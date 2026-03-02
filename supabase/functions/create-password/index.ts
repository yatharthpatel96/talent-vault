import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { token, new_password } = (await req.json()) as { token?: string; new_password?: string };
    if (!token || !new_password || new_password.length < 8) {
      return new Response(JSON.stringify({ error: "Token and password (min 8 characters) required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row, error: tokErr } = await supabase.from("password_setup_tokens").select("id, email, role_id, expires_at, used").eq("token", token).single();
    if (tokErr || !row) {
      return new Response(JSON.stringify({ error: "Invalid or expired link" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if ((row as { used: boolean }).used) {
      return new Response(JSON.stringify({ error: "This link has already been used" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const expiresAt = new Date((row as { expires_at: string }).expires_at).getTime();
    if (Date.now() > expiresAt) {
      return new Response(JSON.stringify({ error: "This link has expired" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const hash = await bcrypt.hash(new_password, 10);
    const { error: insertErr } = await supabase.from("logins").insert({
      email: (row as { email: string }).email,
      password_hash: hash,
      role_id: (row as { role_id: string }).role_id,
    });
    if (insertErr) {
      if (insertErr.code === "23505") return new Response(JSON.stringify({ error: "An account with this email already exists" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
      throw insertErr;
    }
    await supabase.from("password_setup_tokens").update({ used: true }).eq("id", (row as { id: string }).id);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
