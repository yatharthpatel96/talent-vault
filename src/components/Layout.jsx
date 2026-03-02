import { Link } from "react-router-dom";
import { getRole, clearAuth } from "../lib/supabaseClient";
import "./Layout.css";

export default function Layout({ children }) {
  const role = getRole();

  return (
    <>
      <header className="layout-header">
        <div className="layout-container">
          <Link to={role === "admin" ? "/admin" : `/${role}`} className="layout-brand">
            Talent Vault
          </Link>
          <nav className="layout-nav">
            {role === "admin" && <Link to="/admin" className="layout-link">Admin</Link>}
            {role === "candidate" && <Link to="/candidate" className="layout-link">Candidate</Link>}
            {role === "professor" && <Link to="/professor" className="layout-link">Professor</Link>}
            {role === "employer" && <Link to="/employer" className="layout-link">Employer</Link>}
            <button type="button" className="layout-btn" onClick={() => { clearAuth(); window.location.href = "/login"; }}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="layout-main">{children}</main>
    </>
  );
}
