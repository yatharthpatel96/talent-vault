import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__container">
        <NavLink to="/" className="navbar__brand">
          Talent Vault
        </NavLink>
        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/candidate" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Candidate
          </NavLink>
          <NavLink to="/employer" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Employer
          </NavLink>
          <NavLink to="/professor" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Professor
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Resources
          </NavLink>
          <NavLink to="/admin/access-requests" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Access requests
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
