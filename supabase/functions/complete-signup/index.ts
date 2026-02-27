import "jsr:@supabase/functions-js/edge_runtime.d.ts";
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { invite_token } = (await req.json()) as { invite_token?: string };
    if (!invite_token) {
      return new Response(
        JSON.stringify({ error: "invite_token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: invite, error: inviteErr } = await supabase
      .from("signup_invites")
      .select("email, role, approved_request_id")
      .eq("token", invite_token)
      .is("used_at", null)
      .single();

    if (inviteErr || !invite) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invite.email?.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Email does not match invite" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const role = invite.role as string;
    const approvedRequestId = invite.approved_request_id as string | null;

    if (role === "candidate") {
      await supabase.from("candidates").insert({ user_id: user.id, email: user.email });
      if (approvedRequestId) {
        const { data: approved } = await supabase
          .from("candidate_approved_requests")
          .select("*")
          .eq("id", approvedRequestId)
          .single();
        if (approved) {
          await supabase.from("candidate_profiles").insert({
            user_id: user.id,
            first_name: approved.first_name,
            last_name: approved.last_name,
            email: approved.email,
            phone: approved.phone,
            message: approved.message,
            usa_citizen: approved.usa_citizen,
            university: approved.university,
            courses: approved.courses ?? [],
            resume_url: approved.resume_url,
            terms_accepted: approved.terms_accepted,
          });
        }
      }
    } else if (role === "employer") {
      await supabase.from("employers").insert({ user_id: user.id, email: user.email });
      if (approvedRequestId) {
        const { data: approved } = await supabase
          .from("employer_approved_requests")
          .select("*")
          .eq("id", approvedRequestId)
          .single();
        if (approved) {
          await supabase.from("employer_profiles").insert({
            user_id: user.id,
            first_name: approved.first_name,
            last_name: approved.last_name,
            email: approved.email,
            phone: approved.phone,
            company: approved.company,
            terms_accepted: approved.terms_accepted,
          });
        }
      }
    } else if (role === "professor") {
      await supabase.from("professors").insert({ user_id: user.id, email: user.email });
      if (approvedRequestId) {
        const { data: approved } = await supabase
          .from("professor_approved_requests")
          .select("*")
          .eq("id", approvedRequestId)
          .single();
        if (approved) {
          await supabase.from("professor_profiles").insert({
            user_id: user.id,
            first_name: approved.first_name,
            last_name: approved.last_name,
            email: approved.email,
            phone: approved.phone,
            university: approved.university,
            terms_accepted: approved.terms_accepted,
          });
        }
      }
    }

    await supabase
      .from("signup_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("token", invite_token);

    return new Response(
      JSON.stringify({ ok: true }),
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
