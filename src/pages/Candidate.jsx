import { useState, useEffect } from "react";
import { functionsUrl, getToken, getRole, anonKey } from "../lib/supabaseClient";
import "./RolePage.css";

export default function Candidate() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${functionsUrl}/get-profile`, {
      headers: {
        ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
        "X-User-Token": token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setProfile(data);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const role = getRole();

  return (
    <div className="role-page">
      <h1 className="page-title">Candidate</h1>
      <p className="page-subtitle">Talent Vault — You are signed in as <strong>{role}</strong></p>
      {loading && <p className="role-loading">Loading profile…</p>}
      {error && <p className="role-error">{error}</p>}
      {!loading && !error && profile && Object.keys(profile).length > 0 && (
        <div className="role-profile">
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
        </div>
      )}
      {!loading && !error && (!profile || Object.keys(profile).length === 0) && (
        <p className="role-muted">No profile details yet.</p>
      )}
    </div>
  );
}
