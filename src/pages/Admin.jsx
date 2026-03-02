import { useState, useEffect } from "react";
import { functionsUrl, getToken, anonKey } from "../lib/supabaseClient";
import "./Admin.css";

const TABS = [
  { id: "candidate", label: "Candidate Access Requests" },
  { id: "professor", label: "Professor Access Requests" },
  { id: "employer", label: "Employer Access Requests" },
];

export default function Admin() {
  const [tab, setTab] = useState("candidate");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${functionsUrl}/list-access-requests?type=${tab}`, {
      headers: {
        ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
        "X-User-Token": token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setList(data);
        else setList([]);
        if (data?.error) setError(data.error);
        else if (data?.message) setError(data.message);
      })
      .catch(() => setError("Failed to load requests"))
      .finally(() => setLoading(false));
  }, [tab]);

  async function approve(id) {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    setError("");
    try {
      const res = await fetch(`${functionsUrl}/approve-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
          "X-User-Token": token,
        },
        body: JSON.stringify({ type: tab, requestId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Approve failed");
        return;
      }
      setList((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Request failed");
    } finally {
      setActionId(null);
    }
  }

  async function reject(id) {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    setError("");
    try {
      const res = await fetch(`${functionsUrl}/reject-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
          "X-User-Token": token,
        },
        body: JSON.stringify({ type: tab, requestId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Reject failed");
        return;
      }
      setList((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Request failed");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin</h1>
      <p className="page-subtitle">Talent Vault — Manage access requests</p>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`admin-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : list.length === 0 ? (
        <p className="admin-empty">No pending requests.</p>
      ) : (
        <ul className="admin-list">
          {list.map((r) => (
            <li key={r.id} className="admin-card">
              <div className="admin-card-body">
                <p><strong>{r.first_name} {r.last_name}</strong> — {r.email}</p>
                {r.phone && <p>Phone: {r.phone}</p>}
                {tab === "candidate" && r.academic_institution && <p>Institution: {r.academic_institution}</p>}
                {tab === "professor" && (
                  <>
                    {r.academic_institution && <p>Institution: {r.academic_institution}</p>}
                    {r.specialty && <p>Specialty: {r.specialty}</p>}
                  </>
                )}
                {tab === "employer" && (
                  <>
                    {r.organization && <p>Organization: {r.organization}</p>}
                    {r.job_title && <p>Job title: {r.job_title}</p>}
                  </>
                )}
              </div>
              <div className="admin-card-actions">
                <button type="button" className="btn" disabled={actionId === r.id} onClick={() => approve(r.id)}>
                  {actionId === r.id ? "…" : "Approve"}
                </button>
                <button type="button" className="btn btn-secondary" disabled={actionId === r.id} onClick={() => reject(r.id)}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
