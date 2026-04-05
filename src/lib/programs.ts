import programIndexJson from "@/data/programs/index.json";
import scoringConfigJson from "@/data/scoring-config.json";
import cmuProgramJson from "@/data/programs/cmu-mscs.json";
import stanfordProgramJson from "@/data/programs/stanford-mscs.json";
import uwProgramJson from "@/data/programs/uw-mscs.json";

export const RADAR_AXES = [
  { key: "prestigeScore" },
  { key: "majorScore" },
  { key: "difficultyScore" },
  { key: "locationScore" },
  { key: "cohortScore" },
  { key: "tuitionScore" },
] as const;

export const GRADE_ORDER = ["A", "B", "C", "D", "E"] as const;

type Grade = (typeof GRADE_ORDER)[number];
export type RadarAxisKey = (typeof RADAR_AXES)[number]["key"];
type LocationType = "city" | "suburb";

type Band = {
  max: number | null;
  grade: Grade;
};

type RankingSet = {
  usNewsUndergrad?: number;
  csrankings?: number;
  openCs?: number;
};

type ReferenceSet = {
  openCsUrl?: string;
  nicheUrl?: string;
};

export type ProgramRecord = {
  id: string;
  schoolName: string;
  programName: string;
  degreeType: string;
  locationCity?: string;
  locationState?: string;
  locationType?: string;
  duration?: string;
  creditHours?: number;
  deliveryMode?: string;
  thesisOption?: string;
  researchOrientation?: number;
  industryOrientation?: number;
  cohortSize?: number;
  tuitionTotalUsd?: number;
  tuitionPerCreditUsd?: number;
  references?: ReferenceSet;
  rankings?: RankingSet;
  notes?: string[];
};

type ProgramIndexEntry = {
  file: string;
};

type ProgramIndexResponse = {
  programs: ProgramIndexEntry[];
};

export type ScoringConfig = {
  rankings: {
    bands: Band[];
  };
  tuition: {
    estimatedCredits: number;
    bands: Band[];
  };
  cohortSize: {
    bands: Band[];
  };
  locationType: Record<LocationType, Grade>;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export type ProgramView = ProgramRecord & {
  validation: ValidationResult;
  researchIndustryLabel: string;
  radarScores: Record<RadarAxisKey, Grade | null>;
  radarDetails: Record<RadarAxisKey, string>;
};

const REQUIRED_STRING_FIELDS = ["id", "schoolName", "programName", "degreeType"] as const;
const LOCATION_TYPES = new Set<LocationType>(["city", "suburb"]);
const programIndexData = programIndexJson as ProgramIndexResponse;
const scoringConfigData = scoringConfigJson as ScoringConfig;

const programFiles: Record<string, ProgramRecord> = {
  "cmu-mscs.json": cmuProgramJson,
  "stanford-mscs.json": stanfordProgramJson,
  "uw-mscs.json": uwProgramJson,
};

export function loadProgramIndex(indexResponse: ProgramIndexResponse): ProgramIndexEntry[] {
  if (!Array.isArray(indexResponse?.programs)) {
    throw new Error("Program index must contain a programs array.");
  }

  return indexResponse.programs;
}

export function loadScoringConfig(configResponse: ScoringConfig): ScoringConfig {
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

export function validateProgramRecord(record: Partial<ProgramRecord>): ValidationResult {
  const errors: string[] = [];

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof record?.[field] !== "string" || record[field]?.trim() === "") {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  if (record?.locationType && !LOCATION_TYPES.has(record.locationType as LocationType)) {
    errors.push("locationType must be city or suburb");
  }

  for (const numericField of [
    "creditHours",
    "cohortSize",
    "tuitionTotalUsd",
    "tuitionPerCreditUsd",
  ] as const) {
    const value = record?.[numericField];
    if (
      value !== undefined &&
      value !== null &&
      (!Number.isFinite(value) || value < 0)
    ) {
      errors.push(`${numericField} must be a non-negative number when provided`);
    }
  }

  for (const rankingField of ["usNewsUndergrad", "csrankings", "openCs"] as const) {
    const value = record?.rankings?.[rankingField];
    if (value !== undefined && value !== null && (!Number.isInteger(value) || value <= 0)) {
      errors.push(`rankings.${rankingField} must be a positive integer when provided`);
    }
  }

  for (const linkField of ["openCsUrl", "nicheUrl"] as const) {
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

  return { valid: errors.length === 0, errors };
}

export function deriveProgramView(record: ProgramRecord, scoringConfig: ScoringConfig): ProgramView {
  const validation = validateProgramRecord(record);

  return {
    ...record,
    validation,
    researchIndustryLabel: getResearchIndustryLabel(
      record.researchOrientation,
      record.industryOrientation,
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
        scoringConfig,
      ),
    },
    radarDetails: {
      prestigeScore: formatRadarDetail(
        "US News undergrad rank",
        formatRankDetail(record.rankings?.usNewsUndergrad),
      ),
      majorScore: formatRadarDetail(
        "CSRankings rank",
        formatRankDetail(record.rankings?.csrankings),
      ),
      difficultyScore: formatRadarDetail("OpenCS rank", formatRankDetail(record.rankings?.openCs)),
      locationScore: formatRadarDetail("Location", formatLocationDetail(record)),
      cohortScore: formatRadarDetail("Cohort size", formatCountDetail(record.cohortSize, "students")),
      tuitionScore: formatRadarDetail("Tuition", formatTuitionDetail(record, scoringConfig)),
    },
  };
}

export function getResearchIndustryLabel(
  researchOrientation?: number,
  industryOrientation?: number,
): string {
  if (!Number.isFinite(researchOrientation) || !Number.isFinite(industryOrientation)) {
    return "N/A";
  }

  const researchValue = researchOrientation as number;
  const industryValue = industryOrientation as number;
  const delta = researchValue - industryValue;
  if (delta >= 0.2) return "Research-leaning";
  if (delta <= -0.2) return "Industry-leaning";
  return "Balanced";
}

export function gradeToValue(grade: Grade | null | undefined): number | null {
  const index = grade ? GRADE_ORDER.indexOf(grade) : -1;
  return index === -1 ? null : GRADE_ORDER.length - index;
}

export function gradeFromRank(rank: number | undefined, scoringConfig: ScoringConfig): Grade | null {
  if (typeof rank !== "number" || !Number.isInteger(rank)) return null;
  const rankValue: number = rank;
  if (rankValue <= 0) return null;
  return gradeFromBands(rankValue, scoringConfig.rankings.bands);
}

export function gradeFromLocation(
  locationType: string | undefined,
  scoringConfig: ScoringConfig,
): Grade | null {
  if (!locationType) return null;
  if (!LOCATION_TYPES.has(locationType as LocationType)) return null;
  return scoringConfig.locationType[locationType as LocationType] ?? null;
}

export function gradeFromCohortSize(
  cohortSize: number | undefined,
  scoringConfig: ScoringConfig,
): Grade | null {
  if (typeof cohortSize !== "number" || !Number.isFinite(cohortSize)) return null;
  const cohortValue: number = cohortSize;
  if (cohortValue <= 0) return null;
  return gradeFromBands(cohortValue, scoringConfig.cohortSize.bands);
}

export function gradeFromTuition(
  totalUsd: number | undefined,
  perCreditUsd: number | undefined,
  scoringConfig: ScoringConfig,
): Grade | null {
  const totalValue = typeof totalUsd === "number" && Number.isFinite(totalUsd) ? totalUsd : null;
  const perCreditValue =
    typeof perCreditUsd === "number" && Number.isFinite(perCreditUsd) ? perCreditUsd : null;
  const baseline =
    totalValue ??
    (perCreditValue !== null
      ? perCreditValue * scoringConfig.tuition.estimatedCredits
      : null);

  if (typeof baseline !== "number" || !Number.isFinite(baseline) || baseline <= 0) {
    return null;
  }

  return gradeFromBands(baseline, scoringConfig.tuition.bands);
}

export function gradeFromBands(value: number, bands: Band[]): Grade | null {
  for (const band of bands) {
    if (band.max === null || value <= band.max) {
      return band.grade;
    }
  }
  return null;
}

export function formatCurrency(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-US").format(value);
}

export function getPrograms(): ProgramView[] {
  const scoringConfig = loadScoringConfig(scoringConfigData);
  const entries = loadProgramIndex(programIndexData);

  return entries.map((entry) => {
    const record = programFiles[entry.file];

    if (!record) {
      throw new Error(`Program file "${entry.file}" is missing from the local dataset.`);
    }

    return deriveProgramView(record, scoringConfig);
  });
}

export function getScoringConfig(): ScoringConfig {
  return loadScoringConfig(scoringConfigData);
}

function validateBands(bands: Band[] | undefined, path: string) {
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

function formatRadarDetail(label: string, value: string): string {
  return `${label}: ${value}`;
}

function formatRankDetail(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  return `#${formatNumber(value)}`;
}

function formatCountDetail(value: number | undefined, unit: string): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${formatNumber(value)} ${unit}`;
}

function formatLocationDetail(record: ProgramRecord): string {
  const city = record.locationCity ?? "N/A";
  const state = record.locationState ? `, ${record.locationState}` : "";
  const type = record.locationType ? ` (${record.locationType})` : "";
  return `${city}${state}${type}`;
}

function formatTuitionDetail(record: ProgramRecord, scoringConfig: ScoringConfig): string {
  if (typeof record.tuitionTotalUsd === "number" && Number.isFinite(record.tuitionTotalUsd)) {
    return `${formatCurrency(record.tuitionTotalUsd)} total`;
  }

  if (
    typeof record.tuitionPerCreditUsd === "number" &&
    Number.isFinite(record.tuitionPerCreditUsd)
  ) {
    const estimatedTotal = record.tuitionPerCreditUsd * scoringConfig.tuition.estimatedCredits;
    return `${formatCurrency(record.tuitionPerCreditUsd)} per credit (${formatCurrency(estimatedTotal)} estimated total)`;
  }

  return "N/A";
}
