import { useState } from "react";
import { Link } from "react-router-dom";
import "../pages/Home.css";

export default function PublicLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div>
      <header className="home-header">
        <nav className="home-nav container" aria-label="Main navigation">
          <Link to="/" className="home-logo">
            Talent Vault
            <span className="home-logo-sub">Semiconductor</span>
          </Link>

          <button
            type="button"
            className="home-nav-toggle"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={navOpen}
            aria-controls="primary-navigation"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span className="home-nav-toggle-line" />
            <span className="home-nav-toggle-line" />
            <span className="home-nav-toggle-line" />
          </button>

          <div
            id="primary-navigation"
            className={`home-nav-links ${navOpen ? "home-nav-links-open" : ""}`}
          >
            <Link
              to="/"
              className="home-nav-link"
              onClick={() => setNavOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/candidate-info"
              className="home-nav-link"
              onClick={() => setNavOpen(false)}
            >
              Candidate
            </Link>
            <Link
              to="/employer-info"
              className="home-nav-link"
              onClick={() => setNavOpen(false)}
            >
              Employer
            </Link>
            <Link
              to="/professor-info"
              className="home-nav-link"
              onClick={() => setNavOpen(false)}
            >
              Professor
            </Link>
            <Link
              to="/resources"
              className="home-nav-link"
              onClick={() => setNavOpen(false)}
            >
              Resources
            </Link>
            <Link
              to="/login"
              aria-label="Login"
              className="home-login-btn"
              onClick={() => setNavOpen(false)}
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

