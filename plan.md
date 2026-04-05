# Plan

## Completed

- Expanded `data/programs` with the requested OpenCS-listed programs
- Updated the loader so records are read from `data/programs/index.json` instead of a hardcoded three-file map
- Switched sidebar selection to program IDs so multiple programs from the same university are usable

## Current Focus

- Maintain the Next.js MSCS comparison app
- Keep scoring dimensions, program data, and UI labels consistent
- Validate changes with `npm test`, `npm run lint`, and `npm run build`

## Near-Term Work

- Refine sidebar and comparison UI polish
- Expand and verify program dataset fields and external links
- Keep ranking, cost, and scoring inputs aligned with display logic

## Release Checklist

- Update data and UI together
- Run automated checks
- Commit scoped changes clearly
- Push branch and update the draft PR
