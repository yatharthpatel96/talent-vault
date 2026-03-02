import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { functionsUrl, setAuth, anonKey } from "../lib/supabaseClient";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${functionsUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey && { Authorization: `Bearer ${anonKey}` }),
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }
      setAuth(data.token, data.role);
      if (data.role === "admin") navigate("/admin", { replace: true });
      else if (data.role === "candidate") navigate("/candidate", { replace: true });
      else if (data.role === "professor") navigate("/professor", { replace: true });
      else if (data.role === "employer") navigate("/employer", { replace: true });
      else navigate("/login", { replace: true });
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Talent Vault</h1>
        <p className="login-subtitle">Sign in to your account</p>
        {error && <p className="login-error" role="alert">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
          <button type="submit" className="btn login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="login-footer">
          <Link to="/request-access">Request Access</Link>
        </p>
      </div>
    </div>
  );
}
