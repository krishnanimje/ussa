// CSV Export Engine with Formula Injection Protection (RFC 4180 Compliant)
import type { Lead, Property, AnalyticsSummary, ReportType } from './types';

/**
 * Sanitizes a cell to prevent Spreadsheet Formula Injection (CSV / DDE attacks).
 * If a value begins with '=', '+', '-', '@', '\t', '\r', it prefixes with a single quote.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Strip dangerous leading whitespace/control characters
  str = str.replace(/^[\s\uFEFF\xA0]+/, '');

  // Formula trigger characters
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  if (formulaTriggers.some(trigger => str.startsWith(trigger))) {
    // Escape by prefixing with a single quote
    str = `'${str}`;
  }

  // Escape any existing double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Builds a valid RFC 4180 CSV string from headers and row arrays.
 */
export function buildCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(h => sanitizeCsvCell(h)).join(',');
  const rowLines = rows.map(row => row.map(cell => sanitizeCsvCell(cell)).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Generates CSV content for any of the 8 authorized report types.
 */
export function generateReportCsv(
  reportType: ReportType, 
  data: {
    properties: Property[];
    leads: Lead[];
    analytics: AnalyticsSummary;
  }
): { filename: string; csv: string } {
  const timestamp = new Date().toISOString().split('T')[0];

  switch (reportType) {
    case 'property_inventory': {
      const headers = [
        'Property ID',
        'Title',
        'MLS Number',
        'Property Type',
        'Listing Status',
        'Publication Status',
        'Price (USD)',
        'Beds',
        'Baths',
        'Square Feet',
        'Lot Size',
        'Address',
        'City',
        'Neighborhood',
        'Created At',
        'Views',
        'Inquiries'
      ];
      const rows = data.properties.map(p => [
        p.id,
        p.title,
        p.mls_number || '',
        p.property_type,
        p.listing_status,
        p.publication_status,
        p.price,
        p.bedrooms,
        p.bathrooms,
        p.square_feet,
        `${p.lot_size} ${p.lot_size_unit || 'sqft'}`,
        p.address_street,
        p.address_city,
        p.neighborhood,
        p.created_at,
        p.view_count,
        p.inquiries_count || 0
      ]);
      return {
        filename: `valle_property_inventory_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'traffic': {
      const headers = [
        'Date',
        'Page Views',
        'Sessions',
        'Unique Visitors',
        'Inquiries'
      ];
      const rows = data.analytics.traffic_trend.map(t => [
        t.date,
        t.page_views,
        t.sessions,
        t.unique_visitors,
        t.inquiries
      ]);
      return {
        filename: `valle_traffic_report_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'property_views_inquiries': {
      const headers = [
        'Property ID',
        'Property Title',
        'Price (USD)',
        'Listing Status',
        'Views',
        'Inquiries',
        'Conversion Rate (%)'
      ];
      const rows = data.analytics.property_ranking.map(r => [
        r.property_id,
        r.title,
        r.price,
        r.status,
        r.views,
        r.inquiries,
        `${r.conversion_rate.toFixed(2)}%`
      ]);
      return {
        filename: `valle_property_views_inquiries_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'leads_by_date': {
      const headers = [
        'Lead ID',
        'Full Name',
        'Email',
        'Phone',
        'Inquiry Type',
        'Status',
        'Budget',
        'Timeframe',
        'Property Address',
        'Follow-Up Date',
        'Assigned Admin',
        'Source Page',
        'UTM Source',
        'UTM Medium',
        'UTM Campaign',
        'Created At'
      ];
      const rows = data.leads.map(l => [
        l.id,
        l.full_name,
        l.email,
        l.phone,
        l.lead_type,
        l.status,
        l.estimated_budget || '',
        l.timeframe || '',
        l.property_address || '',
        l.follow_up_date || '',
        l.assigned_admin || 'Edgar Valle',
        l.source_page || '',
        l.utm_source || '',
        l.utm_medium || '',
        l.utm_campaign || '',
        l.created_at
      ]);
      return {
        filename: `valle_crm_leads_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'conversion_funnel': {
      const headers = [
        'Funnel Stage',
        'Stage Label',
        'Total Count',
        'Drop-off Rate (%)',
        'Cumulative Conversion (%)'
      ];
      const rows = data.analytics.funnel.map(f => [
        f.stage,
        f.label,
        f.count,
        `${f.dropoffRate.toFixed(1)}%`,
        `${f.conversionRate.toFixed(2)}%`
      ]);
      return {
        filename: `valle_conversion_funnel_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'traffic_sources': {
      const headers = [
        'Traffic Channel',
        'Display Label',
        'Sessions',
        'Percentage (%)'
      ];
      const rows = data.analytics.traffic_sources.map(s => [
        s.source,
        s.label,
        s.sessions,
        `${s.percentage.toFixed(1)}%`
      ]);
      return {
        filename: `valle_traffic_sources_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'listing_performance': {
      const headers = [
        'Property ID',
        'Title',
        'Price (USD)',
        'Neighborhood',
        'Listing Status',
        'Views',
        'Inquiries',
        'Days on Market / Created'
      ];
      const rows = data.properties.map(p => {
        const createdDate = new Date(p.created_at);
        const days = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return [
          p.id,
          p.title,
          p.price,
          p.neighborhood,
          p.listing_status,
          p.view_count,
          p.inquiries_count || 0,
          `${days} days`
        ];
      });
      return {
        filename: `valle_listing_performance_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    case 'open_house_inquiries': {
      const openHouseLeads = data.leads.filter(l => l.lead_type === 'open_house_rsvp');
      const headers = [
        'Lead ID',
        'Attendee Name',
        'Email',
        'Phone',
        'Property / Address',
        'Status',
        'Notes',
        'RSVP Date'
      ];
      const rows = openHouseLeads.map(l => [
        l.id,
        l.full_name,
        l.email,
        l.phone,
        l.property_address || '',
        l.status,
        l.admin_notes || '',
        l.created_at
      ]);
      return {
        filename: `valle_open_house_inquiries_${timestamp}.csv`,
        csv: buildCsv(headers, rows)
      };
    }

    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }
}
