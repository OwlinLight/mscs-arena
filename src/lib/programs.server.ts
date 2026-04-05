import fs from "node:fs";
import path from "node:path";

import programIndexJson from "@/data/programs/index.json";
import scoringConfigJson from "@/data/scoring-config.json";
import {
  deriveProgramView,
  loadProgramIndex,
  loadScoringConfig,
  type ProgramRecord,
  type ProgramView,
  type ScoringConfig,
} from "@/src/lib/programs";

type ProgramIndexEntry = {
  file: string;
};

type ProgramIndexResponse = {
  programs: ProgramIndexEntry[];
};

const programIndexData = programIndexJson as ProgramIndexResponse;
const scoringConfigData = scoringConfigJson as ScoringConfig;

const CITY_BASELINES = {
  "Princeton|NJ": { employerDensity: 180, livingCostUsd: 2300 },
  "Stanford|CA": { employerDensity: 220, livingCostUsd: 3200 },
  "Pittsburgh|PA": { employerDensity: 140, livingCostUsd: 2100 },
  "Austin|TX": { employerDensity: 260, livingCostUsd: 1800 },
  "New Haven|CT": { employerDensity: 120, livingCostUsd: 1900 },
  "Ithaca|NY": { employerDensity: 90, livingCostUsd: 1800 },
  "Los Angeles|CA": { employerDensity: 300, livingCostUsd: 2500 },
  "Champaign|IL": { employerDensity: 70, livingCostUsd: 1400 },
  "Ann Arbor|MI": { employerDensity: 130, livingCostUsd: 1800 },
  "Madison|WI": { employerDensity: 110, livingCostUsd: 1600 },
  "Berkeley|CA": { employerDensity: 320, livingCostUsd: 2900 },
  "New York|NY": { employerDensity: 400, livingCostUsd: 3200 },
  "Durham|NC": { employerDensity: 120, livingCostUsd: 1700 },
  "Atlanta|GA": { employerDensity: 240, livingCostUsd: 1700 },
  "Evanston|IL": { employerDensity: 220, livingCostUsd: 2100 },
  "Vancouver|BC": { employerDensity: 200, livingCostUsd: 2600 },
  "College Park|MD": { employerDensity: 240, livingCostUsd: 2100 },
  "Santa Clara|CA": { employerDensity: 320, livingCostUsd: 2800 },
  "San Diego|CA": { employerDensity: 280, livingCostUsd: 2400 },
  "Providence|RI": { employerDensity: 140, livingCostUsd: 1900 },
  "Hanover|NH": { employerDensity: 60, livingCostUsd: 1800 },
  "Houston|TX": { employerDensity: 230, livingCostUsd: 1600 },
  "Santa Barbara|CA": { employerDensity: 150, livingCostUsd: 2300 },
  "Chicago|IL": { employerDensity: 260, livingCostUsd: 2200 },
  "Seattle|WA": { employerDensity: 380, livingCostUsd: 2400 },
} as const;

const PROGRAM_DEFAULTS: Record<string, Partial<ProgramRecord>> = {
  "princeton-msecs": {
    openCsTier: "SSS",
    locationCity: "Princeton",
    locationState: "NJ",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "stanford-mscs": { openCsTier: "SSS" },
  "cmu-mscs": { openCsTier: "SS" },
  "ut-austin-mscs": {
    openCsTier: "SS",
    locationCity: "Austin",
    locationState: "TX",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "yale-two-year-mscs": {
    openCsTier: "SS",
    locationCity: "New Haven",
    locationState: "CT",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "cornell-cs-meng": {
    openCsTier: "S",
    locationCity: "Ithaca",
    locationState: "NY",
    duration: "2 semesters",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "ucla-mscs": {
    openCsTier: "S",
    locationCity: "Los Angeles",
    locationState: "CA",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "uiuc-mscs": {
    openCsTier: "S",
    locationCity: "Champaign",
    locationState: "IL",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "umich-mscse": {
    openCsTier: "S",
    locationCity: "Ann Arbor",
    locationState: "MI",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "wisc-mscs": {
    openCsTier: "S",
    locationCity: "Madison",
    locationState: "WI",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "berkeley-eecs-meng": {
    openCsTier: "A+",
    locationCity: "Berkeley",
    locationState: "CA",
    duration: "1 year",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "cmu-msin": {
    openCsTier: "A+",
    locationCity: "Pittsburgh",
    locationState: "PA",
    duration: "16 months",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "cornell-tech-cs-meng": {
    openCsTier: "A+",
    locationCity: "New York",
    locationState: "NY",
    duration: "1 year",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "duke-mscs": {
    openCsTier: "A+",
    locationCity: "Durham",
    locationState: "NC",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "gatech-mscs": {
    openCsTier: "A+",
    locationCity: "Atlanta",
    locationState: "GA",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "northwestern-mscs": {
    openCsTier: "A+",
    locationCity: "Evanston",
    locationState: "IL",
    duration: "15 months",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "ubc-mscs": {
    openCsTier: "A+",
    locationCity: "Vancouver",
    locationState: "BC",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "uiuc-mcs": {
    openCsTier: "A+",
    locationCity: "Champaign",
    locationState: "IL",
    duration: "3 semesters",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "umd-mscs": {
    openCsTier: "A+",
    locationCity: "College Park",
    locationState: "MD",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "cmu-sesv": {
    openCsTier: "A",
    locationCity: "Santa Clara",
    locationState: "CA",
    duration: "16 months",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "ucsd-cs75": {
    openCsTier: "A",
    locationCity: "San Diego",
    locationState: "CA",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "brown-scm-cs": {
    openCsTier: "A-",
    locationCity: "Providence",
    locationState: "RI",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "columbia-mscs": {
    openCsTier: "A-",
    locationCity: "New York",
    locationState: "NY",
    duration: "1.5 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "dartmouth-mscs": {
    openCsTier: "A-",
    locationCity: "Hanover",
    locationState: "NH",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "rice-mcs": {
    openCsTier: "A-",
    locationCity: "Houston",
    locationState: "TX",
    duration: "3 semesters",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "ucsb-mscs": {
    openCsTier: "A-",
    locationCity: "Santa Barbara",
    locationState: "CA",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "uchicago-mpcs": {
    openCsTier: "A-",
    locationCity: "Chicago",
    locationState: "IL",
    duration: "15 months",
    deliveryMode: "On campus",
    thesisOption: "No thesis",
  },
  "nyu-courant-mscs": {
    openCsTier: "B+",
    locationCity: "New York",
    locationState: "NY",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "nyu-tandon-mscs": {
    openCsTier: "B+",
    locationCity: "New York",
    locationState: "NY",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "usc-cs28": {
    openCsTier: "B+",
    locationCity: "Los Angeles",
    locationState: "CA",
    duration: "2 years",
    deliveryMode: "On campus",
    thesisOption: "Thesis optional",
  },
  "uw-mscs": {
    openCsTier: "S",
    livingCostUsd: 2400,
  },
} as const;

export function getPrograms(): ProgramView[] {
  const scoringConfig = loadScoringConfig(scoringConfigData);
  const entries = loadProgramIndex(programIndexData);

  return entries.map((entry) => deriveProgramView(applyProgramDefaults(loadProgramFile(entry.file)), scoringConfig));
}

export function getScoringConfig(): ScoringConfig {
  return loadScoringConfig(scoringConfigData);
}

function loadProgramFile(fileName: string): ProgramRecord {
  const filePath = path.join(process.cwd(), "data", "programs", fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Program file "${fileName}" is missing from the local dataset.`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ProgramRecord;
}

function applyProgramDefaults(record: ProgramRecord): ProgramRecord {
  const programDefaults = PROGRAM_DEFAULTS[record.id] ?? {};
  const merged = {
    ...programDefaults,
    ...record,
  } as ProgramRecord;
  const cityKey =
    merged.locationCity && merged.locationState
      ? `${merged.locationCity}|${merged.locationState}`
      : null;
  const cityDefaults = cityKey ? CITY_BASELINES[cityKey as keyof typeof CITY_BASELINES] : null;

  return {
    ...cityDefaults,
    ...merged,
    notes: [
      ...(record.notes ?? []),
      ...(cityDefaults || programDefaults.openCsTier
        ? ["Some comparison values are seeded from city baselines and OpenCS tier fallbacks."]
        : []),
    ],
  };
}
