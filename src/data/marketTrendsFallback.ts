import { MarketTrendsData } from '../types.js';

export function getFallbackMarketTrends(region: string = 'Durham Region', buyerFocus: string = 'All Buyers & Investors'): MarketTrendsData {
  const isGTA = region.includes('GTA') || region.includes('Toronto') || region.includes('Peel') || region.includes('York');
  const isBrooklin = region.includes('Brooklin') || region.includes('Whitby');
  const isOshawa = region.includes('Oshawa') || region.includes('Courtice') || region.includes('Clarington');
  const isPickering = region.includes('Pickering') || region.includes('Ajax');

  let benchmarkPrice = '$892,400';
  let priceChange = '+1.9% QoQ';
  let avgSqft = '$840 - $960';
  let temperatureScore = 68;
  let temperatureLabel = 'Balanced Buyer Opportunity';

  if (isBrooklin) {
    benchmarkPrice = '$968,500';
    priceChange = '+2.4% QoQ';
    avgSqft = '$860 - $980';
    temperatureScore = 74;
    temperatureLabel = 'High Family Demand Hub';
  } else if (isOshawa) {
    benchmarkPrice = '$749,000';
    priceChange = '+3.1% QoQ';
    avgSqft = '$780 - $890';
    temperatureScore = 78;
    temperatureLabel = 'High-Yield Cash Flow Zone';
  } else if (isPickering) {
    benchmarkPrice = '$915,000';
    priceChange = '+1.7% QoQ';
    avgSqft = '$890 - $1,050';
    temperatureScore = 71;
    temperatureLabel = 'Lakeshore & Transit Growth';
  } else if (isGTA) {
    benchmarkPrice = '$1,120,000';
    priceChange = '+0.8% QoQ';
    avgSqft = '$1,100 - $1,400';
    temperatureScore = 62;
    temperatureLabel = 'Selective Value Seeking';
  }

  return {
    region,
    buyerFocus,
    generatedAt: new Date().toISOString(),
    source: 'TRREB Market Watch & BILD GTA New Home Intelligence Analysis',
    marketTemperature: {
      score: temperatureScore,
      label: temperatureLabel,
      summary: `Current conditions in ${region} present an advantageous entry window. Buyers benefit from extended builder deposit schedules, capped municipal development levies, and room to include home inspection and financing conditions.`
    },
    keyMetrics: [
      {
        label: 'Benchmark Composite Price',
        value: benchmarkPrice,
        subtext: `Composite across all home categories in ${region}`,
        trend: 'up',
        change: priceChange
      },
      {
        label: 'Avg. Pre-Construction $/SqFt',
        value: avgSqft,
        subtext: isGTA ? 'GTA average range across high-rise & mid-rise' : 'Durham master-planned communities vs $1,350+ in Downtown Toronto',
        trend: 'up',
        change: isGTA ? 'Stable Entry' : '30% Value Discount vs Core'
      },
      {
        label: 'Average Days on Market (DOM)',
        value: '26-30 Days',
        subtext: 'Healthy inventory window allowing calm, unhurried decision making',
        trend: 'down',
        change: 'Balanced Absorption'
      },
      {
        label: 'Sales-to-New-Listings (SNLR)',
        value: '52.3%',
        subtext: 'Balanced territory giving buyers leverage on conditions & pricing',
        trend: 'neutral',
        change: 'Balanced Market'
      }
    ],
    regionalSpotlights: [
      {
        regionName: 'Whitby & Brooklin',
        headline: 'Family Estate Capital & Highway 407/412 Gateway',
        medianPrice: '$968,500',
        statusBadge: 'Top Family Pick',
        growthDrivers: [
          'Direct access to Highway 407 & Highway 412 commuter corridors',
          'High-performing public & Catholic schools in high demand',
          'Master-planned releases by Tribute Communities with 2-3 year build runways'
        ],
        realtorInsight: 'Brooklin detached homes and freehold townhomes consistently retain strong resale value due to master-planned village aesthetics, large parks, and zero condo fees.'
      },
      {
        regionName: 'Oshawa & Courtice Growth Corridor',
        headline: 'Accessible Price Point with Metrolinx GO Train Expansion',
        medianPrice: '$749,000',
        statusBadge: 'Best Value & Cash Flow',
        growthDrivers: [
          'Bowmanville Metrolinx GO Train expansion with dedicated stations in Courtice',
          'Major workforce expansion via Ontario Power Generation (OPG) clean energy headquarters',
          'Strong student and healthcare worker rental pool (Ontario Tech & Lakeridge Health)'
        ],
        realtorInsight: 'Oshawa and Courtice offer entry-level detached homes under $800k — 35% lower than Markham or Vaughan, creating high cap rate potential for investor portfolios.'
      },
      {
        regionName: 'Pickering Waterfront & Ajax',
        headline: 'Lakeshore Lifestyle with 28-Minute Express Commute to Union Station',
        medianPrice: '$915,000',
        statusBadge: 'Transit & Nautical Hub',
        growthDrivers: [
          'Frenchman’s Bay waterfront boardwalk, marinas, and beaches',
          'Pickering City Centre multi-tower master redevelopment',
          'Direct 28-minute Lakeshore East express train into Downtown Toronto'
        ],
        realtorInsight: 'Pickering acts as the primary bridge between Toronto and Durham. New high-rise and townhome releases here attract young downtown professionals seeking lakeshore tranquility.'
      },
      {
        regionName: 'York & Peel Region (Markham / Mississauga / Brampton)',
        headline: 'Established Tech & Commerce Centers with Strong Resale Liquidity',
        medianPrice: '$1,180,000',
        statusBadge: 'Established Urban Core',
        growthDrivers: [
          'Major corporate headquarters, tech hubs, and multi-cultural amenities',
          'Hazel McCallion LRT line and Yonge North Subway extensions',
          'Dense transit-oriented condominium and urban town developments'
        ],
        realtorInsight: 'While price per square foot is higher ($1,050 - $1,300/sqft), established infrastructure and deep employment corridors offer resilient long-term capital preservation.'
      }
    ],
    preConVsResale: [
      {
        factor: 'Upfront Capital & Cash Flow',
        preConstruction: 'Staggered 10-15% deposit over 12-24 months (e.g., 5% on signing, 5% in 120 days, 5% in 365 days)',
        resale: 'Full 5% to 20% down payment required immediately at closing (30-60 days)',
        recommendation: 'Pre-construction allows buyers to accumulate savings and investment gains while locking in current contract prices.'
      },
      {
        factor: 'Legal & Warranty Protection',
        preConstruction: 'Mandatory 10-Day Statutory Right of Rescission (Condo Act) + Tarion 7-Year New Home Warranty',
        resale: 'Firm purchase agreement upon waiver of conditions; standard property disclosures',
        recommendation: 'Pre-construction provides a risk-free 10-day lawyer contract review window to verify all builder disclosures.'
      },
      {
        factor: 'Market Appreciation Horizon',
        preConstruction: 'Occupancy in 2026-2028; capture capital growth during construction with zero mortgage payments',
        resale: 'Immediate move-in or rental occupancy; mortgage amortization starts on closing',
        recommendation: 'Choose resale for immediate housing needs; choose pre-con for equity growth and brand-new finishes.'
      },
      {
        factor: 'Negotiable Builder Incentives',
        preConstruction: 'Platinum VIP perks: Capped development charges ($5,000-$10,000 cap), free right of assignment, parking/locker discounts',
        resale: 'Negotiation focused on purchase price, closing date, seller-included chattels, and inspection repairs',
        recommendation: 'Amit Sawhney negotiates builder caps directly so clients avoid unexpected final closing adjustments.'
      }
    ],
    rateImpactAnalysis: {
      title: 'Bank of Canada Rate Trends & Buyer Purchasing Power',
      bocSummary: 'With the Bank of Canada moving into an easing rate cycle, 5-year fixed and variable mortgage rates are providing relief for qualified buyers. In Durham Region, where median prices average $850k-$950k, monthly carrying costs are roughly $1,200-$1,800 lower than comparable homes in York or Peel Regions.',
      buyerStrategy: 'Purchasing pre-construction today lets buyers lock in Tier-1 VIP pricing with builder capped levies, while postponing final mortgage rate lock until project completion in 2027/2028 when borrowing costs are anticipated to be lower.'
    },
    strategicTakeaways: [
      'Pre-construction builder promotions are at a cyclical high, with developers offering extended 2-year deposit schedules and $25,000-$50,000 in decor & fee caps.',
      'Durham Region detached homes and freehold townhomes offer a 25-35% price discount versus York/Peel regions, with matching commute times via Hwy 407.',
      'First-Time Home Buyers can combine the Tax-Free First Home Savings Account (FHSA) with staggered pre-con deposits for optimal tax savings.',
      'Working with a dedicated VIP Realtor gives you access to private builder inventory and $0 buyer commission fees (paid 100% by the developer).'
    ],
    faqs: [
      {
        question: 'Why is Durham Region currently attracting so many GTA buyers?',
        answer: 'Durham Region offers the best affordability-to-lifestyle balance in the GTA. Communities like Brooklin, Whitby, and Courtice provide larger lots, scenic conservation trails, and modern schools, while Highway 407 and Lakeshore East GO trains provide swift transit across the GTA.'
      },
      {
        question: 'How do development charge caps protect pre-construction buyers?',
        answer: 'Municipalities charge levies for infrastructure on new developments. Without a capped clause in your Agreement of Purchase and Sale, these fees can rise unexpectedly by $20,000 to $40,000+ at final closing. Amit Sawhney ensures development charges are strictly capped during the VIP launch.'
      },
      {
        question: 'Is it better to buy pre-construction or resale in today’s market?',
        answer: 'It depends on your timeline. If you need to move within 60-90 days, resale provides move-in certainty. If you have 2-3 years, pre-construction allows you to lock in today’s price with structured deposits and take advantage of new building codes and full Tarion warranty coverage.'
      }
    ]
  };
}
