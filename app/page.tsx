import { ProgramBrowser } from "@/app/program-browser";
import { getPrograms, RADAR_AXES } from "@/src/lib/programs";

export default function HomePage() {
  const programs = getPrograms();

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">MSCS Arena</p>
          <h1>
            US CS master Explorer
          </h1>
        </div>
        <div className="hero-panel">
          <p>
            Every radar axis is normalized onto an A-E scale, where A is the
            most comparison-favorable outcome for that dimension.
          </p>
          <p className="config-caption">
            Scoring rules are loaded from <code>data/scoring-config.json</code>.
          </p>
          <ul className="legend-list">
            {RADAR_AXES.map((axis) => (
              <li key={axis.key}>{axis.label}</li>
            ))}
          </ul>
        </div>
      </section>
      <ProgramBrowser programs={programs} />
    </main>
  );
}
