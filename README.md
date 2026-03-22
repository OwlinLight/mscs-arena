# mscs-arena

A static web app for comparing CS master's programs using local JSON data.

## Run locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Run tests

```bash
npm test
```

## Data shape

Each program is stored as a local JSON file in [`data/programs`](/mnt/d/programming/codex/mscs-arena/data/programs). Shared validation and scoring logic lives in [`src/programs.js`](/mnt/d/programming/codex/mscs-arena/src/programs.js).

The ABCDE mapping is configured externally in [`data/scoring-config.json`](/mnt/d/programming/codex/mscs-arena/data/scoring-config.json), so you can tune ranking, tuition, cohort-size, and location grading without editing application code.

The UI renders each program in this order:

1. Basic program info
2. Radar chart including (map to ABCDE)
3. Reference
4. Fields including

Radar chart dimensions:

- Prestigious
- Major ranking
- How hard it is
- Location
- Cohort size
- Tuition costs

`A` is the strongest / most comparison-favorable value on each axis.
