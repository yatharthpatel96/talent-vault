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
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "candidate";
    const table = type === "candidate" ? "candidate_access_requests" : type === "professor" ? "professor_access_requests" : "employer_access_requests";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.from(table).select("*").eq("pending", true).order("created_at", { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data || []), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
