import {
  CanadianProvince,
  ComparableSale,
  PropertyCondition,
  SubjectPropertyInput,
  ValuationEngineConfig,
  ValuationResponse
} from './types.js';
import { RawComparableRecord } from './comparablesData.js';
import { GeocodingProvider, MarketDataProvider } from './providers.js';

const TODAY_MS = new Date('2026-09-10T00:00:00.000Z').getTime();

export class ValuationScoringEngine {
  /**
   * Main entry point to score comparables and calculate valuation
   */
  public static calculateValuation(
    subject: SubjectPropertyInput,
    rawComparables: RawComparableRecord[],
    config: ValuationEngineConfig,
    radiusUsedKm: number,
    lookbackDaysUsed: number
  ): ValuationResponse {
    const auditId = `cma-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const subSqft = subject.sqft || 2000;
    const subBeds = subject.bedrooms || 3;
    const subBaths = subject.bathrooms || 2;
    const subGarage = subject.garage || 1;
    const subBasementFinished = subject.basement === 'Finished' || subject.basement === 'Separate Entrance Suite';

    const marketTrend = MarketDataProvider.getTrend(subject.municipality, subject.province);
    const communityReport = MarketDataProvider.getCommunityReport(
      subject.municipality,
      subject.propertyType,
      subject.province
    );

    // If no comparables at all exist (extremely rare edge case)
    if (rawComparables.length === 0) {
      return this.generateInsufficientDataResponse(subject, auditId, config, radiusUsedKm, lookbackDaysUsed);
    }

    // 1. Score each comparable using configurable multi-factor weights
    const scoredComparables: ComparableSale[] = rawComparables.map(raw => {
      const daysAgo = Math.max(1, Math.round((TODAY_MS - new Date(raw.soldDate).getTime()) / (1000 * 60 * 60 * 24)));
      const distanceKm = GeocodingProvider.calculateDistanceKm(
        subject.lat || 43.8975,
        subject.lng || -78.9428,
        raw.lat,
        raw.lng
      );

      // Factor 1: Proximity (25%)
      const proxScore = Math.max(0, 1 - distanceKm / Math.max(radiusUsedKm, 3.0));

      // Factor 2: Property Type (15%)
      let typeScore = 0.5;
      if (raw.propertyType === subject.propertyType) {
        typeScore = 1.0;
      } else if (
        (subject.propertyType === 'Condo Apartment' && raw.propertyType === 'Condo Townhouse') ||
        (subject.propertyType === 'Townhouse' && raw.propertyType === 'Semi-Detached')
      ) {
        typeScore = 0.8;
      } else if (subject.propertyType === 'Detached Home' && raw.propertyType === 'Semi-Detached') {
        typeScore = 0.75;
      }

      // Factor 3: Living Area / Sqft (15%)
      const sqftDelta = Math.abs(subSqft - raw.sqft);
      const sqftScore = Math.max(0, 1 - sqftDelta / subSqft);

      // Factor 4: Bedrooms (10%)
      const bedDelta = Math.abs(subBeds - raw.bedrooms);
      const bedScore = Math.max(0, 1 - bedDelta / 3);

      // Factor 5: Bathrooms (10%)
      const bathDelta = Math.abs(subBaths - raw.bathrooms);
      const bathScore = Math.max(0, 1 - bathDelta / 3);

      // Factor 6: Lot Size (5%)
      const lotScore = subject.propertyType.includes('Condo') ? 1.0 : 0.85;

      // Factor 7: Age (5%)
      const ageDelta = Math.abs((subject.yearBuilt || 2012) - raw.yearBuilt);
      const ageScore = Math.max(0, 1 - ageDelta / 30);

      // Factor 8: Garage (5%)
      const garageDelta = Math.abs(subGarage - raw.garage);
      const garageScore = Math.max(0, 1 - garageDelta / 2);

      // Factor 9: Basement (5%)
      const rawBasementFinished = raw.basement.toLowerCase().includes('finished');
      const basementScore = subBasementFinished === rawBasementFinished ? 1.0 : 0.65;

      // Factor 10: Sale Recency (5%)
      const recencyScore = Math.max(0, 1 - daysAgo / Math.max(lookbackDaysUsed, 90));

      const compositeScore =
        proxScore * config.weights.geographicProximity +
        typeScore * config.weights.propertyType +
        sqftScore * config.weights.livingArea +
        bedScore * config.weights.bedrooms +
        bathScore * config.weights.bathrooms +
        lotScore * config.weights.lotSize +
        ageScore * config.weights.age +
        garageScore * config.weights.garage +
        basementScore * config.weights.basement +
        recencyScore * config.weights.saleRecency;

      const similarityScore = Math.round(Math.min(99, Math.max(55, compositeScore * 100)));

      // 2. Compute Characteristic Adjustments
      const baseSqftRate = raw.soldPrice / raw.sqft;
      // Marginal sqft value is typically 40-50% of average sqft price
      const sqftAdjustment = Math.round((subSqft - raw.sqft) * (baseSqftRate * 0.45));
      const bedBathAdjustment = (subBeds - raw.bedrooms) * 14000 + (subBaths - raw.bathrooms) * 9000;
      const garageAdjustment = (subGarage - raw.garage) * 12000;
      const basementAdjustment = subBasementFinished && !rawBasementFinished ? 24000 : !subBasementFinished && rawBasementFinished ? -20000 : 0;
      const garageBasementAdjustment = garageAdjustment + basementAdjustment;

      // Condition Adjustment
      const conditionValues: Record<PropertyCondition, number> = {
        'Needs Work': -0.08,
        'Average': 0.0,
        'Good': 0.04,
        'Excellent': 0.08,
        'Fully Renovated': 0.14
      };
      const subConditionFactor = conditionValues[subject.condition] || 0.04;
      const rawConditionFactor = conditionValues[raw.condition] || 0.04;
      const conditionAdjustment = Math.round(raw.soldPrice * (subConditionFactor - rawConditionFactor));

      // Market Trend Adjustment (sale date to today)
      const annualAppreciation = (marketTrend.annualPct || 2.0) / 100;
      const marketTrendAdjustment = Math.round(raw.soldPrice * (annualAppreciation * (daysAgo / 365)));

      const adjustedPrice = Math.round(
        raw.soldPrice +
        sqftAdjustment +
        bedBathAdjustment +
        garageBasementAdjustment +
        conditionAdjustment +
        marketTrendAdjustment
      );

      // Natural explanation tag
      let selectionReason = '';
      if (raw.propertyType === subject.propertyType && distanceKm <= 1.2) {
        selectionReason = `Direct match in ${raw.municipality} located only ${distanceKm} km away with comparable ${raw.bedrooms}-bedroom layout.`;
      } else if (raw.buildingName && raw.buildingName === subject.unit) {
        selectionReason = `Same condominium building (${raw.buildingName}) sold recently within the last ${daysAgo} days.`;
      } else if (distanceKm <= 2.0) {
        selectionReason = `Nearby ${raw.propertyType.toLowerCase()} located ${distanceKm} km away with ${raw.sqft} sq. ft. living area.`;
      } else {
        selectionReason = `Regional benchmark in ${raw.municipality} with closely matching square footage and layout specifications.`;
      }

      return {
        id: raw.id,
        address: raw.address,
        municipality: raw.municipality,
        province: raw.province,
        postalCode: raw.postalCode,
        soldPrice: raw.soldPrice,
        soldDate: raw.soldDate,
        daysAgo,
        distanceKm,
        propertyType: raw.propertyType,
        bedrooms: raw.bedrooms,
        bathrooms: raw.bathrooms,
        sqft: raw.sqft,
        lotSize: raw.lotSize,
        yearBuilt: raw.yearBuilt,
        pricePerSqft: Math.round(raw.soldPrice / raw.sqft),
        similarityScore,
        selectionReason,
        garage: raw.garage,
        basement: raw.basement,
        condition: raw.condition,
        buildingName: raw.buildingName,
        photoUrl: raw.photoUrl,
        adjustedPrice,
        adjustments: {
          sqftAdjustment,
          bedBathAdjustment,
          garageBasementAdjustment,
          conditionAdjustment,
          marketTrendAdjustment
        }
      };
    });

    // Sort by similarity score descending and take up to maxComparables
    scoredComparables.sort((a, b) => b.similarityScore - a.similarityScore);
    const topComparables = scoredComparables.slice(0, config.maxComparables);

    // 3. User Renovation Adjustments (Additive lift based on confirmed renovation items)
    let renovationLift = 0;
    if (subject.renovations) {
      if (subject.renovations.kitchen) renovationLift += 18000;
      if (subject.renovations.bathrooms) renovationLift += 12000;
      if (subject.renovations.finishedBasement && !subBasementFinished) renovationLift += 22000;
      if (subject.renovations.flooring) renovationLift += 7500;
      if (subject.renovations.windows) renovationLift += 6000;
      if (subject.renovations.roof) renovationLift += 6500;
      if (subject.renovations.furnaceHvac) renovationLift += 5000;
      if (subject.renovations.landscaping) renovationLift += 4500;
      if (subject.renovations.pool) renovationLift += 15000;
    }

    // 4. Calculate Weighted Average Estimated Market Value
    let totalWeight = 0;
    let weightedSum = 0;
    topComparables.forEach(c => {
      const weight = Math.pow(c.similarityScore / 100, 2);
      weightedSum += c.adjustedPrice * weight;
      totalWeight += weight;
    });

    const rawEstimatedValue = totalWeight > 0 ? weightedSum / totalWeight + renovationLift : 850000;
    // Round to nearest $5,000 for realistic real estate CMA estimation
    const estimatedValue = Math.round(rawEstimatedValue / 5000) * 5000;

    // 5. Statistical Summary of Adjusted Prices
    const adjustedPrices = topComparables.map(c => c.adjustedPrice);
    const mean = Math.round(adjustedPrices.reduce((a, b) => a + b, 0) / adjustedPrices.length);
    const sortedPrices = [...adjustedPrices].sort((a, b) => a - b);
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

    const variance =
      adjustedPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / adjustedPrices.length;
    const standardDeviation = Math.round(Math.sqrt(variance));
    const varianceCoefficient = Number((standardDeviation / mean).toFixed(3));

    // 6. Statistically Grounded Confidence Score
    const avgSimilarity = Math.round(
      topComparables.reduce((s, c) => s + c.similarityScore, 0) / topComparables.length
    );
    const avgDistance = Number(
      (topComparables.reduce((s, c) => s + c.distanceKm, 0) / topComparables.length).toFixed(1)
    );
    const maxDaysAgo = Math.max(...topComparables.map(c => c.daysAgo));

    let confidence: 'High' | 'Moderate' | 'Limited' = 'Moderate';
    let confidencePercent = 78;
    let confidenceReason = '';

    if (topComparables.length >= 4 && avgDistance <= 2.0 && maxDaysAgo <= 90 && avgSimilarity >= 82) {
      confidence = 'High';
      confidencePercent = Math.min(94, Math.round(80 + (avgSimilarity - 80) * 0.7));
      confidenceReason = `High confidence because ${topComparables.length} closely comparable properties sold within ${avgDistance} km during the last 90 days with an average similarity score of ${avgSimilarity}%.`;
    } else if (topComparables.length >= 3 && avgDistance <= 4.0 && maxDaysAgo <= 180) {
      confidence = 'Moderate';
      confidencePercent = Math.min(84, Math.max(68, avgSimilarity));
      confidenceReason = `Moderate confidence based on ${topComparables.length} recent sales within ${avgDistance} km sold over the last ${maxDaysAgo} days.`;
    } else {
      confidence = 'Limited';
      confidencePercent = Math.min(65, Math.max(48, avgSimilarity - 15));
      confidenceReason = `Limited confidence due to wider geographic distribution (${avgDistance} km average radius) and extended market lookback period (${maxDaysAgo} days).`;
    }

    // 7. Dynamic Statistical Valuation Range (NOT flat ±5%)
    // Range expands with higher variance and lower confidence
    let rangeSpreadPercent = 0.04; // 4% default for high confidence tight distribution
    if (confidence === 'High') {
      rangeSpreadPercent = Math.max(0.035, Math.min(0.05, varianceCoefficient * 0.8));
    } else if (confidence === 'Moderate') {
      rangeSpreadPercent = Math.max(0.055, Math.min(0.08, varianceCoefficient * 1.1));
    } else {
      rangeSpreadPercent = Math.max(0.085, Math.min(0.13, varianceCoefficient * 1.4));
    }

    const lowValue = Math.round((estimatedValue * (1 - rangeSpreadPercent)) / 5000) * 5000;
    const highValue = Math.round((estimatedValue * (1 + rangeSpreadPercent)) / 5000) * 5000;

    // 8. Square Footage Price Metrics
    const subjectImpliedPricePerSqft = Math.round(estimatedValue / subSqft);
    const compSqftRates = topComparables.map(c => c.pricePerSqft);
    const medianComparablePricePerSqft = compSqftRates.sort((a, b) => a - b)[Math.floor(compSqftRates.length / 2)];
    const comparablePricePerSqftRange = {
      min: Math.min(...compSqftRates),
      max: Math.max(...compSqftRates)
    };

    // 9. Buyer Perspective Analysis (if user toggles or inputs asking price)
    let buyerPerspective = undefined;
    const askingPrice = subject.askingPrice || undefined;
    if (askingPrice && askingPrice > 0) {
      const diffAmount = askingPrice - estimatedValue;
      const diffPercent = Number(((diffAmount / estimatedValue) * 100).toFixed(1));

      let evaluation: 'Over Asking Market Range' | 'Fair Market Value' | 'Below Market Range' = 'Fair Market Value';
      let verdictMessage = '';

      if (askingPrice > highValue) {
        evaluation = 'Over Asking Market Range';
        verdictMessage = `Based on recent comparable sales, the current asking price appears approximately ${diffPercent}% above the estimated market range ($${lowValue.toLocaleString()} - $${highValue.toLocaleString()}).`;
      } else if (askingPrice < lowValue) {
        evaluation = 'Below Market Range';
        verdictMessage = `The current asking price is positioned approximately ${Math.abs(diffPercent)}% below estimated market value, which may indicate a strategic pricing technique to spark multiple offers.`;
      } else {
        evaluation = 'Fair Market Value';
        verdictMessage = `The asking price of $${askingPrice.toLocaleString()} is closely aligned with prevailing recent neighborhood sold comparables.`;
      }

      buyerPerspective = {
        askingPrice,
        estimatedMarketValue: estimatedValue,
        differenceAmount: diffAmount,
        differencePercent: diffPercent,
        evaluation,
        verdictMessage,
        suggestedBuyerQuestions: [
          'What are the average days on market for comparable homes in this specific pocket?',
          'Have there been recent competing offer presentations on similar listings?',
          'Are there any pending municipal levy adjustments or neighborhood infrastructure changes?',
          'What are the recent sold prices of properties within walking distance during the last 30 days?'
        ]
      };
    }

    // 10. Listing Price Strategy Guidance
    const potentialListingPriceGuidance = {
      recommendedLow: Math.round((estimatedValue * 0.96) / 5000) * 5000,
      recommendedHigh: Math.round((estimatedValue * 1.03) / 5000) * 5000,
      commentary: `Your property's estimated market value is $${lowValue.toLocaleString()} - $${highValue.toLocaleString()}. A real estate professional may recommend a tailored list price depending on active inventory, neighborhood seasonality, and our 1% full-service listing marketing strategy.`
    };

    return {
      auditId,
      subjectProperty: subject,
      estimatedValue,
      lowValue,
      highValue,
      valuationRange: {
        low: lowValue,
        high: highValue
      },
      confidence,
      confidencePercent,
      confidenceReason,
      confidenceScore: {
        rating: confidence,
        score: confidencePercent,
        reason: confidenceReason
      },
      comparablesCount: topComparables.length,
      searchRadiusUsedKm: radiusUsedKm,
      lookbackPeriodDaysUsed: lookbackDaysUsed,
      dataThroughDate: 'September 10, 2026',
      valuationDate: new Date().toISOString().split('T')[0],
      subjectImpliedPricePerSqft,
      medianComparablePricePerSqft,
      comparablePricePerSqftRange,
      marketTrendAdjustment: {
        appliedPct: marketTrend.annualPct,
        description: marketTrend.description,
        localTrend: marketTrend.status
      },
      statisticalSummary: {
        mean,
        median,
        standardDeviation,
        varianceCoefficient
      },
      communityReport,
      comparables: topComparables,
      comparablesUsed: topComparables,
      aiExplanation: '', // will be populated by AI explainer
      disclaimer: config.disclaimer,
      potentialListingPriceGuidance,
      buyerPerspective
    };
  }

  private static generateInsufficientDataResponse(
    subject: SubjectPropertyInput,
    auditId: string,
    config: ValuationEngineConfig,
    radiusUsedKm: number,
    lookbackDaysUsed: number
  ): ValuationResponse {
    return {
      auditId,
      subjectProperty: subject,
      estimatedValue: 0,
      lowValue: 0,
      highValue: 0,
      valuationRange: {
        low: 0,
        high: 0
      },
      confidence: 'Limited',
      confidencePercent: 0,
      confidenceReason: `Insufficient verified sales found within ${radiusUsedKm} km over the past ${lookbackDaysUsed} days.`,
      confidenceScore: {
        rating: 'Limited',
        score: 0,
        reason: `Insufficient verified sales found within ${radiusUsedKm} km over the past ${lookbackDaysUsed} days.`
      },
      comparablesCount: 0,
      searchRadiusUsedKm: radiusUsedKm,
      lookbackPeriodDaysUsed: lookbackDaysUsed,
      dataThroughDate: 'September 10, 2026',
      valuationDate: new Date().toISOString().split('T')[0],
      subjectImpliedPricePerSqft: 0,
      medianComparablePricePerSqft: 0,
      comparablePricePerSqftRange: { min: 0, max: 0 },
      marketTrendAdjustment: {
        appliedPct: 0,
        description: 'No regional trend applicable due to lack of comparable data.',
        localTrend: 'Stable'
      },
      statisticalSummary: {
        mean: 0,
        median: 0,
        standardDeviation: 0,
        varianceCoefficient: 0
      },
      comparables: [],
      comparablesUsed: [],
      aiExplanation:
        "We couldn't produce a reliable automated estimate because there are insufficient recent comparable property sales in this specific area matching the property characteristics. Rather than generating an inaccurate estimate, we recommend requesting a personalized Comparative Market Analysis (CMA) prepared directly by Amit Sawhney.",
      disclaimer: config.disclaimer,
      potentialListingPriceGuidance: {
        recommendedLow: 0,
        recommendedHigh: 0,
        commentary: 'A personalized in-person CMA is recommended to establish property value.'
      },
      insufficientData: true,
      insufficientDataReason:
        'Fewer than the minimum required verified comparable sales were available in this geographic boundary.'
    };
  }
}
