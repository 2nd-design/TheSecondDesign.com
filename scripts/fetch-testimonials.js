/**
 * Fetch testimonials from Google Sheets and process images
 *
 * This script:
 * 1. Fetches testimonial data from a public Google Sheet
 * 2. Downloads images from Google Drive
 * 3. Resizes images with Sharp (max 1600px, 80% quality)
 * 4. Outputs JSON file for Astro to consume
 *
 * Prerequisites:
 * - npm install sharp node-fetch
 * - Google Sheet must be "Published to web" (File > Share > Publish to web)
 * - Google Drive folder with images must be "Anyone with link can view"
 *
 * Usage:
 * - Set GOOGLE_SHEET_ID in .env or hardcode below
 * - Run: node scripts/fetch-testimonials.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================
// CONFIGURATION
// ============================================

// Your Google Sheet ID
const SHEET_ID = '1xHTYHuGVZx6U4DwrzRbVZiDdxAbkKYtOJAc6FTA6DO0';

// Sheet name where form responses go (usually "Form Responses 1")
const SHEET_NAME = 'Form Responses 1';

// Output paths
const OUTPUT_JSON = path.join(PROJECT_ROOT, 'src/data/testimonials-sheets.json');
const OUTPUT_IMAGES_DIR = path.join(PROJECT_ROOT, 'src/assets/images/testimonials-sheets');

// Image settings
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fetch Google Sheet data as JSON (from published sheet)
 */
async function fetchSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  console.log('Fetching sheet data...');
  const response = await fetch(url);
  const text = await response.text();

  // Google returns JSONP, extract the JSON part
  const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/)?.[1];
  if (!jsonString) {
    throw new Error('Could not parse Google Sheets response. Is the sheet published to web?');
  }

  const data = JSON.parse(jsonString);
  return data.table;
}

/**
 * Extract Google Drive file ID from various URL formats
 */
function extractDriveFileId(url) {
  if (!url) return null;

  // Format: https://drive.google.com/open?id=FILE_ID
  let match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Format: https://drive.google.com/file/d/FILE_ID/view
  match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Format: https://drive.google.com/uc?id=FILE_ID
  match = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  return null;
}

/**
 * Download image from Google Drive (public file)
 */
async function downloadDriveImage(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  console.log(`  Downloading image: ${fileId}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Resize and optimize image with Sharp
 */
async function processImage(buffer, outputPath) {
  console.log(`  Processing image: ${path.basename(outputPath)}`);

  await sharp(buffer)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(outputPath);
}

/**
 * Generate a slug from text
 */
function slugify(text) {
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
 * Extract product_id from dropdown value (format: "product_id | Display Name")
 */
function extractId(dropdownValue) {
  if (!dropdownValue) return null;
  const match = dropdownValue.match(/^([a-z0-9-]+)\s*\|/);
  return match ? match[1] : null;
}

/**
 * Parse a Google Sheets row into a testimonial object
 */
function parseRow(row, headers, index) {
  const getValue = (colName) => {
    const colIndex = headers.indexOf(colName);
    if (colIndex === -1) return null;
    const cell = row.c?.[colIndex];
    return cell?.v ?? cell?.f ?? null;
  };

  // Parse the data
  const selectPerson = getValue('Select Person');
  const isNewPerson = selectPerson === '-- Add New Person --';
  const isAnonymous = selectPerson === '-- Anonymous (no person) --';

  const personName = isNewPerson
    ? getValue('New Person - Full Name')
    : isAnonymous
      ? null
      : selectPerson?.split(' (')[0];

  const product = getValue('Product');
  const productId = extractId(product);

  const partner = getValue('Partner');
  const partnerId = extractId(partner);

  const imageUrl = getValue('Image Upload');
  const driveFileId = extractDriveFileId(imageUrl);

  const dateValue = getValue('Testimonial Date');
  const date = dateValue
    ? new Date(dateValue).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const isPublished = getValue('Publish Immediately?') === 'Yes';

  const rating = getValue('Rating');
  const ratingNum = rating && rating !== '-- No rating --' ? parseFloat(rating) : null;

  return {
    testimonial_id: `testimonial-${slugify(personName || 'anonymous')}-${index}`,
    person_name: personName,
    person_designation: isNewPerson ? getValue('New Person - Designation') : null,
    person_company: isNewPerson ? getValue('New Person - Company/Organization') : null,
    person_relationship_type: isNewPerson ? getValue('New Person - Relationship Type') : null,
    person_linkedin: isNewPerson ? getValue('New Person - LinkedIn URL') : null,
    product_id: productId,
    partner_id: partnerId === '-- No specific partner --' ? null : partnerId,
    scope: getValue('Scope'),
    audience_type: getValue('Audience Type'),
    source_type: getValue('Source Type'),
    source_url: getValue('Source URL'),
    quote_short: getValue('Quote (Short)'),
    quote_long: getValue('Quote (Long)'),
    image_url: null, // Will be set after processing
    image_alt: getValue('Image Alt Text'),
    _drive_file_id: driveFileId, // Temporary, for image processing
    language: getValue('Language'),
    date: date,
    priority: getValue('Priority'),
    rating: ratingNum,
    is_published: isPublished,
    internal_notes: getValue('Internal Notes'),
    _raw_timestamp: getValue('Timestamp')
  };
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('===========================================');
  console.log('Fetching testimonials from Google Sheets');
  console.log('===========================================\n');

  // Check if Sheet ID is configured
  if (SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    console.error('ERROR: Please set GOOGLE_SHEET_ID in .env or in this script.');
    console.error('You can find the Sheet ID in the URL:');
    console.error('https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit');
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_IMAGES_DIR, { recursive: true });

  // Fetch sheet data
  const table = await fetchSheetData();

  // Extract headers
  const headers = table.cols.map(col => col.label);
  console.log(`Found ${table.rows?.length || 0} testimonials\n`);

  if (!table.rows || table.rows.length === 0) {
    console.log('No testimonials found. Writing empty array.');
    await fs.writeFile(OUTPUT_JSON, '[]', 'utf-8');
    return;
  }

  // Process each row
  const testimonials = [];

  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    console.log(`Processing row ${i + 1}/${table.rows.length}`);

    const testimonial = parseRow(row, headers, i);

    // Download and process image if present
    if (testimonial._drive_file_id) {
      try {
        const imageBuffer = await downloadDriveImage(testimonial._drive_file_id);
        const filename = `${testimonial.testimonial_id}.jpg`;
        const outputPath = path.join(OUTPUT_IMAGES_DIR, filename);

        await processImage(imageBuffer, outputPath);
        testimonial.image_url = `/src/assets/images/testimonials-sheets/${filename}`;
      } catch (err) {
        console.error(`  Failed to process image: ${err.message}`);
      }
    }

    // Remove temporary fields
    delete testimonial._drive_file_id;
    delete testimonial._raw_timestamp;

    testimonials.push(testimonial);
  }

  // Write output JSON
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(testimonials, null, 2), 'utf-8');

  console.log('\n===========================================');
  console.log(`Done! Processed ${testimonials.length} testimonials`);
  console.log(`Output: ${OUTPUT_JSON}`);
  console.log(`Images: ${OUTPUT_IMAGES_DIR}`);
  console.log('===========================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
