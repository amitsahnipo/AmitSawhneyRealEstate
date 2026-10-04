export interface ClientTestimonial {
  id: string;
  clientName: string;
  location: string;
  clientType: 'seller' | 'buyer' | 'precon' | 'investor';
  clientTypeLabel: string;
  headline: string;
  quote: string;
  outcomeMetric: {
    label: string;
    value: string;
  };
  secondaryOutcome: string;
  rating: number; // usually 5
  year: string;
  initials: string;
  verifiedTransaction: boolean;
}

export const MOCK_TESTIMONIALS: ClientTestimonial[] = [
  {
    id: 'test-1',
    clientName: 'Marcus & Elena Vance',
    location: 'Brooklin, Whitby',
    clientType: 'seller',
    clientTypeLabel: 'Sellers — 1% Full-Service Listing',
    headline: 'Saved $24,800 in commissions and sold $36,000 over asking in 6 days.',
    quote: 'Selling our family home in Brooklin felt daunting until Amit stepped in. His 1% listing model delivered what other brokerages charge 2.5% for: architectural twilight photography, precision staging guidance, and laser-focused MLS® targeting. We had 41 showings over one weekend and closed clean without appraisal contingencies. Amit is truly a fiduciary powerhouse.',
    outcomeMetric: {
      label: 'Equity Retained',
      value: '+$24,800'
    },
    secondaryOutcome: 'Sold in 6 Days • 104% of List Price',
    rating: 5,
    year: '2026',
    initials: 'MV',
    verifiedTransaction: true
  },
  {
    id: 'test-2',
    clientName: 'David & Priya Patel',
    location: 'Pickering Waterfront & City Centre',
    clientType: 'precon',
    clientTypeLabel: 'VIP Pre-Construction Investors',
    headline: 'Secured Phase 1 Platinum VIP allocation before the public even heard about it.',
    quote: 'We wanted a 2-bedroom corner suite at Pickering City Centre but were worried about lottery queues and inflated Phase 2 tiers. Amit utilized his direct builder relationships to secure our top-choice layout at foundational opening prices, complete with a free assignment clause and capped developmental levies. His financial modeling for 2028 closing was impeccably detailed.',
    outcomeMetric: {
      label: 'Phase 1 Value Advantage',
      value: '$35,000 Below Phase 2'
    },
    secondaryOutcome: 'Capped Levies • Free Assignment Rights',
    rating: 5,
    year: '2026',
    initials: 'DP',
    verifiedTransaction: true
  },
  {
    id: 'test-3',
    clientName: 'Dr. Julian & Karen Thorne',
    location: 'Courtice Trails, Clarington',
    clientType: 'buyer',
    clientTypeLabel: 'Executive Relocation Buyers',
    headline: 'Protected our interests fiercely during complex multi-offer bidding.',
    quote: 'Relocating from Toronto to Durham Region required someone with granular neighborhood insight. Amit analyzed historical municipal records, future transit corridors near the Bowmanville GO extension, and school rankings. When we found our dream detached home on a ravine lot, Amit structured our offer with terms that won against four competing bids without overpaying a single dollar.',
    outcomeMetric: {
      label: 'Offer Precision',
      value: 'Won vs 4 Bids'
    },
    secondaryOutcome: 'Ravine Lot Secured • Immediate Clean Closing',
    rating: 5,
    year: '2025',
    initials: 'JT',
    verifiedTransaction: true
  },
  {
    id: 'test-4',
    clientName: 'Sarah & Liam Chen',
    location: 'Downtown Whitby / Pringle Creek',
    clientType: 'buyer',
    clientTypeLabel: 'First-Time Freehold Homebuyers',
    headline: 'Zero pressure, 100% transparency — Amit turned our anxiety into confident ownership.',
    quote: 'As first-time buyers, we feared making an expensive mistake. Amit spent hours breaking down mortgage stress tests, land transfer tax rebates, and inspection pitfalls before we even visited our first open house. When inspection flagged a minor roof ventilation issue, he negotiated a $4,500 closing credit on our behalf. We could not recommend him more highly.',
    outcomeMetric: {
      label: 'Repair Credit Negotiated',
      value: '+$4,500'
    },
    secondaryOutcome: 'First-Time Rebate Maximized • 5-Star Experience',
    rating: 5,
    year: '2025',
    initials: 'SC',
    verifiedTransaction: true
  },
  {
    id: 'test-5',
    clientName: 'Robert K. MacIntyre',
    location: 'North Oshawa (Kedron)',
    clientType: 'investor',
    clientTypeLabel: 'Multi-Unit Portfolio Investor',
    headline: 'Unmatched rental yield analysis and airtight lease negotiations.',
    quote: 'I have worked with a dozen Realtors over fifteen years across the GTA. Amit stands in a league of his own. His analytical spreadsheet evaluating cash-on-cash returns, Durham property tax rates, and Oshawa University student tenant pools was better than what commercial brokerages provide. Both townhomes he sourced are cash-flowing from day one.',
    outcomeMetric: {
      label: 'Net Rental Yield',
      value: '6.2% Cap Rate'
    },
    secondaryOutcome: '100% Occupancy • Vetted AAA Tenants',
    rating: 5,
    year: '2026',
    initials: 'RM',
    verifiedTransaction: true
  },
  {
    id: 'test-6',
    clientName: 'Amira & Tarek Mansour',
    location: 'Ajax Lakeside',
    clientType: 'seller',
    clientTypeLabel: 'Downsizers & Home Sellers',
    headline: 'Seamless transition from a 3,400 sq.ft. detached to a luxury lakeside suite.',
    quote: 'Downsizing after 22 years in the same home was emotional and complex. Amit coordinated contractors for touch-ups, staged our property with museum-grade care, and listed at the exact psychological price point that sparked a frenzy. At the same time, he secured our new pre-construction lakeside condo with favorable deposit terms. Pure white-glove service.',
    outcomeMetric: {
      label: 'Equity Realized',
      value: '$1,280,000 Sold'
    },
    secondaryOutcome: 'Simultaneous Settlement • Zero Gap Stress',
    rating: 5,
    year: '2025',
    initials: 'AM',
    verifiedTransaction: true
  }
];

export const TRUST_STATS = [
  { label: 'Google & Verified Reviews', value: '5.0 ★★★★★', subtext: '100% 5-Star Track Record' },
  { label: 'Transaction Volume', value: '$45M+', subtext: 'Successfully Transacted' },
  { label: 'Avg Seller Savings', value: '$18,500', subtext: 'With 1% Listing Model' },
  { label: 'Client Retention Rate', value: '98.4%', subtext: 'Repeat & Referral Fiduciary Business' }
];
