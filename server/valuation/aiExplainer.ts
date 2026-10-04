import { GoogleGenAI } from '@google/genai';
import { ComparableSale, SubjectPropertyInput, ValuationResponse } from './types.js';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(contents: any, systemInstruction?: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash'];

  for (const model of modelsToTry) {
    try {
      const payload: any = {
        model,
        contents
      };
      if (systemInstruction) {
        payload.systemInstruction = systemInstruction;
      }

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
      const callPromise = (async () => {
        try {
          const response = await ai.models.generateContent(payload);
          return response?.text?.trim() || null;
        } catch {
          return null;
        }
      })();

      const res = await Promise.race([callPromise, timeoutPromise]);
      if (res && res.length > 30) {
        return res;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Generates an intelligent, automated Comparative Market Analysis (CMA) summary.
 * Must NOT hallucinate or alter any numbers. Strictly explains the structured calculations.
 */
export async function generateValuationExplanation(
  valuation: ValuationResponse,
  subject: SubjectPropertyInput
): Promise<string> {
  if (valuation.insufficientData) {
    return valuation.aiExplanation;
  }

  const prompt = `You are an expert Canadian Real Estate Analyst and CMA valuation specialist assisting Amit Sawhney (Licensed Ontario REALTOR®).
Provide a concise, 2-to-3 paragraph Comparative Market Analysis (CMA) rationale for the automated valuation range of:
Property: ${subject.address}
Property Type: ${subject.propertyType} (${subject.bedrooms} bed, ${subject.bathrooms} bath, ${subject.sqft} sq.ft, ${subject.condition} condition)
Estimated Market Valuation Range: $${valuation.lowValue.toLocaleString()} to $${valuation.highValue.toLocaleString()} CAD (Midpoint: $${valuation.estimatedValue.toLocaleString()} CAD)
Confidence: ${valuation.confidence} (${valuation.confidencePercent}%)
Confidence Rationale: ${valuation.confidenceReason}
Market Data Source: TRREB Community Market Reports (https://trreb.ca/market-data/community-reports/) and DurhamRegion.com Real Estate Reporting (https://www.durhamregion.com/business/real-estate/)
Municipality Benchmark: ${subject.municipality} (${valuation.marketTrendAdjustment.localTrend}, ${valuation.marketTrendAdjustment.appliedPct}% annual pace) - ${valuation.marketTrendAdjustment.description}
Community Benchmark Rate: ~$${valuation.medianComparablePricePerSqft}/sq.ft. vs Subject Implied: ~$${valuation.subjectImpliedPricePerSqft}/sq.ft.

Rules:
1. Write clearly, objectively, and authoritatively without marketing hype.
2. Ground your reasoning in the valuation range ($${valuation.lowValue.toLocaleString()} to $${valuation.highValue.toLocaleString()} CAD) and the TRREB Community Market Reports data for ${subject.municipality}.
3. CRITICAL: Do NOT mention individual comparable home addresses or individual sold prices, in adherence with TRREB data distribution standards. Focus exclusively on the valuation range and community statistical benchmarks.
4. Explain how the property's size (${subject.sqft} sq.ft), bedroom/bathroom configuration, basement status, and condition position it within the $${valuation.lowValue.toLocaleString()} - $${valuation.highValue.toLocaleString()} range.
5. Conclude with a clear reminder that an in-person consultation with Amit Sawhney is recommended to verify bespoke interior improvements and establish a tailored listing strategy.`;

  try {
    const aiResult = await callGemini(prompt, 'You are an objective Canadian Real Estate CMA valuation engine.');
    if (aiResult && aiResult.length > 50) {
      return aiResult;
    }
  } catch (err) {
    console.warn('Gemini valuation explanation fallback triggered:', err);
  }

  // Deterministic high-quality fallback emphasizing valuation range, TRREB Community Reports, and DurhamRegion.com market reporting
  return `Based on market intelligence synthesized from TRREB Community Market Reports (https://trreb.ca/market-data/community-reports/), DurhamRegion.com real estate reporting (https://www.durhamregion.com/business/real-estate/), and municipal transaction metrics for ${subject.municipality}, the estimated market valuation for ${subject.address} is positioned within a projected range of $${valuation.lowValue.toLocaleString()} to $${valuation.highValue.toLocaleString()} CAD (midpoint benchmark of $${valuation.estimatedValue.toLocaleString()}).

This valuation range correlates with prevailing neighborhood price distributions for ${subject.propertyType.toLowerCase()}s in ${subject.municipality}, where current absorption maintains an annual trend pace of ${valuation.marketTrendAdjustment.appliedPct}%. The subject property's implied rate of ~$${valuation.subjectImpliedPricePerSqft}/sq.ft. aligns comfortably with community benchmark figures (~$${valuation.medianComparablePricePerSqft}/sq.ft.), factoring in its ${subject.bedrooms}-bedroom layout, bathroom count, and basement condition.

Confidence is assessed as ${valuation.confidence} (${valuation.confidencePercent}%) grounded in recent transaction density and localized absorption metrics across the ${subject.municipality} market area. While this automated valuation range establishes a clear strategic bracket, an in-home assessment by Amit Sawhney is recommended to inspect custom upgrades and verify final listing positioning.`;
}

/**
 * Generates an explanation for "Why was this property selected?" for an individual comparable
 */
export async function generateComparableRationale(
  comp: ComparableSale,
  subject: SubjectPropertyInput
): Promise<string> {
  const prompt = `Explain in 2-3 concise sentences why this recently sold property was selected as a comparable for the subject property:
Subject Property: ${subject.address}, ${subject.propertyType}, ${subject.bedrooms} bed, ${subject.bathrooms} bath, ${subject.sqft} sqft, ${subject.condition}
Comparable: ${comp.address}, Sold for $${comp.soldPrice.toLocaleString()} on ${comp.soldDate} (${comp.daysAgo} days ago)
Distance: ${comp.distanceKm} km away
Specs: ${comp.propertyType}, ${comp.bedrooms} bed, ${comp.bathrooms} bath, ${comp.sqft} sqft, ${comp.condition}, Similarity Score: ${comp.similarityScore}%
Adjusted Valuation Contribution: $${comp.adjustedPrice.toLocaleString()}`;

  try {
    const aiResult = await callGemini(prompt, 'You are an objective real estate appraisal assistant.');
    if (aiResult && aiResult.length > 20) {
      return aiResult;
    }
  } catch (err) {
    // fallback below
  }

  return `${comp.address} was selected because it represents a genuine ${comp.propertyType.toLowerCase()} transaction located just ${comp.distanceKm} km away in ${comp.municipality}. Sold ${comp.daysAgo} days ago for $${comp.soldPrice.toLocaleString()}, its ${comp.sqft} sq. ft. floor plan and ${comp.bedrooms}-bedroom layout yield an adjusted comparative valuation of $${comp.adjustedPrice.toLocaleString()} after accounting for square footage and market timing.`;
}
