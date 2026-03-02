import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { jwtVerify } from "npm:jose@4";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, x-user-token" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const jwt = req.headers.get("X-User-Token") || req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET") || "talent-vault-secret-change-in-production");
    const { payload } = await jwtVerify(jwt, secret);
    if (payload.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const { type, requestId } = (await req.json()) as { type?: string; requestId?: string };
    if (!type || !requestId || !["candidate", "professor", "employer"].includes(type)) {
      return new Response(JSON.stringify({ error: "type and requestId required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const accessTable = type === "candidate" ? "candidate_access_requests" : type === "professor" ? "professor_access_requests" : "employer_access_requests";
    const rejectedTable = type === "candidate" ? "rejected_candidate_requests" : type === "professor" ? "rejected_professor_requests" : "rejected_employer_requests";
    const { data: reqRow, error: fetchErr } = await supabase.from(accessTable).select("*").eq("id", requestId).eq("pending", true).single();
    if (fetchErr || !reqRow) {
      return new Response(JSON.stringify({ error: "Request not found or already processed" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const r = reqRow as Record<string, unknown>;
    const rejectPayload = { ...r, id: undefined, rejected: true, pending: false, approved: false, rejected_at: new Date().toISOString() };
    delete rejectPayload.id;
    await supabase.from(rejectedTable).insert(rejectPayload);
    await supabase.from(accessTable).update({ rejected: true, pending: false, approved: false }).eq("id", requestId);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
