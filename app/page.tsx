import {
  formatCurrency,
  formatNumber,
  getPrograms,
  gradeToValue,
  RADAR_AXES,
  type ProgramView,
} from "@/src/lib/programs";

export default function HomePage() {
  const programs = getPrograms();
  const invalidPrograms = programs.filter((program) => !program.validation.valid);

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">MSCS Arena</p>
          <h1>
            Compare CS master&apos;s programs with consistent local data and
            transparent scoring.
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

      {invalidPrograms.length > 0 ? (
        <section className="validation-banner">
          <strong>{invalidPrograms.length} record(s) have validation warnings.</strong>
          <span>They still render, but the UI flags the affected programs.</span>
        </section>
      ) : null}

      <section className="program-grid">
        {programs.map((program) => (
          <article className="program-card" key={program.id}>
            <header className="program-header">
              <div>
                <p className="program-school">{program.schoolName}</p>
                <h2>{program.programName}</h2>
                <p className="program-degree">{program.degreeType}</p>
              </div>
              {program.validation.valid ? null : (
                <span className="warning-badge">Validation warnings</span>
              )}
            </header>

            <section className="section-block">
              <h3>Basic program info</h3>
              <dl className="info-list">
                <InfoRow label="Location" value={formatLocation(program)} />
                <InfoRow label="Duration / Credits" value={formatDuration(program)} />
                <InfoRow label="Thesis" value={program.thesisOption ?? "N/A"} />
                <InfoRow
                  label="Research vs Industry"
                  value={`${program.researchIndustryLabel} - course design & thesis requirement`}
                />
                <InfoRow label="Delivery mode" value={program.deliveryMode ?? "N/A"} />
              </dl>
            </section>

            <section className="section-block">
              <h3>Radar chart including (map to ABCDE)</h3>
              <div className="chart-wrap">
                <RadarChart program={program} />
                <ul className="score-list">
                  {RADAR_AXES.map((axis) => (
                    <li key={axis.key}>
                      <span>{axis.label}</span>
                      <strong>{program.radarScores[axis.key] ?? "N/A"}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="section-block">
              <h3>Reference</h3>
              <div className="reference-list">
                <ReferenceChip label="OpenCS Page" url={program.references?.openCsUrl} />
                <ReferenceChip label="Niche Page" url={program.references?.nicheUrl} />
              </div>
            </section>

            <section className="section-block">
              <h3>Fields including</h3>
              <dl className="info-list">
                <InfoRow
                  label="Tuition"
                  value={
                    Number.isFinite(program.tuitionTotalUsd)
                      ? `${formatCurrency(program.tuitionTotalUsd)} total`
                      : Number.isFinite(program.tuitionPerCreditUsd)
                        ? `${formatCurrency(program.tuitionPerCreditUsd)} per credit`
                        : "N/A"
                  }
                />
                <InfoRow label="Duration" value={program.duration ?? "N/A"} />
                <InfoRow label="Credits" value={formatNumber(program.creditHours)} />
                <InfoRow label="Location" value={formatLocation(program)} />
                <InfoRow label="Cohort size" value={formatNumber(program.cohortSize)} />
                <InfoRow label="Thesis option" value={program.thesisOption ?? "N/A"} />
                <InfoRow
                  label="Research vs industry orientation"
                  value={program.researchIndustryLabel}
                />
                <InfoRow label="Delivery mode" value={program.deliveryMode ?? "N/A"} />
                <InfoRow
                  label="Ranking inputs"
                  value={[
                    `US News ${program.rankings?.usNewsUndergrad ?? "N/A"}`,
                    `CSRankings ${program.rankings?.csrankings ?? "N/A"}`,
                    `OpenCS ${program.rankings?.openCs ?? "N/A"}`,
                  ].join(" / ")}
                />
                <InfoRow
                  label="Notes"
                  value={program.notes?.length ? program.notes.join(" | ") : "N/A"}
                />
              </dl>
            </section>

            {program.validation.valid ? null : (
              <section className="section-block warning-list">
                <h3>Validation details</h3>
                <ul>
                  {program.validation.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ReferenceChip({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return <span className="reference disabled">{label}: N/A</span>;
  }

  return (
    <a className="reference" href={url} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function RadarChart({ program }: { program: ProgramView }) {
  const center = 110;
  const radius = 72;
  const levels = 5;
  const points = RADAR_AXES.map((axis, index) => {
    const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
    const value = gradeToValue(program.radarScores[axis.key]);
    const scaledRadius = value ? (radius * value) / levels : 0;
    const x = center + Math.cos(angle) * scaledRadius;
    const y = center + Math.sin(angle) * scaledRadius;
    const labelX = center + Math.cos(angle) * (radius + 24);
    const labelY = center + Math.sin(angle) * (radius + 24);

    return { angle, axis, x, y, labelX, labelY, value };
  });

  const polygonPoints = points
    .filter((point) => point.value)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 220 220" className="radar-chart" aria-label="Program radar chart">
      {Array.from({ length: levels }, (_, index) => {
        const ringRadius = ((index + 1) * radius) / levels;
        const ringPoints = points
          .map((point) => {
            const x = center + Math.cos(point.angle) * ringRadius;
            const y = center + Math.sin(point.angle) * ringRadius;
            return `${x},${y}`;
          })
          .join(" ");

        return <polygon key={ringRadius} points={ringPoints} className="grid-ring" />;
      })}

      {points.map((point) => (
        <g key={point.axis.key}>
          <line
            x1={center}
            y1={center}
            x2={center + Math.cos(point.angle) * radius}
            y2={center + Math.sin(point.angle) * radius}
            className="grid-axis"
          />
          <text x={point.labelX} y={point.labelY} className="axis-label">
            {point.axis.label}
          </text>
        </g>
      ))}

      {polygonPoints ? <polygon points={polygonPoints} className="data-area" /> : null}

      {points
        .filter((point) => point.value)
        .map((point) => (
          <circle
            key={`${point.axis.key}-dot`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            className="data-dot"
          />
        ))}
    </svg>
  );
}

function formatLocation(program: ProgramView): string {
  const city = program.locationCity ?? "N/A";
  const state = program.locationState ? `, ${program.locationState}` : "";
  const type = program.locationType ? ` (${program.locationType})` : "";
  return `${city}${state}${type}`;
}

function formatDuration(program: ProgramView): string {
  const duration = program.duration ?? "N/A";
  const credits = formatNumber(program.creditHours);
  return `${duration} / ${credits}`;
}
