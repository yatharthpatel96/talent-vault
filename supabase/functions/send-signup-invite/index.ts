// import "jsr:@supabase/functions-js/edge_runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, role, approved_request_id } = (await req.json()) as {
      email?: string;
      role?: string;
      approved_request_id?: string;
    };

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validRoles = ["candidate", "professor", "employer"];
    const roleVal = role && validRoles.includes(role) ? role : "candidate";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const token = crypto.randomUUID();
    const { error: insertError } = await supabase.from("signup_invites").insert({
      token,
      email: email.trim(),
      role: roleVal,
      approved_request_id: approved_request_id || null,
    });

    if (insertError) {
      console.error(insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const inviteLink = `${siteUrl.replace(/\/$/, "")}/auth/create-account?invite=${token}`;

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
          to: [email.trim()],
          subject: "Create your Talent Vault account",
          html: `
            <p>You've been approved to create an account.</p>
            <p><a href="${inviteLink}">Create your account</a></p>
            <p>This link can only be used once.</p>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        return new Response(
          JSON.stringify({ error: "Failed to send invite email", details: err }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("RESEND_API_KEY not set; invite created. Link:", inviteLink);
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Invite created" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
