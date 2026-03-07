/**
 * Fetch testimonials data from Google Sheets
 *
 * Reads from:
 * - Form Responses 1 (testimonials)
 * - Products (product definitions)
 * - Partners (partner definitions)
 * - Persons (person definitions)
 *
 * Outputs:
 * - src/data/testimonials.json
 * - src/data/products.json
 * - src/data/partners.json
 * - src/data/persons.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'src/data');

// Your Google Sheet ID
const SHEET_ID = '1xHTYHuGVZx6U4DwrzRbVZiDdxAbkKYtOJAc6FTA6DO0';

/**
 * Fetch a sheet tab as JSON
 */
async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  console.log(`Fetching ${sheetName}...`);
  const response = await fetch(url);
  const text = await response.text();

  // Google returns JSONP, extract the JSON part
  const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/)?.[1];
  if (!jsonString) {
    console.warn(`Could not parse ${sheetName}. Is the sheet published?`);
    return { cols: [], rows: [] };
  }

  return JSON.parse(jsonString).table;
}

/**
 * Expected column mapping for Form Responses (handles missing headers)
 */
const FORM_COLUMN_MAP = {
  'P': 'Image URL',
  'Q': 'Image Alt Text',
  'R': 'Language',
  'S': 'Testimonial Date',
  'T': 'Priority',
  'U': 'Rating',
  'V': 'Publish Immediately?',
  'W': 'Internal Notes'
};

/**
 * Convert sheet table to array of objects
 * Handles both labeled columns and header-in-first-row cases
 */
function tableToObjects(table, useColumnMap = false) {
  const rows = table.rows || [];
  if (rows.length === 0) return [];

  // Check if column labels are meaningful (not just A, B, C)
  const colLabels = table.cols.map(col => col.label || col.id);
  const hasRealLabels = colLabels.some(l => l && !l.match(/^[A-Z]$/));

  let headers;
  let dataRows;

  if (hasRealLabels) {
    // Use column labels as headers, mapping single letters to known names
    headers = colLabels.map(label => {
      if (useColumnMap && label.match(/^[A-Z]$/) && FORM_COLUMN_MAP[label]) {
        return FORM_COLUMN_MAP[label];
      }
      return label;
    });
    dataRows = rows;
  } else {
    // First row contains headers
    headers = rows[0].c?.map(cell => cell?.v ?? cell?.f ?? '') || [];
    dataRows = rows.slice(1);
  }

  return dataRows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      const cell = row.c?.[i];
      obj[header] = cell?.v ?? cell?.f ?? null;
    });
    return obj;
  });
}

/**
 * Extract ID from dropdown value (format: "id | Display Name")
 */
function extractId(dropdownValue) {
  if (!dropdownValue) return null;
  const match = dropdownValue.match(/^([a-z0-9-]+)\s*\|/);
  return match ? match[1] : dropdownValue;
}

/**
 * Generate a slug from text
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .substring(0, 50);
}

/**
 * Map person display name to person_id
 */
function personNameToId(displayName, personsMap) {
  if (!displayName || displayName === '-- Anonymous (no person) --' || displayName === '-- Add New Person --') {
    return null;
  }

  // Try to find in persons map by matching name
  for (const [id, person] of Object.entries(personsMap)) {
    if (displayName.startsWith(person.name)) {
      return id;
    }
  }

  // Fallback: generate ID from name
  return slugify(displayName.split('(')[0].trim());
}

/**
 * Parse products sheet
 */
function parseProducts(rows) {
  return rows.map(row => ({
    product_id: row['product_id'] || '',
    name: row['name'] || '',
    category: row['category'] || 'generic',
    variant_name: row['variant_name'] || null,
    partner_ids: row['partner_ids'] ? row['partner_ids'].split(',').map(s => s.trim()) : [],
    platform: row['platform'] || null,
    url: row['url'] || '',
    description_short: row['description_short'] || '',
    status: row['status'] || 'active'
  })).filter(p => p.product_id);
}

/**
 * Parse partners sheet
 */
function parsePartners(rows) {
  return rows.map(row => ({
    partner_id: row['partner_id'] || '',
    name: row['name'] || '',
    relationship_type: row['relationship_type'] || 'community',
    logo_url: row['logo_url'] || '',
    website_url: row['website_url'] || '',
    description_short: row['description_short'] || '',
    priority: parseInt(row['priority']) || 10
  })).filter(p => p.partner_id);
}

/**
 * Parse persons sheet
 */
function parsePersons(rows) {
  return rows.map(row => ({
    person_id: row['person_id'] || '',
    name: row['name'] || '',
    designation: row['designation'] || '',
    company: row['company'] || '',
    partner_id: row['partner_id'] || null,
    linkedin_url: row['linkedin_url'] || null,
    other_link: row['other_link'] || null,
    headshot_url: row['headshot_url'] || null,
    relationship_type: row['relationship_type'] || 'participant'
  })).filter(p => p.person_id);
}

/**
 * Parse testimonials from form responses
 */
function parseTestimonials(rows, personsMap) {
  return rows.map((row, index) => {
    // Parse person
    const selectPerson = row['Select Person'];
    let personId = personNameToId(selectPerson, personsMap);

    // Handle new person entries
    const newPersonName = row['New Person - Full Name'];
    if (selectPerson === '-- Add New Person --' && newPersonName) {
      personId = slugify(newPersonName);
    }

    // Parse product ID
    const productDisplay = row['Product'];
    const productId = extractId(productDisplay);

    // Parse partner ID
    const partnerDisplay = row['Partner'];
    let partnerId = extractId(partnerDisplay);
    if (partnerId === '-- No specific partner --' || partnerDisplay === '-- No specific partner --') {
      partnerId = null;
    }

    // Parse rating
    const ratingStr = row['Rating'];
    let rating = null;
    if (ratingStr && ratingStr !== '-- No rating --') {
      rating = parseFloat(ratingStr);
    }

    // Parse date (handles Google Sheets Date(year,month,day) format)
    let dateStr = '';
    const rawDate = row['Testimonial Date'];
    if (typeof rawDate === 'string' && rawDate.startsWith('Date(')) {
      // Parse Date(2024,11,31) format - note: month is 0-indexed in this format
      const match = rawDate.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = match[1];
        const month = String(parseInt(match[2]) + 1).padStart(2, '0');
        const day = match[3].padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
    } else if (rawDate instanceof Date) {
      dateStr = rawDate.toISOString().split('T')[0];
    } else if (typeof rawDate === 'string' && rawDate) {
      dateStr = rawDate;
    } else if (rawDate) {
      try {
        dateStr = new Date(rawDate).toISOString().split('T')[0];
      } catch (e) {
        dateStr = '';
      }
    }

    // Parse is_published
    const publishedStr = row['Publish Immediately?'];
    const isPublished = publishedStr === 'Yes' || publishedStr === true;

    // Generate testimonial ID
    const testimonialId = `testimonial-${slugify(newPersonName || selectPerson || 'anon')}-${index + 1}`;

    return {
      testimonial_id: testimonialId,
      person_id: personId,
      product_ids: productId ? [productId] : [],
      partner_ids: partnerId ? [partnerId] : [],
      scope: row['Scope'] || 'product',
      audience_type: row['Audience Type'] || 'student',
      source_type: row['Source Type'] || 'text',
      source_url: row['Source URL'] || null,
      image_url: row['Image URL'] || null,
      image_alt: row['Image Alt Text'] || null,
      quote_short: row['Quote (Short)'] || '',
      quote_long: row['Quote (Long)'] || '',
      rating: rating,
      language: row['Language'] || 'en',
      date: dateStr,
      priority: row['Priority'] || 'normal',
      is_published: isPublished,
      internal_notes: row['Internal Notes'] || ''
    };
  }).filter(t => t.quote_short); // Filter out empty rows
}

/**
 * Main function
 */
async function main() {
  console.log('===========================================');
  console.log('Fetching testimonials data from Google Sheets');
  console.log('===========================================\n');

  // Fetch all sheets
  const [testimonialsTable, productsTable, partnersTable, personsTable] = await Promise.all([
    fetchSheet('Form Responses 1'),
    fetchSheet('Products'),
    fetchSheet('Partners'),
    fetchSheet('Persons')
  ]);

  // Convert to objects (use column map for form responses)
  const productsRows = tableToObjects(productsTable, false);
  const partnersRows = tableToObjects(partnersTable, false);
  const personsRows = tableToObjects(personsTable, false);
  const testimonialsRows = tableToObjects(testimonialsTable, true);

  // Parse data
  const products = parseProducts(productsRows);
  const partners = parsePartners(partnersRows);
  const persons = parsePersons(personsRows);

  // Build persons map for testimonial parsing
  const personsMap = {};
  persons.forEach(p => {
    personsMap[p.person_id] = p;
  });

  const testimonials = parseTestimonials(testimonialsRows, personsMap);

  // Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  // Write all JSON files
  await Promise.all([
    fs.writeFile(
      path.join(DATA_DIR, 'testimonials.json'),
      JSON.stringify(testimonials, null, 2)
    ),
    fs.writeFile(
      path.join(DATA_DIR, 'products.json'),
      JSON.stringify(products, null, 2)
    ),
    fs.writeFile(
      path.join(DATA_DIR, 'partners.json'),
      JSON.stringify(partners, null, 2)
    ),
    fs.writeFile(
      path.join(DATA_DIR, 'persons.json'),
      JSON.stringify(persons, null, 2)
    )
  ]);

  console.log('\n===========================================');
  console.log('Done!');
  console.log(`  Testimonials: ${testimonials.length}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Partners: ${partners.length}`);
  console.log(`  Persons: ${persons.length}`);
  console.log('===========================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
