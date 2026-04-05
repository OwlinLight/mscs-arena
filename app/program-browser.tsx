"use client";

import { useMemo, useState } from "react";

import {
  formatCurrency as formatDisplayCurrency,
  formatDuration,
  formatEmployerDensity,
  formatLivingCost,
  formatLocation,
  formatNumber as formatDisplayNumber,
  getAxisDetail,
  getAxisKeys,
  getAxisLabel,
  getResearchIndustryLabel as getLocalizedResearchIndustryLabel,
  translations,
  type Language,
} from "@/src/lib/i18n";
import {
  gradeToValue,
  RADAR_AXES,
  type ProgramView,
  type RadarAxisKey,
} from "@/src/lib/programs";

type ProgramBrowserProps = {
  language: Language;
  programs: ProgramView[];
};

export function ProgramBrowser({ language, programs }: ProgramBrowserProps) {
  const t = translations[language].browser;
  const [mode, setMode] = useState<"single" | "compare">("compare");
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id ?? "");
  const [selectedProgramIds, setSelectedProgramIds] = useState<[string, string]>(() => [
    programs[0]?.id ?? "",
    programs[1]?.id ?? programs[0]?.id ?? "",
  ]);

  const comparedPrograms = useMemo(
    () =>
      selectedProgramIds
        .map((programId) => programs.find((program) => program.id === programId))
        .filter((program): program is ProgramView => Boolean(program)),
    [programs, selectedProgramIds],
  );

  const singleProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) ?? null,
    [programs, selectedProgramId],
  );

  const invalidPrograms =
    mode === "compare"
      ? comparedPrograms.filter((program) => !program.validation.valid)
      : singleProgram && !singleProgram.validation.valid
        ? [singleProgram]
        : [];

  return (
    <div className="content-layout">
      <aside className="filter-sidebar" aria-label={t.ariaUniversityFilters}>
        <div className="filter-panel">
          <p className="filter-kicker">{t.kicker}</p>
          <h2>{mode === "compare" ? t.compareHeading : t.singleHeading}</h2>
          <p className="filter-copy">
            {mode === "compare" ? t.compareCopy : t.singleCopy}
          </p>

          <div className="mode-toggle" role="tablist" aria-label={t.ariaViewMode}>
            <button
              type="button"
              className={mode === "single" ? "mode-toggle-button active" : "mode-toggle-button"}
              onClick={() => setMode("single")}
            >
              {t.singleMode}
            </button>
            <button
              type="button"
              className={mode === "compare" ? "mode-toggle-button active" : "mode-toggle-button"}
              onClick={() => setMode("compare")}
            >
              {t.compareMode}
            </button>
          </div>

          {mode === "compare" ? (
            <>
              <div className="compare-control-group">
                <label className="compare-control">
                  <span>{t.universityA}</span>
                  <select
                    value={selectedProgramIds[0]}
                    onChange={(event) =>
                      setSelectedProgramIds(([_, second]) => [
                        event.target.value,
                        second === event.target.value
                          ? programs.find((program) => program.id !== event.target.value)?.id ?? second
                          : second,
                      ])
                    }
                  >
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {getProgramOptionLabel(program)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="compare-control">
                  <span>{t.universityB}</span>
                  <select
                    value={selectedProgramIds[1]}
                    onChange={(event) =>
                      setSelectedProgramIds(([first]) => [
                        first === event.target.value
                          ? programs.find((program) => program.id !== event.target.value)?.id ?? first
                          : first,
                        event.target.value,
                      ])
                    }
                  >
                    {programs.map((program) => (
                      <option
                        key={program.id}
                        value={program.id}
                        disabled={program.id === selectedProgramIds[0]}
                      >
                        {getProgramOptionLabel(program)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="filter-list" role="list">
                {selectedProgramIds.map((programId, index) => {
                  const program = programs.find((candidate) => candidate.id === programId);

                  return (
                    <div key={`${programId}-${index}`} className="filter-chip active static">
                      <span className="filter-chip-label">
                        {index === 0 ? "A" : "B"}: {program ? getProgramOptionLabel(program) : t.notAvailable}
                      </span>
                      <RankingChip language={language} program={program ?? null} />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="compare-control-group">
                <label className="compare-control">
                  <span>{t.university}</span>
                  <select value={selectedProgramId} onChange={(event) => setSelectedProgramId(event.target.value)}>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {getProgramOptionLabel(program)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="filter-list" role="list">
                <div className="filter-chip active static">
                  <span className="filter-chip-label">
                    {t.selected}: {singleProgram ? getProgramOptionLabel(singleProgram) : t.notAvailable}
                  </span>
                  <RankingChip language={language} program={singleProgram} />
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      <div className="content-main">
        {invalidPrograms.length > 0 ? (
          <section className="validation-banner">
            <strong>{invalidPrograms.length} {t.recordsWarning}</strong>
            <span>{t.recordsWarningCopy}</span>
          </section>
        ) : null}

        {mode === "single" ? (
          singleProgram ? (
            <section className="program-grid single-grid">
              <ProgramCard key={singleProgram.id} language={language} program={singleProgram} />
            </section>
          ) : (
            <section className="empty-state">
              <h2>{t.noMatchingUniversity}</h2>
              <p>{t.noMatchingUniversityCopy}</p>
            </section>
          )
        ) : comparedPrograms.length < 2 ? (
          <section className="empty-state">
            <h2>{t.pickTwoUniversities}</h2>
            <p>{t.pickTwoUniversitiesCopy}</p>
          </section>
        ) : (
          <>
            <ComparisonPanel
              language={language}
              leftProgram={comparedPrograms[0]}
              rightProgram={comparedPrograms[1]}
              onSelectProgram={(programId) => {
                setSelectedProgramId(programId);
                setMode("single");
              }}
            />

            <section className="program-grid comparison-grid">
              {comparedPrograms.map((program) => (
                <ProgramCard key={program.id} language={language} program={program} />
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ComparisonPanel({
  language,
  leftProgram,
  rightProgram,
  onSelectProgram,
}: {
  language: Language;
  leftProgram: ProgramView;
  rightProgram: ProgramView;
  onSelectProgram: (programId: string) => void;
}) {
  const t = translations[language].browser;
  const [activeAxis, setActiveAxis] = useState<RadarAxisKey>(RADAR_AXES[0].key);

  return (
    <section className="comparison-panel">
      <div className="comparison-panel-header">
        <div>
          <p className="filter-kicker">{t.compareView}</p>
          <h2>
            {leftProgram.schoolName} vs {rightProgram.schoolName}
          </h2>
        </div>
        <div className="comparison-legend" aria-label={t.comparisonLegend}>
          <button
            type="button"
            className="comparison-legend-item left"
            onClick={() => onSelectProgram(leftProgram.id)}
          >
            <i />
            {getProgramOptionLabel(leftProgram)}
          </button>
          <button
            type="button"
            className="comparison-legend-item right"
            onClick={() => onSelectProgram(rightProgram.id)}
          >
            <i />
            {getProgramOptionLabel(rightProgram)}
          </button>
        </div>
      </div>

      <div className="comparison-stage">
        <ComparisonRadarChart
          language={language}
          leftProgram={leftProgram}
          rightProgram={rightProgram}
          activeAxis={activeAxis}
          onAxisHover={setActiveAxis}
        />

        <div className="comparison-inspector">
          <div className="radar-detail-card comparison-detail-card">
            <p className="radar-detail-kicker">{t.activeAxis}</p>
            <h4>{getAxisLabel(language, activeAxis)}</h4>
            <div className="comparison-metric-grid">
              <div className="comparison-metric left">
                <strong>{leftProgram.schoolName}</strong>
                <p>{getAxisDetail(language, leftProgram, activeAxis)}</p>
                <span>{t.grade} {leftProgram.radarScores[activeAxis] ?? t.notAvailable}</span>
              </div>
              <div className="comparison-metric right">
                <strong>{rightProgram.schoolName}</strong>
                <p>{getAxisDetail(language, rightProgram, activeAxis)}</p>
                <span>{t.grade} {rightProgram.radarScores[activeAxis] ?? t.notAvailable}</span>
              </div>
            </div>
          </div>

          <ul className="score-list comparison-score-list">
            {getAxisKeys().map((axisKey) => (
              <li key={axisKey} className="score-item">
                <button
                  type="button"
                  className={activeAxis === axisKey ? "score-axis-button active" : "score-axis-button"}
                  onMouseEnter={() => setActiveAxis(axisKey)}
                  onFocus={() => setActiveAxis(axisKey)}
                  onClick={() => setActiveAxis(axisKey)}
                >
                  {getAxisLabel(language, axisKey)}
                </button>
                <div className="comparison-score-pair">
                  <strong className="left">{leftProgram.radarScores[axisKey] ?? t.notAvailable}</strong>
                  <strong className="right">{rightProgram.radarScores[axisKey] ?? t.notAvailable}</strong>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ language, program }: { language: Language; program: ProgramView }) {
  const t = translations[language].browser;
  const [activeAxis, setActiveAxis] = useState<RadarAxisKey>(RADAR_AXES[0].key);
  const mapQuery = [program.schoolName, program.locationCity, program.locationState]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(", ");
  const mapEmbedUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`
    : null;

  return (
    <article className="program-card">
      <header className="program-header">
        <div>
          <p className="program-school">{program.schoolName}</p>
          <h2>{program.programName}</h2>
          <p className="program-degree">{program.degreeType}</p>
        </div>
        {program.validation.valid ? null : (
          <span className="warning-badge">{t.validationWarnings}</span>
        )}
      </header>

      <section className="section-block">
        <h3>{t.basicProgramInfo}</h3>
        <dl className="info-list">
          <InfoRow label={t.location} value={formatLocation(language, program)} />
          <InfoRow label={t.durationCredits} value={formatDuration(language, program)} />
          {program.thesisOption ? <InfoRow label={t.thesis} value={program.thesisOption} /> : null}
          {program.researchIndustryLabel !== "N/A" ? (
            <InfoRow
              label={t.researchVsIndustry}
              value={`${getLocalizedResearchIndustryLabel(language, program.researchIndustryLabel)} - ${t.researchVsIndustryDetail}`}
            />
          ) : null}
          {program.deliveryMode ? <InfoRow label={t.deliveryMode} value={program.deliveryMode} /> : null}
        </dl>
      </section>

      <section className="section-block">
        <h3>{t.radarSection}</h3>
        <div className="chart-wrap single-program-chart">
          <RadarChart
            language={language}
            program={program}
            activeAxis={activeAxis}
            onAxisHover={setActiveAxis}
          />
          <div className="radar-side-panel">
            <div className="radar-detail-card">
              <p className="radar-detail-kicker">{t.axisDetail}</p>
              <h4>{getAxisLabel(language, activeAxis)}</h4>
              <p>{getAxisDetail(language, program, activeAxis)}</p>
              <strong>{t.grade} {program.radarScores[activeAxis] ?? t.notAvailable}</strong>
            </div>

            <ul className="score-list">
              {getAxisKeys().map((axisKey) => (
                <li key={axisKey} className="score-item">
                  <button
                    type="button"
                    className={activeAxis === axisKey ? "score-axis-button active" : "score-axis-button"}
                    onMouseEnter={() => setActiveAxis(axisKey)}
                    onFocus={() => setActiveAxis(axisKey)}
                    onClick={() => setActiveAxis(axisKey)}
                  >
                    {getAxisLabel(language, axisKey)}
                  </button>
                  <strong>{program.radarScores[axisKey] ?? t.notAvailable}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-block">
        <h3>{t.reference}</h3>
        <div className="reference-list">
          <ReferenceChip language={language} label={t.openCsPage} url={program.references?.openCsUrl} />
          <ReferenceChip language={language} label={t.nichePage} url={program.references?.nicheUrl} />
        </div>
      </section>

      <section className="section-block">
        <h3>{t.fieldsIncluding}</h3>
        <dl className="info-list">
          {buildFieldRows(language, program).map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </section>

      {program.validation.valid ? null : (
        <section className="section-block warning-list">
          <h3>{t.validationDetails}</h3>
          <ul>
            {program.validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section-block">
        <h3>{t.campusMap}</h3>
        {mapEmbedUrl ? (
          <div className="map-embed-shell">
            <iframe
              title={`${program.schoolName} map`}
              src={mapEmbedUrl}
              className="map-embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <p className="map-unavailable">{t.mapUnavailable}</p>
        )}
      </section>
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

function getProgramOptionLabel(program: ProgramView): string {
  return `${program.schoolName} - ${program.programName}`;
}

function RankingChip({ language, program }: { language: Language; program: ProgramView | null }) {
  const t = translations[language].browser;
  const rank = program?.rankings?.csOpenRankings;
  const url = program?.references?.csOpenRankingsUrl;
  const tier = program?.openCsTier;
  const openCsUrl = program?.references?.openCsUrl;

  if (!Number.isFinite(rank)) {
    if (!tier) {
      return <span className="filter-chip-rank">{t.notAvailable}</span>;
    }

    if (!openCsUrl) {
      return <span className="filter-chip-rank">{tier}</span>;
    }

    return (
      <a
        className="filter-chip-rank"
        href={openCsUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${program.schoolName} OpenCS ${tier}`}
        title={`OpenCS ${tier}`}
      >
        {tier}
      </a>
    );
  }

  if (!url) {
    return <span className="filter-chip-rank">#{rank}</span>;
  }

  return (
    <a
      className="filter-chip-rank"
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${program.schoolName} ${t.rankingCsOpen} #${rank}`}
      title={`${t.rankingCsOpen} #${rank}`}
    >
      {`#${rank}`}
    </a>
  );
}

type FieldRow = {
  label: string;
  value: string;
};

function buildFieldRows(language: Language, program: ProgramView) {
  const t = translations[language].browser;
  const rankingValues = [
    typeof program.rankings?.usNewsUndergrad === "number"
      ? `${t.rankingUsNews} ${program.rankings.usNewsUndergrad}`
      : null,
    typeof program.rankings?.csrankings === "number"
      ? `${t.rankingCsrankings} ${program.rankings.csrankings}`
      : null,
    typeof program.rankings?.openCs === "number"
      ? `${t.rankingOpenCs} ${program.rankings.openCs}`
      : null,
    typeof program.rankings?.csOpenRankings === "number"
      ? `${t.rankingCsOpen} ${program.rankings.csOpenRankings}`
      : null,
    program.openCsTier ? `OpenCS Tier ${program.openCsTier}` : null,
  ].filter((value): value is string => Boolean(value));
  const rows: Array<FieldRow | null> = [
    Number.isFinite(program.tuitionTotalUsd)
      ? { label: t.tuition, value: `${formatDisplayCurrency(language, program.tuitionTotalUsd)} ${t.total}` }
      : Number.isFinite(program.tuitionPerCreditUsd)
        ? { label: t.tuition, value: `${formatDisplayCurrency(language, program.tuitionPerCreditUsd)} ${t.perCredit}` }
        : null,
    program.duration ? { label: t.duration, value: program.duration } : null,
    Number.isFinite(program.creditHours)
      ? { label: t.credits, value: formatDisplayNumber(language, program.creditHours) }
      : null,
    program.locationCity || program.locationState
      ? { label: t.location, value: formatLocation(language, program) }
      : null,
    Number.isFinite(program.employerDensity)
      ? { label: t.employerDensity, value: formatEmployerDensity(language, program.employerDensity) }
      : null,
    Number.isFinite(program.livingCostUsd)
      ? { label: t.livingCost, value: formatLivingCost(language, program.livingCostUsd) }
      : null,
    program.thesisOption ? { label: t.thesisOption, value: program.thesisOption } : null,
    program.researchIndustryLabel !== "N/A"
      ? {
          label: t.researchVsIndustryOrientation,
          value: getLocalizedResearchIndustryLabel(language, program.researchIndustryLabel),
        }
      : null,
    program.deliveryMode ? { label: t.deliveryMode, value: program.deliveryMode } : null,
    rankingValues.length > 0 ? { label: t.rankingInputs, value: rankingValues.join(" / ") } : null,
    program.notes?.length ? { label: t.notes, value: program.notes.join(" | ") } : null,
  ];

  return rows.filter((row): row is FieldRow => row !== null);
}

function ReferenceChip({
  language,
  label,
  url,
}: {
  language: Language;
  label: string;
  url?: string;
}) {
  if (!url) {
    return <span className="reference disabled">{label}: {translations[language].browser.notAvailable}</span>;
  }

  return (
    <a className="reference" href={url} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function RadarChart({
  language,
  program,
  activeAxis,
  onAxisHover,
}: {
  language: Language;
  program: ProgramView;
  activeAxis: RadarAxisKey;
  onAxisHover: (axis: RadarAxisKey) => void;
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
    <svg viewBox="0 0 220 220" className="radar-chart" aria-label={translations[language].browser.programRadarChart}>
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
              <span className="axis-label-text">{getAxisLabel(language, point.axis.key)}</span>
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
  language,
  leftProgram,
  rightProgram,
  activeAxis,
  onAxisHover,
}: {
  language: Language;
  leftProgram: ProgramView;
  rightProgram: ProgramView;
  activeAxis: RadarAxisKey;
  onAxisHover: (axis: RadarAxisKey) => void;
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
      aria-label={translations[language].browser.comparisonRadarChart}
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
              <span className="axis-label-text comparison-axis-text">
                {getAxisLabel(language, point.axis.key)}
              </span>
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
