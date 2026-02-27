import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import Toast from '../components/Toast';
import './AccessRequests.css';

const MESSAGE_TRUNCATE_LEN = 120;
const TABS = [
  { id: 'candidate', label: 'Candidate requests' },
  { id: 'professor', label: 'Professor requests' },
  { id: 'employer', label: 'Employer requests' },
];

const accessTable = (tab) => {
  if (tab === 'candidate') return 'candidate_access_requests';
  if (tab === 'professor') return 'professor_access_requests';
  return 'employer_access_requests';
};

const approvedTable = (tab) => {
  if (tab === 'candidate') return 'candidate_approved_requests';
  if (tab === 'professor') return 'professor_approved_requests';
  return 'employer_approved_requests';
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AccessRequests() {
  const [activeTab, setActiveTab] = useState('candidate');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!supabaseClient) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    const table = accessTable(activeTab);
    const { data, error: err } = await supabaseClient
      .from(table)
      .select('*')
      .eq('pending', true)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (err) {
      setError(err.message || 'Failed to load requests.');
      setRequests([]);
      return;
    }
    setRequests(data ?? []);
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered = search.trim()
    ? requests.filter((r) => {
        const s = search.toLowerCase();
        const name = `${(r.first_name || '').toLowerCase()} ${(r.last_name || '').toLowerCase()}`;
        const email = (r.email || '').toLowerCase();
        const university = (r.university || '').toLowerCase();
        const company = (r.company || '').toLowerCase();
        return name.includes(s) || email.includes(s) || university.includes(s) || company.includes(s);
      })
    : requests;

  const callSendInvite = async (email, role, approvedRequestId) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return false;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-signup-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          email,
          role,
          approved_request_id: approvedRequestId,
        }),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  };

  const handleApprove = async (row) => {
    if (!supabaseClient || actionId) return;
    setActionId(row.id);
    const previous = [...requests];
    setRequests((prev) => prev.filter((r) => r.id !== row.id));

    const tableAccess = accessTable(activeTab);
    const tableApproved = approvedTable(activeTab);

    let payload;
    if (activeTab === 'candidate') {
      payload = {
        original_request_id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        usa_citizen: row.usa_citizen,
        university: row.university,
        courses: row.courses ?? [],
        terms_accepted: row.terms_accepted ?? true,
        resume_url: row.resume_url ?? null,
      };
    } else if (activeTab === 'professor') {
      payload = {
        original_request_id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        university: row.university,
        terms_accepted: row.terms_accepted ?? true,
      };
    } else {
      payload = {
        original_request_id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        company: row.company,
        terms_accepted: row.terms_accepted ?? true,
      };
    }

    const { data: inserted, error: insertErr } = await supabaseClient
      .from(tableApproved)
      .insert(payload)
      .select('id')
      .single();

    if (insertErr) {
      setRequests(previous);
      setToast({ type: 'error', message: insertErr.message || 'Approve failed.' });
      setActionId(null);
      return;
    }

    const { error: deleteErr } = await supabaseClient
      .from(tableAccess)
      .delete()
      .eq('id', row.id);

    if (deleteErr) {
      setRequests(previous);
      setToast({ type: 'error', message: deleteErr.message || 'Approve succeeded but cleanup failed.' });
      setActionId(null);
      return;
    }

    const inviteSent = await callSendInvite(row.email, activeTab, inserted?.id);
    setToast({
      type: 'success',
      message: inviteSent
        ? 'Request approved and sign-up link sent to email.'
        : 'Request approved; invite could not be sent.',
    });
    setActionId(null);
  };

  const handleRemove = async (row) => {
    setRemoveConfirm(null);
    if (!supabaseClient || actionId) return;
    setActionId(row.id);
    const previous = [...requests];
    setRequests((prev) => prev.filter((r) => r.id !== row.id));

    const table = accessTable(activeTab);
    const { error: deleteErr } = await supabaseClient.from(table).delete().eq('id', row.id);

    if (deleteErr) {
      setRequests(previous);
      setToast({ type: 'error', message: deleteErr.message || 'Remove failed.' });
    } else {
      setToast({ type: 'success', message: 'Request removed.' });
    }
    setActionId(null);
  };

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderCardContent = (req) => {
    const base = (
      <>
        <h2 className="access-requests__card-name">
          {req.first_name} {req.last_name}
        </h2>
        <p className="access-requests__card-meta">
          <a href={`mailto:${req.email}`}>{req.email}</a>
          {req.phone && ` · ${req.phone}`}
        </p>
      </>
    );
    if (activeTab === 'candidate') {
      return (
        <>
          {base}
          {req.university && <p className="access-requests__card-meta">{req.university}</p>}
          {typeof req.usa_citizen === 'boolean' && (
            <div className="access-requests__card-badges">
              <span className={`access-requests__badge access-requests__badge--${req.usa_citizen ? 'yes' : 'no'}`}>
                USA Citizen: {req.usa_citizen ? 'Yes' : 'No'}
              </span>
            </div>
          )}
          {Array.isArray(req.courses) && req.courses.length > 0 && (
            <div className="access-requests__chips">
              {req.courses.map((c) => (
                <span key={c} className="access-requests__chip">{c}</span>
              ))}
            </div>
          )}
          {req.message && (
            <div className="access-requests__message">
              {req.message.length <= MESSAGE_TRUNCATE_LEN || expandedId === req.id ? (
                <>
                  {req.message}
                  {req.message.length > MESSAGE_TRUNCATE_LEN && (
                    <button type="button" className="access-requests__message-toggle" onClick={() => toggleExpanded(req.id)}>Show less</button>
                  )}
                </>
              ) : (
                <>
                  {req.message.slice(0, MESSAGE_TRUNCATE_LEN)}…
                  <button type="button" className="access-requests__message-toggle" onClick={() => toggleExpanded(req.id)}>Show more</button>
                </>
              )}
            </div>
          )}
          <p className="access-requests__card-meta access-requests__card-meta--muted">
            Terms accepted: {req.terms_accepted ? 'Yes' : 'No'}
          </p>
          {req.resume_url && (
            <p className="access-requests__card-meta">
              <a href={req.resume_url} target="_blank" rel="noopener noreferrer" className="access-requests__resume-link">View resume</a>
            </p>
          )}
        </>
      );
    }
    if (activeTab === 'professor') {
      return (
        <>
          {base}
          {req.university && <p className="access-requests__card-meta">{req.university}</p>}
          <p className="access-requests__card-meta access-requests__card-meta--muted">
            Terms accepted: {req.terms_accepted ? 'Yes' : 'No'}
          </p>
        </>
      );
    }
    return (
      <>
        {base}
        {req.company && <p className="access-requests__card-meta">{req.company}</p>}
        <p className="access-requests__card-meta access-requests__card-meta--muted">
          Terms accepted: {req.terms_accepted ? 'Yes' : 'No'}
        </p>
      </>
    );
  };

  return (
    <div className="access-requests page">
      <header className="access-requests__header">
        <h1 className="access-requests__title">Access Requests</h1>
        <p className="access-requests__subtitle">Pending ({requests.length})</p>
        <div className="access-requests__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`access-requests__tab ${activeTab === tab.id ? 'access-requests__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="access-requests__search-wrap">
          <input
            type="search"
            className="access-requests__search"
            placeholder="Search by name, email, university or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search requests"
          />
        </div>
      </header>

      {error && (
        <div className="access-requests__error" role="alert">{error}</div>
      )}

      {loading ? (
        <div className="access-requests__skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="access-requests__skeleton-card" aria-hidden="true">
              <div className="access-requests__skeleton-line" />
              <div className="access-requests__skeleton-line access-requests__skeleton-line--short" />
              <div className="access-requests__skeleton-line access-requests__skeleton-line--short" />
            </div>
          ))}
        </div>
      ) : (
        <div className="access-requests__grid">
          {filtered.length === 0 ? (
            <p className="access-requests__empty">
              {requests.length === 0 ? 'No pending requests.' : 'No requests match your search.'}
            </p>
          ) : (
            filtered.map((req) => (
              <article key={req.id} className="access-requests__card" data-id={req.id}>
                {renderCardContent(req)}
                <p className="access-requests__card-date">{formatDate(req.created_at)}</p>
                <div className="access-requests__card-actions">
                  <button
                    type="button"
                    className="access-requests__btn access-requests__btn--approve"
                    onClick={() => handleApprove(req)}
                    disabled={actionId === req.id}
                    aria-busy={actionId === req.id}
                  >
                    {actionId === req.id ? '…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    className="access-requests__btn access-requests__btn--remove"
                    onClick={() => setRemoveConfirm(req)}
                    disabled={actionId === req.id}
                    aria-busy={actionId === req.id}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {removeConfirm && (
        <div className="access-requests__modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="remove-confirm-title">
          <div className="access-requests__modal">
            <h2 id="remove-confirm-title" className="access-requests__modal-title">Remove request?</h2>
            <p className="access-requests__modal-text">
              This will permanently remove the request for <strong>{removeConfirm.first_name} {removeConfirm.last_name}</strong>.
              This action cannot be undone.
            </p>
            <div className="access-requests__modal-actions">
              <button type="button" className="access-requests__btn access-requests__btn--remove" onClick={() => handleRemove(removeConfirm)}>Remove</button>
              <button type="button" className="access-requests__btn access-requests__btn--secondary" onClick={() => setRemoveConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="access-requests__toast-wrap">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

export default AccessRequests;
