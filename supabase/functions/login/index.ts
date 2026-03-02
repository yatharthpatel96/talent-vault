import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SignJWT } from "npm:jose@4";
import bcrypt from "npm:bcryptjs@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: loginRow, error: loginErr } = await supabase.from("logins").select("id, password_hash, role_id, roles(name)").eq("email", email.trim().toLowerCase()).single();
    if (loginErr || !loginRow) {
      if (loginErr) console.error("login db error:", loginErr.message, loginErr.code);
      return new Response(JSON.stringify({ error: "No account found for this email." }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const row = loginRow as { roles?: { name: string }; role?: { name: string } };
    const roleName = row.roles?.name ?? row.role?.name;
    if (!roleName) {
      return new Response(JSON.stringify({ error: "Invalid role" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const ok = await bcrypt.compare(password, (loginRow as { password_hash: string }).password_hash);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Invalid password." }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET") || "talent-vault-secret-change-in-production");
    const token = await new SignJWT({ email: email.trim().toLowerCase(), role: roleName }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
    return new Response(JSON.stringify({ token, role: roleName }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
