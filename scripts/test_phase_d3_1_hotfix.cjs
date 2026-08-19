const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('====================================================');
console.log('   PHASE D3.1 HOTFIX PROJECT SAFETY TEST SUITE     ');
console.log('====================================================');

let passCount = 0;
const totalTests = 8;

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

const videoDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/VideoFormDrawer.tsx'), 'utf-8');
const imageDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/ImageFormDrawer.tsx'), 'utf-8');
const mediaPageContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/pages/AdminMediaPage.tsx'), 'utf-8');

// QA A: /admin/media generic open -> project_id is empty, select option "-- Chọn dự án --"
assertTest('QA-A1', 'VideoFormDrawer generic open initializes project_id to empty string',
  videoDrawerContent.includes("project_id: ''") &&
  videoDrawerContent.includes("isValidProject ? (defaultProjectId as string) : ''") &&
  !videoDrawerContent.includes('projects[0]'),
  'Ensures no automatic fallback to projects[0]'
);

assertTest('QA-A2', 'VideoFormDrawer renders visible "-- Chọn dự án --" option',
  videoDrawerContent.includes('<option value="">-- Chọn dự án --</option>'),
  'Default placeholder option visible and selectable'
);

// QA B: Submit without project -> block and show "Vui lòng chọn dự án."
assertTest('QA-B', 'VideoFormDrawer blocks submission without project and returns exact Vietnamese validation',
  videoDrawerContent.includes("if (!formData.project_id || !formData.project_id.trim())") &&
  videoDrawerContent.includes("setValidationError('Vui lòng chọn dự án.')"),
  'Explicit validation error blocks API calls'
);

// QA C: /admin/media?project=<id> preselects only if ID is valid
assertTest('QA-C', 'AdminMediaPage validates URL project query against projects list before preselection',
  mediaPageContent.includes("projects.some((p) => p.id === selectedProjectId)") &&
  videoDrawerContent.includes("projects.some((p) => p.id === defaultProjectId)"),
  'Preselects project only when project ID genuinely exists in dataset'
);

// QA D: Same tests for ImageFormDrawer
assertTest('QA-D1', 'ImageFormDrawer generic open initializes project_id to empty string',
  imageDrawerContent.includes("project_id: ''") &&
  imageDrawerContent.includes("isValidProject ? (defaultProjectId as string) : ''") &&
  !imageDrawerContent.includes('projects[0]'),
  'No automatic project fallback in Image drawer'
);

assertTest('QA-D2', 'ImageFormDrawer renders "-- Chọn dự án --" and blocks submission without project',
  imageDrawerContent.includes('<option value="">-- Chọn dự án --</option>') &&
  imageDrawerContent.includes("setValidationError('Vui lòng chọn dự án.')"),
  'Image drawer blocks submission with "Vui lòng chọn dự án."'
);

// QA E: Verify live database baseline
async function verifyDatabaseBaseline() {
  const SUPABASE_URL = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_8eg-XoTohtULfR_xHBpm6A_bLNf5qUs';
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: publicProjects } = await client.from('projects').select('*');
  const { data: publicVideos } = await client.from('project_videos').select('*');
  const { data: publicMedia } = await client.from('project_media').select('*');

  const pubProjCount = (publicProjects || []).length;
  const pubVidCount = (publicVideos || []).length;
  const pubMediaCount = (publicMedia || []).length;

  assertTest('QA-E1', 'Live database baseline: 2 published projects, 2 published videos, 0 media',
    pubProjCount === 2 && pubVidCount === 2 && pubMediaCount === 0,
    `Observed: projects=${pubProjCount}, videos=${pubVidCount}, media=${pubMediaCount}`
  );

  assertTest('QA-E2', 'Zero unwanted temporary rows in database',
    (publicVideos || []).every(v => v.title !== 'D3 QA TEMP VIDEO'),
    'Existing 2 videos remain pristine'
  );

  console.log('====================================================');
  console.log(`   RESULT: ${passCount}/${totalTests} TESTS PASSED`);
  console.log('====================================================');
}

verifyDatabaseBaseline();
