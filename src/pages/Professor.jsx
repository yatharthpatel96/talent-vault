import './Professor.css';

function Professor() {
  return (
    <div className="page professor">
      <div className="container">
        <header className="page__header">
          <h1 className="page__title">Professor</h1>
          <p className="page__subtitle">
            Research labs, collaborations, and student opportunities in semiconductors.
          </p>
        </header>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Lab openings</h2>
            <p className="feature-card__text">
              Post PhD, MS, and internship positions in your VLSI and semiconductor lab.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Research collaborations</h2>
            <p className="feature-card__text">
              Connect with industry and other academics for joint projects and funding.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__accent" aria-hidden="true" />
            <h2 className="feature-card__title">Publish and share resources</h2>
            <p className="feature-card__text">
              Share courses, slides, and publications with the semiconductor community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Professor;
