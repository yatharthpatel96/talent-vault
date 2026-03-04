import { useState, useEffect, useRef, useCallback } from "react";
import { functionsUrl, getToken, anonKey } from "../lib/supabaseClient";
import "./Admin.css";

const TYPES = ["candidate", "professor", "employer"];
const TABS = { overview: "Overview", requests: "Access requests" };

function fetchRequests(token, type) {
  return fetch(`${functionsUrl}/list-access-requests?type=${type}`, {
    headers: {
      ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
      "X-User-Token": token,
    },
  })
    .then((res) => res.json())
    .then((data) => (Array.isArray(data) ? data : []));
}

function fetchDashboardStats(token) {
  return fetch(`${functionsUrl}/admin-dashboard-stats`, {
    headers: {
      ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
      "X-User-Token": token,
    },
  })
    .then((res) => res.json())
    .then((data) => (data.error ? Promise.reject(new Error(data.error)) : data));
}

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const modalRef = useRef(null);
  const filterSelectRef = useRef(null);

  const refreshStats = useCallback(() => setStatsRefresh((n) => n + 1), []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setStatsLoading(true);
    setError("");
    fetchDashboardStats(token)
      .then(setStats)
      .catch(() => setError("Failed to load dashboard stats"))
      .finally(() => setStatsLoading(false));
  }, [statsRefresh]);

  useEffect(() => {
    const token = getToken();
    if (!token || tab !== "requests") return;
    setLoading(true);
    setError("");
    if (filter === "all") {
      Promise.all(TYPES.map((type) => fetchRequests(token, type)))
        .then(([candidates, professors, employers]) => {
          const merged = [
            ...candidates.map((r) => ({ ...r, requestType: "candidate" })),
            ...professors.map((r) => ({ ...r, requestType: "professor" })),
            ...employers.map((r) => ({ ...r, requestType: "employer" })),
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setList(merged);
        })
        .catch(() => setError("Failed to load requests"))
        .finally(() => setLoading(false));
    } else {
      fetchRequests(token, filter)
        .then((data) => setList(data.map((r) => ({ ...r, requestType: filter }))))
        .catch(() => setError("Failed to load requests"))
        .finally(() => setLoading(false));
    }
  }, [tab, filter]);

  const closeModal = useCallback(() => {
    setSelectedRequest(null);
    filterSelectRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!selectedRequest) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedRequest, closeModal]);

  useEffect(() => {
    if (selectedRequest && modalRef.current) {
      const firstBtn = modalRef.current.querySelector(".admin-modal-actions button");
      firstBtn?.focus();
    }
  }, [selectedRequest]);

  async function approve(id, type) {
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
        body: JSON.stringify({ type, requestId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Approve failed");
        return;
      }
      setList((prev) => prev.filter((r) => r.id !== id));
      closeModal();
      refreshStats();
    } catch {
      setError("Request failed");
    } finally {
      setActionId(null);
    }
  }

  async function reject(id, type) {
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
        body: JSON.stringify({ type, requestId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Reject failed");
        return;
      }
      setList((prev) => prev.filter((r) => r.id !== id));
      closeModal();
      refreshStats();
    } catch {
      setError("Request failed");
    } finally {
      setActionId(null);
    }
  }

  const typeLabel = (t) => (t === "candidate" ? "Candidate" : t === "professor" ? "Professor" : "Employer");

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin</h1>
      <p className="page-subtitle">Talent Vault — Manage access requests</p>

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-controls={`admin-panel-${key}`}
            id={`admin-tab-${key}`}
            className={`admin-tab ${tab === key ? "admin-tab--active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div id="admin-panel-overview" role="tabpanel" aria-labelledby="admin-tab-overview" className="admin-overview">
          {statsLoading ? (
            <p className="admin-loading">Loading dashboard…</p>
          ) : stats ? (
            <>
              <h2 className="admin-overview-title">Candidate requests</h2>
              <div className="admin-stats-grid admin-stats-grid--single">
                <div className="admin-stat-card admin-stat-card--candidate admin-stat-card--summary">
                  <span className="admin-stat-value">{stats.totalCandidateRequests}</span>
                  <span className="admin-stat-label">Total requests</span>
                  <span className="admin-stat-value admin-stat-value--small">{stats.approvedCandidateRequests}</span>
                  <span className="admin-stat-label">Approved</span>
                </div>
              </div>
              <h2 className="admin-overview-title">Current users</h2>
              <div className="admin-stats-grid">
                <div className="admin-stat-card admin-stat-card--candidate">
                  <span className="admin-stat-value">{stats.candidates}</span>
                  <span className="admin-stat-label">Candidates</span>
                </div>
                <div className="admin-stat-card admin-stat-card--professor">
                  <span className="admin-stat-value">{stats.professors}</span>
                  <span className="admin-stat-label">Professors</span>
                </div>
                <div className="admin-stat-card admin-stat-card--employer">
                  <span className="admin-stat-value">{stats.employers}</span>
                  <span className="admin-stat-label">Employers</span>
                </div>
              </div>
              <h2 className="admin-overview-title">Pending requests</h2>
              <div className="admin-stats-grid admin-stats-grid--pending">
                <div className="admin-stat-card admin-stat-card--candidate">
                  <span className="admin-stat-value">{stats.pendingCandidates}</span>
                  <span className="admin-stat-label">Candidates</span>
                </div>
                <div className="admin-stat-card admin-stat-card--professor">
                  <span className="admin-stat-value">{stats.pendingProfessors}</span>
                  <span className="admin-stat-label">Professors</span>
                </div>
                <div className="admin-stat-card admin-stat-card--employer">
                  <span className="admin-stat-value">{stats.pendingEmployers}</span>
                  <span className="admin-stat-label">Employers</span>
                </div>
              </div>
            </>
          ) : (
            <p className="admin-empty">Could not load dashboard.</p>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div id="admin-panel-requests" role="tabpanel" aria-labelledby="admin-tab-requests" className="admin-requests-panel">
      <div className="admin-filter-wrap">
        <label htmlFor="admin-filter" className="admin-filter-label">View</label>
        <select
          id="admin-filter"
          ref={filterSelectRef}
          className="admin-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter access requests by type"
        >
          <option value="all">All</option>
          <option value="candidate">Candidate</option>
          <option value="professor">Professor</option>
          <option value="employer">Employer</option>
        </select>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : list.length === 0 ? (
        <p className="admin-empty">No pending requests.</p>
      ) : (
        <ul className="admin-list">
          {list.map((r) => (
            <li key={`${r.requestType}-${r.id}`} className="admin-row">
              <div className="admin-row-info">
                <span className="admin-row-name">{r.first_name} {r.last_name}</span>
                <span className={`admin-badge admin-badge--${r.requestType}`}>{typeLabel(r.requestType)}</span>
              </div>
              <button
                type="button"
                className="btn admin-review-btn"
                onClick={() => setSelectedRequest(r)}
                aria-label={`Review request for ${r.first_name} ${r.last_name}`}
              >
                Review request
              </button>
            </li>
          ))}
        </ul>
      )}
        </div>
      )}

      {selectedRequest && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          ref={modalRef}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="admin-modal">
            <h2 id="admin-modal-title" className="admin-modal-title">
              Request details — {selectedRequest.first_name} {selectedRequest.last_name}
            </h2>
            <div className="admin-modal-body">
              <p><strong>First name:</strong> {selectedRequest.first_name}</p>
              <p><strong>Last name:</strong> {selectedRequest.last_name}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              {selectedRequest.phone && <p><strong>Phone:</strong> {selectedRequest.phone}</p>}
              {selectedRequest.requestType === "candidate" && (
                <>
                  {selectedRequest.resume_url && (
                    <p><strong>Resume:</strong> <a href={selectedRequest.resume_url} target="_blank" rel="noopener noreferrer">Open resume</a></p>
                  )}
                  {selectedRequest.video_url && (
                    <p><strong>Intro video:</strong> <a href={selectedRequest.video_url} target="_blank" rel="noopener noreferrer">Watch video</a></p>
                  )}
                  <p><strong>Terms accepted:</strong> {selectedRequest.terms_accepted ? "Yes" : "No"}</p>
                </>
              )}
              {selectedRequest.requestType === "professor" && (
                <>
                  {selectedRequest.academic_institution && <p><strong>Institution:</strong> {selectedRequest.academic_institution}</p>}
                  {selectedRequest.specialty && <p><strong>Specialty:</strong> {selectedRequest.specialty}</p>}
                </>
              )}
              {selectedRequest.requestType === "employer" && (
                <>
                  {selectedRequest.organization && <p><strong>Organization:</strong> {selectedRequest.organization}</p>}
                  {selectedRequest.job_title && <p><strong>Job title:</strong> {selectedRequest.job_title}</p>}
                </>
              )}
            </div>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn"
                disabled={actionId === selectedRequest.id}
                onClick={() => approve(selectedRequest.id, selectedRequest.requestType)}
              >
                {actionId === selectedRequest.id ? "…" : "Approve"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={actionId === selectedRequest.id}
                onClick={() => reject(selectedRequest.id, selectedRequest.requestType)}
              >
                Reject
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
