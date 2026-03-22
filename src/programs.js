export const RADAR_AXES = [
  { key: "prestigeScore", label: "Prestigious" },
  { key: "majorScore", label: "Major ranking" },
  { key: "difficultyScore", label: "How hard it is" },
  { key: "locationScore", label: "Location" },
  { key: "cohortScore", label: "Cohort size" },
  { key: "tuitionScore", label: "Tuition costs" }
];

export const GRADE_ORDER = ["A", "B", "C", "D", "E"];

const REQUIRED_STRING_FIELDS = ["id", "schoolName", "programName", "degreeType"];
const LOCATION_TYPES = new Set(["city", "suburb"]);

export function loadProgramIndex(indexResponse) {
  if (!Array.isArray(indexResponse?.programs)) {
    throw new Error("Program index must contain a programs array.");
  }
  return indexResponse.programs;
}

export function loadScoringConfig(configResponse) {
  if (!configResponse || typeof configResponse !== "object") {
    throw new Error("Scoring config must be an object.");
  }

  validateBands(configResponse.rankings?.bands, "rankings.bands");
  validateBands(configResponse.tuition?.bands, "tuition.bands");
  validateBands(configResponse.cohortSize?.bands, "cohortSize.bands");

  if (
    !configResponse.locationType ||
    typeof configResponse.locationType.city !== "string" ||
    typeof configResponse.locationType.suburb !== "string"
  ) {
    throw new Error("Scoring config must define locationType.city and locationType.suburb.");
  }

  return configResponse;
}

export function validateProgramRecord(record) {
  const errors = [];

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof record?.[field] !== "string" || record[field].trim() === "") {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  if (record?.locationType && !LOCATION_TYPES.has(record.locationType)) {
    errors.push("locationType must be city or suburb");
  }

  for (const numericField of [
    "creditHours",
    "cohortSize",
    "tuitionTotalUsd",
    "tuitionPerCreditUsd"
  ]) {
    if (
      record?.[numericField] !== undefined &&
      record[numericField] !== null &&
      (!Number.isFinite(record[numericField]) || record[numericField] < 0)
    ) {
      errors.push(`${numericField} must be a non-negative number when provided`);
    }
  }

  for (const rankingField of ["usNewsUndergrad", "csrankings", "openCs"]) {
    const value = record?.rankings?.[rankingField];
    if (value !== undefined && value !== null && (!Number.isInteger(value) || value <= 0)) {
      errors.push(`rankings.${rankingField} must be a positive integer when provided`);
    }
  }

  for (const linkField of ["openCsUrl", "nicheUrl"]) {
    const value = record?.references?.[linkField];
    if (value !== undefined && value !== null && typeof value !== "string") {
      errors.push(`references.${linkField} must be a string when provided`);
    }
  }

  if (
    record?.researchOrientation !== undefined &&
    (!Number.isFinite(record.researchOrientation) ||
      record.researchOrientation < 0 ||
      record.researchOrientation > 1)
  ) {
    errors.push("researchOrientation must be a number between 0 and 1");
  }

  if (
    record?.industryOrientation !== undefined &&
    (!Number.isFinite(record.industryOrientation) ||
      record.industryOrientation < 0 ||
      record.industryOrientation > 1)
  ) {
    errors.push("industryOrientation must be a number between 0 and 1");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function deriveProgramView(record, scoringConfig) {
  const validation = validateProgramRecord(record);

  return {
    ...record,
    validation,
    researchIndustryLabel: getResearchIndustryLabel(
      record.researchOrientation,
      record.industryOrientation
    ),
    radarScores: {
      prestigeScore: gradeFromRank(record.rankings?.usNewsUndergrad, scoringConfig),
      majorScore: gradeFromRank(record.rankings?.csrankings, scoringConfig),
      difficultyScore: gradeFromRank(record.rankings?.openCs, scoringConfig),
      locationScore: gradeFromLocation(record.locationType, scoringConfig),
      cohortScore: gradeFromCohortSize(record.cohortSize, scoringConfig),
      tuitionScore: gradeFromTuition(
        record.tuitionTotalUsd,
        record.tuitionPerCreditUsd,
        scoringConfig
      )
    }
  };
}

export function getResearchIndustryLabel(researchOrientation, industryOrientation) {
  if (!Number.isFinite(researchOrientation) || !Number.isFinite(industryOrientation)) {
    return "N/A";
  }

  const delta = researchOrientation - industryOrientation;
  if (delta >= 0.2) return "Research-leaning";
  if (delta <= -0.2) return "Industry-leaning";
  return "Balanced";
}

export function gradeToValue(grade) {
  const index = GRADE_ORDER.indexOf(grade);
  return index === -1 ? null : GRADE_ORDER.length - index;
}

export function gradeFromRank(rank, scoringConfig) {
  if (!Number.isInteger(rank) || rank <= 0) return null;
  return gradeFromBands(rank, scoringConfig.rankings.bands);
}

export function gradeFromLocation(locationType, scoringConfig) {
  if (!locationType) return null;
  return scoringConfig.locationType[locationType] ?? null;
}

export function gradeFromCohortSize(cohortSize, scoringConfig) {
  if (!Number.isFinite(cohortSize) || cohortSize <= 0) return null;
  return gradeFromBands(cohortSize, scoringConfig.cohortSize.bands);
}

export function gradeFromTuition(totalUsd, perCreditUsd, scoringConfig) {
  const baseline = Number.isFinite(totalUsd)
    ? totalUsd
    : Number.isFinite(perCreditUsd)
      ? perCreditUsd * scoringConfig.tuition.estimatedCredits
      : null;

  if (!Number.isFinite(baseline) || baseline <= 0) return null;
  return gradeFromBands(baseline, scoringConfig.tuition.bands);
}

export function gradeFromBands(value, bands) {
  for (const band of bands) {
    if (band.max === null || value <= band.max) {
      return band.grade;
    }
  }
  return null;
}

function validateBands(bands, path) {
  if (!Array.isArray(bands) || bands.length === 0) {
    throw new Error(`${path} must be a non-empty array.`);
  }

  for (const band of bands) {
    const gradeValid = typeof band?.grade === "string" && GRADE_ORDER.includes(band.grade);
    const maxValid = band?.max === null || (Number.isFinite(band?.max) && band.max > 0);

    if (!gradeValid || !maxValid) {
      throw new Error(`${path} entries must contain a valid grade and positive max or null.`);
    }
  }
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-US").format(value);
}
