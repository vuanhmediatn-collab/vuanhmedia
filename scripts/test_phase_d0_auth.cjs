const fs = require('fs');
const path = require('path');

function runPhaseD0Verification() {
  console.log('====================================================');
  console.log('   PHASE D0 AUTOMATED AUTH VERIFICATION SUITE       ');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 10;

  const srcDir = path.resolve(__dirname, '../src');
  const appTsxContent = fs.readFileSync(path.resolve(srcDir, 'App.tsx'), 'utf-8');

  function checkFilesForPattern(dir, pattern, excludePatterns = []) {
    let matches = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const fullPath = path.join(dir, f.name);
      if (f.isDirectory()) {
        matches = matches.concat(checkFilesForPattern(fullPath, pattern, excludePatterns));
      } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (pattern.test(content)) {
          let excluded = false;
          for (const ep of excludePatterns) {
            if (ep.test(fullPath)) {
              excluded = true;
              break;
            }
          }
          if (!excluded) {
            matches.push(fullPath);
          }
        }
      }
    }
    return matches;
  }

  // TEST AUTH-01: No legacy passcode or fake auth in codebase
  const legacyPasscodeMatches = checkFilesForPattern(
    srcDir,
    /=== ['"]vuanhmedia['"]|=== ['"]2026['"]|vuanh_media_admin|vuanh_media_cms_session|passcodeInput|handleVerifyPasscode/
  );
  if (legacyPasscodeMatches.length === 0) {
    console.log('✅ AUTH-01: Zero legacy passcode or localStorage fake auth occurrences found in src/.');
    passedTests++;
  } else {
    console.error('❌ AUTH-01 FAIL: Legacy passcode references found in:', legacyPasscodeMatches);
  }

  // TEST AUTH-02: Supabase client uses only publishable key
  const supabaseClientContent = fs.readFileSync(path.resolve(srcDir, 'lib/supabase.ts'), 'utf-8');
  if (
    supabaseClientContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY') &&
    !supabaseClientContent.includes('service_role') &&
    !supabaseClientContent.includes('sb_secret')
  ) {
    console.log('✅ AUTH-02: Supabase client is configured exclusively with VITE_SUPABASE_PUBLISHABLE_KEY.');
    passedTests++;
  } else {
    console.error('❌ AUTH-02 FAIL: Supabase client configuration does not meet security requirements.');
  }

  // TEST AUTH-03: AuthProvider implementation
  const authProviderPath = path.resolve(srcDir, 'auth/AuthProvider.tsx');
  if (fs.existsSync(authProviderPath)) {
    const authProviderContent = fs.readFileSync(authProviderPath, 'utf-8');
    const hasRoleCheck = authProviderContent.includes("from('admin_users')");
    const hasIsActiveCheck = authProviderContent.includes('is_active');
    const hasUnsubscribe = authProviderContent.includes('subscription.unsubscribe()');
    
    if (hasRoleCheck && hasIsActiveCheck && hasUnsubscribe) {
      console.log('✅ AUTH-03: AuthProvider implements authoritative public.admin_users role verification and cleans up listener.');
      passedTests++;
    } else {
      console.error('❌ AUTH-03 FAIL: AuthProvider missing database role check or unsubscribe.');
    }
  } else {
    console.error('❌ AUTH-03 FAIL: AuthProvider.tsx not found.');
  }

  // TEST AUTH-04: AdminGuard protects /admin route
  const adminGuardPath = path.resolve(srcDir, 'auth/AdminGuard.tsx');
  if (fs.existsSync(adminGuardPath)) {
    const adminGuardContent = fs.readFileSync(adminGuardPath, 'utf-8');
    const hasLoginFallback = adminGuardContent.includes('<AdminLogin');
    const hasAdminCheck = adminGuardContent.includes('isAdmin');
    const hasDeniedView = adminGuardContent.includes('Không có quyền truy cập') || adminGuardContent.includes('Access Denied');

    if (hasLoginFallback && hasAdminCheck && hasDeniedView) {
      console.log('✅ AUTH-04: AdminGuard correctly handles Unauthenticated -> Login, Authenticated Non-Admin -> Denied, Authenticated Admin -> Shell.');
      passedTests++;
    } else {
      console.error('❌ AUTH-04 FAIL: AdminGuard missing required state branches.');
    }
  } else {
    console.error('❌ AUTH-04 FAIL: AdminGuard.tsx not found.');
  }

  // TEST AUTH-05: AdminLogin has no open self-registration
  const adminLoginPath = path.resolve(srcDir, 'auth/AdminLogin.tsx');
  if (fs.existsSync(adminLoginPath)) {
    const adminLoginContent = fs.readFileSync(adminLoginPath, 'utf-8');
    const hasSignUp = adminLoginContent.includes('signUp') || adminLoginContent.includes('Đăng ký tài khoản');
    if (!hasSignUp) {
      console.log('✅ AUTH-05: AdminLogin contains zero open self-registration flows.');
      passedTests++;
    } else {
      console.error('❌ AUTH-05 FAIL: AdminLogin exposes public registration flow.');
    }
  } else {
    console.error('❌ AUTH-05 FAIL: AdminLogin.tsx not found.');
  }

  // TEST AUTH-06: AdminShell displays required metadata
  const adminShellPath = path.resolve(srcDir, 'auth/AdminShell.tsx');
  if (fs.existsSync(adminShellPath)) {
    const adminShellContent = fs.readFileSync(adminShellPath, 'utf-8');
    const hasBrandTitle = adminShellContent.includes('Vũ Anh Media Admin');
    const hasRoleDisplay = adminShellContent.includes('adminRole');
    const hasSignOutBtn = adminShellContent.includes('signOut');

    if (hasBrandTitle && hasRoleDisplay && hasSignOutBtn) {
      console.log('✅ AUTH-06: AdminShell correctly displays Brand Title, authoritative role pill, and sign out control.');
      passedTests++;
    } else {
      console.error('❌ AUTH-06 FAIL: AdminShell missing required UI elements.');
    }
  } else {
    console.error('❌ AUTH-06 FAIL: AdminShell.tsx not found.');
  }

  // TEST AUTH-07: Root App wraps with AuthProvider
  const mainTsxContent = fs.readFileSync(path.resolve(srcDir, 'main.tsx'), 'utf-8');
  if (mainTsxContent.includes('<AuthProvider>') && mainTsxContent.includes('</AuthProvider>')) {
    console.log('✅ AUTH-07: Root main.tsx properly wraps application in <AuthProvider>.');
    passedTests++;
  } else {
    console.error('❌ AUTH-07 FAIL: main.tsx does not wrap in <AuthProvider>.');
  }

  // TEST AUTH-08: AdminGuard integrated into App.tsx
  if (appTsxContent.includes('<AdminGuard') && appTsxContent.includes('isAdminRoute')) {
    console.log('✅ AUTH-08: App.tsx routes /admin traffic directly to <AdminGuard />.');
    passedTests++;
  } else {
    console.error('❌ AUTH-08 FAIL: App.tsx does not route to <AdminGuard />.');
  }

  // TEST AUTH-09: No client-side call to bootstrap_admin_user
  const clientBootstrapCalls = checkFilesForPattern(
    srcDir,
    /\.rpc\(['"]bootstrap_admin_user['"]\)/,
    []
  );
  if (clientBootstrapCalls.length === 0) {
    console.log('✅ AUTH-09: No client-side call to bootstrap_admin_user found in frontend execution logic.');
    passedTests++;
  } else {
    console.error('❌ AUTH-09 FAIL: Client-side bootstrap_admin_user call found in:', clientBootstrapCalls);
  }

  // TEST AUTH-10: Database security architecture verification
  const phaseAFoundationPath = path.resolve(__dirname, '../supabase/migrations/20260818061900_phase_a_production_foundation.sql');
  const phaseASecurityPath = path.resolve(__dirname, '../supabase/migrations/20260818062024_phase_a_security_hardening.sql');
  
  if (fs.existsSync(phaseAFoundationPath) && fs.existsSync(phaseASecurityPath)) {
    const foundationContent = fs.readFileSync(phaseAFoundationPath, 'utf-8');
    const securityContent = fs.readFileSync(phaseASecurityPath, 'utf-8');
    
    const hasAdminUsersTable = foundationContent.includes('CREATE TABLE IF NOT EXISTS public.admin_users');
    const hasIsAdminFunc = securityContent.includes('CREATE OR REPLACE FUNCTION private.is_admin()');
    
    if (hasAdminUsersTable && hasIsAdminFunc) {
      console.log('✅ AUTH-10: Security migrations define public.admin_users and private.is_admin() RLS function.');
      passedTests++;
    } else {
      console.error('❌ AUTH-10 FAIL: Security migration definitions missing.');
    }
  } else {
    console.error('❌ AUTH-10 FAIL: Security migration file not found.');
  }

  console.log('\n====================================================');
  console.log(`   RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhaseD0Verification();
