import test from "node:test";
import assert from "node:assert/strict";

import scoringConfigJson from "@/data/scoring-config.json";
import {
  deriveProgramView,
  getPrograms,
  gradeFromBands,
  gradeFromCohortSize,
  gradeFromLocation,
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
    locationType: "city",
    creditHours: 30,
    cohortSize: 50,
    tuitionTotalUsd: 28000,
    researchOrientation: 0.6,
    industryOrientation: 0.4,
    references: {
      openCsUrl: "https://example.com/opencs",
      nicheUrl: "https://example.com/niche",
    },
    rankings: {
      usNewsUndergrad: 10,
      csrankings: 12,
      openCs: 25,
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
    locationType: "rural",
    tuitionTotalUsd: -1,
    rankings: {
      usNewsUndergrad: 0,
    },
  };

  const result = validateProgramRecord(record);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /locationType/);
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

test("tuition, cohort size, and location map to grade buckets", () => {
  assert.equal(gradeFromTuition(25000, undefined, scoringConfig), "A");
  assert.equal(gradeFromTuition(45000, undefined, scoringConfig), "B");
  assert.equal(gradeFromTuition(65000, undefined, scoringConfig), "C");
  assert.equal(gradeFromTuition(85000, undefined, scoringConfig), "D");
  assert.equal(gradeFromTuition(105000, undefined, scoringConfig), "E");

  assert.equal(gradeFromCohortSize(40, scoringConfig), "A");
  assert.equal(gradeFromCohortSize(110, scoringConfig), "B");
  assert.equal(gradeFromCohortSize(180, scoringConfig), "C");
  assert.equal(gradeFromCohortSize(260, scoringConfig), "D");
  assert.equal(gradeFromCohortSize(360, scoringConfig), "E");

  assert.equal(gradeFromLocation("city", scoringConfig), "A");
  assert.equal(gradeFromLocation("suburb", scoringConfig), "C");
  assert.equal(gradeFromLocation(undefined, scoringConfig), null);
});

test("loadScoringConfig rejects malformed mapping config", () => {
  assert.throws(
    () =>
      loadScoringConfig({
        rankings: { bands: [] },
        tuition: { bands: [{ max: 1, grade: "A" }], estimatedCredits: 30 },
        cohortSize: { bands: [{ max: 1, grade: "A" }] },
        locationType: { city: "A" } as never,
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
      locationType: "city",
      researchOrientation: 0.8,
      industryOrientation: 0.3,
      tuitionPerCreditUsd: 1000,
      cohortSize: 75,
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
    locationScore: "A",
    cohortScore: "B",
    tuitionScore: "A",
  });
  assert.equal(result.radarDetails.prestigeScore, "US News undergrad rank: #8");
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
  assert.equal(programs[2]?.radarScores.cohortScore, null);
  assert.equal(programs.every((program) => program.validation.valid), true);
});
