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
    const email = payload.email as string;
    const role = payload.role as string;
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let profile = null;
    if (role === "candidate") {
      const { data } = await supabase.from("candidate_profiles").select("*").eq("email", email).single();
      profile = data;
    } else if (role === "professor") {
      const { data } = await supabase.from("professor_profiles").select("*").eq("email", email).single();
      profile = data;
    } else if (role === "employer") {
      const { data } = await supabase.from("employer_profiles").select("*").eq("email", email).single();
      profile = data;
    }
    return new Response(JSON.stringify(profile || {}), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
