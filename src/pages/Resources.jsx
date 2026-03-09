import React from "react";

export default function ResourcesPage() {
  return (
    <div className="info-page">
      <main className="container">
        <h1 className="page-title">Semiconductor resources</h1>
        <p className="page-subtitle">
          Curate your own list of articles, courses, and tools for candidates, employers, and professors.
        </p>

        <section>
          <h2>Learning paths</h2>
          <p>
            Use this section to outline recommended learning paths &mdash; for example,
            device physics fundamentals, process integration, analog/RF design, or reliability.
          </p>
        </section>

        <section>
          <h2>Reference materials</h2>
          <p>
            Add links to key whitepapers, textbooks, open-source projects, or internal resources
            that you want visitors to explore.
          </p>
        </section>
      </main>
    </div>
  );
}

