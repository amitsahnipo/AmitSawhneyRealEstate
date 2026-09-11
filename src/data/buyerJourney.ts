export interface JourneyPathway {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  keyBenefits: string[];
  recommendedPropertyTypes: string[];
  recommendedAction: string;
  actionType: 'search-filter' | 'consultation' | 'valuation' | 'calculator';
  filterCategory?: 'all' | 'preconstruction' | 'resale' | 'invest' | 'sell';
  filterType?: string;
  badge: string;
}

export const BUYER_JOURNEYS: JourneyPathway[] = [
  {
    id: 'first-time-buyer',
    title: "I'm Buying My First Home",
    subtitle: "Navigate Ontario incentives, deposit assistance & stress tests with zero agent fees",
    iconName: 'Sparkles',
    badge: 'First-Time Homebuyer Guide',
    description: "Buying your first home in Ontario is exciting but demands experienced guidance. We help you leverage the Ontario Land Transfer Tax Rebate (up to $4,000), the First Home Savings Account (FHSA), RRSP Home Buyers' Plan (up to $60,000), and guide you through competitive pricing across Durham Region & GTA.",
    keyBenefits: [
      'Maximize up to $4,000 Ontario First-Time Land Transfer Tax Rebate',
      'Guidance on 10-day statutory cooling-off protections for new builds',
      'Access to turnkey resale starter homes & affordable pre-con entry pricing from $499K',
      '100% Free Buyer Representation (Developer & Seller pays our fee)'
    ],
    recommendedPropertyTypes: ['Townhome', 'Semi-Detached', 'High-Rise Condo'],
    recommendedAction: 'Explore Starter Homes & Pre-Con Launches',
    actionType: 'search-filter',
    filterCategory: 'all'
  },
  {
    id: 'new-home-buyer',
    title: "I'm Looking for a New Home",
    subtitle: "Brand new master-planned builds with Tarion 7-Year Warranty & modern architecture",
    iconName: 'Building2',
    badge: 'Brand New Builds',
    description: "Experience the pride of being the first to live in a master-crafted modern residence. Benefit from modern open-concept layouts, EV charger rough-ins, energy-efficient HVAC, and the comprehensive 7-year Tarion New Home Warranty on major structural components.",
    keyBenefits: [
      'Full 7-Year Tarion Ontario New Home Warranty coverage',
      'Contemporary layouts with 9ft-10ft ceilings & chef kitchens',
      'Custom builder finish selections & color palette customization',
      'Low maintenance costs and high-efficiency smart home systems'
    ],
    recommendedPropertyTypes: ['Detached Home', 'Townhome', 'Mixed-Use Community'],
    recommendedAction: 'Explore New Communities',
    actionType: 'search-filter',
    filterCategory: 'preconstruction'
  },
  {
    id: 'preconstruction-interest',
    title: "I'm Interested in Preconstruction",
    subtitle: "Lock in today's price with tiered deposits & Platinum VIP builder allocations",
    iconName: 'Key',
    badge: 'Platinum VIP Access',
    description: "Secure priority tier-1 pricing and premium lot/floor plan selection months before projects open to the general public. Benefit from extended deposit structures spread over 1-2 years and negotiated incentives including capped municipal levies and free assignment rights.",
    keyBenefits: [
      'First-access pricing tier with builder incentives & capped levies',
      'Extended deposit structures (pay 5%-15% gradually over 12-24 months)',
      '10-Day Statutory Right of Rescission (cooling-off period) protection',
      'Direct developer inventory worksheets and digital client view access'
    ],
    recommendedPropertyTypes: ['High-Rise Condo', 'Townhome', 'Detached Home'],
    recommendedAction: 'View VIP Pre-Construction Portal',
    actionType: 'search-filter',
    filterCategory: 'preconstruction'
  },
  {
    id: 'move-up-buyer',
    title: "I'm Moving Up",
    subtitle: "Upsize to executive space, larger yards & top-tier Durham & GTA school zones",
    iconName: 'Home',
    badge: 'Executive Upsizing',
    description: "Ready for more space, larger lots, and prestige neighborhoods? We specialize in helping families smoothly coordinate selling their existing property while securing executive detached residences in premier communities like Brooklin, Whitby Shores, Unionville, and Courtice.",
    keyBenefits: [
      'Strategic timeline coordination between selling your current home and closing',
      'Access to 4-5 bedroom executive estates with 3-car garages & ravine lots',
      'Top-rated Ontario school boundary guidance (Sinclair, Unionville, Donald A. Wilson)',
      'Complimentary home equity analysis on your existing residence'
    ],
    recommendedPropertyTypes: ['Detached Home', 'Luxury Estate'],
    recommendedAction: 'Explore Executive Family Homes',
    actionType: 'search-filter',
    filterCategory: 'resale',
    filterType: 'Detached Home'
  },
  {
    id: 'investor-pathway',
    title: "I'm Looking for an Investment Property",
    subtitle: "High-yield rental corridors, infrastructure growth & pre-con deposit leverage",
    iconName: 'TrendingUp',
    badge: 'High ROI & Capital Growth',
    description: "Build enduring wealth through strategic Ontario real estate. We analyze cashflow models, cap rates, tenant demand, and future infrastructure drivers like GO Train expansions (Bowmanville/Courtice) and Highway 407/412 connections to deliver above-market appreciation.",
    keyBenefits: [
      'Comprehensive ROI, cap rate, and cashflow modeling per unit',
      'Pre-construction deposit leverage (asset grows on full purchase value)',
      'Tenant placement strategy and landlord compliance guidance',
      'Assignment sale strategies and occupancy rental permits'
    ],
    recommendedPropertyTypes: ['High-Rise Condo', 'Townhome', 'Detached Home'],
    recommendedAction: 'View Investment Opportunities',
    actionType: 'search-filter',
    filterCategory: 'invest'
  },
  {
    id: 'selling-home',
    title: "I'm Selling My Home",
    subtitle: "Maximize net equity with custom staging, 4K media marketing & active buyer networks",
    iconName: 'DollarSign',
    badge: 'Maximum Value Strategy',
    description: "Position your home at the highest echelon of the market. Our comprehensive marketing suite includes professional architectural photography, cinematic 4K video tours, floor plans, targeted digital campaigns, and unmatched negotiation expertise by Amit Sawhney.",
    keyBenefits: [
      'Complimentary In-Depth Comparative Market Analysis (CMA)',
      'Professional architectural staging consultation and HDR photography',
      'Omnichannel marketing across MLS, social media, and private buyer database',
      'Skilled contract negotiation to secure highest price with optimal closing terms'
    ],
    recommendedPropertyTypes: ['Detached Home', 'Townhome', 'High-Rise Condo', 'Semi-Detached'],
    recommendedAction: 'Get Free Home Valuation',
    actionType: 'valuation',
    filterCategory: 'sell'
  }
];
