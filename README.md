# AI in Industry HS 2026 course website

Course website for **HS 2026 — AI in Industry**
(ETH Zürich, autumn semester 2026).

A static, Moodle-style site listing the three course weekends, each with its
Friday and Saturday agenda, a theme and its material links, plus a calendar view
with `.ics` and Google Calendar export.

## Commands

```bash
npm install      # install dependencies
npm run dev      # scripts/sync-materials.mjs, then the dev server at http://localhost:5173
npm run build    # scripts/sync-materials.mjs, tsc -b (type-check), vite build into dist/
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
place to hold all materials. In a weekend with numbered materials (below), decks and
visualizations go on the agenda only. Some helpers are provided at the top of
`src/data/weekends.ts`. For example:

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

## Numbered materials

A weekend with a `download` field (weekend 2) numbers its decks and visualizations
in the order of its agenda: Friday's rows top to bottom, then Saturday's, each
row's links left to right. The number and the link's label make one name, such as
"04 Business cases, Etsy and Airbnb". That name is shown on the agenda's chip and
in the Materials list under "Slides and visualizations", a PDF is saved under it,
and the ZIP behind the button at the top of the page uses it. The served files
keep their URLs. A handout, `<deck>-handout.pdf` linked right after its deck,
takes the deck's number and goes to the ZIP's `Handouts` folder. Nothing stores
the numbers: add, move or remove a link on the agenda and the page and the ZIP
follow on the next build. The code is [`src/lib/materials.ts`](src/lib/materials.ts).

The rules of such a weekend:

- A deck or a visualization goes on the agenda, on the row where it is used. Its
  label names it and is its file name: no colon, slash or question mark, and
  never "Slides" or "Handout" alone.
- The Materials list (`resources`) lists what the agenda does not: slides marked
  Soon, notebooks, the project. A file kept off the agenda on purpose goes in
  `download.extras`: shown in the Materials list without a number, left out of the ZIP.
- Lecture notes go in `download.notes` (since 2026-11-12, Carlos: "put that next
  to download all slides and visualizations"): a button each beside the ZIP
  button, no number, in the ZIP under their label, and in the Materials list.
- Every file in `public/slides/we<N>/` and every folder in `public/viz/we<N>/`
  is on the agenda, in `download.extras` or in `download.notes`.

[`scripts/sync-materials.mjs`](scripts/sync-materials.mjs) runs before every
`npm run dev` and `npm run build`. It checks these rules, the files in `public/`
and the order of each day's rows by time, and stops with the list of what
disagrees. Then it writes the ZIP to `public/downloads/`, so `npm run dev` serves
it too. Run it alone with `node scripts/sync-materials.mjs`.

On every weekend, a link to a Colab notebook that one of the weekend's games names
is left off the page, agenda and Materials list: the participants open it from the
game. The same script lists those notebooks in
`src/data/generated/notebooks-in-games.json`, and a notebook is back on the page
when no game names it any more. `public/downloads/` and `src/data/generated/` are
written by every build and are not committed.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
`dist/` to GitHub Pages. Hash routing and `base: './'` in `vite.config.ts` are
what make deep links and assets work under the Pages repo subpath, so keep both
if you touch routing or the build config.
