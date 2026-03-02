import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { functionsUrl, anonKey } from "../lib/supabaseClient";
import "./SetPassword.css";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Invalid link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${functionsUrl}/create-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
        },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to set password.");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="set-password-page">
        <div className="set-password-card">
          <h1 className="page-title">Invalid link</h1>
          <p className="page-subtitle">This link is invalid or has expired.</p>
          <Link to="/request-access" className="btn">Request access</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="set-password-page">
        <div className="set-password-card">
          <h1 className="page-title">Password set</h1>
          <p className="page-subtitle">You can now sign in with your email and password.</p>
          <Link to="/login" className="btn">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="set-password-page">
      <div className="set-password-card">
        <h1 className="page-title">Set your password</h1>
        <p className="page-subtitle">Talent Vault</p>
        {error && <p className="set-password-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="pw">New password *</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} placeholder="At least 8 characters" required />
          <label htmlFor="cf">Confirm password *</label>
          <input id="cf" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} placeholder="Confirm password" required />
          <button type="submit" className="btn set-password-btn" disabled={loading}>
            {loading ? "Setting…" : "Set password"}
          </button>
        </form>
      </div>
    </div>
  );
}
