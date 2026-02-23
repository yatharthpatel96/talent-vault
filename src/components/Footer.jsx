import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__copy">
          © {new Date().getFullYear()} Talent Vault — Semiconductor Career & Research Hub.
        </p>
        <nav className="footer__links">
          <Link to="/">Home</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
