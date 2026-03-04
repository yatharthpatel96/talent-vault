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
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const [
      { count: candidates },
      { count: professors },
      { count: employers },
      { count: totalCandidateRequests },
      { count: approvedCandidateRequests },
      { count: pendingCandidates },
      { count: pendingProfessors },
      { count: pendingEmployers },
    ] = await Promise.all([
      supabase.from("candidate_profiles").select("*", { count: "exact", head: true }),
      supabase.from("professor_profiles").select("*", { count: "exact", head: true }),
      supabase.from("employer_profiles").select("*", { count: "exact", head: true }),
      supabase.from("candidate_access_requests").select("*", { count: "exact", head: true }),
      supabase.from("candidate_access_requests").select("*", { count: "exact", head: true }).eq("approved", true),
      supabase.from("candidate_access_requests").select("*", { count: "exact", head: true }).eq("pending", true),
      supabase.from("professor_access_requests").select("*", { count: "exact", head: true }).eq("pending", true),
      supabase.from("employer_access_requests").select("*", { count: "exact", head: true }).eq("pending", true),
    ]);

    const pendingTotal = (pendingCandidates ?? 0) + (pendingProfessors ?? 0) + (pendingEmployers ?? 0);

    return new Response(
      JSON.stringify({
        candidates: candidates ?? 0,
        professors: professors ?? 0,
        employers: employers ?? 0,
        totalCandidateRequests: totalCandidateRequests ?? 0,
        approvedCandidateRequests: approvedCandidateRequests ?? 0,
        pendingCandidates: pendingCandidates ?? 0,
        pendingProfessors: pendingProfessors ?? 0,
        pendingEmployers: pendingEmployers ?? 0,
        pendingTotal,
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
