# AI in Industry HS 2026 course website

Course website for **HS 2026 — AI in Industry**
(ETH Zürich, autumn semester 2026).

A static, Moodle-style site listing the three course weekends, each with its
Friday and Saturday agenda, a theme and its material links, plus a calendar view
with `.ics` and Google Calendar export.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:5173
npm run build    # tsc -b (type-check) + vite build into dist/
npm run preview  # serve the production build locally
```

`npm run build` is the correctness gate: it type-checks with `tsc -b` before
bundling.

## Editing content

All course content lives in [`src/data/weekends.ts`](src/data/weekends.ts) as a
single typed `Weekend[]` array. Pages and components render from that array, so
updating an agenda or adding a slide deck means editing only that file.

New content should be added to the (`friday` or `saturday`) field in the
corresponding weekend, ***AND*** the `resources` field at the bottom as a centralized
place to hold all materials. Some helpers are provided at the top of `src/data/weekends.ts`.
For example:

```ts
raw(1, 'slides/llms.pdf')                    // PDF for download at public/slides/we1/llms.pdf
colab(2, 'exercises/gradient_descent.ipynb') // Colab notebook at public/exercises/we2/gradient_descent.ipynb
SOON                                         // not uploaded yet, renders greyed out
```

Links set to `SOON` render as "Soon" instead of a clickable link, so an agenda
can go live before its materials exist.

The calendar is derived: [`src/data/calendar.ts`](src/data/calendar.ts) builds
the events from each weekend's `startISO`, and `src/lib/ics.ts` turns those into
the download. Do not hand-maintain calendar events.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
`dist/` to GitHub Pages. Hash routing and `base: './'` in `vite.config.ts` are
what make deep links and assets work under the Pages repo subpath, so keep both
if you touch routing or the build config.
