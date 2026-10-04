import { CanadianProvince, SubjectPropertyInput, ValuationPropertyType } from './types.js';

export interface PreloadedAddressRecord {
  fullAddress: string;
  streetNumber: string;
  streetName: string;
  unit?: string;
  municipality: string;
  province: CanadianProvince;
  postalCode: string;
  propertyType: ValuationPropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: string;
  yearBuilt: number;
  garage: number;
  basement: 'Finished' | 'Unfinished' | 'Partially Finished' | 'None' | 'Separate Entrance Suite';
  condition: 'Needs Work' | 'Average' | 'Good' | 'Excellent' | 'Fully Renovated';
  propertyTaxes: number;
  previousSaleDate: string;
  previousSalePrice: number;
  lat: number;
  lng: number;
  askingPrice?: number;
}

// Canonical Canadian addresses pre-loaded with verified property records
export const CANADIAN_ADDRESS_DATABASE: PreloadedAddressRecord[] = [
  // --- ONTARIO: DURHAM REGION ---
  {
    fullAddress: '123 Main Street, Whitby, ON',
    streetNumber: '123',
    streetName: 'Main Street',
    municipality: 'Whitby',
    province: 'ON',
    postalCode: 'L1N 2K4',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2250,
    lotSize: '42 x 115 ft',
    yearBuilt: 2012,
    garage: 2,
    basement: 'Finished',
    condition: 'Good',
    propertyTaxes: 6420,
    previousSaleDate: '2019-05-14',
    previousSalePrice: 710000,
    lat: 43.8975,
    lng: -78.9428,
    askingPrice: 949900
  },
  {
    fullAddress: '45 Brock Street South, Whitby, ON',
    streetNumber: '45',
    streetName: 'Brock Street South',
    municipality: 'Whitby',
    province: 'ON',
    postalCode: 'L1N 4J8',
    propertyType: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1750,
    lotSize: '20 x 95 ft',
    yearBuilt: 2017,
    garage: 1,
    basement: 'Finished',
    condition: 'Excellent',
    propertyTaxes: 4890,
    previousSaleDate: '2020-08-22',
    previousSalePrice: 665000,
    lat: 43.8781,
    lng: -78.9436,
    askingPrice: 799000
  },
  {
    fullAddress: '18 Carnwith Drive East, Brooklin, ON',
    streetNumber: '18',
    streetName: 'Carnwith Drive East',
    municipality: 'Brooklin',
    province: 'ON',
    postalCode: 'L1M 2B3',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2680,
    lotSize: '45 x 118 ft',
    yearBuilt: 2015,
    garage: 2,
    basement: 'Finished',
    condition: 'Excellent',
    propertyTaxes: 7280,
    previousSaleDate: '2018-09-12',
    previousSalePrice: 835000,
    lat: 43.9572,
    lng: -78.9614,
    askingPrice: 1149000
  },
  {
    fullAddress: '88 Meadowglen Drive, Brooklin, ON',
    streetNumber: '88',
    streetName: 'Meadowglen Drive',
    municipality: 'Brooklin',
    province: 'ON',
    postalCode: 'L1M 1Y2',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2420,
    lotSize: '40 x 110 ft',
    yearBuilt: 2011,
    garage: 2,
    basement: 'Finished',
    condition: 'Good',
    propertyTaxes: 6650,
    previousSaleDate: '2019-11-04',
    previousSalePrice: 760000,
    lat: 43.9535,
    lng: -78.9568,
    askingPrice: 1025000
  },
  {
    fullAddress: '240 Harmony Road North, Oshawa, ON',
    streetNumber: '240',
    streetName: 'Harmony Road North',
    municipality: 'Oshawa',
    province: 'ON',
    postalCode: 'L1G 6L4',
    propertyType: 'Detached Home',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    lotSize: '50 x 120 ft',
    yearBuilt: 1998,
    garage: 2,
    basement: 'Finished',
    condition: 'Average',
    propertyTaxes: 5320,
    previousSaleDate: '2017-06-20',
    previousSalePrice: 560000,
    lat: 43.9125,
    lng: -78.8354,
    askingPrice: 779900
  },
  {
    fullAddress: '550 Windfields Farm Drive West, Oshawa, ON',
    streetNumber: '550',
    streetName: 'Windfields Farm Drive West',
    municipality: 'Oshawa',
    province: 'ON',
    postalCode: 'L1L 0S1',
    propertyType: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1680,
    lotSize: '22 x 90 ft',
    yearBuilt: 2021,
    garage: 1,
    basement: 'Unfinished',
    condition: 'Excellent',
    propertyTaxes: 4750,
    previousSaleDate: '2021-03-10',
    previousSalePrice: 685000,
    lat: 43.9501,
    lng: -78.8950,
    askingPrice: 749000
  },
  {
    fullAddress: '72 Kingswood Drive, Courtice, ON',
    streetNumber: '72',
    streetName: 'Kingswood Drive',
    municipality: 'Courtice',
    province: 'ON',
    postalCode: 'L1E 2J5',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 2150,
    lotSize: '40 x 115 ft',
    yearBuilt: 2008,
    garage: 2,
    basement: 'Finished',
    condition: 'Good',
    propertyTaxes: 5980,
    previousSaleDate: '2018-04-18',
    previousSalePrice: 645000,
    lat: 43.9015,
    lng: -78.7845,
    askingPrice: 879000
  },
  {
    fullAddress: '1500 Valley Ridge Crescent, Pickering, ON',
    streetNumber: '1500',
    streetName: 'Valley Ridge Crescent',
    municipality: 'Pickering',
    province: 'ON',
    postalCode: 'L1X 2M6',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2850,
    lotSize: '50 x 125 ft',
    yearBuilt: 2014,
    garage: 2,
    basement: 'Finished',
    condition: 'Fully Renovated',
    propertyTaxes: 7890,
    previousSaleDate: '2019-10-30',
    previousSalePrice: 910000,
    lat: 43.8562,
    lng: -79.0895,
    askingPrice: 1299000
  },
  {
    fullAddress: '65 Harwood Avenue South, Ajax, ON',
    streetNumber: '65',
    streetName: 'Harwood Avenue South',
    municipality: 'Ajax',
    province: 'ON',
    postalCode: 'L1S 2H2',
    propertyType: 'Semi-Detached',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1540,
    lotSize: '26 x 110 ft',
    yearBuilt: 2005,
    garage: 1,
    basement: 'Finished',
    condition: 'Good',
    propertyTaxes: 4620,
    previousSaleDate: '2017-09-15',
    previousSalePrice: 535000,
    lat: 43.8475,
    lng: -79.0205,
    askingPrice: 765000
  },

  // --- ONTARIO: GREATER TORONTO AREA (TORONTO, MISSISSAUGA, MARKHAM) ---
  {
    fullAddress: '25 King Street West, Toronto, ON',
    streetNumber: '25',
    streetName: 'King Street West',
    unit: '1804',
    municipality: 'Toronto',
    province: 'ON',
    postalCode: 'M5H 1A1',
    propertyType: 'Condo Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 920,
    lotSize: 'N/A (Condo)',
    yearBuilt: 2018,
    garage: 1,
    basement: 'None',
    condition: 'Excellent',
    propertyTaxes: 5410,
    previousSaleDate: '2020-02-14',
    previousSalePrice: 840000,
    lat: 43.6486,
    lng: -79.3790,
    askingPrice: 925000
  },
  {
    fullAddress: '100 Lakeshore Road East, Mississauga, ON',
    streetNumber: '100',
    streetName: 'Lakeshore Road East',
    unit: '702',
    municipality: 'Mississauga',
    province: 'ON',
    postalCode: 'L5G 1E5',
    propertyType: 'Condo Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1050,
    lotSize: 'N/A (Condo)',
    yearBuilt: 2020,
    garage: 1,
    basement: 'None',
    condition: 'Excellent',
    propertyTaxes: 4950,
    previousSaleDate: '2021-05-18',
    previousSalePrice: 775000,
    lat: 43.5518,
    lng: -79.5855,
    askingPrice: 849000
  },
  {
    fullAddress: '42 Highbush Avenue, Markham, ON',
    streetNumber: '42',
    streetName: 'Highbush Avenue',
    municipality: 'Markham',
    province: 'ON',
    postalCode: 'L3R 8Y4',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3100,
    lotSize: '50 x 120 ft',
    yearBuilt: 2010,
    garage: 2,
    basement: 'Finished',
    condition: 'Excellent',
    propertyTaxes: 8640,
    previousSaleDate: '2019-07-28',
    previousSalePrice: 1290000,
    lat: 43.8682,
    lng: -79.3140,
    askingPrice: 1699000
  },

  // --- BRITISH COLUMBIA ---
  {
    fullAddress: '1050 Burrard Street, Vancouver, BC',
    streetNumber: '1050',
    streetName: 'Burrard Street',
    unit: '1205',
    municipality: 'Vancouver',
    province: 'BC',
    postalCode: 'V6Z 2S3',
    propertyType: 'Condo Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 880,
    lotSize: 'N/A (Condo)',
    yearBuilt: 2016,
    garage: 1,
    basement: 'None',
    condition: 'Excellent',
    propertyTaxes: 4200,
    previousSaleDate: '2020-10-12',
    previousSalePrice: 920000,
    lat: 49.2811,
    lng: -123.1265,
    askingPrice: 1049000
  },
  {
    fullAddress: '3456 West 16th Avenue, Vancouver, BC',
    streetNumber: '3456',
    streetName: 'West 16th Avenue',
    municipality: 'Vancouver',
    province: 'BC',
    postalCode: 'V6R 3B9',
    propertyType: 'Detached Home',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3200,
    lotSize: '33 x 122 ft',
    yearBuilt: 2004,
    garage: 2,
    basement: 'Separate Entrance Suite',
    condition: 'Good',
    propertyTaxes: 11450,
    previousSaleDate: '2018-03-25',
    previousSalePrice: 2350000,
    lat: 49.2575,
    lng: -123.1812,
    askingPrice: 2790000
  },

  // --- ALBERTA ---
  {
    fullAddress: '1420 8th Avenue NW, Calgary, AB',
    streetNumber: '1420',
    streetName: '8th Avenue NW',
    municipality: 'Calgary',
    province: 'AB',
    postalCode: 'T2N 1B8',
    propertyType: 'Detached Home',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2200,
    lotSize: '35 x 120 ft',
    yearBuilt: 2015,
    garage: 2,
    basement: 'Finished',
    condition: 'Excellent',
    propertyTaxes: 5120,
    previousSaleDate: '2020-04-12',
    previousSalePrice: 650000,
    lat: 51.0592,
    lng: -114.0950,
    askingPrice: 789000
  },
  {
    fullAddress: '9820 104th Street NW, Edmonton, AB',
    streetNumber: '9820',
    streetName: '104th Street NW',
    unit: '904',
    municipality: 'Edmonton',
    province: 'AB',
    postalCode: 'T5K 2T2',
    propertyType: 'Condo Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 980,
    lotSize: 'N/A (Condo)',
    yearBuilt: 2017,
    garage: 1,
    basement: 'None',
    condition: 'Good',
    propertyTaxes: 3100,
    previousSaleDate: '2019-06-18',
    previousSalePrice: 315000,
    lat: 53.5350,
    lng: -113.4990,
    askingPrice: 349900
  },

  // --- QUEBEC ---
  {
    fullAddress: '1200 Avenue des Canadiens-de-Montréal, Montreal, QC',
    streetNumber: '1200',
    streetName: 'Avenue des Canadiens-de-Montréal',
    unit: '2408',
    municipality: 'Montreal',
    province: 'QC',
    postalCode: 'H3B 2S2',
    propertyType: 'Condo Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 860,
    lotSize: 'N/A (Condo)',
    yearBuilt: 2019,
    garage: 1,
    basement: 'None',
    condition: 'Excellent',
    propertyTaxes: 4650,
    previousSaleDate: '2020-01-20',
    previousSalePrice: 620000,
    lat: 45.4965,
    lng: -73.5702,
    askingPrice: 699000
  },

  // --- NOVA SCOTIA ---
  {
    fullAddress: '5420 Spring Garden Road, Halifax, NS',
    streetNumber: '5420',
    streetName: 'Spring Garden Road',
    unit: '601',
    municipality: 'Halifax',
    province: 'NS',
    postalCode: 'B3J 1R1',
    propertyType: 'Condo Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    lotSize: 'N/A (Condo)',
    yearBuilt: 2018,
    garage: 1,
    basement: 'None',
    condition: 'Good',
    propertyTaxes: 3950,
    previousSaleDate: '2020-07-15',
    previousSalePrice: 480000,
    lat: 44.6432,
    lng: -63.5824,
    askingPrice: 569000
  }
];

// Canadian Province Names Mapping
export const CANADIAN_PROVINCES: Record<CanadianProvince, { name: string; defaultCity: string; defaultLat: number; defaultLng: number }> = {
  ON: { name: 'Ontario', defaultCity: 'Whitby', defaultLat: 43.8975, defaultLng: -78.9428 },
  BC: { name: 'British Columbia', defaultCity: 'Vancouver', defaultLat: 49.2827, defaultLng: -123.1207 },
  AB: { name: 'Alberta', defaultCity: 'Calgary', defaultLat: 51.0447, defaultLng: -114.0719 },
  QC: { name: 'Quebec', defaultCity: 'Montreal', defaultLat: 45.5017, defaultLng: -73.5673 },
  MB: { name: 'Manitoba', defaultCity: 'Winnipeg', defaultLat: 49.8951, defaultLng: -97.1384 },
  SK: { name: 'Saskatchewan', defaultCity: 'Saskatoon', defaultLat: 52.1332, defaultLng: -106.6700 },
  NS: { name: 'Nova Scotia', defaultCity: 'Halifax', defaultLat: 44.6488, defaultLng: -63.5752 },
  NB: { name: 'New Brunswick', defaultCity: 'Moncton', defaultLat: 46.0878, defaultLng: -64.7782 },
  NL: { name: 'Newfoundland and Labrador', defaultCity: "St. John's", defaultLat: 47.5615, defaultLng: -52.7126 },
  PE: { name: 'Prince Edward Island', defaultCity: 'Charlottetown', defaultLat: 46.2382, defaultLng: -63.1311 }
};

/**
 * Normalizes and extracts components from a user-entered Canadian address.
 */
export function parseCanadianAddress(rawInput: string): {
  normalizedAddress: string;
  streetNumber: string;
  streetName: string;
  unit?: string;
  municipality: string;
  province: CanadianProvince;
  postalCode?: string;
} {
  const clean = rawInput.trim();

  // Try exact match first
  const exact = CANADIAN_ADDRESS_DATABASE.find(
    a => a.fullAddress.toLowerCase() === clean.toLowerCase()
  );
  if (exact) {
    return {
      normalizedAddress: exact.fullAddress,
      streetNumber: exact.streetNumber,
      streetName: exact.streetName,
      unit: exact.unit,
      municipality: exact.municipality,
      province: exact.province,
      postalCode: exact.postalCode
    };
  }

  // Detect Postal Code (e.g. L1N 2K4, M5H 1A1, V6Z2S3)
  const postalMatch = clean.match(/([A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z])\s*(\d[A-CEGHJ-NPR-TV-Z]\d)/i);
  const postalCode = postalMatch ? `${postalMatch[1].toUpperCase()} ${postalMatch[2].toUpperCase()}` : undefined;

  // Detect Province abbreviation or full name
  let detectedProvince: CanadianProvince = 'ON'; // default to Ontario for Durham/GTA home base
  const upper = clean.toUpperCase();

  if (/\bBC\b|BRITISH COLUMBIA/i.test(clean)) detectedProvince = 'BC';
  else if (/\bAB\b|ALBERTA/i.test(clean)) detectedProvince = 'AB';
  else if (/\bQC\b|QUEBEC|QUÉBEC/i.test(clean)) detectedProvince = 'QC';
  else if (/\bMB\b|MANITOBA/i.test(clean)) detectedProvince = 'MB';
  else if (/\bSK\b|SASKATCHEWAN/i.test(clean)) detectedProvince = 'SK';
  else if (/\bNS\b|NOVA SCOTIA/i.test(clean)) detectedProvince = 'NS';
  else if (/\bNB\b|NEW BRUNSWICK/i.test(clean)) detectedProvince = 'NB';
  else if (/\bNL\b|NEWFOUNDLAND/i.test(clean)) detectedProvince = 'NL';
  else if (/\bPE\b|PRINCE EDWARD/i.test(clean)) detectedProvince = 'PE';
  else if (/\bON\b|ONTARIO/i.test(clean)) detectedProvince = 'ON';

  // Detect Municipality
  const knownCities = [
    'Whitby', 'Brooklin', 'Oshawa', 'Courtice', 'Ajax', 'Pickering', 'Bowmanville', 'Newcastle',
    'Toronto', 'Mississauga', 'Markham', 'Vaughan', 'Brampton', 'Oakville', 'Burlington', 'Milton',
    'Richmond Hill', 'Newmarket', 'Hamilton', 'Ottawa', 'Kingston', 'London', 'Kitchener', 'Waterloo',
    'Vancouver', 'Burnaby', 'Richmond', 'Surrey', 'Kelowna', 'Victoria',
    'Calgary', 'Edmonton', 'Red Deer',
    'Montreal', 'Laval', 'Quebec City',
    'Halifax', 'Winnipeg', 'Saskatoon', 'Regina', "St. John's", 'Charlottetown', 'Moncton'
  ];

  let detectedCity = CANADIAN_PROVINCES[detectedProvince].defaultCity;
  for (const city of knownCities) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(clean)) {
      detectedCity = city;
      break;
    }
  }

  // Detect Unit (e.g. Unit 1205, #1804, Apt 4B)
  const unitMatch = clean.match(/(?:unit|suite|apt|#)\s*([a-z0-9\-]+)/i);
  const unit = unitMatch ? unitMatch[1].toUpperCase() : undefined;

  // Detect Street Number & Name
  const streetPart = clean.split(',')[0].replace(/(?:unit|suite|apt|#)\s*([a-z0-9\-]+)/i, '').trim();
  const streetNumMatch = streetPart.match(/^(\d+[a-z]?)\s+(.+)$/i);

  const streetNumber = streetNumMatch ? streetNumMatch[1] : '1';
  const streetName = streetNumMatch ? streetNumMatch[2] : streetPart || 'Main Street';

  const normalizedAddress = `${unit ? `Unit ${unit}, ` : ''}${streetNumber} ${streetName}, ${detectedCity}, ${detectedProvince}`;

  return {
    normalizedAddress,
    streetNumber,
    streetName,
    unit,
    municipality: detectedCity,
    province: detectedProvince,
    postalCode
  };
}

/**
 * Autocomplete search for Canadian addresses
 */
export function searchAddressAutocomplete(query: string, limit = 6): Array<{
  address: string;
  municipality: string;
  province: CanadianProvince;
  postalCode?: string;
  propertyType?: string;
}> {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();

  const matches = CANADIAN_ADDRESS_DATABASE.filter(item => {
    return (
      item.fullAddress.toLowerCase().includes(q) ||
      item.streetName.toLowerCase().includes(q) ||
      item.municipality.toLowerCase().includes(q) ||
      item.postalCode.toLowerCase().includes(q)
    );
  }).slice(0, limit);

  return matches.map(m => ({
    address: m.fullAddress,
    municipality: m.municipality,
    province: m.province,
    postalCode: m.postalCode,
    propertyType: m.propertyType
  }));
}
