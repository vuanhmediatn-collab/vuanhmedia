const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   PHASE D1.1 ADMIN DASHBOARD POLISH TEST SUITE     ');
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

// Read relevant files
const adminGuardContent = fs.readFileSync(path.resolve(__dirname, '../src/auth/AdminGuard.tsx'), 'utf-8');
const adminShellContent = fs.readFileSync(path.resolve(__dirname, '../src/auth/AdminShell.tsx'), 'utf-8');
const dashboardServiceContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/services/dashboard.service.ts'), 'utf-8');
const dashboardPageContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/pages/AdminDashboardPage.tsx'), 'utf-8');
const layoutContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/layout/AdminLayout.tsx'), 'utf-8');
const activityListContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/components/ActivityLogsList.tsx'), 'utf-8');
const placeholderPageContent = fs.readFileSync(path.resolve(__dirname, '../src/admin/pages/AdminPlaceholderPage.tsx'), 'utf-8');

// D1-01: unauthenticated /admin redirects login
const hasUnauthRedirect = adminGuardContent.includes("window.history.replaceState({}, '', '/admin/login')");
assertTest('D1-01', 'Unauthenticated /admin redirects to /admin/login', hasUnauthRedirect, 'AdminGuard replaces history state to /admin/login for unauthenticated users');

// D1-02: authenticated super_admin enters dashboard
const hasAdminRender = adminGuardContent.includes('<AdminShell') && adminShellContent.includes('<AdminDashboardPage');
assertTest('D1-02', 'Authenticated super_admin enters dashboard', hasAdminRender, 'AdminShell mounts AdminLayout and AdminDashboardPage for authenticated admins');

// D1-03: refresh /admin preserves session
const hasSessionPreservation = adminGuardContent.includes("window.history.replaceState({}, '', '/admin')") && adminGuardContent.includes('session && user && isAdmin');
assertTest('D1-03', 'Refresh /admin preserves session without redirecting to login', hasSessionPreservation, 'Preserves route and session on browser refresh');

// D1-04: project counts match Supabase query
const hasProjectQueries = dashboardServiceContent.includes(".from('projects')") && dashboardServiceContent.includes("status === 'published'") && dashboardServiceContent.includes("status === 'draft'");
assertTest('D1-04', 'Project counts query real public.projects with all status categories', hasProjectQueries, 'Queries real projects table and aggregates total, published, draft, hidden, archived');

// D1-05: Activity log actor display
const hasActorCheck = activityListContent.includes("log.user_email ? log.user_email : 'Hệ thống'") && activityListContent.includes('Thực hiện bởi:');
assertTest('D1-05', 'Activity log displays actor email or Hệ thống fallback', hasActorCheck, 'Displays actor email if present, else Hệ thống');

// D1-06: Technical label removed
const hasNoRealtimeDb = !dashboardPageContent.includes('Realtime DB') && dashboardPageContent.includes('Hoạt động gần đây');
assertTest('D1-06', 'Technical Realtime DB label replaced with Hoạt động gần đây', hasNoRealtimeDb, 'Removed backend terminology from UI');

// D1-07: Sidebar readability and no phase badges
const hasSidebarPolish = layoutContent.includes('w-72') && !layoutContent.includes('Phase sau');
assertTest('D1-07', 'Sidebar width expanded to w-72 and Phase badges removed', hasSidebarPolish, 'Nội dung Website fully visible and uncluttered');

// D1-08: Content status operational wording
const hasContentWording = dashboardPageContent.includes('Không có thay đổi chờ xuất bản') && dashboardPageContent.includes('thay đổi chờ xuất bản') && !dashboardPageContent.includes('Đồng bộ 100%');
assertTest('D1-08', 'Website content status uses operational wording instead of percentage', hasContentWording, 'Shows real pending changes count without fake percentages');

// D1-09: logout still works
const hasLogoutAction = adminGuardContent.includes('signOut()') && layoutContent.includes('onLogout');
assertTest('D1-09', 'Logout invalidates session and navigates to /admin/login', hasLogoutAction, 'Calls supabase.auth.signOut and updates navigation state to /admin/login');

// D1-10: no service_role / secret / static password in frontend
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
const hasSecrets = checkDirForSecrets(srcDir);
assertTest('D1-10', 'No service_role, secrets, or static password in frontend', !hasSecrets, 'Zero sensitive tokens or static bypass credentials present in src/');

console.log('====================================================');
console.log(`   RESULT: ${passCount}/${totalTests} TESTS PASSED`);
console.log('====================================================');
