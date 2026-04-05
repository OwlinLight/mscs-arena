import test from "node:test";
import assert from "node:assert/strict";

import scoringConfigJson from "@/data/scoring-config.json";
import {
  deriveProgramView,
  getPrograms,
  gradeFromAcceptanceRate,
  gradeFromBands,
  gradeFromEmployerDensity,
  gradeFromLivingCost,
  gradeFromRank,
  gradeFromTuition,
  gradeToValue,
  loadScoringConfig,
  validateProgramRecord,
} from "@/src/lib/programs";

const scoringConfig = loadScoringConfig(scoringConfigJson as Parameters<typeof loadScoringConfig>[0]);

test("validateProgramRecord accepts a complete record", () => {
  const record = {
    id: "demo",
    schoolName: "Demo University",
    programName: "MS Computer Science",
    degreeType: "MS",
    acceptanceRate: 12,
    employerDensity: 180,
    locationType: "city",
    creditHours: 30,
    livingCostUsd: 2400,
    tuitionTotalUsd: 28000,
    researchOrientation: 0.6,
    industryOrientation: 0.4,
    references: {
      openCsUrl: "https://example.com/opencs",
      nicheUrl: "https://example.com/niche",
      csOpenRankingsUrl: "https://example.com/csopenrankings",
    },
    rankings: {
      usNewsUndergrad: 10,
      csrankings: 12,
      openCs: 25,
      csOpenRankings: 18,
    },
  };

  assert.deepEqual(validateProgramRecord(record), { valid: true, errors: [] });
});

test("validateProgramRecord allows partial records but rejects malformed numeric data", () => {
  const record = {
    id: "partial",
    schoolName: "Partial U",
    programName: "MSCS",
    degreeType: "MS",
    employerDensity: -1,
    locationType: "rural",
    livingCostUsd: -1,
    tuitionTotalUsd: -1,
    rankings: {
      usNewsUndergrad: 0,
    },
  };

  const result = validateProgramRecord(record);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /employerDensity/);
  assert.match(result.errors.join(" "), /livingCostUsd/);
  assert.match(result.errors.join(" "), /tuitionTotalUsd/);
  assert.match(result.errors.join(" "), /rankings\.usNewsUndergrad/);
});

test("ranking buckets map to A-E", () => {
  assert.equal(gradeFromRank(1, scoringConfig), "A");
  assert.equal(gradeFromRank(20, scoringConfig), "B");
  assert.equal(gradeFromRank(40, scoringConfig), "C");
  assert.equal(gradeFromRank(70, scoringConfig), "D");
  assert.equal(gradeFromRank(120, scoringConfig), "E");
  assert.equal(gradeFromRank(undefined, scoringConfig), null);
});

test("acceptance rate buckets map lower rates to better grades", () => {
  assert.equal(gradeFromAcceptanceRate(4, scoringConfig), "A");
  assert.equal(gradeFromAcceptanceRate(8, scoringConfig), "B");
  assert.equal(gradeFromAcceptanceRate(18, scoringConfig), "C");
  assert.equal(gradeFromAcceptanceRate(30, scoringConfig), "D");
  assert.equal(gradeFromAcceptanceRate(55, scoringConfig), "E");
  assert.equal(gradeFromAcceptanceRate(undefined, scoringConfig), null);
});

test("tuition, living cost, and employer density map to grade buckets", () => {
  assert.equal(gradeFromTuition(25000, undefined, scoringConfig), "A");
  assert.equal(gradeFromTuition(45000, undefined, scoringConfig), "B");
  assert.equal(gradeFromTuition(65000, undefined, scoringConfig), "C");
  assert.equal(gradeFromTuition(85000, undefined, scoringConfig), "D");
  assert.equal(gradeFromTuition(105000, undefined, scoringConfig), "E");

  assert.equal(gradeFromLivingCost(1200, scoringConfig), "A");
  assert.equal(gradeFromLivingCost(2200, scoringConfig), "B");
  assert.equal(gradeFromLivingCost(3200, scoringConfig), "C");
  assert.equal(gradeFromLivingCost(4200, scoringConfig), "D");
  assert.equal(gradeFromLivingCost(5200, scoringConfig), "E");
  assert.equal(gradeFromLivingCost(undefined, scoringConfig), null);

  assert.equal(gradeFromEmployerDensity(30, scoringConfig), "E");
  assert.equal(gradeFromEmployerDensity(80, scoringConfig), "D");
  assert.equal(gradeFromEmployerDensity(150, scoringConfig), "C");
  assert.equal(gradeFromEmployerDensity(300, scoringConfig), "B");
  assert.equal(gradeFromEmployerDensity(500, scoringConfig), "A");
  assert.equal(gradeFromEmployerDensity(undefined, scoringConfig), null);
});

test("loadScoringConfig rejects malformed mapping config", () => {
  assert.throws(
    () =>
      loadScoringConfig({
        rankings: { bands: [] },
        acceptanceRate: { bands: [{ max: 1, grade: "A" }] },
        employerDensity: { bands: [{ max: 1, grade: "A" }] },
        tuition: { bands: [{ max: 1, grade: "A" }], estimatedCredits: 30 },
        livingCost: { bands: [{ max: 1, grade: "A" }] },
      }),
    /rankings\.bands/,
  );
});

test("gradeFromBands supports reusable external mapping rules", () => {
  assert.equal(
    gradeFromBands(15, [
      { max: 10, grade: "A" },
      { max: 20, grade: "B" },
      { max: null, grade: "E" },
    ]),
    "B",
  );
});

test("deriveProgramView creates a research vs industry label and radar scores", () => {
  const result = deriveProgramView(
    {
      id: "label",
      schoolName: "Label U",
      programName: "MSCS",
      degreeType: "MS",
      acceptanceRate: 28,
      employerDensity: 240,
      locationType: "city",
      livingCostUsd: 2600,
      researchOrientation: 0.8,
      industryOrientation: 0.3,
      tuitionPerCreditUsd: 1000,
      rankings: {
        usNewsUndergrad: 8,
        csrankings: 18,
        openCs: 50,
      },
    },
    scoringConfig,
  );

  assert.equal(result.researchIndustryLabel, "Research-leaning");
  assert.deepEqual(result.radarScores, {
    prestigeScore: "A",
    majorScore: "B",
    difficultyScore: "D",
    locationScore: "B",
    livingCostScore: "C",
    tuitionScore: "A",
  });
  assert.equal(result.radarDetails.prestigeScore, "US News undergrad rank: #8");
  assert.equal(result.radarDetails.difficultyScore, "Acceptance rate: 28%");
  assert.equal(result.radarDetails.locationScore, "Employer density: 240");
  assert.equal(result.radarDetails.livingCostScore, "Living cost: $2,600 / month");
  assert.equal(result.radarDetails.tuitionScore, "Tuition: $1,000 per credit ($30,000 estimated total)");
});

test("gradeToValue maps A-E and returns null for missing grades", () => {
  assert.equal(gradeToValue("A"), 5);
  assert.equal(gradeToValue("C"), 3);
  assert.equal(gradeToValue("E"), 1);
  assert.equal(gradeToValue(null), null);
});

test("getPrograms loads all indexed programs and preserves missing-data warnings", () => {
  const programs = getPrograms();

  assert.equal(programs.length, 3);
  assert.equal(programs[0]?.schoolName, "Stanford University");
  assert.equal(programs[2]?.radarScores.livingCostScore, null);
  assert.equal(programs.every((program) => program.validation.valid), true);
});
