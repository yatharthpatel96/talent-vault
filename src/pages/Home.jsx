import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

// Sample data for jobs and resources.
// TODO: replace sampleJobs and sampleResources with API data (fetch/axios or Supabase)
const sampleJobs = [
  {
    id: 1,
    title: "Device Modeling Intern",
    company: "NovaSilicon Labs",
    location: "Tempe, AZ",
    level: "Internship",
  },
  {
    id: 2,
    title: "Process Integration Engineer",
    company: "QuantumFoundry",
    location: "Hillsboro, OR",
    level: "Mid-level",
  },
  {
    id: 3,
    title: "Analog Mixed-Signal Designer",
    company: "PhotonEdge",
    location: "Austin, TX",
    level: "Senior",
  },
];

const sampleResources = [
  {
    id: 1,
    title: "Introduction to CMOS Fabrication",
    topic: "Fabrication",
    description:
      "A gentle introduction to front-end and back-end-of-line process steps for modern CMOS.",
  },
  {
    id: 2,
    title: "Compact Modeling for Advanced Nodes",
    topic: "Modeling",
    description:
      "How to build accurate, stable compact models for nanoscale devices.",
  },
  {
    id: 3,
    title: "Reliability in Automotive Semiconductors",
    topic: "Reliability",
    description:
      "Key mechanisms and qualification flows for high-reliability automotive ICs.",
  },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const candidateRef = useRef(null);
  const employerRef = useRef(null);
  const professorRef = useRef(null);
  const resourcesRef = useRef(null);

  const scrollTo = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setNavOpen(false);
    }
  };

  return (
    <div className="home">
      <header className="home-header">
        <nav
          className="home-nav container"
          aria-label="Main navigation"
        >
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
            <button
              type="button"
              className="home-nav-link"
              onClick={() => scrollTo(candidateRef)}
            >
              Candidate
            </button>
            <button
              type="button"
              className="home-nav-link"
              onClick={() => scrollTo(employerRef)}
            >
              Employer
            </button>
            <button
              type="button"
              className="home-nav-link"
              onClick={() => scrollTo(professorRef)}
            >
              Professor
            </button>
            <button
              type="button"
              className="home-nav-link"
              onClick={() => scrollTo(resourcesRef)}
            >
              Resources
            </button>
            <Link
              to="/login"
              aria-label="Login"
              className="home-login-btn"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main className="home-main">
        {/* Hero */}
        <section className="home-hero">
          <div className="container home-hero-grid">
            <div className="home-hero-text">
              <p className="home-hero-kicker">Semiconductor careers & resources</p>
              <h1 className="home-hero-title">
                Build the future of chips,{" "}
                <span className="home-hero-title-accent">from lab to fab</span>.
              </h1>
              <p className="home-hero-subtitle">
                Talent Vault connects candidates, employers, and professors
                across the semiconductor ecosystem with curated roles, labs,
                and learning paths.
              </p>
              <div className="home-hero-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => scrollTo(candidateRef)}
                >
                  Find Jobs
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => scrollTo(employerRef)}
                >
                  Post a Job
                </button>
              </div>
            </div>
            <div className="home-hero-visual" aria-hidden="true">
              <div className="home-chip">
                <div className="home-chip-inner">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="home-chip-line" />
                  ))}
                </div>
                <div className="home-chip-pill home-chip-pill-top" />
                <div className="home-chip-pill home-chip-pill-bottom" />
              </div>
            </div>
          </div>
        </section>

        {/* Candidate section */}
        <section
          ref={candidateRef}
          className="home-section"
          aria-labelledby="candidate-heading"
        >
          <div className="container">
            <header className="home-section-header">
              <h2 id="candidate-heading">Opportunities for candidates</h2>
              <p>
                Explore internships, entry-level and experienced roles across
                device physics, design, EDA, and manufacturing.
              </p>
            </header>
            <div className="home-card-grid">
              {sampleJobs.map((job) => (
                <article key={job.id} className="home-card">
                  <h3 className="home-card-title">{job.title}</h3>
                  <p className="home-card-meta">
                    {job.company} · {job.location}
                  </p>
                  <span className="home-card-pill">{job.level}</span>
                  <p className="home-card-text">
                    Learn how this role fits into the silicon pipeline and
                    which skills matter most.
                  </p>
                  <button
                    type="button"
                    className="home-card-btn"
                    onClick={() => {
                      // Placeholder for future detail view / job modal
                      // e.g. navigate(`/jobs/${job.id}`)
                      console.log("View details for job:", job.title);
                    }}
                  >
                    View details
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Employer section */}
        <section
          ref={employerRef}
          className="home-section home-section-alt"
          aria-labelledby="employer-heading"
        >
          <div className="container home-split">
            <div>
              <header className="home-section-header">
                <h2 id="employer-heading">Hire semiconductor talent</h2>
                <p>
                  Reach candidates who understand yield, devices, EDA, and
                  high-reliability systems. Share roles with targeted visibility
                  across universities and industry.
                </p>
              </header>
              <ul className="home-list">
                <li>Curated candidate pool across devices, design, and fab.</li>
                <li>Structured role metadata for better matching.</li>
                <li>Optional API hooks to sync with your existing ATS.</li>
              </ul>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  // Placeholder for a future employer dashboard or post-job flow
                  console.log("Post job CTA clicked");
                }}
              >
                For employers
              </button>
            </div>
            <div className="home-employer-panel">
              <p className="home-employer-label">Example profiles:</p>
              <ul className="home-list-small">
                <li>Process integration engineer with 5+ years at advanced nodes.</li>
                <li>Mixed-signal designer comfortable with SerDes and RF blocks.</li>
                <li>EDA engineer with open-source contributions and Python skills.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Professor section */}
        <section
          ref={professorRef}
          className="home-section"
          aria-labelledby="professor-heading"
        >
          <div className="container home-split">
            <div>
              <header className="home-section-header">
                <h2 id="professor-heading">Partner with professors & labs</h2>
                <p>
                  Align coursework, research, and labs with real industry
                  pipelines. Surface students&apos; work directly to employers.
                </p>
              </header>
              <ul className="home-list">
                <li>Share course syllabi, lab projects, and capstone topics.</li>
                <li>
                  Access curated wafer, device, and reliability datasets for
                  projects.
                </li>
                <li>Host virtual tech talks and office hours with employers.</li>
              </ul>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  // Placeholder for future collaboration request flow
                  console.log("Request collaboration CTA clicked");
                }}
              >
                Request collaboration
              </button>
            </div>
            <div className="home-professor-panel">
              <p className="home-professor-caption">
                Example collaboration kit:
              </p>
              <p className="home-card-text">
                SPICE modeling labs, process-corner case studies, and
                data-driven yield analysis projects that plug directly into
                existing device or VLSI courses.
              </p>
            </div>
          </div>
        </section>

        {/* Resources section */}
        <section
          ref={resourcesRef}
          className="home-section home-section-alt"
          aria-labelledby="resources-heading"
        >
          <div className="container">
            <header className="home-section-header">
              <h2 id="resources-heading">Resources & learning paths</h2>
              <p>
                Curated articles, whitepapers, and tutorials across design,
                fab, modeling, and reliability.
              </p>
            </header>
            <div className="home-card-grid">
              {sampleResources.map((res) => (
                <article key={res.id} className="home-card">
                  <h3 className="home-card-title">{res.title}</h3>
                  <span className="home-card-pill home-card-pill-muted">
                    {res.topic}
                  </span>
                  <p className="home-card-text">{res.description}</p>
                  <button
                    type="button"
                    className="home-card-link"
                    onClick={() => {
                      // Placeholder for opening full resource or external link
                      console.log("Open resource:", res.title);
                    }}
                  >
                    Explore resource
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container home-footer-inner">
          <p>Talent Vault · Semiconductor careers & resources</p>
          <p className="home-footer-meta">
            Built for candidates, employers, and professors shaping the next
            generation of chips.
          </p>
        </div>
      </footer>
    </div>
  );
}

