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
    const profileTable = type === "candidate" ? "candidate_profiles" : type === "professor" ? "professor_profiles" : "employer_profiles";
    const { data: reqRow, error: fetchErr } = await supabase.from(accessTable).select("*").eq("id", requestId).eq("pending", true).single();
    if (fetchErr || !reqRow) {
      return new Response(JSON.stringify({ error: "Request not found or already processed" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const r = reqRow as Record<string, unknown>;
    await supabase.from(accessTable).update({ approved: true, pending: false, rejected: false }).eq("id", requestId);
    const profilePayload: Record<string, unknown> = {
      role_id: r.role_id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      phone: r.phone || null,
    };
    if (type === "candidate") {
      profilePayload.academic_institution = r.academic_institution;
      profilePayload.resume_url = r.resume_url || null;
    } else if (type === "professor") {
      profilePayload.academic_institution = r.academic_institution;
      profilePayload.specialty = r.specialty;
    } else {
      profilePayload.organization = r.organization;
      profilePayload.job_title = r.job_title;
    }
    await supabase.from(profileTable).insert(profilePayload);
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);
    await supabase.from("password_setup_tokens").insert({
      email: (r.email as string).trim().toLowerCase(),
      role_id: r.role_id,
      token,
      expires_at: expiresAt.toISOString(),
    });
    const siteUrl = (Deno.env.get("SITE_URL") || "http://localhost:5173").replace(/\/$/, "");
    const link = `${siteUrl}/set-password?token=${token}`;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
          to: [r.email],
          subject: "Set your Talent Vault password",
          html: `<p>Your access was approved. <a href="${link}">Set your password here</a>. Link expires in 2 days.</p>`,
        }),
      });
    }
    return new Response(JSON.stringify({ ok: true, link: resendKey ? undefined : link }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
