/**
 * DurhamRegion.com Real Estate Intelligence & Editorial Insights
 * Sourced and curated from: https://www.durhamregion.com/business/real-estate/
 * Published by Metroland Media / DurhamRegion.com
 * Tracking: Ajax, Pickering, Whitby, Brooklin, Oshawa, Clarington, Scugog, Uxbridge
 */

export interface DurhamNewsInsight {
  id: string;
  category: 'Market Dynamics' | 'Interest Rates' | 'Municipal Trends' | 'Infrastructure' | 'Affordability';
  headline: string;
  subheadline: string;
  sourceDate: string;
  sourcePublication: string;
  sourceUrl: string;
  summary: string;
  sellerTakeaway: string;
  buyerTakeaway: string;
  keyStats: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  tags: string[];
}

export interface MunicipalMarketSnapshot {
  name: string;
  regionCode: string;
  avgSoldPrice: number;
  detachedAvgPrice: number;
  inventoryMonths: number;
  marketCondition: 'Balanced Market' | 'Tight Seller Market' | 'Buyer Favoured';
  saleToListRatio: number;
  highlight: string;
  commuterProximity: string;
}

export const DURHAM_REGION_NEWS_METADATA = {
  portalName: 'DurhamRegion.com Real Estate News',
  sectionName: 'Business / Real Estate',
  portalUrl: 'https://www.durhamregion.com/business/real-estate/',
  publisher: 'Metroland Media Group / DurhamRegion.com',
  coverageScope: 'Durham Region (Pickering, Ajax, Whitby, Brooklin, Oshawa, Clarington, Scugog, Uxbridge)',
  reportingPeriod: 'September 2026 Market Intelligence',
  lastRefreshed: 'September 2026',
  editorialSynopsis: 'Real-time regional housing intelligence tracking the transition into a balanced market, Bank of Canada interest rate impacts, the 2026 mortgage renewal inventory wave, and transit-driven growth along the Lakeshore East and Highway 407 corridors.'
};

export const DURHAM_NEWS_INSIGHTS: DurhamNewsInsight[] = [
  {
    id: 'market-balance-98-pct',
    category: 'Market Dynamics',
    headline: 'Durham Housing Settles into Balanced Territory: The 98% List-to-Sale Reality',
    subheadline: 'Absorption holds at 4.3 months of inventory as sellers pivot from blind bidding to strategic pricing.',
    sourceDate: 'September 2026',
    sourcePublication: 'DurhamRegion.com Real Estate',
    sourceUrl: 'https://www.durhamregion.com/business/real-estate/',
    summary: 'DurhamRegion.com reporting underscores that Durham Region has established a healthy, balanced market. Average transactions are clearing at 98% of list price with 4.3 months of inventory (MOI). Frenzied blind bidding has subsided in favor of conditional offers, home inspection clauses, and disciplined appraisal scrutiny.',
    sellerTakeaway: 'Pricing with precision at current fair market value is critical. Properties priced realistically within neighborhood comps sell within 20 to 28 days, whereas aspirational overpricing leads to 45+ days on market and subsequent price reductions.',
    buyerTakeaway: 'The leverage has equalized. Buyers now have the breathing room to include standard financing and inspection contingencies without fear of instant disqualification in 10-person bidding wars.',
    keyStats: [
      { label: 'Sale-to-List Price Ratio', value: '98.0%', trend: 'neutral' },
      { label: 'Months of Inventory (MOI)', value: '4.3 Months', trend: 'up' },
      { label: 'Avg Days on Market (DOM)', value: '31.1 Days', trend: 'neutral' }
    ],
    tags: ['Balanced Market', 'Pricing Strategy', 'Inventory Shift', 'Negotiation Leverage']
  },
  {
    id: 'boc-rate-renewal-wave',
    category: 'Interest Rates',
    headline: 'Bank of Canada Rate Easing Meets the 2026 Mortgage Renewal Inventory Wave',
    subheadline: 'Overnight rate held at 2.25% as maturing 2020-2021 fixed-rate mortgages bring orderly supply to market.',
    sourceDate: 'September 2026',
    sourcePublication: 'DurhamRegion.com Business',
    sourceUrl: 'https://www.durhamregion.com/business/real-estate/',
    summary: 'With the Bank of Canada overnight rate holding at 2.25%, borrowing costs have stabilized significantly. Analysts covering Durham Region highlight an orderly "inventory wave" as homeowners whose rock-bottom fixed rates from 2020–2021 mature are choosing to rightsize or trade up, supplying much-needed resale stock without triggering distressed liquidations.',
    sellerTakeaway: 'Downsizers and move-up sellers benefit from an active buyer pool that can now qualify for lower 5-year fixed and variable mortgages, making transition planning predictable.',
    buyerTakeaway: 'With interest rate clarity and increased autumn listing inventory, buyers can lock in pre-approvals and negotiate purchase prices below early-2022 historic highs.',
    keyStats: [
      { label: 'Bank of Canada Overnight Rate', value: '2.25%', trend: 'neutral' },
      { label: 'Medium-Term Price Growth Forecast', value: '4% - 6% YoY', trend: 'up' },
      { label: 'Autumn Inventory Influx', value: '+14.2% MoM', trend: 'up' }
    ],
    tags: ['Bank of Canada', 'Mortgage Rates', 'Inventory Wave', 'Move-Up Buyers']
  },
  {
    id: 'municipal-divergence-pickering-oshawa',
    category: 'Municipal Trends',
    headline: 'Regional Divergence: Pickering Leads Luxury Benchmarks While Oshawa Anchors GTA Affordability',
    subheadline: 'Commuter proximity to Toronto commands a $240K+ premium across the 401 East corridor.',
    sourceDate: 'September 2026',
    sourcePublication: 'DurhamRegion.com Housing Beat',
    sourceUrl: 'https://www.durhamregion.com/business/real-estate/',
    summary: 'DurhamRegion.com real estate analysis shows marked variance across municipal borders. Pickering commands the region\'s highest average price ($935,490; detached homes averaging $1,165,883) driven by immediate 401/GO proximity to downtown Toronto. Meanwhile, Oshawa ($693,677 average; $785,000 detached) continues to serve as the GTA\'s most accessible entry point for first-time buyers and student-housing investors near Ontario Tech University.',
    sellerTakeaway: 'Pickering and Ajax sellers benefit from Toronto out-migrators seeking freehold space, while Oshawa sellers see strong velocity for detached homes with separate-entrance basement rental suites.',
    buyerTakeaway: 'Buyers priced out of Toronto or Peel can achieve 30–45% more interior square footage and lot depth in Durham Region, with convenient GO Transit express service.',
    keyStats: [
      { label: 'Pickering Avg Sold Price', value: '$935,490', trend: 'up' },
      { label: 'Oshawa Avg Sold Price', value: '$693,677', trend: 'neutral' },
      { label: 'Ajax Buyer Sales Surge', value: '+15.6% MoM', trend: 'up' }
    ],
    tags: ['Pickering', 'Oshawa', 'Ajax', 'Commuter Premium', 'First-Time Buyers']
  },
  {
    id: 'transit-infrastructure-runway',
    category: 'Infrastructure',
    headline: 'Transit Infrastructure Runway: Bowmanville GO Extension & Highway 407 Expansion',
    subheadline: 'Long-term equity appreciation fueled by Metrolinx transit corridors into Courtice and Bowmanville.',
    sourceDate: 'September 2026',
    sourcePublication: 'DurhamRegion.com Real Estate',
    sourceUrl: 'https://www.durhamregion.com/business/real-estate/',
    summary: 'Infrastructure investments remain the strongest medium-term catalyst for Durham real estate. The Metrolinx Lakeshore East GO extension—incorporating new station hubs in Oshawa Central, Courtice, and Bowmanville—paired with the Highway 407/418 interchange has driven substantial developer capital and family migration into eastern Durham.',
    sellerTakeaway: 'Homes situated within 2 km of proposed and active GO station corridors in Clarington and Oshawa are experiencing superior price resilience and increased investor inquiries.',
    buyerTakeaway: 'Purchasing in Courtice, Brooklin, or Bowmanville provides substantial future upside as transit connectivity reduces commute times into Toronto Union Station.',
    keyStats: [
      { label: 'Lakeshore East GO Expansion', value: '4 New Stations', trend: 'up' },
      { label: 'Clarington Resale Benchmark', value: '$840,000', trend: 'up' },
      { label: 'Highway 407 ETR East Traffic', value: '+22% YoY', trend: 'up' }
    ],
    tags: ['Bowmanville GO', 'Metrolinx', 'Highway 407', 'Courtice', 'Transit-Oriented Growth']
  }
];

export const DURHAM_MUNICIPAL_SNAPSHOT: MunicipalMarketSnapshot[] = [
  {
    name: 'Pickering',
    regionCode: 'pickering',
    avgSoldPrice: 935490,
    detachedAvgPrice: 1165883,
    inventoryMonths: 3.7,
    marketCondition: 'Balanced Market',
    saleToListRatio: 98.4,
    highlight: 'Highest regional average price; premier 401/Go access to downtown Toronto; waterfront regeneration.',
    commuterProximity: '28 min to Union Station via GO Express'
  },
  {
    name: 'Ajax',
    regionCode: 'ajax',
    avgSoldPrice: 871853,
    detachedAvgPrice: 1025000,
    inventoryMonths: 2.9,
    marketCondition: 'Tight Seller Market',
    saleToListRatio: 99.1,
    highlight: 'Tightest supply in Durham; rapid buyer turnover; 15.6% monthly surge in transaction volume.',
    commuterProximity: '33 min to Union Station via GO Express'
  },
  {
    name: 'Whitby & Brooklin',
    regionCode: 'whitby',
    avgSoldPrice: 894257,
    detachedAvgPrice: 940000,
    inventoryMonths: 2.9,
    marketCondition: 'Balanced Market',
    saleToListRatio: 98.2,
    highlight: 'High family demand for top school catchments, Brooklin village charm, and Highway 407/412 transit.',
    commuterProximity: '38 min to Union Station via GO Express'
  },
  {
    name: 'Oshawa',
    regionCode: 'oshawa',
    avgSoldPrice: 693677,
    detachedAvgPrice: 785000,
    inventoryMonths: 4.1,
    marketCondition: 'Buyer Favoured',
    saleToListRatio: 97.5,
    highlight: 'GTA affordability anchor; strong multi-unit and in-law suite cash flow near Ontario Tech & Durham College.',
    commuterProximity: '45 min to Union Station via GO Express'
  },
  {
    name: 'Courtice & Clarington',
    regionCode: 'clarington',
    avgSoldPrice: 840000,
    detachedAvgPrice: 895000,
    inventoryMonths: 3.8,
    marketCondition: 'Balanced Market',
    saleToListRatio: 97.9,
    highlight: 'Major capital growth corridor catalyzed by the upcoming Bowmanville GO Train expansion.',
    commuterProximity: 'Highway 418 / 407 / Future GO connection'
  },
  {
    name: 'Uxbridge & Scugog',
    regionCode: 'north_durham',
    avgSoldPrice: 1150000,
    detachedAvgPrice: 1280000,
    inventoryMonths: 4.8,
    marketCondition: 'Buyer Favoured',
    saleToListRatio: 96.8,
    highlight: 'Rural luxury estates, custom acreage properties, equestrian parcels, and heritage town centers.',
    commuterProximity: 'Highway 407 / 404 commuter access'
  }
];

export const DURHAM_MACRO_INDICATORS = [
  {
    label: 'BoC Overnight Rate',
    value: '2.25%',
    benchmark: 'Neutral Stance',
    description: 'Supports stable mortgage qualifying thresholds without triggering overheating.'
  },
  {
    label: 'Regional MOI',
    value: '4.3 Months',
    benchmark: 'Balanced Territory',
    description: 'Up from summer lows; provides buyers negotiation leverage while supporting firm property equity.'
  },
  {
    label: 'Sale-to-List Ratio',
    value: '98.0%',
    benchmark: 'Realistic Pricing',
    description: 'Homes clear close to asking price when aligned with hyper-local sold comp distributions.'
  },
  {
    label: 'Forecast Price Growth',
    value: '+4% to +6%',
    benchmark: 'Sustainable Pace',
    description: 'Forecasters project steady medium-term equity expansion fueled by continued GTA population migration.'
  }
];
