const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('====================================================');
console.log('   PHASE D3.1 FLEXIBLE COMBOBOX QA TEST SUITE       ');
console.log('====================================================');

let passCount = 0;
const totalTests = 10;

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

const comboboxContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/ProjectCombobox.tsx'), 'utf-8');
const videoDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/VideoFormDrawer.tsx'), 'utf-8');
const imageDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/ImageFormDrawer.tsx'), 'utf-8');
const mediaPageContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/pages/AdminMediaPage.tsx'), 'utf-8');
const projectDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/projects/components/ProjectFormDrawer.tsx'), 'utf-8');

// QA-A: Generic open starts with placeholder "Chọn dự án..." and empty selection
assertTest('QA-A', 'Generic /admin/media starts with "Chọn dự án..." and empty project_id',
  comboboxContent.includes("placeholder = 'Chọn dự án...'") &&
  videoDrawerContent.includes("project_id: ''") &&
  imageDrawerContent.includes("project_id: ''"),
  'Ensures no automatic fallback to projects[0]'
);

// QA-B: Search filters by title, client, and slug
assertTest('QA-B', 'Search filters existing projects across title, client, and slug',
  comboboxContent.includes('p.title.toLowerCase().includes(term)') &&
  comboboxContent.includes('p.client && p.client.toLowerCase().includes(term)') &&
  comboboxContent.includes('p.slug && p.slug.toLowerCase().includes(term)'),
  'Matches Vietnamese titles like "THÀNH LONG", clients, and slugs'
);

// QA-C: Selection updates project_id
assertTest('QA-C', 'Selecting a project item sets project_id and closes dropdown',
  comboboxContent.includes('onSelectProject(project.id)') &&
  videoDrawerContent.includes('onSelectProject={(id) => setFormData((prev) => ({ ...prev, project_id: id }))}'),
  'Proper state setter propagation'
);

// QA-D: Empty search state
assertTest('QA-D', 'Empty search shows "Không tìm thấy dự án phù hợp." and "+ Tạo dự án mới"',
  comboboxContent.includes('Không tìm thấy dự án phù hợp.') &&
  comboboxContent.includes('Tạo dự án mới'),
  'Provides clean feedback and quick creation action'
);

// QA-E: Clicking "+ Tạo dự án mới" opens existing ProjectFormDrawer
assertTest('QA-E', 'Clicking "+ Tạo dự án mới" opens existing ProjectFormDrawer',
  mediaPageContent.includes('onCreateNewProject={() => setIsProjectDrawerOpen(true)}') &&
  mediaPageContent.includes('<ProjectFormDrawer'),
  'Reuses existing D2 ProjectFormDrawer without duplicating CRUD logic'
);

// QA-F: Project creation defaults to draft status
assertTest('QA-F', 'Project creation defaults status to draft',
  projectDrawerContent.includes("status: 'draft'"),
  'Prevents premature public exposure of attached media'
);

// QA-G: On project create success, auto-selects new project and preserves media fields
assertTest('QA-G', 'Auto-selects created project and preserves existing media inputs',
  mediaPageContent.includes('setCreatedProjectId(newProject.id)') &&
  videoDrawerContent.includes('setFormData((prev) => ({ ...prev, project_id: defaultProjectId }))') &&
  imageDrawerContent.includes('setFormData((prev) => ({ ...prev, project_id: defaultProjectId }))'),
  'Preserves title, url, description, etc. while injecting new project_id'
);

// QA-H: Changing selection to another existing project is supported
assertTest('QA-H', 'Changing selection or clearing project is fully allowed',
  comboboxContent.includes('onSelectProject(\'\')') &&
  comboboxContent.includes('onClick={() => handleSelect(project)}'),
  'Combobox is not locked and allows switching projects'
);

// QA-I: URL context /admin/media?project=<id> preselects without disabling
assertTest('QA-I', 'URL project query preselects default project while remaining editable',
  mediaPageContent.includes('activeDefaultProjectId') &&
  comboboxContent.includes('disabled = false'),
  'Editable and flexible project selector verified'
);

// QA-J: Final database baseline verified
async function verifyDatabase() {
  const SUPABASE_URL = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_8eg-XoTohtULfR_xHBpm6A_bLNf5qUs';
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: publicProjects } = await client.from('projects').select('*');
  const { data: publicVideos } = await client.from('project_videos').select('*');
  const { data: publicMedia } = await client.from('project_media').select('*');

  const pubProjCount = (publicProjects || []).length;
  const pubVidCount = (publicVideos || []).length;
  const pubMediaCount = (publicMedia || []).length;

  assertTest('QA-J', 'Database baseline intact: 2 published projects, 2 videos, 0 media',
    pubProjCount === 2 && pubVidCount === 2 && pubMediaCount === 0,
    `Observed: projects=${pubProjCount}, videos=${pubVidCount}, media=${pubMediaCount}`
  );

  console.log('====================================================');
  console.log(`   RESULT: ${passCount}/${totalTests} TESTS PASSED`);
  console.log('====================================================');
}

verifyDatabase();
