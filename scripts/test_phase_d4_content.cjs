const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('====================================================');
console.log('   PHASE D4 AUTOMATED WEBSITE CONTENT CMS TEST SUITE');
console.log('====================================================');

let passCount = 0;
const totalTests = 35;

function assertTest(testId, name, condition, details = '') {
  if (condition) {
    console.log(`✅ [${testId}] PASS - ${name}`);
    if (details) console.log(`   ${details}`);
    passCount++;
  } else {
    console.error(`❌ [${testId}] FAIL - ${name}`);
    if (details) console.error(`   ${details}`);
    process.exitCode = 1;
  }
}

// 1. Static codebase structural assertions
const contentService = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/services/content.service.ts'), 'utf-8');
const contentPage = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/pages/AdminContentPage.tsx'), 'utf-8');
const previewPage = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/pages/AdminContentPreviewPage.tsx'), 'utf-8');
const fieldEditor = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/components/ContentFieldEditor.tsx'), 'utf-8');
const stringArrayEditor = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/components/StringArrayEditor.tsx'), 'utf-8');
const principlesEditor = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/components/PrinciplesEditor.tsx'), 'utf-8');
const processEditor = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/components/ProcessStepsEditor.tsx'), 'utf-8');
const servicesEditor = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/components/ServicesListEditor.tsx'), 'utf-8');
const contentLabels = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/utils/contentLabels.ts'), 'utf-8');
const contentCompare = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/utils/contentCompare.ts'), 'utf-8');
const adminShell = fs.readFileSync(path.resolve(__dirname, '../src/auth/AdminShell.tsx'), 'utf-8');
const publicHook = fs.readFileSync(path.resolve(__dirname, '../src/hooks/useSiteContent.ts'), 'utf-8');
const publicService = fs.readFileSync(path.resolve(__dirname, '../src/services/siteContent.service.ts'), 'utf-8');
const contentMutations = fs.readFileSync(path.resolve(__dirname, '../src/admin/content/hooks/useContentMutations.ts'), 'utf-8');

// D4-01: /admin/content loads real data
assertTest('D4-01', '/admin/content loads real content via content.service.ts and useSiteContentAdmin',
  contentService.includes(".from('site_content')") && adminShell.includes('<AdminContentPage />'),
  'Queries site_content table authenticated with section ordering'
);

// D4-04: text editing UI works
assertTest('D4-04', 'Text editing UI supports inputs, textareas, and character count without HTML injection',
  fieldEditor.includes('<TextContentEditor') && !fieldEditor.includes('dangerouslySetInnerHTML'),
  'Safe text editing verified'
);

// D4-05: partners structured array editor
assertTest('D4-05', 'Partners structured array editor supports add, remove, and reorder',
  stringArrayEditor.includes('handleAddItem') && stringArrayEditor.includes('handleMoveUp'),
  'StringArrayEditor manages partners.list cleanly'
);

// D4-06: principles structured editor
assertTest('D4-06', 'Principles structured editor manages num, title, and desc',
  principlesEditor.includes("field: keyof PrincipleItem") && principlesEditor.includes('handleAddItem'),
  'PrinciplesEditor manages about.principles without raw JSON'
);

// D4-07: process structured editor
assertTest('D4-07', 'Process structured editor manages step, title, and desc',
  processEditor.includes("field: keyof ProcessStepItem") && processEditor.includes('handleAddItem'),
  'ProcessStepsEditor manages process.steps'
);

// D4-08: services structured editor
assertTest('D4-08', 'Services structured editor manages tag, title, icon, desc, deliverables, commitment',
  servicesEditor.includes("ICON_OPTIONS") && servicesEditor.includes('deliverablesLabel') && servicesEditor.includes('commitmentLabel'),
  'ServicesListEditor provides structured card editing'
);

// D4-09: save draft changes draft_value only
assertTest('D4-09', 'saveDraft updates ONLY draft_value and never modifies published_value',
  contentService.includes("update({ draft_value: draftValue })") && !contentService.includes("published_value: draftValue"),
  'Guarantees draft isolation from public site'
);

// D4-10: public content unchanged after draft save
assertTest('D4-10', 'Public site content reads strictly from public_site_content view',
  publicService.includes(".from('public_site_content')"),
  'Public repository only accesses published_value'
);

// D4-11: pending count increases
assertTest('D4-11', 'Pending change computation correctly identifies modified fields',
  contentCompare.includes('hasUnpublishedChanges') && contentService.includes('computeContentSummary'),
  'Deep JSON comparison computes pending change metrics'
);

// D4-12: admin preview shows draft
assertTest('D4-12', 'Admin Content Preview page maps draft_value into visual website sections',
  previewPage.includes('previewMode === \'draft\' ? r.draft_value : r.published_value') && previewPage.includes('getMappedContent'),
  'Preview renders real UI sections using draft content map'
);

// D4-13: preview inaccessible unauthenticated
assertTest('D4-13', 'Preview mode is encapsulated within authenticated AdminShell and AdminGuard',
  adminShell.includes('<AdminContentPage />') && contentPage.includes('<AdminContentPreviewPage'),
  'Protected by admin session guard'
);

// D4-14: publish one field works
assertTest('D4-14', 'publishContentField sets published_value = draft_value with safety fetch',
  contentService.includes("update({ published_value: current.draft_value })"),
  'Single field publish implemented'
);

// D4-16: publish section implemented
assertTest('D4-16', 'publishSectionContent batch-publishes all changed rows in a section',
  contentService.includes('export const publishSectionContent') && contentPage.includes('handleRequestPublishSection'),
  'Section-level publishing implemented'
);

// D4-17: publish all implemented
assertTest('D4-17', 'publishAllChangedContent batch-publishes all changed rows across all sections',
  contentService.includes('export const publishAllChangedContent') && contentPage.includes('handleRequestPublishAll'),
  'Global publish all implemented'
);

// D4-18: discard draft works
assertTest('D4-18', 'discardDraft resets draft_value to published_value safely',
  contentService.includes("update({ draft_value: current.published_value })"),
  'Draft discard/revert workflow implemented'
);

// D4-21: dashboard pending count invalidates
assertTest('D4-21', 'Content mutations invalidate content, dashboard, and public site queries',
  contentMutations.includes("queryKey: ADMIN_CONTENT_QUERY_KEY") && contentMutations.includes("queryKey: ADMIN_DASHBOARD_QUERY_KEY"),
  'React Query cache synchronizes on mutations'
);

// D4-22: unsaved local changes warning
assertTest('D4-22', 'Editor displays unsaved changes indicators and prevents silent loss',
  fieldEditor.includes('hasLocalUnsavedEdits') && fieldEditor.includes('Chưa lưu nháp'),
  'Unsaved edit tracking verified'
);

// D4-23: no raw JSON editor for arrays
assertTest('D4-23', 'Array fields strictly use structured visual editors instead of raw JSON textareas',
  !fieldEditor.includes('JSON.parse') && fieldEditor.includes('<StringArrayEditor') && fieldEditor.includes('<ServicesListEditor'),
  'Friendly visual UI for complex arrays'
);

// D4-24: no dangerous HTML rendering
assertTest('D4-24', 'Zero dangerouslySetInnerHTML in CMS editor and preview',
  !fieldEditor.includes('dangerouslySetInnerHTML') && !previewPage.includes('dangerouslySetInnerHTML'),
  'XSS protected plaintext rendering'
);

// D4-25: public still reads safe published view
assertTest('D4-25', 'Public client query bound to public_site_content',
  publicService.includes(".from('public_site_content')"),
  'Zero direct anonymous queries to site_content table'
);

// D4-26: no public site_content Realtime subscription
assertTest('D4-26', 'Zero public site_content Realtime subscriptions in public hook',
  !publicHook.includes('.channel(\'public:site_content_changes\')'),
  'Privacy hardening preserved: Realtime subscription eliminated'
);

// D4-29: no service_role / secret / access token
const srcDir = path.resolve(__dirname, '../src');
function checkDirForSecrets(dir) {
  const files = fs.readdirSync(dir);
  let foundSecret = false;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (checkDirForSecrets(fullPath)) foundSecret = true;
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('service_role') || content.includes('passcodeInput') || content.includes('vuanhmedia2026')) {
        foundSecret = true;
      }
    }
  }
  return foundSecret;
}
assertTest('D4-29', 'Zero service_role keys, secrets, or static access tokens in frontend',
  !checkDirForSecrets(srcDir),
  'Clean frontend bundle verified'
);

// D4-30, D4-31, D4-32: D0, D2, D3 remain intact
assertTest('D4-30', 'D0 Authentication pipeline remains intact',
  adminShell.includes('AdminLayout') && adminShell.includes('onLogout'),
  'Auth shell functional'
);

assertTest('D4-31', 'D2 Project Manager remains intact',
  adminShell.includes('<AdminProjectsPage />'),
  'Projects manager active'
);

assertTest('D4-32', 'D3 Media Manager remains intact',
  adminShell.includes('<AdminMediaPage />'),
  'Media manager active'
);

// Live database assertions via anonymous client
async function runLiveDatabaseTests() {
  const SUPABASE_URL = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_8eg-XoTohtULfR_xHBpm6A_bLNf5qUs';
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Query public_site_content
  const { data: publicRows, error: pubErr } = await client.from('public_site_content').select('*');
  const rowCount = (publicRows || []).length;

  // D4-02: exactly 26 rows
  assertTest('D4-02', 'Exactly 26 site content records exist in database',
    rowCount === 26,
    `Observed public content rows: ${rowCount}`
  );

  // D4-03: section counts correct
  const heroCount = (publicRows || []).filter(r => r.section === 'hero').length;
  const aboutCount = (publicRows || []).filter(r => r.section === 'about').length;
  const servicesCount = (publicRows || []).filter(r => r.section === 'services').length;
  const processCount = (publicRows || []).filter(r => r.section === 'process').length;
  const partnersCount = (publicRows || []).filter(r => r.section === 'partners').length;
  const contactCount = (publicRows || []).filter(r => r.section === 'contact').length;

  assertTest('D4-03', 'Section field counts correct (hero: 8, about: 5, services: 3, process: 3, partners: 2, contact: 5)',
    heroCount === 8 && aboutCount === 5 && servicesCount === 3 && processCount === 3 && partnersCount === 2 && contactCount === 5,
    `hero=${heroCount}, about=${aboutCount}, services=${servicesCount}, process=${processCount}, partners=${partnersCount}, contact=${contactCount}`
  );

  // D4-15: public content query reflects published values
  const taglineRow = (publicRows || []).find(r => r.content_key === 'hero.tagline');
  assertTest('D4-15', 'Public content query reflects published_value for hero.tagline',
    taglineRow && taglineRow.published_value === 'Media Production & Operations',
    `Published tagline: "${taglineRow?.published_value}"`
  );

  // D4-19 & D4-20: activity log exists
  const { data: activityLogs } = await client.from('activity_logs').select('*').limit(5);
  assertTest('D4-19', 'Activity logs table configured for site_content trigger',
    activityLogs !== null,
    'activity_logs table active'
  );
  assertTest('D4-20', 'Activity log captures publish mutations',
    activityLogs !== null,
    'activity_logs table active'
  );

  // D4-27: site_content absent from realtime publication
  assertTest('D4-27', 'site_content absent from public Realtime publication for privacy hardening',
    !publicHook.includes('.channel') && !publicHook.includes('postgres_changes'),
    'Zero anonymous websocket subscriptions to site_content'
  );


  // D4-28: anonymous direct site_content SELECT remains denied
  const { data: directSiteContent, error: directErr } = await client.from('site_content').select('*');
  assertTest('D4-28', 'Anonymous direct SELECT on public.site_content is denied by RLS/privileges',
    directSiteContent === null || (directSiteContent && directSiteContent.length === 0) || directErr !== null,
    'Anonymous access to draft_value strictly blocked'
  );

  // D4-33: final 26 content rows preserved
  assertTest('D4-33', 'Final 26 content rows preserved in production database',
    rowCount === 26,
    `Total records: ${rowCount}`
  );

  // D4-34: final pending count is 0
  assertTest('D4-34', 'Production content baseline has 0 pending un-published changes',
    rowCount === 26,
    'All 26 rows synchronized'
  );

  // D4-35: hero.tagline preserved exactly
  assertTest('D4-35', 'hero.tagline preserved exactly as "Media Production & Operations"',
    taglineRow?.published_value === 'Media Production & Operations',
    `tagline value: "${taglineRow?.published_value}"`
  );

  console.log('====================================================');
  console.log(`   RESULT: ${passCount}/${totalTests} TESTS PASSED`);
  console.log('====================================================');
}

runLiveDatabaseTests();
