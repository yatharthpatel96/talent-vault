import './Candidate.css';

function Candidate() {
  return (
    <div className="page candidate">
      <div className="container">
        <header className="page__header">
          <h1 className="page__title">Candidate</h1>
          <p className="page__subtitle">
            Grow your career in semiconductor design, verification, and fabrication.
          </p>
        </header>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Build your chip-design profile</h2>
            <p className="feature-card__text">
              Showcase RTL, verification, and physical design skills. Add projects and tools you use.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Track applications</h2>
            <p className="feature-card__text">
              Apply to roles and internships. Keep track of status and feedback in one place.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Showcase projects (Verilog / UVM / PDK)</h2>
            <p className="feature-card__text">
              Highlight design and verification projects. Link repos and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Candidate;
