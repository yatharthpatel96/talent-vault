import './Resources.css';

const RESOURCES = [
  { id: 1, title: 'Digital Design', desc: 'Combinational and sequential logic, FSMs, RTL basics.' },
  { id: 2, title: 'RTL to GDS', desc: 'Synthesis, place & route, timing closure, PDK flows.' },
  { id: 3, title: 'Verification (UVM)', desc: 'SystemVerilog, UVM, constrained random, coverage.' },
  { id: 4, title: 'Semiconductor Physics', desc: 'Device physics, process technology, fabrication.' },
  { id: 5, title: 'Interview Prep', desc: 'RTL puzzles, verification scenarios, behavioral questions.' },
];

function Resources() {
  return (
    <div className="page resources">
      <div className="container">
        <header className="page__header">
          <h1 className="page__title">Resources</h1>
          <p className="page__subtitle">
            Learning paths, courses, and tools for semiconductor design and verification.
          </p>
        </header>
        <div className="resource-grid">
          {RESOURCES.map((r) => (
            <div key={r.id} className="resource-card">
              <div className="resource-card__accent" aria-hidden="true" />
              <h2 className="resource-card__title">{r.title}</h2>
              <p className="resource-card__text">{r.desc}</p>
              <button type="button" className="btn resource-card__btn">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Resources;
