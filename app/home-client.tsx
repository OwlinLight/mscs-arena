"use client";

import { useEffect, useState } from "react";

import { ProgramBrowser } from "@/app/program-browser";
import {
  DEFAULT_LANGUAGE,
  getAxisKeys,
  getAxisLabel,
  LANGUAGE_STORAGE_KEY,
  translations,
  type Language,
} from "@/src/lib/i18n";
import type { ProgramView } from "@/src/lib/programs";

type HomeClientProps = {
  programs: ProgramView[];
};

export function HomeClient({ programs }: HomeClientProps) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_LANGUAGE;
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage === "en" || storedLanguage === "cn"
      ? storedLanguage
      : DEFAULT_LANGUAGE;
  });
  const t = translations[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = t.htmlLang;
  }, [language, t.htmlLang]);

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <div className="hero-topbar">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <div className="language-toggle" role="group" aria-label={t.languageLabel}>
              <button
                type="button"
                className={language === "en" ? "language-toggle-button active" : "language-toggle-button"}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={language === "cn" ? "language-toggle-button active" : "language-toggle-button"}
                onClick={() => setLanguage("cn")}
              >
                CN
              </button>
            </div>
          </div>
          <h1>{t.hero.title}</h1>
        </div>
        <div className="hero-panel">
          <p>{t.hero.description}</p>
          <p className="config-caption">
            {t.hero.configCaption} <code>data/scoring-config.json</code>.
          </p>
          <ul className="legend-list">
            {getAxisKeys().map((axisKey) => (
              <li key={axisKey}>{getAxisLabel(language, axisKey)}</li>
            ))}
          </ul>
        </div>
      </section>
      <ProgramBrowser programs={programs} language={language} />
    </main>
  );
}
