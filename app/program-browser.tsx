"use client";

import { useMemo, useState } from "react";

import {
  formatCurrency,
  formatNumber,
  gradeToValue,
  RADAR_AXES,
  type ProgramView,
} from "@/src/lib/programs";

type ProgramBrowserProps = {
  programs: ProgramView[];
};

export function ProgramBrowser({ programs }: ProgramBrowserProps) {
  const [mode, setMode] = useState<"single" | "compare">("compare");
  const [selectedSchool, setSelectedSchool] = useState<string>(programs[0]?.schoolName ?? "");
  const [selectedSchools, setSelectedSchools] = useState<[string, string]>(() => [
    programs[0]?.schoolName ?? "",
    programs[1]?.schoolName ?? programs[0]?.schoolName ?? "",
  ]);

  const schools = useMemo(
    () => Array.from(new Set(programs.map((program) => program.schoolName))),
    [programs],
  );

  const comparedPrograms = useMemo(
    () =>
      selectedSchools
        .map((school) => programs.find((program) => program.schoolName === school))
        .filter((program): program is ProgramView => Boolean(program)),
    [programs, selectedSchools],
  );

  const singleProgram = useMemo(
    () => programs.find((program) => program.schoolName === selectedSchool) ?? null,
    [programs, selectedSchool],
  );

  const invalidPrograms =
    mode === "compare"
      ? comparedPrograms.filter((program) => !program.validation.valid)
      : singleProgram && !singleProgram.validation.valid
        ? [singleProgram]
        : [];

  return (
    <div className="content-layout">
      <aside className="filter-sidebar" aria-label="University filters">
        <div className="filter-panel">
          <p className="filter-kicker">Explore</p>
          <h2>{mode === "compare" ? "Build a comparison" : "Browse one university"}</h2>
          <p className="filter-copy">
            {mode === "compare"
              ? "Choose two universities to compare side by side with an overlapped radar chart."
              : "Focus on one university at a time and inspect its details in a single card view."}
          </p>

          <div className="mode-toggle" role="tablist" aria-label="View mode">
            <button
              type="button"
              className={mode === "single" ? "mode-toggle-button active" : "mode-toggle-button"}
              onClick={() => setMode("single")}
            >
              Single mode
            </button>
            <button
              type="button"
              className={mode === "compare" ? "mode-toggle-button active" : "mode-toggle-button"}
              onClick={() => setMode("compare")}
            >
              Compare mode
            </button>
          </div>

          {mode === "compare" ? (
            <>
              <div className="compare-control-group">
                <label className="compare-control">
                  <span>University A</span>
                  <select
                    value={selectedSchools[0]}
                    onChange={(event) =>
                      setSelectedSchools(([_, second]) => [
                        event.target.value,
                        second === event.target.value
                          ? schools.find((school) => school !== event.target.value) ?? second
                          : second,
                      ])
                    }
                  >
                    {schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="compare-control">
                  <span>University B</span>
                  <select
                    value={selectedSchools[1]}
                    onChange={(event) =>
                      setSelectedSchools(([first]) => [
                        first === event.target.value
                          ? schools.find((school) => school !== event.target.value) ?? first
                          : first,
                        event.target.value,
                      ])
                    }
                  >
                    {schools.map((school) => (
                      <option
                        key={school}
                        value={school}
                        disabled={school === selectedSchools[0]}
                      >
                        {school}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="filter-list" role="list">
                {selectedSchools.map((school, index) => (
                  <div key={`${school}-${index}`} className="filter-chip active static">
                    <span className="filter-chip-label">
                      {index === 0 ? "A" : "B"}: {school}
                    </span>
                    <span>1</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="compare-control-group">
                <label className="compare-control">
                  <span>University</span>
                  <select value={selectedSchool} onChange={(event) => setSelectedSchool(event.target.value)}>
                    {schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="filter-list" role="list">
                <div className="filter-chip active static">
                  <span className="filter-chip-label">Selected: {selectedSchool}</span>
                  <span>1</span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      <div className="content-main">
        {invalidPrograms.length > 0 ? (
          <section className="validation-banner">
            <strong>{invalidPrograms.length} record(s) have validation warnings.</strong>
            <span>They still render, but the UI flags the affected programs.</span>
          </section>
        ) : null}

        {mode === "single" ? (
          singleProgram ? (
            <section className="program-grid single-grid">
              <ProgramCard key={singleProgram.id} program={singleProgram} />
            </section>
          ) : (
            <section className="empty-state">
              <h2>No matching university</h2>
              <p>Choose a university from the sidebar to render the single-school view.</p>
            </section>
          )
        ) : comparedPrograms.length < 2 ? (
          <section className="empty-state">
            <h2>Pick two universities</h2>
            <p>Choose two different schools from the sidebar to render the comparison.</p>
          </section>
        ) : (
          <>
            <ComparisonPanel
              leftProgram={comparedPrograms[0]}
              rightProgram={comparedPrograms[1]}
            />

            <section className="program-grid comparison-grid">
              {comparedPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ComparisonPanel({
  leftProgram,
  rightProgram,
}: {
  leftProgram: ProgramView;
  rightProgram: ProgramView;
}) {
  const [activeAxis, setActiveAxis] = useState<(typeof RADAR_AXES)[number]["key"]>(
    RADAR_AXES[0].key,
  );
  const activeAxisMeta = RADAR_AXES.find((axis) => axis.key === activeAxis) ?? RADAR_AXES[0];

  return (
    <section className="comparison-panel">
      <div className="comparison-panel-header">
        <div>
          <p className="filter-kicker">Compare view</p>
          <h2>
            {leftProgram.schoolName} vs {rightProgram.schoolName}
          </h2>
        </div>
        <div className="comparison-legend" aria-label="Comparison legend">
          <span className="comparison-legend-item left">
            <i />
            {leftProgram.schoolName}
          </span>
          <span className="comparison-legend-item right">
            <i />
            {rightProgram.schoolName}
          </span>
        </div>
      </div>

      <div className="comparison-stage">
        <ComparisonRadarChart
          leftProgram={leftProgram}
          rightProgram={rightProgram}
          activeAxis={activeAxis}
          onAxisHover={setActiveAxis}
        />

        <div className="comparison-inspector">
          <div className="radar-detail-card comparison-detail-card">
            <p className="radar-detail-kicker">Active axis</p>
            <h4>{activeAxisMeta.label}</h4>
            <div className="comparison-metric-grid">
              <div className="comparison-metric left">
                <strong>{leftProgram.schoolName}</strong>
                <p>{leftProgram.radarDetails[activeAxisMeta.key]}</p>
                <span>Grade {leftProgram.radarScores[activeAxisMeta.key] ?? "N/A"}</span>
              </div>
              <div className="comparison-metric right">
                <strong>{rightProgram.schoolName}</strong>
                <p>{rightProgram.radarDetails[activeAxisMeta.key]}</p>
                <span>Grade {rightProgram.radarScores[activeAxisMeta.key] ?? "N/A"}</span>
              </div>
            </div>
          </div>

          <ul className="score-list comparison-score-list">
            {RADAR_AXES.map((axis) => (
              <li key={axis.key} className="score-item">
                <button
                  type="button"
                  className={activeAxis === axis.key ? "score-axis-button active" : "score-axis-button"}
                  onMouseEnter={() => setActiveAxis(axis.key)}
                  onFocus={() => setActiveAxis(axis.key)}
                  onClick={() => setActiveAxis(axis.key)}
                >
                  {axis.label}
                </button>
                <div className="comparison-score-pair">
                  <strong className="left">{leftProgram.radarScores[axis.key] ?? "N/A"}</strong>
                  <strong className="right">{rightProgram.radarScores[axis.key] ?? "N/A"}</strong>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ program }: { program: ProgramView }) {
  const [activeAxis, setActiveAxis] = useState<(typeof RADAR_AXES)[number]["key"]>(
    RADAR_AXES[0].key,
  );

  const activeAxisMeta = RADAR_AXES.find((axis) => axis.key === activeAxis) ?? RADAR_AXES[0];

  return (
    <article className="program-card">
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
        <div className="chart-wrap single-program-chart">
          <RadarChart program={program} activeAxis={activeAxis} onAxisHover={setActiveAxis} />
          <div className="radar-side-panel">
            <div className="radar-detail-card">
              <p className="radar-detail-kicker">Axis detail</p>
              <h4>{activeAxisMeta.label}</h4>
              <p>{program.radarDetails[activeAxisMeta.key]}</p>
              <strong>Grade {program.radarScores[activeAxisMeta.key] ?? "N/A"}</strong>
            </div>

            <ul className="score-list">
              {RADAR_AXES.map((axis) => (
                <li key={axis.key} className="score-item">
                  <button
                    type="button"
                    className={activeAxis === axis.key ? "score-axis-button active" : "score-axis-button"}
                    onMouseEnter={() => setActiveAxis(axis.key)}
                    onFocus={() => setActiveAxis(axis.key)}
                    onClick={() => setActiveAxis(axis.key)}
                  >
                    {axis.label}
                  </button>
                  <strong>{program.radarScores[axis.key] ?? "N/A"}</strong>
                </li>
              ))}
            </ul>
          </div>
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

function RadarChart({
  program,
  activeAxis,
  onAxisHover,
}: {
  program: ProgramView;
  activeAxis: (typeof RADAR_AXES)[number]["key"];
  onAxisHover: (axis: (typeof RADAR_AXES)[number]["key"]) => void;
}) {
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
          <foreignObject
            x={point.labelX - 34}
            y={point.labelY - 12}
            width="68"
            height="26"
            className="axis-label-wrap"
          >
            <button
              type="button"
              className={activeAxis === point.axis.key ? "axis-label-button active" : "axis-label-button"}
              onMouseEnter={() => onAxisHover(point.axis.key)}
              onFocus={() => onAxisHover(point.axis.key)}
              onClick={() => onAxisHover(point.axis.key)}
            >
              <span className="axis-label-text">{point.axis.label}</span>
            </button>
          </foreignObject>
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

function ComparisonRadarChart({
  leftProgram,
  rightProgram,
  activeAxis,
  onAxisHover,
}: {
  leftProgram: ProgramView;
  rightProgram: ProgramView;
  activeAxis: (typeof RADAR_AXES)[number]["key"];
  onAxisHover: (axis: (typeof RADAR_AXES)[number]["key"]) => void;
}) {
  const center = 130;
  const radius = 90;
  const levels = 5;
  const points = RADAR_AXES.map((axis, index) => {
    const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
    const labelX = center + Math.cos(angle) * (radius + 28);
    const labelY = center + Math.sin(angle) * (radius + 28);

    return {
      angle,
      axis,
      labelX,
      labelY,
      leftValue: gradeToValue(leftProgram.radarScores[axis.key]),
      rightValue: gradeToValue(rightProgram.radarScores[axis.key]),
    };
  });

  const getPolygonPoints = (variant: "leftValue" | "rightValue") =>
    points
      .filter((point) => point[variant])
      .map((point) => {
        const scaledRadius = (radius * (point[variant] ?? 0)) / levels;
        const x = center + Math.cos(point.angle) * scaledRadius;
        const y = center + Math.sin(point.angle) * scaledRadius;
        return `${x},${y}`;
      })
      .join(" ");

  const leftPolygon = getPolygonPoints("leftValue");
  const rightPolygon = getPolygonPoints("rightValue");

  return (
    <svg
      viewBox="0 0 260 260"
      className="comparison-radar-chart"
      aria-label="Comparison radar chart"
    >
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
          <foreignObject
            x={point.labelX - 40}
            y={point.labelY - 12}
            width="80"
            height="28"
            className="axis-label-wrap"
          >
            <button
              type="button"
              className={activeAxis === point.axis.key ? "axis-label-button active" : "axis-label-button"}
              onMouseEnter={() => onAxisHover(point.axis.key)}
              onFocus={() => onAxisHover(point.axis.key)}
              onClick={() => onAxisHover(point.axis.key)}
            >
              <span className="axis-label-text comparison-axis-text">{point.axis.label}</span>
            </button>
          </foreignObject>
        </g>
      ))}

      {leftPolygon ? <polygon points={leftPolygon} className="compare-area left" /> : null}
      {rightPolygon ? <polygon points={rightPolygon} className="compare-area right" /> : null}

      {points.map((point) => {
        const leftRadius = ((point.leftValue ?? 0) * radius) / levels;
        const rightRadius = ((point.rightValue ?? 0) * radius) / levels;
        const leftX = center + Math.cos(point.angle) * leftRadius;
        const leftY = center + Math.sin(point.angle) * leftRadius;
        const rightX = center + Math.cos(point.angle) * rightRadius;
        const rightY = center + Math.sin(point.angle) * rightRadius;

        return (
          <g key={`${point.axis.key}-points`}>
            {point.leftValue ? <circle cx={leftX} cy={leftY} r="4" className="compare-dot left" /> : null}
            {point.rightValue ? <circle cx={rightX} cy={rightY} r="4" className="compare-dot right" /> : null}
          </g>
        );
      })}
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
