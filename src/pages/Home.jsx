import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      {/* A) HERO SECTION */}
      <section className="hero">
        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__content">
          <h1 className="hero__headline">Semiconductor Career & Research Hub</h1>
          <p className="hero__subheadline">
            Connect candidates, employers, and professors in the world of chips.
          </p>
          <div className="hero__labels">
            <span className="hero__label">VLSI</span>
            <span className="hero__label">Verification</span>
            <span className="hero__label">Fabrication</span>
          </div>
          <Link to="/login" className="btn hero__cta">Get Started</Link>
        </div>
      </section>

      {/* B) CANDIDATE CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__accent" aria-hidden="true" />
            <h2 className="cta-card__title">Candidates</h2>
            <p className="cta-card__text">
              Build your path in semiconductors—from RTL design and verification to physical design and PDK.
              Showcase your skills, apply to internships and full-time roles at top fabs and design houses.
            </p>
            <Link to="/candidate" className="btn">Explore as Candidate</Link>
          </div>
        </div>
      </section>

      {/* C) EMPLOYER CTA */}
      <section className="cta-section cta-section--alt">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__accent" aria-hidden="true" />
            <h2 className="cta-card__title">Employers</h2>
            <p className="cta-card__text">
              Hire RTL designers, verification engineers (UVM/formal), and process engineers.
              Reach qualified talent in chip design, verification, and fabrication.
            </p>
            <Link to="/employer" className="btn">Post Jobs & Hire</Link>
          </div>
        </div>
      </section>

      {/* D) PROFESSOR CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__accent" aria-hidden="true" />
            <h2 className="cta-card__title">Professors</h2>
            <p className="cta-card__text">
              Share your research labs, projects, and publications. Connect students with industry and
              collaboration opportunities in VLSI and semiconductor research.
            </p>
            <Link to="/professor" className="btn">For Academics</Link>
          </div>
        </div>
      </section>

      {/* E) RESOURCES CTA */}
      <section className="cta-section cta-section--alt">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__accent" aria-hidden="true" />
            <h2 className="cta-card__title">Resources</h2>
            <p className="cta-card__text">
              Courses, roadmaps, interview prep, and tools for digital design, RTL-to-GDS, verification,
              and semiconductor physics. Learn and grow in the field.
            </p>
            <Link to="/resources" className="btn">Browse Resources</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
