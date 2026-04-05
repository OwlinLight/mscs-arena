# Repository Guidelines

## Project Structure & Module Organization

This is a small Next.js App Router project for comparing MSCS programs. UI routes and global styles live in `app/` (`app/page.tsx`, `app/program-browser.tsx`, `app/globals.css`). Shared data logic lives in `src/lib/`, mainly `programs.ts` for scoring/validation and `i18n.ts` for labels. Static dataset files live in `data/`, with program records under `data/programs/*.json` and scoring rules in `data/scoring-config.json`. Public assets belong in `public/`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js dev server at `http://localhost:3000`.
- `npm run build`: create a production build and run type checks.
- `npm run start`: serve the production build locally.
- `npm run lint`: run ESLint against `app/` and `src/`.
- `npm test`: run the Node test suite in `src/lib/programs.test.ts`.

Run `npm run lint && npm test && npm run build` before opening a PR. Skipping checks is how avoidable regressions get shipped.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode expectations. Prefer existing modules over new files unless there is a clear structural reason. Follow the repo’s current style: double quotes, semicolons, and alias imports via `@/*`. Keep React components in PascalCase, helper functions in camelCase, and JSON data keys descriptive and stable (`acceptanceRate`, `livingCostUsd`, `csOpenRankingsUrl`). Keep CSS selectors purposeful; avoid adding one-off styles when an existing component class can be extended.

## Testing Guidelines

Tests use the built-in Node test runner via `tsx --test`. Add or update tests in `src/lib/programs.test.ts` when changing scoring, validation, derived labels, or dataset assumptions. Prefer direct assertions on derived outputs over snapshot-style testing. If a data field changes, update the fixtures and the matching expectation together.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Add university sidebar filter` and `Refine radar detail panel readability`. Keep commits focused and readable. PRs should include:

- a short description of behavior changes
- linked issue or task context when available
- screenshots or short notes for UI changes
- confirmation that `lint`, `test`, and `build` passed

## Data & Configuration Notes

Program JSON files are part of the product, not throwaway mock data. Keep ranking links, costs, and labels internally consistent, and update `data/scoring-config.json` when scoring semantics change.

## Get OpenCS link
Browse opencs page to get the detail link

## Plan Mode
Always save plans created in plan mode to the <project_folder>/docs/<feature_name>/<feature-plan>.md

