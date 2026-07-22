const lifecycle = [
  'Campaign',
  'Collection',
  'Showroom',
  'Selection',
  'Order Builder',
  'Order',
  'DealSpace',
];

const foundations = [
  ['Architecture', 'Accepted'],
  ['Product canon', 'In QA'],
  ['Runtime', 'Active'],
  ['Legacy dependency', 'None'],
] as const;

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Syntha Wholesale home">
          SYNTHA <span>WHOLESALE</span>
        </a>
        <div className="environment">V2 · FOUNDATION</div>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">Independent B2B fashion operating environment</p>
          <h1>
            Wholesale work,
            <br />
            built as one system.
          </h1>
          <p className="lead">
            A clean foundation for brands and retail organisations to publish collections,
            build selections, confirm orders and execute together.
          </p>
          <div className="actions">
            <a className="primaryAction" href="#lifecycle">
              Explore foundation
            </a>
            <a className="secondaryAction" href="/api/health">
              Runtime health
            </a>
          </div>
        </div>

        <aside className="statusPanel" aria-label="Foundation status">
          <p className="panelLabel">Foundation status</p>
          {foundations.map(([label, value]) => (
            <div className="statusRow" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <p className="isolationNote">
            New Syntha is isolated from Legacy. No Legacy UI, routes, services or runtime state are used.
          </p>
        </aside>
      </section>

      <section className="lifecycleSection" id="lifecycle" aria-labelledby="lifecycle-title">
        <div className="sectionHeading">
          <p className="eyebrow">Canonical lifecycle</p>
          <h2 id="lifecycle-title">One commercial flow</h2>
        </div>
        <ol className="lifecycleGrid">
          {lifecycle.map((stage, index) => (
            <li key={stage}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage}</strong>
            </li>
          ))}
        </ol>
      </section>

      <footer>
        <span>Syntha Wholesale V2</span>
        <span>Independent runtime · 2026</span>
      </footer>
    </main>
  );
}
