import { SITE_SETTINGS } from './store';
import type { Property } from './types';

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
}

export function generateSeoMetadata(props?: SeoProps) {
  const defaultTitle = `${SITE_SETTINGS.brand_name} | San Diego Real Estate`;
  const defaultDescription = `Edgar Valle is a premier San Diego Realtor® with Full Circle Group (DRE #02375273) specializing in first-time homebuyers, VA military loans, and fix-and-flip investments. Hablamos Español.`;
  const siteUrl = 'https://edgarvalle.com';

  const title = props?.title ? `${props.title} | Edgar Valle Realtor` : defaultTitle;
  const description = props?.description || defaultDescription;
  const image = props?.image ? (props.image.startsWith('http') ? props.image : `${siteUrl}${props.image}`) : `${siteUrl}/images/branding/og-preview.png`;
  const canonicalUrl = props?.canonicalUrl ? `${siteUrl}${props.canonicalUrl}` : siteUrl;
  const type = props?.type || 'website';

  return {
    title,
    description,
    image,
    canonicalUrl,
    type,
    siteName: 'Edgar Valle Real Estate'
  };
}

export function generateAgentJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Edgar Valle',
    jobTitle: 'Realtor®',
    worksFor: {
      '@type': 'RealEstateBroker',
      name: 'Full Circle Group'
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'California DRE License',
      value: '02375273'
    },
    telephone: '(619) 555-0198',
    email: 'edgar@yourrealtoredgar.com',
    url: 'https://edgarvalle.com',
    image: 'https://edgarvalle.com/images/branding/edgar-valle.svg',
    sameAs: [
      'https://www.instagram.com/yourrealtoredgar/'
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Diego',
      addressRegion: 'CA',
      addressCountry: 'US'
    },
    areaServed: [
      'San Diego',
      'North Park',
      'Pacific Beach',
      'Chula Vista',
      'Oceanside',
      'La Jolla'
    ],
    knowsLanguage: ['en', 'es'],
    priceRange: '$$$$'
  });
}

export function generatePropertyJsonLd(property: Property) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    name: property.title,
    description: property.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address_street,
      addressLocality: property.address_city,
      addressRegion: property.address_state,
      postalCode: property.address_zip,
      addressCountry: 'US'
    },
    geo: property.latitude && property.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude
    } : undefined,
    numberOfRooms: property.bedrooms,
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.square_feet,
      unitCode: 'FTK'
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      availability: property.status === 'active' || property.status === 'open_house' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
    }
  });
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://edgarvalle.com${item.url}`
    }))
  });
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  });
}

export function generateArticleJsonLd(post: { title: string; excerpt: string; slug: string; published_at: string; cover_image: string; author_name: string }) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `https://edgarvalle.com/blog/${post.slug}`,
    datePublished: post.published_at,
    image: `https://edgarvalle.com${post.cover_image}`,
    author: {
      '@type': 'Person',
      name: post.author_name || 'Edgar Valle'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Edgar Valle Real Estate',
      logo: {
        '@type': 'ImageObject',
        url: 'https://edgarvalle.com/images/branding/logo.svg'
      }
    }
  });
}

