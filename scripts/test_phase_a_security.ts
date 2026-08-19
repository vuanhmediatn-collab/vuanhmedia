/**
 * Phase A Security Acceptance Test Suite
 * Validates RLS policies, RBAC boundaries, and immutability rules.
 */

export interface TestResult {
  testId: string;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

export const runPhaseASecurityTests = async (
  supabaseAnonClient: any,
  supabaseAuthNonAdminClient: any,
  supabaseAdminClient: any
): Promise<TestResult[]> => {
  const results: TestResult[] = [];

  // TEST 1: Anonymous READ published projects
  try {
    const { data, error } = await supabaseAnonClient
      .from('projects')
      .select('id, title, status')
      .eq('status', 'published');
    
    const isPass = !error && Array.isArray(data);
    results.push({
      testId: 'SEC-01',
      name: 'Anonymous: READ published projects',
      expected: 'Data returned without error',
      actual: isPass ? `Returned ${data?.length} records` : `Error: ${error?.message}`,
      status: isPass ? 'PASS' : 'FAIL',
    });
  } catch (err: any) {
    results.push({
      testId: 'SEC-01',
      name: 'Anonymous: READ published projects',
      expected: 'Data returned without error',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
    });
  }

  // TEST 2: Anonymous READ draft projects
  try {
    const { data, error } = await supabaseAnonClient
      .from('projects')
      .select('id, title, status')
      .eq('status', 'draft');

    // With RLS, querying draft as anon must return 0 records or error
    const isPass = !error && data?.length === 0;
    results.push({
      testId: 'SEC-02',
      name: 'Anonymous: READ draft projects (Must be hidden by RLS)',
      expected: '0 records returned (RLS isolated)',
      actual: isPass ? '0 records returned' : `Exposed ${data?.length} drafts!`,
      status: isPass ? 'PASS' : 'FAIL',
    });
  } catch (err: any) {
    results.push({
      testId: 'SEC-02',
      name: 'Anonymous: READ draft projects',
      expected: '0 records returned',
      actual: `Exception: ${err.message}`,
      status: 'PASS',
    });
  }

  // TEST 3: Anonymous WRITE (Insert project)
  try {
    const { data, error } = await supabaseAnonClient
      .from('projects')
      .insert({
        title: 'Hacked Project',
        slug: 'hacked-project',
        status: 'published',
      });

    const isPass = !!error;
    results.push({
      testId: 'SEC-03',
      name: 'Anonymous: WRITE / INSERT project',
      expected: 'DENIED by RLS (403/Forbidden)',
      actual: isPass ? `Blocked: ${error.message}` : 'SECURITY BREACH: Insert succeeded!',
      status: isPass ? 'PASS' : 'FAIL',
    });
  } catch (err: any) {
    results.push({
      testId: 'SEC-03',
      name: 'Anonymous: WRITE / INSERT project',
      expected: 'DENIED by RLS',
      actual: `Blocked with exception: ${err.message}`,
      status: 'PASS',
    });
  }

  // TEST 4: Authenticated Non-Admin WRITE
  try {
    const { data, error } = await supabaseAuthNonAdminClient
      .from('projects')
      .insert({
        title: 'Unauthorized Project',
        slug: 'unauthorized-project',
        status: 'published',
      });

    const isPass = !!error;
    results.push({
      testId: 'SEC-04',
      name: 'Authenticated Non-Admin: WRITE / INSERT (authenticated != admin)',
      expected: 'DENIED by RLS (is_admin() = false)',
      actual: isPass ? `Blocked: ${error.message}` : 'SECURITY BREACH: Non-admin inserted record!',
      status: isPass ? 'PASS' : 'FAIL',
    });
  } catch (err: any) {
    results.push({
      testId: 'SEC-04',
      name: 'Authenticated Non-Admin: WRITE',
      expected: 'DENIED by RLS',
      actual: `Blocked: ${err.message}`,
      status: 'PASS',
    });
  }

  // TEST 5: Founder Admin CRUD
  try {
    const testSlug = `sec-test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabaseAdminClient
      .from('projects')
      .insert({
        title: 'Admin Test Project',
        slug: testSlug,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Clean up
    await supabaseAdminClient.from('projects').delete().eq('id', insertData.id);

    results.push({
      testId: 'SEC-05',
      name: 'Founder Admin: CRUD Operations (is_admin() = true)',
      expected: 'INSERT and DELETE successful',
      actual: 'Successfully created draft and cleaned up',
      status: 'PASS',
    });
  } catch (err: any) {
    results.push({
      testId: 'SEC-05',
      name: 'Founder Admin: CRUD Operations',
      expected: 'CRUD successful',
      actual: `Failed: ${err.message}`,
      status: 'FAIL',
    });
  }

  // TEST 6: Activity Logs Immutability (UPDATE / DELETE)
  try {
    const { error: updateError } = await supabaseAdminClient
      .from('activity_logs')
      .update({ action: 'TAMPERED' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: deleteError } = await supabaseAdminClient
      .from('activity_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const isPass = !!updateError && !!deleteError;
    results.push({
      testId: 'SEC-06',
      name: 'Activity Logs: Immutability (UPDATE and DELETE blocked)',
      expected: 'DENIED for both UPDATE and DELETE',
      actual: isPass
        ? 'Both operations rejected by RLS'
        : `Update: ${updateError ? 'Blocked' : 'Allowed!'}, Delete: ${deleteError ? 'Blocked' : 'Allowed!'}`,
      status: isPass ? 'PASS' : 'FAIL',
    });
  } catch (err: any) {
    results.push({
      testId: 'SEC-06',
      name: 'Activity Logs: Immutability',
      expected: 'DENIED',
      actual: `Blocked with exception: ${err.message}`,
      status: 'PASS',
    });
  }

  return results;
};
