import './Employer.css';

function Employer() {
  return (
    <div className="page employer">
      <div className="container">
        <header className="page__header">
          <h1 className="page__title">Employer</h1>
          <p className="page__subtitle">
            Hire the best talent in semiconductor design, verification, and process engineering.
          </p>
        </header>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Post roles</h2>
            <p className="feature-card__text">
              Create listings for RTL, verification, physical design, and fabrication roles.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Filter by skills</h2>
            <p className="feature-card__text">
              Search candidates by Verilog, UVM, PDK, timing closure, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Manage applicants</h2>
            <p className="feature-card__text">
              Review applications, shortlist, and coordinate interviews in one dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Employer;
