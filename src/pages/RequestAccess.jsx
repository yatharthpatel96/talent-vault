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
    terms_accepted: false,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_VIDEO_BYTES = 30 * 1024 * 1024; // 30 MB for ~90 sec moderate quality
  const MIN_VIDEO_SEC = 30;
  const MAX_VIDEO_SEC = 90;

  function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read video"));
      };
      video.src = url;
    });
  }

  async function handleVideoChange(e) {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    setError("");
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      setError("Video must be under 30 MB and 30–90 seconds.");
      setVideoFile(null);
      e.target.value = "";
      return;
    }
    try {
      const duration = await getVideoDuration(file);
      if (duration < MIN_VIDEO_SEC || duration > MAX_VIDEO_SEC) {
        setError("Video must be between 30 and 90 seconds.");
        setVideoFile(null);
        e.target.value = "";
      }
    } catch {
      setError("Could not read video. Use MP4 or WebM.");
      setVideoFile(null);
      e.target.value = "";
    }
  }

  useEffect(() => {
    if (!supabase) return;
    // Load roles from the database. We normalize to lowercase in code so this
    // works even if names are stored as "Candidate", "candidate", etc.
    supabase
      .from("roles")
      .select("id, name")
      .then(({ data }) => setRoles(data || []));
  }, []);

  const roleId = roles.find((r) => r.name?.toLowerCase() === roleOption.toLowerCase())?.id;

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
    if (roleOption === "candidate" && !form.terms_accepted) {
      setError("You must accept the terms and conditions.");
      return;
    }
    if (roleOption === "candidate" && !videoFile) {
      setError("Intro video is required for candidates.");
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

    if (roleOption === "candidate" && videoFile && videoFile.size > MAX_VIDEO_BYTES) {
      setError("Video must be under 30 MB and 30–90 seconds.");
      return;
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
    let video_url = null;
    if (roleOption === "candidate" && videoFile && supabase) {
      const name = `${Date.now()}-${videoFile.name}`;
      const { error: upErr } = await supabase.storage.from("candidate-videos").upload(name, videoFile, { upsert: false });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("candidate-videos").getPublicUrl(name);
        video_url = pub?.publicUrl ?? null;
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
      payload.resume_url = resume_url;
      payload.video_url = video_url;
      payload.terms_accepted = !!form.terms_accepted;
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
              <input id="candidate-resume" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
              <label htmlFor="candidate-video">Intro video *</label>
              <p className="request-access-hint">Required. 30–90 seconds, moderate quality, max 30 MB. MP4 or WebM.</p>
              <input id="candidate-video" type="file" accept="video/mp4,video/webm" onChange={handleVideoChange} required aria-required="true" />
              <div className="request-access-checkbox-wrap">
                <input
                  id="candidate-terms"
                  type="checkbox"
                  checked={form.terms_accepted}
                  onChange={(e) => setForm((f) => ({ ...f, terms_accepted: e.target.checked }))}
                  aria-required="true"
                />
                <label htmlFor="candidate-terms">I accept the terms and conditions *</label>
              </div>
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
