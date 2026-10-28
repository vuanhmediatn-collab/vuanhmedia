const SUPABASE_URL = "https://kgpwfohbwcrtbkwowxmv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_kWtBjuOgqKIhHo2-CacVjw_AjPZ_ouN";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/vamops-command-center/campaigns`;

async function probe(url, options = {}) {
  const controller = new AbortController();
  // Supabase Edge Functions can cold-start after a quiet period. Keep this
  // above the observed cold-start window so the UI does not report a false
  // gateway outage while still bounding the serverless request.
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") return res.status(405).json({ status: "error", error: "METHOD_NOT_ALLOWED" });

  const blockers = [];
  let databaseAndAuth = false;
  let workflowGateway = false;
  try {
    const auth = await probe(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } });
    databaseAndAuth = auth.ok;
  } catch (_) {
    databaseAndAuth = false;
  }
  try {
    const edge = await probe(EDGE_URL, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }
    });
    workflowGateway = edge.status === 401 || edge.status === 403;
  } catch (_) {
    workflowGateway = false;
  }
  if (!databaseAndAuth) blockers.push("SUPABASE_AUTH_OR_DATABASE_UNAVAILABLE");
  if (!workflowGateway) blockers.push("WORKFLOW_GATEWAY_UNAVAILABLE");

  return res.status(blockers.length ? 503 : 200).json({
    status: "ok",
    service: "VAMOPS Zero-Credit Workflow Gateway",
    version: "4.0",
    ready: blockers.length === 0,
    checks: {
      api: true,
      persistentDatabaseConfigured: databaseAndAuth,
      identityConfigured: databaseAndAuth,
      workflowGateway
    },
    configuredModels: ["vamops-zero-credit-v1"],
    engineKind: "deterministic_zero_credit",
    blockers
  });
}
