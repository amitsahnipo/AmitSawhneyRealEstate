import { Project } from '../types';

const brooklinImg = '/src/assets/images/brooklin_trails_1785877631233.jpg';
const cobourgImg = '/src/assets/images/cobourg_trails_1785877640165.jpg';
const colganImg = '/src/assets/images/colgan_crossing_1785877650078.jpg';
const stonemanorImg = '/src/assets/images/stonemanor_woods_1785877658948.jpg';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'brooklin-trails-tribute',
    name: 'Brooklin Trails By Tribute',
    builder: 'Tribute Communities',
    location: {
      address: 'Baldwin St N & Columbus Rd W',
      city: 'Whitby',
      region: 'Durham Region',
      lat: 43.9555,
      lng: -78.9610,
      intersection: 'Baldwin St N & Columbus Rd W'
    },
    priceRange: {
      min: 719469,
      max: 1333000,
      display: 'From $719,469'
    },
    propertyTypes: ['Townhome', 'Detached Home'],
    status: 'Selling Now',
    occupancyYear: 'October 2027',
    totalUnits: 280,
    image: brooklinImg,
    galleryImages: [
      brooklinImg,
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Brooklin Trails is an extraordinary master-planned community of single-family homes and freehold townhomes by Tribute Communities located at Baldwin Street North & Columbus Road West in Whitby. Offering a harmonious blend of suburban tranquility and urban convenience in picturesque Whitby.',
    highlights: [
      'Master-planned freehold towns & 30\', 36\' & 40\' single family homes',
      'Direct access to Hwy 407, Hwy 412 & Whitby GO Station',
      'Avg price per sq.ft.: $524/sqft — outstanding value for Durham Region',
      'Close to top-ranked Whitby schools, parks & Whitby Town Centre'
    ],
    vipIncentives: [
      'Verified Client View Package & Floor Plans',
      'VIP Platinum Builder Discount & Capped Levies',
      '$10,000 Signing Bonus Credit',
      'Free Right to Assign',
      'Extended 5% Deposit Structure Over 1 Year'
    ],
    depositStructure: [
      { stage: '$10,000 Bank Draft', percentage: 1, timing: 'At Signing', estimatedAmount: '$10,000' },
      { stage: 'Balance to 5%', percentage: 4, timing: '30 Days', estimatedAmount: '$26,000' },
      { stage: '1st Installment', percentage: 1, timing: '120 Days', estimatedAmount: '$7,200' },
      { stage: '2nd Installment', percentage: 1, timing: '180 Days', estimatedAmount: '$7,200' },
      { stage: '3rd Installment', percentage: 1, timing: '270 Days', estimatedAmount: '$7,200' },
      { stage: '4th Installment', percentage: 1, timing: '300 Days', estimatedAmount: '$7,200' },
      { stage: '5th Installment', percentage: 1, timing: '365 Days', estimatedAmount: '$7,200' }
    ],
    floorPlans: [
      {
        id: 'bt-town-3b',
        name: 'The Baldwin Freehold Town',
        type: '3 Bed Townhome',
        sqft: 1420,
        bathrooms: 2.5,
        startingPrice: '$719,469',
        features: ['Freehold Townhome', '9ft Ceilings', 'Granite Kitchen Countertops', 'Private Garage']
      },
      {
        id: 'bt-sing-4b',
        name: 'The Whitby Estate 36\'',
        type: '4 Bed Detached',
        sqft: 2480,
        bathrooms: 3.5,
        startingPrice: '$1,089,900',
        features: ['36\' Lot', 'Double Car Garage', 'Primary Luxury Ensuite', 'Hardwood Flooring']
      }
    ],
    featured: true
  },
  {
    id: 'cobourg-trails-tribute',
    name: 'Cobourg Trails By Tribute',
    builder: 'Tribute Communities',
    location: {
      address: '620 Elgin Street East',
      city: 'Cobourg',
      region: 'Northumberland',
      lat: 43.9680,
      lng: -78.1520,
      intersection: 'Elgin St E & Division St'
    },
    priceRange: {
      min: 574327,
      max: 1048990,
      display: 'From $574,327'
    },
    propertyTypes: ['Townhome', 'Detached Home'],
    status: 'Platinum VIP Launch',
    occupancyYear: 'Q4 2026',
    totalUnits: 220,
    image: cobourgImg,
    galleryImages: [
      cobourgImg,
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Cobourg Trails is a stunning new release of 30\', 38\' & 45\' detached single family homes and freehold townhomes by Tribute Communities in beautiful Cobourg, minutes from Lake Ontario beaches, Historic Downtown Cobourg, and Highway 401.',
    highlights: [
      'Exclusive Registered Client View Available',
      '30\', 38\' & 45\' Single Family Lots & Freehold Townhomes',
      '2 Minutes to Highway 401 & Northumberland Hills Hospital',
      'Short drive to Cobourg Beach Boardwalk & Marina'
    ],
    vipIncentives: [
      'Live VIP Pricing & Worksheets Access',
      'Capped Development Charges Guaranteed',
      'Free Assignment Right',
      '$15,000 Upgraded Decor Studio Credit',
      'Extended Deposit Structure'
    ],
    depositStructure: [
      { stage: '$10,000 Draft', percentage: 2, timing: 'At Signing', estimatedAmount: '$10,000' },
      { stage: 'Balance to 5%', percentage: 3, timing: '30 Days', estimatedAmount: '$18,700' },
      { stage: '2nd Deposit', percentage: 2.5, timing: '90 Days', estimatedAmount: '$14,300' },
      { stage: '3rd Deposit', percentage: 2.5, timing: '180 Days', estimatedAmount: '$14,300' }
    ],
    floorPlans: [
      {
        id: 'ct-town',
        name: 'The Elgin Freehold Town',
        type: '3 Bed Townhome',
        sqft: 1380,
        bathrooms: 2.5,
        startingPrice: '$574,327',
        features: ['Freehold', 'Modern Kitchen', 'Main Floor Hardwood']
      },
      {
        id: 'ct-sing-38',
        name: 'The Heritage 38\' Detached',
        type: '4 Bed Detached',
        sqft: 2210,
        bathrooms: 3.5,
        startingPrice: '$849,900',
        features: ['2-Car Garage', 'Primary Soaker Tub', 'Gas Fireplace']
      }
    ],
    featured: true
  },
  {
    id: 'colgan-crossing-tribute',
    name: 'Colgan Crossing By Tribute',
    builder: 'Tribute Communities & Greybrook',
    location: {
      address: 'County Road 14 & Concession Rd 8',
      city: 'Colgan / Tottenham',
      region: 'Simcoe County',
      lat: 44.0298,
      lng: -79.8051,
      intersection: 'County Rd 14 & Queen St'
    },
    priceRange: {
      min: 899900,
      max: 1499900,
      display: 'From $899,900'
    },
    propertyTypes: ['Detached Home', 'Townhome'],
    status: 'Platinum VIP Launch',
    occupancyYear: 'Q3 2027',
    totalUnits: 190,
    image: colganImg,
    galleryImages: [
      colganImg,
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Colgan Crossing is a serene master-planned community of bungalow townhomes and single-detached homes nestled amongst rolling hills in Colgan (Simcoe County), just 5 minutes from Tottenham and 20 minutes from Highway 400.',
    highlights: [
      'Verified VIP Client View Integration',
      'Expansive 40\', 50\' & 60\' estate lots surrounded by rolling nature',
      '5 minutes to Tottenham, boutiques, dining & golf courses',
      'Bungalow & 2-storey layouts designed for upscale family living'
    ],
    vipIncentives: [
      'Direct Registered Client Access Portal',
      '$25,000 Platinum Builder Upgrades Credit',
      'Free Assignment Privilege',
      'Capped Development Levies',
      'Extended 10% Deposit Structure'
    ],
    depositStructure: [
      { stage: '$20,000 Draft', percentage: 2, timing: 'At Signing', estimatedAmount: '$20,000' },
      { stage: 'Balance to 5%', percentage: 3, timing: '30 Days', estimatedAmount: '$25,000' },
      { stage: '2nd Deposit', percentage: 2.5, timing: '120 Days', estimatedAmount: '$22,500' },
      { stage: '3rd Deposit', percentage: 2.5, timing: '240 Days', estimatedAmount: '$22,500' }
    ],
    floorPlans: [
      {
        id: 'cc-bung-3b',
        name: 'The Simcoe Bungalow',
        type: '3 Bed Bungalow',
        sqft: 1850,
        bathrooms: 2.5,
        startingPrice: '$899,900',
        features: ['Main Floor Primary Suite', '10ft Ceilings', 'Covered Porch', 'Granite Kitchen']
      }
    ],
    featured: true
  },
  {
    id: 'stonemanor-woods-tribute',
    name: 'Stonemanor Woods By Tribute',
    builder: 'Tribute Communities',
    location: {
      address: 'Sunnidale Road & Oliver’s Mill Rd',
      city: 'Springwater / Barrie',
      region: 'Simcoe County',
      lat: 44.3890,
      lng: -79.7420,
      intersection: 'Sunnidale Rd & Bayfield St'
    },
    priceRange: {
      min: 849900,
      max: 1399900,
      display: 'From $849,900'
    },
    propertyTypes: ['Detached Home'],
    status: 'Selling Now',
    occupancyYear: 'Q2 2026',
    totalUnits: 175,
    image: stonemanorImg,
    galleryImages: [
      stonemanorImg,
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Stonemanor Woods is a prestigious master-planned estate community of 42\', 50\' & 60\' single family homes in Springwater, just 5 minutes outside Barrie, Highway 400, and Lake Simcoe water activities.',
    highlights: [
      'Verified VIP Client View Integration',
      'Picturesque country atmosphere with Barrie urban conveniences 5 mins away',
      '42\', 50\' and 60\' deep estate lots with side entrance options',
      'Close to Snow Valley Ski Resort, Georgian College & RVH Hospital'
    ],
    vipIncentives: [
      'Real-Time Registered Client Feed Access',
      'Up to $35,000 Price Credit on Select Lots',
      'Free Hardwood Main Floor Upgrade',
      'Free Assignment Right',
      'Reduced Deposit Schedule'
    ],
    depositStructure: [
      { stage: '$15,000 Draft', percentage: 2, timing: 'At Signing', estimatedAmount: '$15,000' },
      { stage: 'Balance to 5%', percentage: 3, timing: '30 Days', estimatedAmount: '$27,500' },
      { stage: '2nd Deposit', percentage: 2.5, timing: '120 Days', estimatedAmount: '$21,250' },
      { stage: '3rd Deposit', percentage: 2.5, timing: '240 Days', estimatedAmount: '$21,250' }
    ],
    floorPlans: [
      {
        id: 'sw-det-42',
        name: 'The Springwater 42\'',
        type: '4 Bed Detached',
        sqft: 2540,
        bathrooms: 3.5,
        startingPrice: '$849,900',
        features: ['42\' Frontage Lot', 'Gas Fireplace', 'Granite Counters', 'Loft Space']
      }
    ],
    featured: true
  },
  {
    id: 'grand-niagara-residences',
    name: 'The Grand Niagara Residences',
    builder: 'Great Gulf',
    location: {
      address: '8520 Montrose Road',
      city: 'Niagara Falls',
      region: 'Niagara Region',
      lat: 43.0642,
      lng: -79.1124,
      intersection: 'Montrose Rd & QEW'
    },
    priceRange: {
      min: 489900,
      max: 899900,
      display: 'From $489,900'
    },
    propertyTypes: ['High-Rise Condo', 'Townhome'],
    status: 'Platinum VIP Launch',
    occupancyYear: 'Q3 2027',
    totalUnits: 320,
    storeys: 28,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'The Grand Niagara Residences is a master-planned luxury waterfront project situated minutes from the QEW, Niagara River, and world-class wineries. Featuring modern architecture, panoramic skyline views, resort-style amenities, and high rental yield potential for savvy investors.',
    highlights: [
      'Minutes to QEW Highway & Niagara Falls Entertainment District',
      'Floor-to-ceiling double glazed windows with expansive balconies',
      '20,000 sq ft luxury amenities including rooftop infinity pool & spa',
      'Zero assignment fee for Blueprint Realty Platinum VIP clients'
    ],
    vipIncentives: [
      'Capped Development Charges at $5,000',
      'Free Assignment Right (Valued at $10,000)',
      'Right to Lease During Occupancy',
      '$10,000 Decor Dollars Credit on Closing',
      'Extended 15% Deposit Structure Over 18 Months'
    ],
    depositStructure: [
      { stage: '$5,000 on Signing', percentage: 1, timing: 'At Signing', estimatedAmount: '$5,000' },
      { stage: 'Balance to 5%', percentage: 4, timing: '30 Days', estimatedAmount: '$19,500' },
      { stage: 'Second Deposit', percentage: 5, timing: '180 Days', estimatedAmount: '$24,500' },
      { stage: 'Third Deposit', percentage: 5, timing: '360 Days', estimatedAmount: '$24,500' },
      { stage: 'Occupancy Deposit', percentage: 5, timing: 'At Occupancy (Q3 2027)', estimatedAmount: '$24,500' }
    ],
    floorPlans: [
      {
        id: 'gn-1b',
        name: 'The Falls - 1 Bed',
        type: '1 Bedroom',
        sqft: 540,
        bathrooms: 1,
        startingPrice: '$489,900',
        exposure: 'East / Skyline View',
        features: ['Quartz Countertops', 'Built-in European Appliances', '9ft Ceilings', 'Private Balcony']
      },
      {
        id: 'gn-1bd',
        name: 'The River - 1 Bed + Den',
        type: '1 Bed + Den',
        sqft: 665,
        bathrooms: 1.5,
        startingPrice: '$559,900',
        exposure: 'South / Water View',
        features: ['Ensuite Bath', 'Enclosed Den/Home Office', 'Walk-in Closet', 'Laminate Flooring']
      },
      {
        id: 'gn-2b',
        name: 'The Summit - 2 Bed Suite',
        type: '2 Bedroom',
        sqft: 815,
        bathrooms: 2,
        startingPrice: '$689,900',
        exposure: 'South West Corner',
        features: ['Corner Unit', 'Wrap-around Balcony', 'Master Ensuite', 'Kitchen Island']
      }
    ],
    featured: true
  },
  {
    id: 'mississauga-city-centre-condos',
    name: 'Square One City Centre Towers',
    builder: 'Daniels Corporation',
    location: {
      address: '385 Prince of Wales Drive',
      city: 'Mississauga',
      region: 'Peel Region',
      lat: 43.5890,
      lng: -79.6441,
      intersection: 'Hurontario St & Burnhamthorpe Rd'
    },
    priceRange: {
      min: 529900,
      max: 989900,
      display: 'From $529,900'
    },
    propertyTypes: ['High-Rise Condo'],
    status: 'Selling Now',
    occupancyYear: 'Q4 2026',
    totalUnits: 480,
    storeys: 45,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Soaring high above Downtown Mississauga, Square One City Centre Towers puts you steps away from Square One Shopping Centre, the upcoming Hazel McCallion LRT, Sheridan College, and Celebration Square.',
    highlights: [
      'Direct access to Hazel McCallion LRT & GO Transit Terminal',
      'Steps from Square One Shopping Mall & Sheridan College Hazel McCallion Campus',
      'State-of-the-art co-working lounge, outdoor terrace & basketball court',
      'High rental demand in Mississauga’s booming downtown core'
    ],
    vipIncentives: [
      'Capped Development Levies at $7,500',
      'Extended 10% Deposit Structure for End Users',
      'Free Assignment Right',
      'Free Parking Spot on Select 2-Bed Units'
    ],
    depositStructure: [
      { stage: '$10,000 Bank Draft', percentage: 2, timing: 'At Signing', estimatedAmount: '$10,000' },
      { stage: 'Balance to 5%', percentage: 3, timing: '30 Days', estimatedAmount: '$16,500' },
      { stage: 'Second Deposit', percentage: 5, timing: '120 Days', estimatedAmount: '$26,500' },
      { stage: 'Third Deposit', percentage: 5, timing: '360 Days', estimatedAmount: '$26,500' },
      { stage: 'Occupancy Deposit', percentage: 5, timing: 'Occupancy', estimatedAmount: '$26,500' }
    ],
    floorPlans: [
      {
        id: 'sq1-1b',
        name: 'The Civic 1B',
        type: '1 Bedroom',
        sqft: 510,
        bathrooms: 1,
        startingPrice: '$529,900',
        exposure: 'North',
        features: ['Smart Home Automation', 'Floor-to-ceiling Windows', 'Stainless Steel Package']
      },
      {
        id: 'sq1-2b',
        name: 'The Celebration 2B',
        type: '2 Bedroom',
        sqft: 740,
        bathrooms: 2,
        startingPrice: '$719,900',
        exposure: 'South / CN Tower View',
        features: ['Master Suite Walk-in', 'Kitchen Island', 'Spacious Living Room']
      }
    ],
    featured: true
  },
  {
    id: 'empire-canals-townhomes',
    name: 'Empire Canals Master Community',
    builder: 'Empire Communities',
    location: {
      address: '1200 Dain City Road',
      city: 'Welland / Niagara',
      region: 'Niagara Region',
      lat: 42.9721,
      lng: -79.2483,
      intersection: 'King St & Canal Bank Rd'
    },
    priceRange: {
      min: 569900,
      max: 899900,
      display: 'From $569,900'
    },
    propertyTypes: ['Townhome', 'Stacked Town', 'Detached Home'],
    status: 'Platinum VIP Launch',
    occupancyYear: 'Q2 2026',
    totalUnits: 210,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An extraordinary water-inspired master-planned townhome & detached community situated right along the historic Welland Canal in the heart of Niagara. Enjoy waterside trails, parks, and easy access to Niagara-on-the-Lake.',
    highlights: [
      'Waterfront trail access & future community boat dock',
      'Spacious 3 & 4 bedroom layouts with private garages & backyards',
      '15 minutes to Port Dalhousie & Niagara Wineries',
      'Ideal for growing families, downsizers, and rental investors'
    ],
    vipIncentives: [
      'Up to $30,000 Off Purchase Price on Townhomes',
      '$15,000 Upgraded Finishes Voucher',
      'Extended Deposit Structure (Only 10% in Year 1)',
      'Free Assignment Right'
    ],
    depositStructure: [
      { stage: '$10,000 Draft', percentage: 2, timing: 'At Signing', estimatedAmount: '$10,000' },
      { stage: 'Balance to 5%', percentage: 3, timing: '30 Days', estimatedAmount: '$18,500' },
      { stage: 'Second Deposit', percentage: 2.5, timing: '90 Days', estimatedAmount: '$14,250' },
      { stage: 'Third Deposit', percentage: 2.5, timing: '180 Days', estimatedAmount: '$14,250' }
    ],
    floorPlans: [
      {
        id: 'ec-town-3b',
        name: 'The Canal Modern Town',
        type: '3 Bed Townhome',
        sqft: 1640,
        bathrooms: 2.5,
        startingPrice: '$569,900',
        features: ['Attached Garage', '9ft Main Floor Ceilings', 'Granite Kitchen Countertops', 'Main Floor Laundry']
      },
      {
        id: 'ec-det-4b',
        name: 'The Heritage Detached',
        type: '4 Bed Detached Home',
        sqft: 2280,
        bathrooms: 3.5,
        startingPrice: '$799,900',
        features: ['2-Car Garage', 'Primary Ensuite with Soaker Tub', 'Hardwood Main Floor', 'Covered Porch']
      }
    ],
    featured: true
  },
  {
    id: 'hamilton-bayfront-lofts',
    name: 'Hamilton Bayfront West',
    builder: 'Spallacci Group',
    location: {
      address: '220 James Street North',
      city: 'Hamilton',
      region: 'Hamilton-Wentworth',
      lat: 43.2657,
      lng: -79.8679,
      intersection: 'James St N & Barton St W'
    },
    priceRange: {
      min: 449900,
      max: 789900,
      display: 'From $449,900'
    },
    propertyTypes: ['Mid-Rise Condo', 'Stacked Town'],
    status: 'Platinum VIP Launch',
    occupancyYear: 'Q1 2027',
    totalUnits: 185,
    storeys: 12,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Located in Hamilton’s bustling James Street North Arts & Culture District, Bayfront West is minutes from West Harbour GO Station, McMaster University Innovation Park, and Pier 4 Park.',
    highlights: [
      '3 min walk to West Harbour GO Train Station (Direct to Union Station Toronto)',
      'Steps to James St N galleries, award-winning restaurants & cafes',
      'Geothermal heating & cooling system for low condo maintenance fees',
      'High student & professional healthcare rental demand'
    ],
    vipIncentives: [
      'Capped Levies at $5,000 All Sizes',
      'Free Assignment Right',
      '1 Year Free Property Management for Investors',
      'Flexible 12-Month Deposit Plan'
    ],
    depositStructure: [
      { stage: '$5,000 on Signing', percentage: 1, timing: 'Signing', estimatedAmount: '$5,000' },
      { stage: 'Balance to 5%', percentage: 4, timing: '30 Days', estimatedAmount: '$17,500' },
      { stage: 'Second 5%', percentage: 5, timing: '180 Days', estimatedAmount: '$22,500' },
      { stage: 'Third 5%', percentage: 5, timing: '365 Days', estimatedAmount: '$22,500' }
    ],
    floorPlans: [
      {
        id: 'hb-1b',
        name: 'The Gallery Loft',
        type: '1 Bedroom',
        sqft: 495,
        bathrooms: 1,
        startingPrice: '$449,900',
        features: ['Exposed Concrete Accent Wall', 'Quartz Countertops', 'Laminate Flooring']
      },
      {
        id: 'hb-2b',
        name: 'The Harbour Suite',
        type: '2 Bedroom',
        sqft: 720,
        bathrooms: 2,
        startingPrice: '$629,900',
        features: ['Bayfront Harbor View', 'Primary Bath Suite', 'Custom Millwork Kitchen']
      }
    ],
    featured: false
  },
  {
    id: 'brampton-west-estates',
    name: 'Brampton Heritage Green Estates',
    builder: 'Paradise Developments',
    location: {
      address: '9420 Chinguacousy Road',
      city: 'Brampton',
      region: 'Peel Region',
      lat: 43.6841,
      lng: -79.7915,
      intersection: 'Chinguacousy Rd & Queen St W'
    },
    priceRange: {
      min: 799900,
      max: 1399900,
      display: 'From $799,900'
    },
    propertyTypes: ['Townhome', 'Detached Home'],
    status: 'Selling Now',
    occupancyYear: 'Q3 2026',
    totalUnits: 140,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An exclusive luxury collection of modern freehold townhomes and 38’ & 42’ detached homes in West Brampton. Surrounded by lush ravines, Mount Pleasant GO station, top-rated schools, and community parks.',
    highlights: [
      'Freehold Townhomes & Detached Single Family Residences',
      '5 Minutes to Mount Pleasant GO Station & Highway 407/401',
      'Side door separate entrances available for secondary basement suites',
      'Hardwood floors, smooth ceilings & smooth stone exterior finishes'
    ],
    vipIncentives: [
      '$25,000 Upgraded Kitchen & Bath Voucher',
      'Separate Basement Side Entrance Included (Select Lots)',
      'Extended Deposit Structure Over 1 Year',
      'Zero Development Charge Increase Guarantee'
    ],
    depositStructure: [
      { stage: '$20,000 Bank Draft', percentage: 2.5, timing: 'At Signing', estimatedAmount: '$20,000' },
      { stage: '$30,000', percentage: 3.5, timing: '30 Days', estimatedAmount: '$30,000' },
      { stage: '$30,000', percentage: 3.5, timing: '90 Days', estimatedAmount: '$30,000' },
      { stage: '$30,000', percentage: 3.5, timing: '180 Days', estimatedAmount: '$30,000' }
    ],
    floorPlans: [
      {
        id: 'bw-town',
        name: 'The Chinguacousy Freehold Town',
        type: '3 Bed Townhome',
        sqft: 1890,
        bathrooms: 2.5,
        startingPrice: '$799,900',
        features: ['Freehold (No Maintenance Fees)', 'Cold Cellar', '9ft Ceilings on Main & 2nd', 'Quartz Counters']
      },
      {
        id: 'bw-det-38',
        name: 'The Mount Pleasant Detached 38’',
        type: '4 Bed Detached',
        sqft: 2750,
        bathrooms: 3.5,
        startingPrice: '$1,199,900',
        features: ['2-Car Garage', 'Separate Side Entrance to Basement', '2 Ensuite Bathrooms', 'Gas Fireplace']
      }
    ],
    featured: true
  },
  {
    id: 'oakville-preserve-towns',
    name: 'Oakville Preserve Crossing',
    builder: 'Mattamy Homes',
    location: {
      address: '3009 Dundas Street West',
      city: 'Oakville',
      region: 'Halton Region',
      lat: 43.4675,
      lng: -79.7423,
      intersection: 'Dundas St W & Bronte Rd'
    },
    priceRange: {
      min: 749900,
      max: 1249900,
      display: 'From $749,900'
    },
    propertyTypes: ['Townhome', 'Stacked Town'],
    status: 'Upcoming Registration',
    occupancyYear: 'Q4 2026',
    totalUnits: 165,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Set in North Oakville, Oakville Preserve Crossing offers refined living surrounded by Bronte Creek Provincial Park, top-tier Oakville public & private schools, and quick access to Highway 407 & 403.',
    highlights: [
      'Prestigious Oakville location with top-ranking schools',
      'Modern West Coast & Craftsman architectural design',
      'Roof terrace options with outdoor BBQ gas connections',
      'Mattamy Smart Home technology package included'
    ],
    vipIncentives: [
      'Blueprint VIP Platinum Early Registration Advantage',
      '$20,000 Upgrade Credit at Mattamy Design Studio',
      'Capped Development Charges',
      'Free Assignment Right'
    ],
    depositStructure: [
      { stage: '$10,000 Draft', percentage: 1.5, timing: 'Signing', estimatedAmount: '$10,000' },
      { stage: 'Balance to 5%', percentage: 3.5, timing: '30 Days', estimatedAmount: '$27,500' },
      { stage: 'Second 5%', percentage: 5, timing: '120 Days', estimatedAmount: '$37,500' },
      { stage: 'Third 5%', percentage: 5, timing: '240 Days', estimatedAmount: '$37,500' }
    ],
    floorPlans: [
      {
        id: 'op-town-2b',
        name: 'The Bronte Urban Town',
        type: '2 Bed Townhome',
        sqft: 1420,
        bathrooms: 2,
        startingPrice: '$749,900',
        features: ['Rooftop Terrace', 'Single Car Garage', 'Custom Kitchen Cabinets']
      }
    ],
    featured: false
  },
  {
    id: 'toronto-vanguard-condos',
    name: 'The Vanguard Waterfront Toronto',
    builder: 'Tridel',
    location: {
      address: '215 Lakeshore Blvd East',
      city: 'Toronto',
      region: 'Toronto',
      lat: 43.6487,
      lng: -79.3681,
      intersection: 'Lakeshore Blvd E & Parliament St'
    },
    priceRange: {
      min: 649900,
      max: 1699900,
      display: 'From $649,900'
    },
    propertyTypes: ['High-Rise Condo'],
    status: 'Platinum VIP Launch',
    occupancyYear: 'Q2 2028',
    totalUnits: 550,
    storeys: 42,
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Tridel’s flagship waterfront community along Toronto’s East Bayfront. Breathtaking views of Lake Ontario, direct access to Sugar Beach, Distillery District, and Union Station LRT line.',
    highlights: [
      'Tridel LEED Gold Green Building standard with low utilities',
      'Steps to Sugar Beach, George Brown College waterfront campus & St. Lawrence Market',
      'Zero assignment fee & reduced deposit structure for Blueprint clients'
    ],
    vipIncentives: [
      '10% Total Deposit Before Occupancy',
      'Free Right to Assign',
      'Right to Lease During Interim Occupancy',
      'Capped Development Charges ($10,000)'
    ],
    depositStructure: [
      { stage: '$10,000 Bank Draft', percentage: 1.5, timing: 'Signing', estimatedAmount: '$10,000' },
      { stage: 'Balance to 5%', percentage: 3.5, timing: '30 Days', estimatedAmount: '$22,500' },
      { stage: '5% Deposit', percentage: 5, timing: '180 Days', estimatedAmount: '$32,500' },
      { stage: '5% at Occupancy', percentage: 5, timing: 'Occupancy Q2 2028', estimatedAmount: '$32,500' }
    ],
    floorPlans: [
      {
        id: 'tv-1b',
        name: 'The Harbourfront 1B',
        type: '1 Bedroom',
        sqft: 525,
        bathrooms: 1,
        startingPrice: '$649,900',
        features: ['Lake Ontario South View', 'Miele Appliance Package', '10ft Ceilings']
      }
    ],
    featured: true
  },
  {
    id: 'vaughan-metropolitan-station',
    name: 'Vaughan Station East Condos',
    builder: 'CentreCourt Developments',
    location: {
      address: '100 Millway Avenue',
      city: 'Vaughan',
      region: 'York Region',
      lat: 43.7942,
      lng: -79.5284,
      intersection: 'Jane St & Highway 7'
    },
    priceRange: {
      min: 499900,
      max: 879900,
      display: 'From $499,900'
    },
    propertyTypes: ['High-Rise Condo'],
    status: 'Selling Now',
    occupancyYear: 'Q1 2027',
    totalUnits: 620,
    storeys: 52,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Located directly adjacent to the Vaughan Metropolitan Centre (VMC) TTC Subway Station. Reach York University in 5 minutes and Downtown Toronto Union Station in 40 minutes with zero transfers.',
    highlights: [
      '0 Minutes to VMC Subway Station & SmartTransit Bus Terminal',
      'Minutes to Highway 400, 407, York University & Vaughan Mills Mall',
      'CentreCourt track record: 100% on-time project completion guarantee',
      'High rental rates driven by York University students & tech commuters'
    ],
    vipIncentives: [
      'Extended 15% Deposit Structure Over 2 Years',
      'Free Assignment Right',
      'Capped Levies at $7,500',
      'Smooth Ceilings & Upgraded Kitchen Included'
    ],
    depositStructure: [
      { stage: '$5,000 on Signing', percentage: 1, timing: 'At Signing', estimatedAmount: '$5,000' },
      { stage: 'Balance to 5%', percentage: 4, timing: '30 Days', estimatedAmount: '$20,000' },
      { stage: '5% Deposit', percentage: 5, timing: '120 Days', estimatedAmount: '$25,000' },
      { stage: '5% Deposit', percentage: 5, timing: '300 Days', estimatedAmount: '$25,000' }
    ],
    floorPlans: [
      {
        id: 'vmc-1b',
        name: 'The Transit 1B',
        type: '1 Bedroom',
        sqft: 480,
        bathrooms: 1,
        startingPrice: '$499,900',
        features: ['Floor-to-Ceiling Windows', 'Quartz Countertops', 'In-suite Laundry']
      }
    ],
    featured: false
  }
];
