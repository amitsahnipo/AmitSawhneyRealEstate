import { CommunityInfo } from '../types';

export const COMMUNITIES_DATA: CommunityInfo[] = [
  {
    id: 'whitby',
    name: 'Whitby',
    region: 'Durham Region',
    tagline: 'Lakeside Prestige, Thriving Downtown & Rapid GO Transit Access',
    description: 'Whitby blends historic charm with dynamic lakeside urban growth. Renowned for top-tier schools, Port Whitby marina, and seamless 40-minute GO Train access to Union Station, it remains one of the GTA\'s most desirable family and investment hubs.',
    avgPrice: '$1,045,000',
    avgPreconPrice: 'From $649,900',
    transitSummary: 'Whitby GO Hub (Lakeshore East), Highways 401 & 412',
    commuteToToronto: '38 - 45 mins to Union Station via GO Train',
    lifestyleTags: ['Lakeside Trails', 'Top-Rated Schools', 'Heritage Downtown', 'Marina Living'],
    topHighlights: [
      'Port Whitby Marina and Lake Ontario Waterfront Trail with miles of recreation',
      'Iroquois Park Sports Centre — Canada’s largest municipal recreation complex',
      'Direct interchange to Highway 412 connecting seamlessly to Highway 407 and 401'
    ],
    schools: ['Donald A. Wilson SS', 'Sinclair SS', 'All Saints Catholic CSS'],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['Executive Detached', 'Lakeside Condos', 'Freehold Towns']
  },
  {
    id: 'brooklin',
    name: 'Brooklin',
    region: 'Durham Region (North Whitby)',
    tagline: 'Upscale Village Atmosphere with Modern Master-Planned Communities',
    description: 'Nestled in North Whitby, Brooklin is celebrated for its picturesque historic village core, upscale estate developments, boutique restaurants, and high-demand master-planned communities by premier builders like Tribute.',
    avgPrice: '$1,280,000',
    avgPreconPrice: 'From $849,900',
    transitSummary: 'Hwy 407 & Hwy 412 direct exits; minutes to Whitby GO',
    commuteToToronto: '40 mins to North York / Markham via Highway 407',
    lifestyleTags: ['Village Charm', 'Estate Lots', 'Family-Centric', 'Boutique Dining'],
    topHighlights: [
      'Charming historic downtown filled with gourmet cafes, pubs, and local bakeries',
      'Rapid access to Highway 407 for frictionless east-west GTA commuting',
      'Master-planned releases like Brooklin Trails offering generous 38\' & 45\' lots'
    ],
    schools: ['Brooklin High School', 'Chris Hadfield PS', 'St. Bridget Catholic School'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['Custom Estates', '38\' & 45\' Detached', 'Bungalow Towns']
  },
  {
    id: 'courtice',
    name: 'Courtice',
    region: 'Durham Region (Clarington)',
    tagline: 'Unbeatable Value, Scenic Ravines & Expanding Transit Corridors',
    description: 'Situated immediately east of Oshawa in the Municipality of Clarington, Courtice offers expansive green space, scenic ravines, and high affordability. With the upcoming Bowmanville GO Train expansion passing through, value appreciation is among Durham’s highest.',
    avgPrice: '$895,000',
    avgPreconPrice: 'From $599,900',
    transitSummary: 'Highway 401, Hwy 418 connection to 407, Future Courtice GO Hub',
    commuteToToronto: '45 mins via 401 or GO Transit',
    lifestyleTags: ['Conservation Ravines', 'High Value Growth', 'Tranquil Parks', 'Spacious Yards'],
    topHighlights: [
      'Priced up to 25% below equivalent west-GTA communities, maximizing purchasing power',
      'Metrolinx Bowmanville GO Train expansion bringing dedicated local rail service',
      'Abundance of conservation areas including Courtice Community Complex & Millennium Trail'
    ],
    schools: ['Courtice Secondary School', 'Holy Trinity Catholic SS', 'Good Shepherd CES'],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['Ravine Townhomes', '2-Storey Detached', 'New Subdivisions']
  },
  {
    id: 'oshawa',
    name: 'Oshawa',
    region: 'Durham Region',
    tagline: 'Dynamic Education & Healthcare Engine with Booming North Communities',
    description: 'Oshawa has transformed into a leading tech, healthcare, and post-secondary educational powerhouse anchored by Ontario Tech University and Lakeridge Health. North Oshawa (Kedron / Windfields) features explosive modern developments and major retail centres.',
    avgPrice: '$825,000',
    avgPreconPrice: 'From $499,900',
    transitSummary: 'Oshawa Central GO (30-min express to Union), Hwy 407 & 401',
    commuteToToronto: '40 mins express train to Toronto Union',
    lifestyleTags: ['University Hub', 'High Rental Yield', 'Retail Power Centres', 'Hospital Network'],
    topHighlights: [
      'North Oshawa retail super-hub featuring RioCan Windfields Plaza and Costco',
      'Strong student and medical professional rental demand with attractive cap rates',
      'Continuous infrastructure upgrades and major master-planned builder releases'
    ],
    schools: ['Maxwell Heights SS', 'O’Neill CVI', 'Ontario Tech University Campus'],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['Single Family Homes', 'Stacked Towns', 'Investment Condos']
  },
  {
    id: 'pickering',
    name: 'Pickering',
    region: 'Durham Region',
    tagline: 'The Gateway to Durham: Frenchman’s Bay Waterfront & City Centre Hub',
    description: 'Directly bordering Toronto to the east, Pickering offers the shortest commute into Toronto while maintaining spectacular natural beauty along Frenchman’s Bay, Petticoat Creek, and the future Seaton master-planned community.',
    avgPrice: '$1,090,000',
    avgPreconPrice: 'From $589,900',
    transitSummary: 'Pickering GO (Pedestrian bridge to Mall), Hwy 401 & 407',
    commuteToToronto: '28 mins express train to Union Station',
    lifestyleTags: ['Direct Toronto Border', 'Frenchman\'s Bay', 'Seaton Master Plan', 'GO Express Hub'],
    topHighlights: [
      'Fastest transit commute into Downtown Toronto of any Durham municipality',
      'Nautical Village boardwalk with waterfront dining, sailing clubs, and beaches',
      'Massive billion-dollar revitalization of Pickering Town Centre into high-density transit hub'
    ],
    schools: ['Dunbarton High School', 'Pine Ridge SS', 'St. Mary Catholic SS'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['High-Rise Transit Condos', 'Waterfront Townhomes', 'Seaton Detached']
  },
  {
    id: 'ajax',
    name: 'Ajax',
    region: 'Durham Region',
    tagline: 'Miles of Uninterrupted Public Waterfront & Thriving Family Neighborhoods',
    description: 'Ajax is uniquely distinguished by having 100% of its Lake Ontario shoreline publicly accessible, surrounded by parkland and scenic bike trails. It features exceptional civic infrastructure, community centres, and diverse family-friendly neighborhoods.',
    avgPrice: '$975,000',
    avgPreconPrice: 'From $619,900',
    transitSummary: 'Ajax GO Station, Highway 401 & Westney / Salem Corridors',
    commuteToToronto: '35 mins via GO Transit',
    lifestyleTags: ['Public Shoreline', 'Rotary Park', 'Diverse Community', 'Modern Retail'],
    topHighlights: [
      'Over 6 km of pristine public waterfront parkland without private commercial barriers',
      'Centrally located shopping corridors along Salem Road and Kingston Road',
      'High-performing elementary and secondary school options'
    ],
    schools: ['Ajax High School', 'J. Clarke Richardson Collegiate', 'Archbishop Denis O’Connor'],
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['Modern Semi-Detached', 'Freehold Townhomes', 'Single-Family Homes']
  },
  {
    id: 'newcastle',
    name: 'Newcastle',
    region: 'Durham Region (Port of Newcastle)',
    tagline: 'Relaxed Port Town Living, Private Marina Clubs & Deep Waterfront Lots',
    description: 'Located in eastern Clarington, Newcastle is a peaceful lakeside sanctuary beloved by retirees, move-up families, and buyers seeking tranquil community living with large lots, private marina access, and charming historic village avenues.',
    avgPrice: '$875,000',
    avgPreconPrice: 'From $549,900',
    transitSummary: 'Highway 401 direct interchange, easy link to 418/407',
    commuteToToronto: '55 mins via Highway 401 / GO Rail',
    lifestyleTags: ['Port Marina Living', 'Spacious Bungalows', 'Peaceful Sanctuary', 'Beachside Community'],
    topHighlights: [
      'Port of Newcastle Admiral’s Club amenities featuring indoor saltwater pool, gym & marina',
      'Historic downtown village with quaint artisan bakeries, cafes, and antique markets',
      'Deep, wide estate and bungalow lots rarely available closer to Toronto'
    ],
    schools: ['Clarke High School', 'The Pines Senior PS', 'St. Francis of Assisi'],
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    popularPropertyTypes: ['Lakeside Bungalows', 'Port Marina Towns', 'Sprawling Detached']
  }
];
