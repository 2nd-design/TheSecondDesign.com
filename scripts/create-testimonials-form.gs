/**
 * Google Apps Script to create a Testimonials Input Form
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Delete any existing code and paste this entire script
 * 4. Click "Run" (play button) - select createTestimonialsForm
 * 5. Authorize when prompted (click through the warnings)
 * 6. Check your Google Drive for the new form and linked spreadsheet
 */

function createTestimonialsForm() {
  // Create the form
  const form = FormApp.create('Testimonials Input - The Second Design');
  form.setDescription('Add new testimonials for The Second Design website. All dropdowns are pre-populated with existing data.');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);

  // ============================================
  // SECTION 1: PERSON INFORMATION
  // ============================================
  form.addSectionHeaderItem()
    .setTitle('Person Information')
    .setHelpText('Who is giving this testimonial? Select an existing person or add a new one.');

  // Existing persons dropdown
  const existingPersons = [
    '-- Add New Person --',
    'Sai Rahul (CEO, FOSS United)',
    'Rik van den Berge (Certified Coach)',
    'Azul (Course Creator)',
    'Konstantin Starikov (Course Creator)',
    'Shanak Rahman (Learning Experience Designer, IMG Academy)',
    'Rachel Hoeft (Learning Experience Designer, IMG Academy)',
    'Kira Milda Gai (Learning & Development Professional)',
    'Rodolfo Sagahon (CBC Creator)',
    'Alejandro Mashad (Founder, Edison)',
    'Matias Kahl (Co-founder, Edison)',
    'Quincy P',
    'Chris B',
    'Jonathan Woodruff',
    'Abhith B',
    'Amrid',
    'Deva',
    'Arjun Vibeesh',
    'Niranjana',
    'R Sreehari',
    'Suha Shajahan',
    'Arsha',
    'Shreya Sajalan',
    'Nahidah (Student, Jyothi Engineering College)',
    '-- Anonymous (no person) --'
  ];

  form.addListItem()
    .setTitle('Select Person')
    .setHelpText('Choose an existing person or select "Add New Person" to enter details below.')
    .setChoiceValues(existingPersons)
    .setRequired(true);

  // New person fields (filled only if adding new)
  form.addTextItem()
    .setTitle('New Person - Full Name')
    .setHelpText('Only fill if adding a new person');

  form.addTextItem()
    .setTitle('New Person - Designation')
    .setHelpText('e.g., "Student", "Founder", "Program Lead"');

  form.addTextItem()
    .setTitle('New Person - Company/Organization')
    .setHelpText('Optional');

  form.addListItem()
    .setTitle('New Person - Relationship Type')
    .setHelpText('Only for new persons')
    .setChoiceValues([
      '-- Skip (using existing person) --',
      'student',
      'participant',
      'client',
      'partner_staff',
      'collaborator'
    ]);

  form.addTextItem()
    .setTitle('New Person - LinkedIn URL')
    .setHelpText('Optional');

  // ============================================
  // SECTION 2: TESTIMONIAL CONTEXT
  // ============================================
  form.addSectionHeaderItem()
    .setTitle('Testimonial Context')
    .setHelpText('What product/program is this testimonial about?');

  // Products dropdown
  const products = [
    'rwr | Real World Ready (main program)',
    'rwr-btb | Real World Ready - Beyond the Blueprint (TinkerHub)',
    'rwr-foss2025 | Real World Ready - FOSS Hack 2025',
    'consulting-edison | Consulting - Edison',
    'ocd-design-cbc | Design Your First Cohort Based Course (Maven)',
    'ocd-udemy-ai-course | AI Assisted Course Creation (Udemy)',
    'generic-brand | The Second Design - Brand (general praise)'
  ];

  form.addListItem()
    .setTitle('Product')
    .setHelpText('Which product or program is this testimonial for?')
    .setChoiceValues(products)
    .setRequired(true);

  // Partners dropdown
  const partners = [
    '-- No specific partner --',
    'tinkerhub | TinkerHub',
    'foss-united | FOSS United',
    'edison | Edison',
    'maven | Maven',
    'udemy | Udemy'
  ];

  form.addListItem()
    .setTitle('Partner')
    .setHelpText('Is this testimonial connected to a specific partner?')
    .setChoiceValues(partners)
    .setRequired(true);

  // Scope
  form.addMultipleChoiceItem()
    .setTitle('Scope')
    .setHelpText('"Product" = about a specific program. "Brand" = about The Second Design overall.')
    .setChoiceValues(['product', 'brand'])
    .setRequired(true);

  // Audience type
  form.addListItem()
    .setTitle('Audience Type')
    .setHelpText('Who is the person giving this testimonial?')
    .setChoiceValues([
      'student',
      'participant',
      'client',
      'partner',
      'collaborator',
      'generic'
    ])
    .setRequired(true);

  // ============================================
  // SECTION 3: TESTIMONIAL CONTENT
  // ============================================
  form.addSectionHeaderItem()
    .setTitle('Testimonial Content')
    .setHelpText('The actual testimonial text and media.');

  // Source type
  form.addListItem()
    .setTitle('Source Type')
    .setHelpText('What kind of testimonial is this?')
    .setChoiceValues([
      'text',
      'video',
      'image',
      'email',
      'blog',
      'tweet'
    ])
    .setRequired(true);

  // Quote short
  form.addParagraphTextItem()
    .setTitle('Quote (Short)')
    .setHelpText('1-2 killer lines. This appears on cards and previews.')
    .setRequired(true);

  // Quote long
  form.addParagraphTextItem()
    .setTitle('Quote (Long)')
    .setHelpText('Optional. Fuller context or the complete testimonial text.');

  // Source URL
  form.addTextItem()
    .setTitle('Source URL')
    .setHelpText('Link to video, tweet, blog post, etc. Leave empty for text testimonials.');

  // Image upload
  form.addFileUploadItem()
    .setTitle('Image Upload')
    .setHelpText('Screenshot, photo, or any visual testimonial. Will be auto-resized during site build.')
    .setAcceptedFileTypes(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

  // Image alt text
  form.addTextItem()
    .setTitle('Image Alt Text')
    .setHelpText('Describe the image for accessibility (if uploading an image).');

  // ============================================
  // SECTION 4: METADATA
  // ============================================
  form.addSectionHeaderItem()
    .setTitle('Metadata')
    .setHelpText('Additional information for sorting and display.');

  // Language
  form.addListItem()
    .setTitle('Language')
    .setChoiceValues(['en', 'ml', 'hi', 'es', 'other'])
    .setRequired(true);

  // Date
  form.addDateItem()
    .setTitle('Testimonial Date')
    .setHelpText('When was this testimonial given? (approximate is fine)')
    .setRequired(true);

  // Priority
  form.addListItem()
    .setTitle('Priority')
    .setHelpText('Hero = featured prominently. High = important. Normal = standard. Low = archive.')
    .setChoiceValues(['hero', 'high', 'normal', 'low'])
    .setRequired(true);

  // Rating
  form.addListItem()
    .setTitle('Rating')
    .setHelpText('For review-style testimonials (e.g., Udemy reviews). Leave blank otherwise.')
    .setChoiceValues([
      '-- No rating --',
      '5',
      '4.5',
      '4',
      '3.5',
      '3',
      '2.5',
      '2',
      '1.5',
      '1'
    ]);

  // Is published
  form.addMultipleChoiceItem()
    .setTitle('Publish Immediately?')
    .setHelpText('Set to Yes to show on site. Set to No to save as draft.')
    .setChoiceValues(['Yes', 'No'])
    .setRequired(true);

  // Internal notes
  form.addParagraphTextItem()
    .setTitle('Internal Notes')
    .setHelpText('Private notes. Never displayed on the site.');

  // ============================================
  // CREATE LINKED SPREADSHEET
  // ============================================
  const ss = SpreadsheetApp.create('Testimonials Data - The Second Design');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Add reference tabs to the spreadsheet
  const productsSheet = ss.insertSheet('Products');
  productsSheet.getRange('A1:C1').setValues([['product_id', 'name', 'variant_name']]);
  productsSheet.getRange('A2:C8').setValues([
    ['rwr', 'Real World Ready', ''],
    ['rwr-btb', 'Real World Ready', 'Beyond the Blueprint'],
    ['rwr-foss2025', 'Real World Ready', 'FOSS Hack 2025'],
    ['consulting-edison', 'Consulting', 'Edison'],
    ['ocd-design-cbc', 'Design Your First Cohort Based Course', ''],
    ['ocd-udemy-ai-course', 'AI Assisted Course Creation', 'Step-by-Step with ChatGPT'],
    ['generic-brand', 'The Second Design - Brand', '']
  ]);

  const partnersSheet = ss.insertSheet('Partners');
  partnersSheet.getRange('A1:B1').setValues([['partner_id', 'name']]);
  partnersSheet.getRange('A2:B6').setValues([
    ['tinkerhub', 'TinkerHub'],
    ['foss-united', 'FOSS United'],
    ['edison', 'Edison'],
    ['maven', 'Maven'],
    ['udemy', 'Udemy']
  ]);

  const personsSheet = ss.insertSheet('Persons');
  personsSheet.getRange('A1:D1').setValues([['person_id', 'name', 'designation', 'company']]);
  personsSheet.getRange('A2:D24').setValues([
    ['sai-rahul', 'Sai Rahul', 'CEO', 'FOSS United'],
    ['rik-van-den-berge', 'Rik van den Berge', 'Certified Coach', ''],
    ['azul', 'Azul', 'Course Creator', ''],
    ['konstantin-starikov', 'Konstantin Starikov', 'Course Creator', ''],
    ['shanak-rahman', 'Shanak Rahman', 'Learning Experience Designer', 'IMG Academy'],
    ['rachel-hoeft', 'Rachel Hoeft', 'Learning Experience Designer', 'IMG Academy'],
    ['kira-milda-gai', 'Kira Milda Gai', 'Learning & Development Professional', ''],
    ['rodolfo-sagahon', 'Rodolfo Sagahon', 'CBC Creator', ''],
    ['alejandro-mashad', 'Alejandro Mashad', 'Founder', 'Edison'],
    ['matias-kahl', 'Matias Kahl', 'Co-founder', 'Edison'],
    ['quincy-p', 'Quincy P', '', ''],
    ['chris-b', 'Chris B', '', ''],
    ['jonathan-woodruff', 'Jonathan Woodruff', '', ''],
    ['abhith-b', 'Abhith B', '', ''],
    ['amrid', 'Amrid', '', ''],
    ['deva', 'Deva', '', ''],
    ['arjun-vibeesh', 'Arjun Vibeesh', '', ''],
    ['niranjana', 'Niranjana', '', ''],
    ['r-sreehari', 'R Sreehari', '', ''],
    ['suha-shajahan', 'Suha Shajahan', '', ''],
    ['arsha', 'Arsha', '', ''],
    ['shreya-sajalan', 'Shreya Sajalan', '', ''],
    ['nahidah', 'Nahidah', 'Student', 'Jyothi Engineering College']
  ]);

  // Log the URLs
  Logger.log('===========================================');
  Logger.log('FORM CREATED SUCCESSFULLY!');
  Logger.log('===========================================');
  Logger.log('Form URL (for you to fill out):');
  Logger.log(form.getEditUrl());
  Logger.log('');
  Logger.log('Form URL (shareable, if needed):');
  Logger.log(form.getPublishedUrl());
  Logger.log('');
  Logger.log('Spreadsheet URL (responses go here):');
  Logger.log(ss.getUrl());
  Logger.log('');
  Logger.log('Spreadsheet ID (for your build script):');
  Logger.log(ss.getId());
  Logger.log('===========================================');

  // Show alert with URLs
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Form Created!',
    'Form: ' + form.getPublishedUrl() + '\n\n' +
    'Spreadsheet: ' + ss.getUrl() + '\n\n' +
    'Spreadsheet ID: ' + ss.getId() + '\n\n' +
    'Check the Logs (View > Logs) for all URLs.',
    ui.ButtonSet.OK
  );
}
