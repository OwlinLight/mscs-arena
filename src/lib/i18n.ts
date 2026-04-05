import type { ProgramView, RadarAxisKey } from "@/src/lib/programs";

export type Language = "en" | "cn";

export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "mscs-arena-language";

const AXIS_KEYS: RadarAxisKey[] = [
  "prestigeScore",
  "majorScore",
  "difficultyScore",
  "locationScore",
  "cohortScore",
  "tuitionScore",
];

export const translations = {
  en: {
    htmlLang: "en",
    languageLabel: "Language",
    hero: {
      eyebrow: "MSCS Arena",
      title: "US CS master Explorer",
      description:
        "Every radar axis is normalized onto an A-E scale, where A is the most comparison-favorable outcome for that dimension.",
      configCaption: "Scoring rules are loaded from",
    },
    browser: {
      ariaUniversityFilters: "University filters",
      kicker: "Explore",
      compareHeading: "Build a comparison",
      singleHeading: "Browse one university",
      compareCopy:
        "Choose two universities to compare side by side with an overlapped radar chart.",
      singleCopy:
        "Focus on one university at a time and inspect its details in a single card view.",
      ariaViewMode: "View mode",
      singleMode: "Single mode",
      compareMode: "Compare mode",
      universityA: "University A",
      universityB: "University B",
      university: "University",
      selected: "Selected",
      recordsWarning: "record(s) have validation warnings.",
      recordsWarningCopy: "They still render, but the UI flags the affected programs.",
      noMatchingUniversity: "No matching university",
      noMatchingUniversityCopy:
        "Choose a university from the sidebar to render the single-school view.",
      pickTwoUniversities: "Pick two universities",
      pickTwoUniversitiesCopy:
        "Choose two different schools from the sidebar to render the comparison.",
      compareView: "Compare view",
      comparisonLegend: "Comparison legend",
      activeAxis: "Active axis",
      axisDetail: "Axis detail",
      grade: "Grade",
      notAvailable: "N/A",
      validationWarnings: "Validation warnings",
      basicProgramInfo: "Basic program info",
      location: "Location",
      durationCredits: "Duration / Credits",
      thesis: "Thesis",
      researchVsIndustry: "Research vs Industry",
      researchVsIndustryDetail: "course design & thesis requirement",
      deliveryMode: "Delivery mode",
      radarSection: "Radar chart including (map to ABCDE)",
      reference: "Reference",
      openCsPage: "OpenCS Page",
      nichePage: "Niche Page",
      fieldsIncluding: "Fields including",
      tuition: "Tuition",
      total: "total",
      perCredit: "per credit",
      duration: "Duration",
      credits: "Credits",
      cohortSize: "Cohort size",
      thesisOption: "Thesis option",
      researchVsIndustryOrientation: "Research vs industry orientation",
      rankingInputs: "Ranking inputs",
      notes: "Notes",
      validationDetails: "Validation details",
      programRadarChart: "Program radar chart",
      comparisonRadarChart: "Comparison radar chart",
      students: "students",
      estimatedTotal: "estimated total",
      city: "city",
      suburb: "suburb",
      rankingUsNews: "US News",
      rankingCsrankings: "CSRankings",
      rankingOpenCs: "OpenCS",
      researchLeaning: "Research-leaning",
      industryLeaning: "Industry-leaning",
      balanced: "Balanced",
      locationDetail: "Location",
      tuitionDetail: "Tuition",
      cohortDetail: "Cohort size",
      prestigiousDetail: "US News undergrad rank",
      majorDetail: "CSRankings rank",
      difficultyDetail: "OpenCS rank",
    },
    axes: {
      prestigeScore: "Prestigious",
      majorScore: "Major ranking",
      difficultyScore: "Course load difficulty",
      locationScore: "Location",
      cohortScore: "Cohort size",
      tuitionScore: "Tuition costs",
    },
  },
  cn: {
    htmlLang: "zh-CN",
    languageLabel: "语言",
    hero: {
      eyebrow: "MSCS Arena",
      title: "美国 CS 硕士项目浏览器",
      description: "所有雷达图维度都被归一到 A-E 等级，其中 A 表示该维度更利于横向比较。",
      configCaption: "评分规则加载自",
    },
    browser: {
      ariaUniversityFilters: "学校筛选",
      kicker: "探索",
      compareHeading: "对比项目",
      singleHeading: "查看单个学校",
      compareCopy: "选择两所学校并排对比，使用重叠雷达图查看差异。",
      singleCopy: "一次聚焦一所学校，在单卡片视图中查看详细信息。",
      ariaViewMode: "查看模式",
      singleMode: "单校模式",
      compareMode: "对比模式",
      universityA: "学校 A",
      universityB: "学校 B",
      university: "学校",
      selected: "已选",
      recordsWarning: "条记录存在校验警告。",
      recordsWarningCopy: "它们仍会显示，但界面会标出受影响的项目。",
      noMatchingUniversity: "没有匹配的学校",
      noMatchingUniversityCopy: "请从侧边栏选择学校以显示单校视图。",
      pickTwoUniversities: "请选择两所学校",
      pickTwoUniversitiesCopy: "请从侧边栏选择两所不同学校以显示对比视图。",
      compareView: "对比视图",
      comparisonLegend: "对比图例",
      activeAxis: "当前维度",
      axisDetail: "维度说明",
      grade: "等级",
      notAvailable: "暂无",
      validationWarnings: "校验警告",
      basicProgramInfo: "项目基础信息",
      location: "地点",
      durationCredits: "时长 / 学分",
      thesis: "论文",
      researchVsIndustry: "科研 / 就业导向",
      researchVsIndustryDetail: "课程设计与论文要求",
      deliveryMode: "授课形式",
      radarSection: "雷达图维度（映射为 ABCDE）",
      reference: "参考链接",
      openCsPage: "OpenCS 页面",
      nichePage: "Niche 页面",
      fieldsIncluding: "字段信息",
      tuition: "学费",
      total: "总计",
      perCredit: "每学分",
      duration: "时长",
      credits: "学分",
      cohortSize: "项目规模",
      thesisOption: "论文选项",
      researchVsIndustryOrientation: "科研 / 就业倾向",
      rankingInputs: "排名输入",
      notes: "备注",
      validationDetails: "校验详情",
      programRadarChart: "项目雷达图",
      comparisonRadarChart: "对比雷达图",
      students: "人",
      estimatedTotal: "估算总额",
      city: "城市",
      suburb: "郊区",
      rankingUsNews: "US News",
      rankingCsrankings: "CSRankings",
      rankingOpenCs: "OpenCS",
      researchLeaning: "偏科研",
      industryLeaning: "偏就业",
      balanced: "均衡",
      locationDetail: "地点",
      tuitionDetail: "学费",
      cohortDetail: "项目规模",
      prestigiousDetail: "US News 本科排名",
      majorDetail: "CSRankings 排名",
      difficultyDetail: "OpenCS 排名",
    },
    axes: {
      prestigeScore: "名气",
      majorScore: "专业排名",
      difficultyScore: "课程负担难度",
      locationScore: "地理位置",
      cohortScore: "项目规模",
      tuitionScore: "学费成本",
    },
  },
} as const;

export function getAxisKeys(): RadarAxisKey[] {
  return AXIS_KEYS;
}

export function getAxisLabel(language: Language, axisKey: RadarAxisKey): string {
  return translations[language].axes[axisKey];
}

export function getResearchIndustryLabel(language: Language, label: ProgramView["researchIndustryLabel"]): string {
  const browser = translations[language].browser;

  if (label === "Research-leaning") return browser.researchLeaning;
  if (label === "Industry-leaning") return browser.industryLeaning;
  if (label === "Balanced") return browser.balanced;
  return browser.notAvailable;
}

export function getAxisDetail(language: Language, program: ProgramView, axisKey: RadarAxisKey): string {
  const browser = translations[language].browser;

  switch (axisKey) {
    case "prestigeScore":
      return `${browser.prestigiousDetail}: ${formatRankDetail(language, program.rankings?.usNewsUndergrad)}`;
    case "majorScore":
      return `${browser.majorDetail}: ${formatRankDetail(language, program.rankings?.csrankings)}`;
    case "difficultyScore":
      return `${browser.difficultyDetail}: ${formatRankDetail(language, program.rankings?.openCs)}`;
    case "locationScore":
      return `${browser.locationDetail}: ${formatLocation(language, program)}`;
    case "cohortScore":
      return `${browser.cohortDetail}: ${formatCountDetail(language, program.cohortSize, browser.students)}`;
    case "tuitionScore":
      return `${browser.tuitionDetail}: ${formatTuition(language, program)}`;
  }
}

export function formatLocation(language: Language, program: ProgramView): string {
  const browser = translations[language].browser;
  const city = program.locationCity ?? browser.notAvailable;
  const state = program.locationState ? `, ${program.locationState}` : "";
  const type = program.locationType
    ? ` (${program.locationType === "city" ? browser.city : browser.suburb})`
    : "";
  return `${city}${state}${type}`;
}

export function formatDuration(language: Language, program: ProgramView): string {
  const browser = translations[language].browser;
  const duration = program.duration ?? browser.notAvailable;
  const credits = formatNumber(language, program.creditHours);
  return `${duration} / ${credits}`;
}

export function formatCurrency(language: Language, value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return translations[language].browser.notAvailable;
  }

  return new Intl.NumberFormat(language === "cn" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(language: Language, value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return translations[language].browser.notAvailable;
  }

  return new Intl.NumberFormat(language === "cn" ? "zh-CN" : "en-US").format(value);
}

function formatRankDetail(language: Language, value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return translations[language].browser.notAvailable;
  }

  return `#${formatNumber(language, value)}`;
}

function formatCountDetail(language: Language, value: number | undefined, unit: string): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return translations[language].browser.notAvailable;
  }

  return `${formatNumber(language, value)} ${unit}`;
}

function formatTuition(language: Language, program: ProgramView): string {
  const browser = translations[language].browser;

  if (typeof program.tuitionTotalUsd === "number" && Number.isFinite(program.tuitionTotalUsd)) {
    return `${formatCurrency(language, program.tuitionTotalUsd)} ${browser.total}`;
  }

  if (
    typeof program.tuitionPerCreditUsd === "number" &&
    Number.isFinite(program.tuitionPerCreditUsd)
  ) {
    const estimatedCredits = program.creditHours ?? 30;
    const estimatedTotal = program.tuitionPerCreditUsd * estimatedCredits;
    return `${formatCurrency(language, program.tuitionPerCreditUsd)} ${browser.perCredit} (${formatCurrency(language, estimatedTotal)} ${browser.estimatedTotal})`;
  }

  return browser.notAvailable;
}
