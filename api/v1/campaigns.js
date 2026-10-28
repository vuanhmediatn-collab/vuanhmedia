const EDGE_URL = "https://kgpwfohbwcrtbkwowxmv.supabase.co/functions/v1/vamops-command-center/campaigns";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query || {})) {
      if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
      else if (value !== undefined) query.set(key, String(value));
    }
    const target = query.size ? `${EDGE_URL}?${query}` : EDGE_URL;
    const headers = { "content-type": "application/json", "accept": "application/json" };
    if (req.headers.authorization) headers.authorization = req.headers.authorization;
    if (req.headers["idempotency-key"]) headers["idempotency-key"] = req.headers["idempotency-key"];
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body || {})
    });
    const contentType = upstream.headers.get("content-type") || "application/json; charset=utf-8";
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", contentType);
    return res.send(body);
  } catch (_) {
    return res.status(502).json({
      success: false,
      error: "WORKFLOW_GATEWAY_UNAVAILABLE",
      message: "Không thể kết nối bộ máy workflow bền vững."
    });
  }
}
