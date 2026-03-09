import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

// Sample data for jobs and resources.
export default function Home() {
  return (
    <div className="home">
      <div className="home-main">
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-grid">
            <div className="home-hero-text">
              <p className="home-hero-tagline">
                Talent Vault
              </p>
              <p className="home-hero-kicker">Semiconductor careers & resources</p>
              <h1 className="home-hero-title">
              Connecting semiconductor employers with top talent,{" "}
                <span className="home-hero-title-accent">from lab to fab</span>.
              </h1>
            </div>
          </div>
        </section>

        {/* Candidate section – now just the intro video */}
        <section className="home-section" aria-labelledby="candidate-video-heading">
          <div className="container">
            <header className="home-section-header">
              <h2
                id="candidate-video-heading"
                className="home-section-title-primary"
                onClick={() => {
                  const video = document.getElementById("talentvault-video");
                  if (video) {
                    video.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
              >
                WHAT IS TALENTVAULT
              </h2>
            </header>

            <div className="home-video-wrapper">
              <video
                id="talentvault-video"
                className="home-video"
                controls
                preload="metadata"
              >
                <source src="/talentvault-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* Why use TalentVault section */}
        <section
          className="home-section home-section-alt home-section-alt-light"
          aria-labelledby="why-talentvault-heading"
        >
          <div className="container">
            <header className="home-section-header">
              <h2
                id="why-talentvault-heading"
                className="home-section-title-primary"
              >
                WHY USE TALENTVAULT
              </h2>
              <p className="home-section-subtitle">
                Whether you&apos;re a talented professional or an industry
                leader, TalentVault provides the tools and connections you need
                to succeed.
              </p>
            </header>

            <div className="home-value-grid">
              <article className="home-value-card">
                <div className="home-value-icon" aria-hidden="true">
                  🔍
                </div>
                <div className="home-value-body">
                  <h3 className="home-value-title">Smart Matching</h3>
                  <p className="home-value-text">
                    Where qualified candidates meet the right opportunities in
                    the semiconductor industry.
                  </p>
                </div>
              </article>

              <article className="home-value-card">
                <div className="home-value-icon" aria-hidden="true">
                  📈
                </div>
                <div className="home-value-body">
                  <h3 className="home-value-title">Industry Focus</h3>
                  <p className="home-value-text">
                    Built for semiconductors—where experts showcase their skills
                    and companies find specialized talent.
                  </p>
                </div>
              </article>

              <article className="home-value-card">
                <div className="home-value-icon" aria-hidden="true">
                  ⚡
                </div>
                <div className="home-value-body">
                  <h3 className="home-value-title">Efficient Process</h3>
                  <p className="home-value-text">
                    Job seekers get noticed faster. Employers hire smarter with
                    pre-vetted candidates.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Industry Facts section */}
        <section
          className="home-section home-facts-section"
          aria-labelledby="industry-facts-heading"
        >
          <div className="container">
            <header className="home-section-header">
              <h2
                id="industry-facts-heading"
                className="home-facts-title"
              >
                INDUSTRY FACTS
              </h2>
            </header>

            <div className="home-facts-grid">
              <article className="home-facts-card">
                <span className="home-facts-icon" aria-hidden="true">📊</span>
                <h3 className="home-facts-card-title">Market Growth</h3>
                <p className="home-facts-card-text">
                  The global semiconductor market is projected to reach $1
                  trillion by 2030, with a CAGR of 7%.
                </p>
              </article>

              <article className="home-facts-card">
                <span className="home-facts-icon" aria-hidden="true">📈</span>
                <h3 className="home-facts-card-title">Job Demand</h3>
                <p className="home-facts-card-text">
                  Over 67,000 new semiconductor jobs are expected by 2030 in the
                  United States alone.
                </p>
              </article>

              <article className="home-facts-card">
                <span className="home-facts-icon" aria-hidden="true">⚡</span>
                <h3 className="home-facts-card-title">Innovation</h3>
                <p className="home-facts-card-text">
                  The semiconductor industry invests over $50 billion annually
                  in research and development.
                </p>
              </article>
            </div>
          </div>
        </section>

      </div>

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

