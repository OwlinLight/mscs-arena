import {
  RADAR_AXES,
  deriveProgramView,
  formatCurrency,
  formatNumber,
  gradeToValue,
  loadProgramIndex,
  loadScoringConfig
} from "./src/programs.js";

const app = document.querySelector("#app");

void init();

async function init() {
  try {
    const scoringResponse = await fetch("./data/scoring-config.json");
    const scoringConfig = loadScoringConfig(await scoringResponse.json());
    const indexResponse = await fetch("./data/programs/index.json");
    const index = loadProgramIndex(await indexResponse.json());
    const programs = await Promise.all(
      index.map(async (entry) => {
        const response = await fetch(`./data/programs/${entry.file}`);
        return deriveProgramView(await response.json(), scoringConfig);
      })
    );

    renderApp(programs, scoringConfig);
  } catch (error) {
    app.innerHTML = `
      <section class="empty-state">
        <h2>Unable to load program data</h2>
        <p>${escapeHtml(error.message)}</p>
      </section>
    `;
  }
}

function renderApp(programs, scoringConfig) {
  const invalidPrograms = programs.filter((program) => !program.validation.valid);
  const cards = programs.map(renderProgramCard).join("");

  app.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">MSCS Arena</p>
        <h1>Compare CS master’s programs with consistent local data and transparent scoring.</h1>
      </div>
      <div class="hero-panel">
        <p>Every radar axis is normalized onto an A-E scale, where A is the most comparison-favorable outcome for that dimension.</p>
        <p class="config-caption">Scoring rules are loaded from <code>data/scoring-config.json</code>.</p>
        <ul class="legend-list">
          ${RADAR_AXES.map((axis) => `<li>${axis.label}</li>`).join("")}
        </ul>
      </div>
    </section>
    ${
      invalidPrograms.length
        ? `
      <section class="validation-banner">
        <strong>${invalidPrograms.length} record(s) have validation warnings.</strong>
        <span>They still render, but the UI flags the affected programs.</span>
      </section>
    `
        : ""
    }
    <section class="program-grid">${cards}</section>
  `;
}

function renderProgramCard(program) {
  const notes = Array.isArray(program.notes) ? program.notes : [];

  return `
    <article class="program-card">
      <header class="program-header">
        <div>
          <p class="program-school">${escapeHtml(program.schoolName)}</p>
          <h2>${escapeHtml(program.programName)}</h2>
          <p class="program-degree">${escapeHtml(program.degreeType)}</p>
        </div>
        ${
          program.validation.valid
            ? ""
            : `<span class="warning-badge">Validation warnings</span>`
        }
      </header>

      <section class="section-block">
        <h3>Basic program info</h3>
        <dl class="info-list">
          ${renderInfoRow("Location", formatLocation(program))}
          ${renderInfoRow("Duration / Credits", formatDuration(program))}
          ${renderInfoRow("Thesis", program.thesisOption || "N/A")}
          ${renderInfoRow(
            "Research vs Industry",
            `${program.researchIndustryLabel} - course design & thesis requirement`
          )}
          ${renderInfoRow("Delivery mode", program.deliveryMode || "N/A")}
        </dl>
      </section>

      <section class="section-block">
        <h3>Radar chart including (map to ABCDE)</h3>
        <div class="chart-wrap">
          ${renderRadarChart(program.radarScores)}
          <ul class="score-list">
            ${RADAR_AXES.map((axis) => {
              const grade = program.radarScores[axis.key] ?? "N/A";
              return `<li><span>${axis.label}</span><strong>${grade}</strong></li>`;
            }).join("")}
          </ul>
        </div>
      </section>

      <section class="section-block">
        <h3>Reference</h3>
        <div class="reference-list">
          ${renderReference("OpenCS Page", program.references?.openCsUrl)}
          ${renderReference("Niche Page", program.references?.nicheUrl)}
        </div>
      </section>

      <section class="section-block">
        <h3>Fields including</h3>
        <dl class="info-list">
          ${renderInfoRow(
            "Tuition",
            Number.isFinite(program.tuitionTotalUsd)
              ? `${formatCurrency(program.tuitionTotalUsd)} total`
              : Number.isFinite(program.tuitionPerCreditUsd)
                ? `${formatCurrency(program.tuitionPerCreditUsd)} per credit`
                : "N/A"
          )}
          ${renderInfoRow("Duration", program.duration || "N/A")}
          ${renderInfoRow("Credits", formatNumber(program.creditHours))}
          ${renderInfoRow("Location", formatLocation(program))}
          ${renderInfoRow("Cohort size", formatNumber(program.cohortSize))}
          ${renderInfoRow("Thesis option", program.thesisOption || "N/A")}
          ${renderInfoRow("Research vs industry orientation", program.researchIndustryLabel)}
          ${renderInfoRow("Delivery mode", program.deliveryMode || "N/A")}
          ${renderInfoRow(
            "Ranking inputs",
            [
              `US News ${program.rankings?.usNewsUndergrad ?? "N/A"}`,
              `CSRankings ${program.rankings?.csrankings ?? "N/A"}`,
              `OpenCS ${program.rankings?.openCs ?? "N/A"}`
            ].join(" / ")
          )}
          ${renderInfoRow(
            "Notes",
            notes.length ? escapeHtml(notes.join(" | ")) : "N/A"
          )}
        </dl>
      </section>

      ${
        program.validation.valid
          ? ""
          : `
        <section class="section-block warning-list">
          <h3>Validation details</h3>
          <ul>
            ${program.validation.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
          </ul>
        </section>
      `
      }
    </article>
  `;
}

function renderInfoRow(label, value) {
  return `
    <div class="info-row">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function renderReference(label, url) {
  if (!url) {
    return `<span class="reference disabled">${escapeHtml(label)}: N/A</span>`;
  }

  return `
    <a class="reference" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">
      ${escapeHtml(label)}
    </a>
  `;
}

function renderRadarChart(scores) {
  const center = 110;
  const radius = 72;
  const levels = 5;
  const points = RADAR_AXES.map((axis, index) => {
    const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
    const value = gradeToValue(scores[axis.key]);
    const scaledRadius = value ? (radius * value) / levels : null;
    const x = center + Math.cos(angle) * (scaledRadius ?? 0);
    const y = center + Math.sin(angle) * (scaledRadius ?? 0);
    const labelX = center + Math.cos(angle) * (radius + 24);
    const labelY = center + Math.sin(angle) * (radius + 24);

    return { angle, axis, x, y, labelX, labelY, value };
  });

  const polygonPoints = points
    .filter((point) => point.value)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const rings = Array.from({ length: levels }, (_, index) => {
    const ringRadius = ((index + 1) * radius) / levels;
    const ringPoints = points
      .map((point) => {
        const x = center + Math.cos(point.angle) * ringRadius;
        const y = center + Math.sin(point.angle) * ringRadius;
        return `${x},${y}`;
      })
      .join(" ");

    return `<polygon points="${ringPoints}" class="grid-ring" />`;
  }).join("");

  const axes = points
    .map(
      (point) => `
      <line x1="${center}" y1="${center}" x2="${center + Math.cos(point.angle) * radius}" y2="${center + Math.sin(point.angle) * radius}" class="grid-axis" />
      <text x="${point.labelX}" y="${point.labelY}" class="axis-label">${escapeHtml(point.axis.label)}</text>
    `
    )
    .join("");

  const dots = points
    .filter((point) => point.value)
    .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" class="data-dot" />`)
    .join("");

  return `
    <svg viewBox="0 0 220 220" class="radar-chart" aria-label="Program radar chart">
      ${rings}
      ${axes}
      ${
        polygonPoints
          ? `<polygon points="${polygonPoints}" class="data-area" />`
          : ""
      }
      ${dots}
    </svg>
  `;
}

function formatLocation(program) {
  const city = program.locationCity || "N/A";
  const state = program.locationState || "";
  const type = program.locationType ? ` (${program.locationType})` : "";
  return `${city}${state ? `, ${state}` : ""}${type}`;
}

function formatDuration(program) {
  const duration = program.duration || "N/A";
  const credits = Number.isFinite(program.creditHours)
    ? `${formatNumber(program.creditHours)} credits`
    : "N/A credits";
  return `${duration} / ${credits}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
