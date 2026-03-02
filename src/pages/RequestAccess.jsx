import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./RequestAccess.css";

export default function RequestAccess() {
  const [roleOption, setRoleOption] = useState("candidate");
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    academic_institution: "",
    specialty: "",
    organization: "",
    job_title: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("roles").select("id, name").in("name", ["candidate", "professor", "employer"]).then(({ data }) => setRoles(data || []));
  }, []);

  const roleId = roles.find((r) => r.name === roleOption)?.id;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!roleId) {
      setError("Please select a role.");
      return;
    }
    const required = { first_name: form.first_name?.trim(), last_name: form.last_name?.trim(), email: form.email?.trim() };
    if (!required.first_name || !required.last_name || !required.email) {
      setError("First name, last name, and email are required.");
      return;
    }
    if (roleOption === "candidate" && !form.academic_institution?.trim()) {
      setError("Academic institution is required for candidates.");
      return;
    }
    if (roleOption === "professor") {
      if (!form.academic_institution?.trim()) { setError("Academic institution is required."); return; }
      if (!form.specialty?.trim()) { setError("Specialty is required for professors."); return; }
    }
    if (roleOption === "employer") {
      if (!form.organization?.trim()) { setError("Organization is required."); return; }
      if (!form.job_title?.trim()) { setError("Job title is required for employers."); return; }
    }

    setLoading(true);
    let resume_url = null;
    if (roleOption === "candidate" && resumeFile && supabase) {
      const name = `${Date.now()}-${resumeFile.name}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(name, resumeFile, { upsert: false });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("resumes").getPublicUrl(name);
        resume_url = pub?.publicUrl ?? null;
      }
    }

    const table =
      roleOption === "candidate"
        ? "candidate_access_requests"
        : roleOption === "professor"
        ? "professor_access_requests"
        : "employer_access_requests";
    const payload = {
      role_id: roleId,
      first_name: required.first_name,
      last_name: required.last_name,
      email: required.email.toLowerCase(),
      phone: form.phone?.trim() || null,
      pending: true,
      approved: false,
      rejected: false,
    };
    if (roleOption === "candidate") {
      payload.academic_institution = form.academic_institution?.trim() || "";
      payload.resume_url = resume_url;
    } else if (roleOption === "professor") {
      payload.academic_institution = form.academic_institution?.trim() || "";
      payload.specialty = form.specialty?.trim() || "";
    } else {
      payload.organization = form.organization?.trim() || "";
      payload.job_title = form.job_title?.trim() || "";
    }

    const { error: insertErr } = await supabase.from(table).insert(payload);
    setLoading(false);
    if (insertErr) {
      if (insertErr.code === "23505") setError("You already have a pending request for this role and email.");
      else setError(insertErr.message || "Request failed.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="request-access-page">
        <div className="request-access-card">
          <h1 className="page-title">Request received</h1>
          <p className="page-subtitle">We will review your access request. You will receive an email when it is approved.</p>
          <Link to="/login" className="btn">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="request-access-page">
      <div className="request-access-card">
        <h1 className="page-title">Request Access</h1>
        <p className="page-subtitle">Talent Vault</p>
        {error && <p className="request-access-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>I am requesting access as</label>
          <select value={roleOption} onChange={(e) => setRoleOption(e.target.value)} required>
            <option value="candidate">Candidate</option>
            <option value="professor">Professor</option>
            <option value="employer">Employer</option>
          </select>

          <label>First name *</label>
          <input type="text" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />

          <label>Last name *</label>
          <input type="text" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required />

          <label>Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />

          <label>Phone</label>
          <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />

          {roleOption === "candidate" && (
            <>
              <label>Resume</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
              <label>Academic institution *</label>
              <input type="text" value={form.academic_institution} onChange={(e) => setForm((f) => ({ ...f, academic_institution: e.target.value }))} required />
            </>
          )}
          {roleOption === "professor" && (
            <>
              <label>Academic institution *</label>
              <input type="text" value={form.academic_institution} onChange={(e) => setForm((f) => ({ ...f, academic_institution: e.target.value }))} required />
              <label>Specialty *</label>
              <input type="text" value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} required />
            </>
          )}
          {roleOption === "employer" && (
            <>
              <label>Organization *</label>
              <input type="text" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} required />
              <label>Job title *</label>
              <input type="text" value={form.job_title} onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))} required />
            </>
          )}

          <button type="submit" className="btn request-access-btn" disabled={loading}>
            {loading ? "Submitting…" : "Submit request"}
          </button>
        </form>
        <p className="request-access-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
