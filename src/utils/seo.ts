import { Project } from '../types';

const DEFAULT_TITLE = 'Amit Sawhney Real Estate | Pre-Construction & Resale Homes GTA & Durham Region';
const DEFAULT_DESCRIPTION = 'Discover premium pre-construction developments, new communities, and resale homes across the GTA and Durham Region with Amit Sawhney, Licensed Ontario REALTOR®.';
const DEFAULT_KEYWORDS = 'pre-construction homes GTA, Durham Region real estate, pre-construction condos, new home developments Ontario, Amit Sawhney REALTOR';

const DYNAMIC_TAG_IDS = {
  jsonLd: 'project-seo-jsonld',
  canonical: 'project-seo-canonical',
  dynamicPrefix: 'seo-dynamic-'
};

function getOrCreateMeta(attrName: 'name' | 'property', attrValue: string): HTMLMetaElement {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    element.setAttribute('data-dynamic-seo', 'true');
    document.head.appendChild(element);
  }
  return element;
}

function removeDynamicMetaTags(): void {
  const dynamicMetas = document.head.querySelectorAll('meta[data-dynamic-seo="true"]');
  dynamicMetas.forEach(el => el.remove());
}

/**
 * Updates head meta tags, OpenGraph, Twitter cards, geo coordinates, and Schema.org JSON-LD
 * when a specific pre-construction project modal is opened.
 */
export function updateProjectSEO(project: Project | null): void {
  if (typeof document === 'undefined') return;

  if (!project) {
    // Revert to site defaults
    document.title = DEFAULT_TITLE;

    const descMeta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descMeta) {
      descMeta.content = DEFAULT_DESCRIPTION;
    }

    const kwMeta = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (kwMeta) {
      kwMeta.content = DEFAULT_KEYWORDS;
    }

    // Reset or remove canonical link
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = window.location.origin + window.location.pathname;
    }

    // Remove dynamic project-specific meta tags
    removeDynamicMetaTags();

    // Remove JSON-LD script
    const existingJsonLd = document.getElementById(DYNAMIC_TAG_IDS.jsonLd);
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    return;
  }

  // --- Dynamic Project Meta Details ---
  const projectUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(project.id)}`;
  const title = `${project.name} by ${project.builder} | Pre-Construction in ${project.location.city} - Amit Sawhney`;
  const cleanExcerpt = project.description.replace(/\s+/g, ' ').trim().slice(0, 130);
  const description = `${project.name} by ${project.builder} in ${project.location.city}, ${project.location.region}. ${project.priceRange.display}. VIP incentives, deposit structure, floor plans & unit allocations with Amit Sawhney REALTOR®. ${cleanExcerpt}...`;
  const keywords = `${project.name}, ${project.builder}, ${project.location.city} pre-construction, ${project.location.region} new developments, ${project.propertyTypes.join(', ')}, ${project.location.intersection}, ${project.status}, Ontario pre-construction condos, Amit Sawhney REALTOR`;

  // 1. Title Tag
  document.title = title;

  // 2. Standard Meta Tags
  getOrCreateMeta('name', 'description').content = description;
  getOrCreateMeta('name', 'keywords').content = keywords;
  getOrCreateMeta('name', 'author').content = `Amit Sawhney - Licensed Ontario REALTOR®`;
  getOrCreateMeta('name', 'robots').content = 'index, follow, max-image-preview:large, max-snippet:-1';

  // 3. Open Graph / Facebook Meta Tags
  getOrCreateMeta('property', 'og:title').content = `${project.name} by ${project.builder} | VIP Pre-Construction`;
  getOrCreateMeta('property', 'og:description').content = description;
  getOrCreateMeta('property', 'og:type').content = 'website';
  getOrCreateMeta('property', 'og:url').content = projectUrl;
  getOrCreateMeta('property', 'og:image').content = project.image;
  getOrCreateMeta('property', 'og:site_name').content = 'Amit Sawhney Real Estate | Blueprint Realty';
  getOrCreateMeta('property', 'og:locale').content = 'en_CA';

  // 4. Twitter Card Meta Tags
  getOrCreateMeta('name', 'twitter:card').content = 'summary_large_image';
  getOrCreateMeta('name', 'twitter:title').content = `${project.name} | Pre-Construction in ${project.location.city}`;
  getOrCreateMeta('name', 'twitter:description').content = description;
  getOrCreateMeta('name', 'twitter:image').content = project.image;
  getOrCreateMeta('name', 'twitter:creator').content = '@AmitSawhneyRE';

  // 5. Geographic & Real Estate Meta Tags
  getOrCreateMeta('name', 'geo.placename').content = `${project.location.city}, Ontario, Canada`;
  getOrCreateMeta('name', 'geo.region').content = 'CA-ON';
  getOrCreateMeta('name', 'geo.position').content = `${project.location.lat};${project.location.lng}`;
  getOrCreateMeta('name', 'ICBM').content = `${project.location.lat}, ${project.location.lng}`;
  getOrCreateMeta('property', 'product:price:amount').content = String(project.priceRange.min);
  getOrCreateMeta('property', 'product:price:currency').content = 'CAD';

  // 6. Canonical Link Tag
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = projectUrl;

  // 7. Schema.org JSON-LD Structured Data
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': project.name,
    'description': project.description,
    'image': [project.image, ...(project.galleryImages || [])],
    'url': projectUrl,
    'datePosted': '2026-01-01',
    'category': project.propertyTypes.join(', '),
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'CAD',
      'lowPrice': project.priceRange.min,
      'highPrice': project.priceRange.max,
      'price': project.priceRange.min,
      'offerCount': project.totalUnits,
      'availability': project.status === 'Selling Now' || project.status === 'Platinum VIP Launch' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/PreOrder',
      'priceValidUntil': '2026-12-31'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': project.location.address,
      'addressLocality': project.location.city,
      'addressRegion': 'ON',
      'addressCountry': 'CA'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': project.location.lat,
      'longitude': project.location.lng
    },
    'broker': {
      '@type': 'RealEstateAgent',
      'name': 'Amit Sawhney',
      'telephone': '+1-647-895-3613',
      'email': 'truecondodeal@gmail.com',
      'jobTitle': 'Licensed Real Estate Sales Representative',
      'worksFor': {
        '@type': 'RealEstateAgent',
        'name': 'Blueprint Realty Brokerage Inc.'
      }
    }
  };

  let jsonLdScript = document.getElementById(DYNAMIC_TAG_IDS.jsonLd) as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = DYNAMIC_TAG_IDS.jsonLd;
    jsonLdScript.type = 'application/ld+json';
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(jsonLdData, null, 2);
}
