import type { Weekend } from '../types';

/**
 * Single source of truth for all BMAI 2026 weekend content.
 * Transcribed from the "Syllabus" tab of "BMAI HS26 master spreadsheet.xlsx".
 *
 * To update content, edit the objects below. Each weekend has a Friday and a
 * Saturday agenda plus a `resources` list.
 */

/**
 * SCHEDULE FACTS AND WHERE THEY COME FROM.
 *
 * Times and rooms are the course unit's own entry in the ETH Vorlesungs-
 * verzeichnis, 275-0004-00L, autumn semester 2026: Friday 08:15 to 17:00 and
 * Saturday 08:15 to 13:00, both in HG D 7.2. That is why every day starts at
 * 08:15 rather than 08:00. The one exception is the course opening on the
 * Friday of weekend 1, an 08:00 row that Carlos asked for on 2026-10-15; the
 * master spreadsheet starts both days at 08:00 as well.
 *
 * Catering comes from the CAS AIS HS26 schedule sent by the programme office on
 * 3 September 2026. THE FRIDAY VENUES ARE NOT THE SAME EVERY WEEKEND, so they
 * are set per weekend rather than once: weekends 1 and 3 are largely at the
 * Dozentenfoyer, weekends 2 and 4 at Polysnack, and weekend 3's afternoon
 * coffee is at the foyer instead. Every Saturday coffee is at HG D30.0075, the
 * foyer immediately outside the classroom. Do not "tidy" these into one value.
 */
const ORG = 'eth-ainit-hs26';

/**
 * Name of a public repository in the eth-ainit-hs26 organisation that materials
 * are read from, e.g. 'w1-cx-public' or 'w1-lecture-slides'.
 *
 * Deliberately any string, not a fixed list: a lecturer creates whatever public
 * repo suits them and we link it, rather than asking them to rename it to fit a
 * convention. `w<N>-<cx|project|lecture>-public` is the house habit for TA
 * material, not a rule. The trade-off is that a typo in a repo name is a dead
 * link at runtime instead of a build error, so paste names, do not type them.
 */
export type PublicRepo = string;

/**
 * Direct file link into a public repo, for slides and handouts. GitHub serves
 * these as a download rather than rendering them in the browser.
 */
export const raw = (repo: PublicRepo, path: string): string =>
  `https://raw.githubusercontent.com/${ORG}/${repo}/main/${path}`;

/** Notebook in a public repo, opened in Google Colab. */
export const colab = (repo: PublicRepo, path: string): string =>
  `https://colab.research.google.com/github/${ORG}/${repo}/blob/main/${path}`;

/** File shown in GitHub's own viewer, for a notebook or PDF to preview in-page. */
export const github = (repo: PublicRepo, path: string): string =>
  `https://github.com/${ORG}/${repo}/blob/main/${path}`;

/**
 * Placeholder for material that has not been uploaded yet. Renders greyed out
 * as "Soon" instead of a link, so an agenda can go live before its files do.
 * Replace with raw(repo, path) or colab(repo, path) once the file is pushed.
 */
export const SOON = '#';

/**
 * A lecture deck hosted by THIS site, from `public/slides/we<n>/`.
 *
 * Why not raw(): raw() needs a PUBLIC repository in the org to read from, and
 * no public repository holds these decks. They live in
 * `eth-ainit-hs26/w1-lecture-material`, which is private. Serving them from this
 * repository is what the sibling FDD site does, it needs no new repository and
 * no visibility change, and it goes live on the next deploy. If a public slides
 * repo is ever created, switch these to raw('<that-repo>', ...) and delete the
 * PDFs from public/slides/.
 *
 * BASE_URL rather than a bare './' so the link survives a change to `base` in
 * vite.config.ts. Under hash routing the document URL is always the site root,
 * so a relative href resolves correctly from any route.
 */
export const deck = (n: number, file: string): string =>
  `${import.meta.env.BASE_URL}slides/we${n}/${file}`;

/**
 *
 * An interactive VISUALIZATION hosted by this site, from
 * `public/viz/we<n>/<name>/`.
 *
 * Same reasoning as deck(): the source lives in the private
 * `eth-ainit-hs26/w1-lecture-material`, and serving the built page from here
 * needs no new repository and no visibility change.
 *
 * A visualization is a FOLDER rather than one file, so this points at its
 * index.html. Each one is browser only, opens with no build step and no
 * network, and carries its own vendored libraries, so it works from this
 * subpath exactly as it works from a file:// URL on a laptop.
 */
export const viz = (n: number, name: string): string =>
  `${import.meta.env.BASE_URL}viz/we${n}/${name}/index.html`;

/**
 * A participant-facing HOW-TO page hosted by this site, from `public/guides/`.
 *
 * Same reasoning as deck(): the source lives in a private repository, and a
 * page served from here needs no new repository and no visibility change. The
 * sibling FDD site serves its installation guide the same way.
 */
export const guide = (file: string): string =>
  `${import.meta.env.BASE_URL}guides/${file}`;

/**
 * An exercise hosted by THIS site, from `public/exercises/we<n>/`, for the
 * exercises that Colab cannot carry. Two kinds live here:
 *
 * A NOTEBOOK, which the browser downloads. colab() is right for every other
 * exercise in this course and wrong for the Claude Code one: it drives a
 * terminal program that edits files in a folder the participant owns, and Colab
 * has neither the folder nor the licence, so the notebook is opened locally in
 * VS Code. See the setup guide.
 *
 * A self-contained HTML page, which opens in a tab and needs no Python at all.
 * Why not raw(): raw.githubusercontent.com serves .html as `text/plain` with
 * `nosniff`, so a participant clicking it reads the source instead of using the
 * page. The file is copied here from its public repo rather than linked, so
 * check for a newer copy upstream when the TA edits it.
 */
export const exercise = (n: number, file: string): string =>
  `${import.meta.env.BASE_URL}exercises/we${n}/${file}`;

/**
 * A runnable APPLICATION hosted by this site, from `public/apps/we<n>/`, as a
 * zip the participant unpacks and starts on their own laptop.
 *
 * Same reasoning as deck(): it has to DOWNLOAD, and the download attribute is
 * same-origin only, so linking w1-project-public directly would leave the chip
 * at the mercy of whatever GitHub decides to serve. A copy, so re-export it
 * when the app changes upstream.
 */
export const app = (n: number, file: string): string =>
  `${import.meta.env.BASE_URL}apps/we${n}/${file}`;

/**
 * A weekend's "download all" ZIP, from `downloads/`. scripts/sync-materials.mjs
 * writes it to public/downloads/ (not committed) before every `npm run dev` and
 * `npm run build`, from the weekend's agenda; see the `download` field.
 */
export const downloadZip = (file: string): string =>
  `${import.meta.env.BASE_URL}downloads/${file}`;

export const weekends: Weekend[] = [
  {
    id: 'we1',
    number: 1,
    // Title Case to match the other three weekend cards, which sit beside
    // this one on the home page; he wrote it in sentence case.
    title: 'Large Language Models',
    theme: "LLMs, prompt engineering, and prompt optimization",
    dates: '16-17 October 2026',
    startISO: '2026-10-16',
    fridayRoom: 'HG D 7.2',
    saturdayRoom: 'HG D 7.2',
    project: 'LLM Marketing Agent',
    summary:
      "This weekend introduces the fundamentals of large language models and how to enhance their performance through prompt engineering and optimization.",
    friday: [
      {
        time: '08:00',
        title: 'Course opening',
        type: 'lecture',
        // The opening of the course, "The Word, the Thought, the Power, the Act" (the
        // Title sequence, a dark film-titles look), and the introduction and
        // administration deck. Both were public already, the opening since 2026-10-14
        // and the administration deck since 2026-10-09; this row puts them in the
        // schedule, at Carlos's instruction of 2026-10-15 ("the cold intro for the
        // course on Friday 8am"). The first lecture still starts at 08:15, see the
        // note on the schedule facts above.
        links: [
          { label: 'Opening slides', url: deck(1, 'ainit-hs26-cold-intro.pdf') },
          { label: 'Introduction & administration slides', url: deck(1, 'ainit-hs26-introduction-and-administration.pdf') },
        ],
      },
      {
        time: '08:15',
        title: 'Language models with the Ge\'ez games',
        type: 'lecture',
        // The introduction and Games 1 to 3 (structure, imitation, prediction), built
        // from llm-deck/geez-slides.tex in w1-lecture-material and published on
        // 2026-10-13 at Carlos's instruction. Replaced on 2026-10-15 by the build of
        // 2026-10-14 (84 pages), with its handout (27 pages, the last click of each frame).
        //
        // "Annotated" is the deck as Carlos wrote on it in the lecture, an iPad
        // export, and it sits right after the deck it annotates on every lecture
        // row, as on the FDD site. Published on 2026-10-16. It has 86 pages: the
        // deck's 84 and two repeats of a frame, each with its own handwriting (pages
        // 42 and 49).
        links: [
          { label: 'Slides', url: deck(1, 'ainit-hs26-language-models-with-the-geez-games.pdf') },
          { label: 'Handout', url: deck(1, 'ainit-hs26-language-models-with-the-geez-games-handout.pdf') },
          { label: 'Annotated', url: deck(1, 'ainit-hs26-language-models-with-the-geez-games-annotated.pdf') },
        ],
      },
      {
        time: '09:00',
        title: 'Ge\'ez games',
        type: 'exercise',
        // Three browser exercises run in this slot. All are self-contained
        // pages, so 'Open in browser' would name them all: the labels say
        // WHICH exercise instead, in the order the TA runs them.

        links: [
          {
            label: 'Ge\'ez games',
            url: exercise(1, '01_geez_llm_game.html'),
          },
          {
            label: 'Python Recap notebook',
            url: colab('w1-cx-public', 'Python_recap.ipynb'),
          },
        ],
      },
      {
        time: '10:00',
        title: 'Large language models',
        type: 'lecture',
        // Games 4 and 5 (representation, the transformer), built from
        // llm-deck/llm-slides.tex in w1-lecture-material, published on
        // 2026-10-12 and rebuilt on 2026-10-13 at Carlos's instruction. Replaced on
        // 2026-10-15 by the build of 2026-10-14 (95 pages: wheels for the chances, a recap
        // after Game 4, what it means for you, the summary), with its handout (30 pages).
        // The annotated copy, published on 2026-10-16, is the deck as Carlos wrote on it
        // in the lecture: 99 pages, the deck's 95 and four handwritten sketch pages of his
        // (pages 9, 20, 28 and 97).
        links: [
          { label: 'Slides', url: deck(1, 'ainit-hs26-large-language-models.pdf') },
          { label: 'Handout', url: deck(1, 'ainit-hs26-large-language-models-handout.pdf') },
          { label: 'Annotated', url: deck(1, 'ainit-hs26-large-language-models-annotated.pdf') },
        ],
      },
      { time: '10:30', title: 'Coffee break at Dozentenfoyer, until 11:00', type: 'break' },
      {
        time: '11:00',
        title: 'Reasoning, prompt engineering, and OPRO',
        type: 'lecture',
        // Four pieces of material, in the order of the lecture (Carlos, 2026-10-15):
        // the reasoning slides with their game, the ladder from a language model to a
        // planning agent, then OPRO. Published on 2026-10-15 from w1-lecture-material and,
        // on 2026-10-16, the reasoning slides and their game were REPLACED by the town
        // version (Carlos: "replace the reasoning slides with these slides"): the same file
        // names, town-deck/town-slides.pdf and its handout, and the game Mara's Town
        // (town-lab/), one HTML page, no network needed. Mara's Valley, the first version,
        // stays in rlvr-deck/ and reasoning-lab/ of that repository. The ladder is
        // ladder-deck/ladder-slides.pdf, OPRO opro-deck/opro-slides.pdf. The labels name
        // the deck because there are three on one row. The annotated copies of the ladder
        // and of OPRO, published on 2026-10-16, sit after their handouts; the reasoning
        // deck has none. The ladder copy has 136 pages (the deck's 128 and eight handwritten
        // sketch pages, two of them blank), OPRO has 43 (the deck's 42 and one sketch page).
        links: [
          { label: 'Reasoning slides', url: deck(1, 'ainit-hs26-reasoning-finding-the-way.pdf') },
          { label: 'Reasoning handout', url: deck(1, 'ainit-hs26-reasoning-finding-the-way-handout.pdf') },
          { label: "Mara's Town (game)", url: viz(1, 'mara-town') },
          { label: 'Ladder slides', url: deck(1, 'ainit-hs26-the-ladder.pdf') },
          { label: 'Ladder handout', url: deck(1, 'ainit-hs26-the-ladder-handout.pdf') },
          { label: 'Ladder annotated', url: deck(1, 'ainit-hs26-the-ladder-annotated.pdf') },
          { label: 'OPRO slides', url: deck(1, 'ainit-hs26-opro.pdf') },
          { label: 'OPRO handout', url: deck(1, 'ainit-hs26-opro-handout.pdf') },
          { label: 'OPRO annotated', url: deck(1, 'ainit-hs26-opro-annotated.pdf') },
        ],
      },
      {
        time: '12:00',
        title: 'Coding bazaar (RZ D8 PBLabs)',
        type: 'lab',
      },
      { time: '13:00', title: 'Lunch break at RZ D8 PBLabs, until 14:00', type: 'break' },
      {
        time: '14:00',
        title: 'Prompt engineering',
        type: 'exercise',
        links: [
          {
            label: 'Basics',
            url: colab('w1-cx-public', '02a_prompt_engineering_student.ipynb'),
          },
          {
            label: 'Chain of thought',
            url: colab('w1-cx-public', '02b_CoT_student.ipynb'),
          },
          {
            label: 'Tree of thought + subquestion decomposition',
            url: colab('w1-cx-public', '02c_subques_student.ipynb'),
          },
        ]
      },
      {
        time: '15:00',
        title: 'Summary of GEPA',
        type: 'lecture',
        // GEPA, "Reflective prompt evolution" (Agrawal et al., ICLR 2026): the CSCS
        // workshop deck transcribed into the course style, from gepa-deck/ in
        // w1-lecture-material. Published on 2026-10-15.
        links: [
          { label: 'Slides', url: deck(1, 'ainit-hs26-gepa.pdf') },
          { label: 'Handout', url: deck(1, 'ainit-hs26-gepa-handout.pdf') },
          // { label: 'Annotated', url: deck(1, '') },
        ],
      },
      { time: '15:30', title: 'Coffee break at Polysnack, until 16:00', type: 'break' },
      {
        time: '16:00',
        title: "OPRO",
        type: 'exercise',
        links: [
          {
            label: 'OPRO notebook',
            url: colab('w1-cx-public', '03_opro_student.ipynb'),
          },
        ]
      },
    ],
    saturday: [
      {
        time: '08:15',
        title: 'MLOps',
        type: 'lecture',
        links: [
          { label: 'Slides', url: deck(1, 'mlops-slides-hs26.pdf') },
        //   { label: 'Annotated', url: deck(1, '') },
        ],
      },
      {
        time: '09:00',
        title: 'MLOps',
        type: 'exercise',
        links: [
          {
            label: 'MLOps notebook',
            url: colab('w1-cx-public', '04_mlops_student.ipynb'),
          },
        ]
      },
      { time: '10:00', title: 'Coffee break outside the classroom, until 10:30', type: 'break' },
      {
        time: '10:30',
        title: 'Guest speaker: Joao Carvalho',
        type: 'lecture',
        // The slides of the guest lecture, "Harnesses: Beyond the Model", sent by the
        // speaker and published on 2026-10-18 with his agreement. Both rows carry the
        // same title, so the link sits on the first.
        links: [
          { label: 'Slides', url: deck(1, 'ainit-hs26-guest-joao-carvalho.pdf') },
        ],
      },
      {
        time: '11:00',
        title: 'Guest speaker: Joao Carvalho',
        type: 'lecture',
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      {
        time: '12:00',
        title: 'Project intro: LLM Marketing Agent',
        type: 'project',
        // The Project 1 introduction deck, published on 2026-10-15. The notebook
        // link follows once w1-project-public exists.
        links: [
          { label: 'Slides', url: deck(1, 'w1_project_intro_hs26.pdf') },
          {
            label: 'Project Notebook',
            url: colab('w1-project-public', 'project1.ipynb'),
          },
        ],
      },
    ],
    resources: [
      /* Centralized list of all the weekend's resources */

      /* Slides */
      // The opening of the course, "The Word, the Thought, the Power, the Act": four blocks, four voices,
      // one order. The official cold intro (the Title sequence, a dark film-titles look), built from
      // cold-intro/intro-slides in w1-lecture-material and published on 2026-10-14 at Carlos's
      // instruction. No handout since 2026-11-11 (Carlos: "drop the handouts for all the cold intros").
      { group: 'Lecture slides', label: 'Course opening: the Word, the Thought, the Power, the Act', url: deck(1, 'ainit-hs26-cold-intro.pdf') },
      { group: 'Lecture slides', label: 'Course introduction and administration', url: deck(1, 'ainit-hs26-introduction-and-administration.pdf') },
      { group: 'Lecture slides', label: 'Language models with the Ge\'ez games', url: deck(1, 'ainit-hs26-language-models-with-the-geez-games.pdf') },
      { group: 'Lecture slides', label: 'Language models with the Ge\'ez games (Handout)', url: deck(1, 'ainit-hs26-language-models-with-the-geez-games-handout.pdf') },
      { group: 'Lecture slides', label: 'Language models with the Ge\'ez games (Annotated)', url: deck(1, 'ainit-hs26-language-models-with-the-geez-games-annotated.pdf') },
      { group: 'Lecture slides', label: 'Large language models', url: deck(1, 'ainit-hs26-large-language-models.pdf') },
      { group: 'Lecture slides', label: 'Large language models (Handout)', url: deck(1, 'ainit-hs26-large-language-models-handout.pdf') },
      { group: 'Lecture slides', label: 'Large language models (Annotated)', url: deck(1, 'ainit-hs26-large-language-models-annotated.pdf') },
      // The 11:00 lecture, "Reasoning, prompt engineering, and OPRO": three decks, in the
      // order of the lecture. Their game, Mara's Town, is under Visualizations below.
      { group: 'Lecture slides', label: 'Reasoning: finding the way, step by step', url: deck(1, 'ainit-hs26-reasoning-finding-the-way.pdf') },
      { group: 'Lecture slides', label: 'Reasoning: finding the way, step by step (Handout)', url: deck(1, 'ainit-hs26-reasoning-finding-the-way-handout.pdf') },
      { group: 'Lecture slides', label: 'The ladder: from a language model to a planning agent', url: deck(1, 'ainit-hs26-the-ladder.pdf') },
      { group: 'Lecture slides', label: 'The ladder (Handout)', url: deck(1, 'ainit-hs26-the-ladder-handout.pdf') },
      { group: 'Lecture slides', label: 'The ladder (Annotated)', url: deck(1, 'ainit-hs26-the-ladder-annotated.pdf') },
      { group: 'Lecture slides', label: 'Prompt optimization: OPRO', url: deck(1, 'ainit-hs26-opro.pdf') },
      { group: 'Lecture slides', label: 'Prompt optimization: OPRO (Handout)', url: deck(1, 'ainit-hs26-opro-handout.pdf') },
      { group: 'Lecture slides', label: 'Prompt optimization: OPRO (Annotated)', url: deck(1, 'ainit-hs26-opro-annotated.pdf') },
      { group: 'Lecture slides', label: 'Summary of GEPA', url: deck(1, 'ainit-hs26-gepa.pdf') },
      { group: 'Lecture slides', label: 'Summary of GEPA (Handout)', url: deck(1, 'ainit-hs26-gepa-handout.pdf') },
      // { group: 'Lecture slides', label: 'Summary of GEPA (Annotated)', url: deck(1, '') },
      { group: 'Lecture slides', label: 'MLOps', url: deck(1, 'mlops-slides-hs26.pdf') },
      // { group: 'Lecture slides', label: 'MLOps (Annotated)', url: deck(1, '') },
      { group: 'Lecture slides', label: 'Guest lecture: Joao Carvalho, "Harnesses: Beyond the Model"', url: deck(1, 'ainit-hs26-guest-joao-carvalho.pdf') },

      /* Coding exercises */
      { group: 'Coding exercises', label: 'Python Recap', url: colab('w1-cx-public', 'Python_recap.ipynb') },
      { group: 'Coding exercises', label: 'Ge\'ez Games', url: exercise(1, '01_geez_llm_game.html') },
      { group: 'Coding exercises', label: 'Prompt engineering: Basics', url: colab('w1-cx-public', '02a_prompt_engineering_student.ipynb') },
      { group: 'Coding exercises', label: 'Prompt engineering: Chain of thought', url: colab('w1-cx-public', '02b_CoT_student.ipynb') },
      { group: 'Coding exercises', label: 'Prompt engineering: Tree of thought + subquestion decomposition', url: colab('w1-cx-public', '02c_subques_student.ipynb') },
      { group: 'Coding exercises', label: 'OPRO', url: colab('w1-cx-public', '03_opro_student.ipynb') },
      { group: 'Coding exercises', label: 'MLOps', url: colab('w1-cx-public', '04_mlops_student.ipynb') },

      /* Visualizations */
      // The game of the reasoning slides, "Mara's Town" (it replaced Mara's Valley on 2026-10-16):
      // Mara carries letters across a town of nine places, told by their houses and their
      // snowmen, and the reader sends her north and east and delivers. One HTML page with its
      // fonts and pictures inside, no network needed, works on a phone. Source: town-lab/ in
      // w1-lecture-material.
      { group: 'Visualizations', label: "Mara's Town: finding the way, step by step (game)", url: viz(1, 'mara-town') },

      /* Project */
      {
        group: 'Project',
        label: 'Project 1 slides',
        url: deck(1, 'w1_project_intro_hs26.pdf'),
      },
      {
        group: 'Project',
        label: 'Project 1 Colab notebook',
        url: colab('w1-project-public', 'project1.ipynb'),
      },
      // { group: 'Project', label: 'Project 1 grading scheme', url: SOON },


      // Demo of how another type of resource can be added
      // {
      //   group: 'Setup',
      //   label: 'Setting up Claude Code: VS Code, a terminal, and your licence',
      //   url: guide('filename'),
      // },
      { group: 'CX solutions', label: 'Prompt engineering: Basics', url: colab('w1-cx-public', '02a_prompt_engineering_solution.ipynb') },
      { group: 'CX solutions', label: 'Prompt engineering: Chain of thought', url: colab('w1-cx-public', '02b_CoT_solution.ipynb') },
      { group: 'CX solutions', label: 'Prompt engineering: Tree of thought + subquestion decomposition', url: colab('w1-cx-public', '02c_subques_solution.ipynb') },
      { group: 'CX solutions', label: 'OPRO', url: colab('w1-cx-public', '03_opro_solution.ipynb') },
      { group: 'CX solutions', label: 'MLOps', url: colab('w1-cx-public', '04_mlops_solution.ipynb') }, 
    ],
  },
  {
    id: 'we2',
    number: 2,
    title: 'Representation Learning',
    theme: 'Nearest neighbors, matrix factorization, bandits, and large-scale computing',
    dates: '13–14 November 2026',
    startISO: '2026-11-13',
    fridayRoom: 'HG D 7.2',
    saturdayRoom: 'HG D 7.2',
    project: 'Recommender for online retail',
    summary:
      'This weekend introduces representation learning through recommendation systems: the inner product and nearest neighbors, matrix factorization, and bandit algorithms, then large-scale computing, from computing clusters to matrix factorization on many computers. Guest lecture on Saturday.',
    // Agenda from the Syllabus tab of the master spreadsheet, read on 2026-11-06 (Carlos's instruction that day),
    // and his message of the same afternoon for Saturday: Buhmann from 09:00 to 12:00. His message of 2026-11-11:
    // computing clusters (the Saturday 08:15 block until then) merged with parallelized matrix factorization into
    // the Friday 16:00 block "Large-scale computing", the project intro at Saturday 08:15, the coding bazaar at
    // 12:00, and no handouts for the cold intros. Each day's first row stays at 08:15, the Vorlesungsverzeichnis time (see the
    // schedule facts above), where the spreadsheet says 08:00; the break rows keep the programme office's venues.
    // The chips are the weekend's visualizations (pages in public/viz/we2/, copied from the private repository
    // eth-ainit-hs26/w2-cx-private; each game opens its own Colab notebooks) and the business cases (public/slides/we2/,
    // from cases-deck/ of the public repository eth-ainit-hs26/w2-recsys-bandits-lecture), published at Carlos's
    // instruction of 2026-11-06: since 2026-11-09 one PDF per block with all the cases that follow it, on that block's
    // row ("for each block, put in one single deck all the slides with all the business cases"); before, one per case.
    // Since 2026-11-12 each block's business cases come first on its row, and where the block has a cold intro, the
    // two are one PDF named after the block (Carlos: "always put the cold intro with the business on top at the
    // beginning before the rest of the material ... make that for each block the first chip"), made by
    // cold-intro-and-cases/merge.py of the same public repository.
    friday: [
      {
        time: '08:15',
        title: 'The inner product and nearest neighbors',
        type: 'lecture',
        // The cold intro "Searching through representations" (the story of Chunyu Kun, Zhanguo ce, Qi 3) and the
        // cases Etsy and Airbnb in one PDF, "Nearest neighbors" (Carlos, 2026-11-12: "they become now together number
        // two, and I want you to call it nearest neighbors"). Number 01 since the semester cheat sheet left the agenda
        // the same day (Carlos: "Drop the cheat sheet from the agenda of weekend 2. We'll keep it on the website."); it
        // is in the Materials list below and by the title on the home page.
        links: [
          { label: 'Nearest neighbors', url: deck(2, 'ainit-hs26-nearest-neighbors-cold-intro-and-cases.pdf') },
          { label: 'Once Upon a Video Store', url: viz(2, 'video-store') },
        ],
      },
      {
        time: '09:00',
        title: 'Inner product and nearest neighbors',
        type: 'exercise',
        // The CX rows show their Colab notebooks since 2026-11-13, although the games open them too (Carlos: "Please
        // put the links to the colab notebooks for the exercises on the corresponding CX slots"); a chip, as on the
        // 12:00 and 15:00 rows.
        links: [{ label: 'Notebook', url: colab('w2-cx-public', '01_cx_nearest_neighbours_student.ipynb') }],
      },
      {
        time: '10:00',
        title: 'Matrix product and matrix factorization',
        type: 'lecture',
        // Part one here, Once Upon a Matchmaker; part two and the optional part at 11:00, the optional one last
        // (Carlos, 2026-11-06). Since 2026-11-12 three games: part three, the whole picture, is the second half of
        // part two (Carlos: "merge matchmaker part 2 matrix factorization with matchmaker part 3, the whole
        // picture"), and parts two and optional are Once Upon a Streaming Service (w2-cx-private 57cac74, 1e1048f).
        links: [{ label: 'Once Upon a Matchmaker, matrix multiplication', url: viz(2, 'matchmaker-part-1') }],
      },
      { time: '10:30', title: 'Coffee break outside the classroom, until 11:00', type: 'break' },
      {
        time: '11:00',
        title: 'Matrix product and matrix factorization',
        type: 'lecture',
        // The block's business case first (it has no cold intro), then the games. The lecture notes of the morning
        // are beside the ZIP button since 2026-11-12 (`download.notes`).
        links: [
          { label: 'Business case, Spotify', url: deck(2, 'ainit-hs26-business-cases-matrix-factorization.pdf') },
          { label: 'Once Upon a Streaming Service, matrix factorization', url: viz(2, 'matchmaker-part-2') },
          { label: 'Once Upon a Streaming Service, optional, gradient descent up close', url: viz(2, 'matchmaker-optional') },
        ],
      },
      { 
        time: '12:00', 
        title: 'Matrix factorization', 
        type: 'exercise',
        links: [
          { label: "Part 1+2", url: colab('w2-cx-public', '02_cx_matrix_factorization_student.ipynb') },
          { label: "Part 3+4 (Optional)", url: colab('w2-cx-public', '02_cx_matrix_factorization_optional_student.ipynb') },
          { label: "Recommendation System", url: colab('w2-cx-public', '02_cx_recsys_student.ipynb') },
        ]
      },
      { time: '13:00', title: 'Lunch break at Dozentenfoyer, until 14:00', type: 'break' },
      {
        time: '14:00',
        title: 'Bandits',
        type: 'lecture',
        // The cold intro "Estimating chances from the past" (John Graunt's Bills of Mortality, London, 1662; Carlos
        // chose it from three drafts on 2026-11-11) and the cases Spotify's home page and Amazon Payments, in one PDF
        // since 2026-11-12.
        links: [
          { label: 'Bandits', url: deck(2, 'ainit-hs26-bandits-cold-intro-and-cases.pdf') },
          { label: 'Once Upon a Mirror', url: viz(2, 'mirror') },
        ],
      },
      { 
        time: '15:00', 
        title: 'Bandits', 
        type: 'exercise',
        links: [
          // { label: "1) Estimates", url: colab('w2-cx-public', '03_cx_bandits_1_estimates_student.ipynb') },
          // { label: "2) Random", url: colab('w2-cx-public', '03_cx_bandits_2_random_student.ipynb') },
          // { label: "3) Explore-then-exploit", url: colab('w2-cx-public', '03_cx_bandits_3_estimate_then_exploit_student.ipynb') },
          // { label: "4) Epsilon-greedy", url: colab('w2-cx-public', '03_cx_bandits_4_epsilon_greedy_student.ipynb') },
          // { label: "5) UCB", url: colab('w2-cx-public', '03_cx_bandits_5_ucb_student.ipynb') },
          { label: "Urn Games", url: viz(2, 'urn') },
          // keepWithGames: shown here although the Urn Games page also opens it.
          { label: "Bandits (all-in-one)", url: colab('w2-cx-public', '03_cx_bandits_6_all_in_one_student.ipynb'), keepWithGames: true },
        ]
      },
      { time: '15:30', title: 'Coffee break at Polysnack, until 16:00', type: 'break' },
      {
        time: '16:00',
        title: 'Large-scale computing',
        type: 'lecture',
        // Computing clusters and parallelized matrix factorization in one block (Carlos, 2026-11-11). Since 2026-11-12,
        // in his order, "large-scale computing cold intro with business case, LinkedIn ads, then computing clusters",
        // and later that day "Notice the slides on large-scale computing and computing clusters. Merge them, I meant":
        // one PDF, the cold intro "Dividing a computation, 1793" (FDD's section of that name), the case LinkedIn's ads,
        // then the first block of FDD weekend 7 ported into Codex plates (clusters-deck/ of the public repository
        // eth-ainit-hs26/w2-recsys-bandits-lecture, published at Carlos's instruction of 2026-11-10), made by
        // cold-intro-and-cases/merge.py there. The handout is that of the clusters deck alone (no cold intro or business
        // case has a handout since 2026-11-11). Then the Grid.
        links: [
          { label: 'Large-scale computing', url: deck(2, 'ainit-hs26-large-scale-computing.pdf') },
          { label: 'Handout', url: deck(2, 'ainit-hs26-large-scale-computing-handout.pdf') },
          { label: 'Matchmaker on a Grid', url: viz(2, 'matchmaker-grid') },
        ],
      },
    ],
    saturday: [
      { 
        time: '08:15', 
        title: 'Project intro: Recommender for online retail', 
        type: 'project',
        links: [
          { label: 'Project intro, Recommender for online retail', url: deck(2, 'w2_project_intro_hs26.pdf') },
          { label: 'Project Notebook', url: colab('w2-project-public', 'project2_student.ipynb') },
        ]
      },
      {
        time: '09:00',
        title: 'Guest lecture: Joachim M. Buhmann',
        type: 'lecture',
        // The speaker's slides, "Quo Vadis, Artificialis Intelligentia?" (68 pages, his PDF of 2026-11-13, published
        // unchanged at Carlos's request of 2026-11-14: "Slides from Prof Buhmann arrived, please upload them on the
        // website"). On the first of the three guest rows only, as in weekend 1.
        links: [
          { label: 'Guest lecture, Joachim M. Buhmann', url: deck(2, 'ainit-hs26-guest-joachim-buhmann.pdf') },
        ],
      },
      { time: '10:00', title: 'Coffee break at HG E30.0075, until 10:30', type: 'break' },
      { time: '10:30', title: 'Guest lecture: Joachim M. Buhmann', type: 'lecture' },
      { time: '11:00', title: 'Guest lecture: Joachim M. Buhmann', type: 'lecture' },
      { time: '12:00', title: 'Coding bazaar', type: 'lab' },
    ],
    // The Materials list. Every deck and visualization on the agenda is listed by the page itself, numbered, under
    // "Slides and visualizations" (src/lib/materials.ts), so it is not repeated here; a deck or visualization added
    // here and not to the agenda stops the build, unless it is one of `download.extras`. Every coding-exercise
    // notebook of w2-cx-public is listed, the student version under Coding exercises and the solution under CX
    // solutions, as in weekend 1 (2026-11-13; until then a notebook that one of the games opens was left off).
    resources: [
      // The semester cheat sheet, the three weekends on one A3 page, from cheat-sheet/ of the public repository
      // eth-ainit-hs26/w2-recsys-bandits-lecture (Carlos's yes, 2026-11-11), also by the title on the home page. Number
      // 01 of the agenda from 9e0be17 (2026-11-11) until 2026-11-12, when Carlos asked: "Drop the cheat sheet from the
      // agenda of weekend 2. We'll keep it on the website." Here since then without a number, as in ab95b28.
      { group: 'Cheat sheet', label: 'The semester on one page, all three weekends', url: deck(2, 'ainit-hs26-cheat-sheet.pdf') },
      { group: 'Business cases', label: 'All six cases', url: deck(2, 'ainit-hs26-business-cases.pdf') },
      {
        group: 'Lecture notes',
        label: 'Nearest neighbors and matrix factorization',
        url: deck(2, 'ainit-hs26-lecture-notes-nearest-neighbors-and-matrix-factorization.pdf'),
      },
      {
        group: 'Lecture notes',
        label: 'Handwritten summary, inner product to large-scale computing',
        url: deck(2, 'ainit-hs26-handwritten-summary.pdf'),
      },
      { group: 'Coding exercises', label: 'Inner product and nearest neighbors', url: colab('w2-cx-public', '01_cx_nearest_neighbours_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Matrix factorization (Part 1+2)', url: colab('w2-cx-public', '02_cx_matrix_factorization_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Matrix factorization (Part 3+4, optional)', url: colab('w2-cx-public', '02_cx_matrix_factorization_optional_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Recommendation system', url: colab('w2-cx-public', '02_cx_recsys_student.ipynb') },
      { group: 'Coding exercises', label: 'Bandits: Estimates', url: colab('w2-cx-public', '03_cx_bandits_1_estimates_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Bandits: Random', url: colab('w2-cx-public', '03_cx_bandits_2_random_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Bandits: Explore-then-exploit', url: colab('w2-cx-public', '03_cx_bandits_3_estimate_then_exploit_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Bandits: Epsilon-greedy', url: colab('w2-cx-public', '03_cx_bandits_4_epsilon_greedy_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Bandits: UCB', url: colab('w2-cx-public', '03_cx_bandits_5_ucb_student.ipynb'), keepWithGames: true},
      { group: 'Coding exercises', label: 'Bandits: All-in-one', url: colab('w2-cx-public', '03_cx_bandits_6_all_in_one_student.ipynb'), keepWithGames: true},
      { group: 'Project', label: 'Recommender for online retail: project description', url: deck(2, 'w2_project_intro_hs26.pdf') },
      { group: 'Project', label: 'Recommender for online retail: Colab notebook', url: colab('w2-project-public', 'project2_student.ipynb') },
      { group: 'CX solutions', label: 'Inner product and nearest neighbors', url: colab('w2-cx-public', '01_cx_nearest_neighbours_solutions.ipynb') },
      { group: 'CX solutions', label: 'Matrix factorization (Part 1+2)', url: colab('w2-cx-public', '02_cx_matrix_factorization_solutions.ipynb') },
      { group: 'CX solutions', label: 'Matrix factorization (Part 3+4, optional)', url: colab('w2-cx-public', '02_cx_matrix_factorization_optional_solutions.ipynb') },
      { group: 'CX solutions', label: 'Recommendation system', url: colab('w2-cx-public', '02_cx_recsys_solutions.ipynb') },
      { group: 'CX solutions', label: 'Bandits: Estimates', url: colab('w2-cx-public', '03_cx_bandits_1_estimates_solutions.ipynb') },
      { group: 'CX solutions', label: 'Bandits: Random', url: colab('w2-cx-public', '03_cx_bandits_2_random_solutions.ipynb') },
      { group: 'CX solutions', label: 'Bandits: Explore-then-exploit', url: colab('w2-cx-public', '03_cx_bandits_3_estimate_then_exploit_solutions.ipynb') },
      { group: 'CX solutions', label: 'Bandits: Epsilon-greedy', url: colab('w2-cx-public', '03_cx_bandits_4_epsilon_greedy_solutions.ipynb') },
      { group: 'CX solutions', label: 'Bandits: UCB', url: colab('w2-cx-public', '03_cx_bandits_5_ucb_solutions.ipynb') },
      { group: 'CX solutions', label: 'Bandits: All-in-one', url: colab('w2-cx-public', '03_cx_bandits_6_all_in_one_solutions.ipynb') },
    ],
    // Numbers every deck and visualization of the agenda in the agenda's order, on the page, in the names of the
    // saved files and in one ZIP behind the button at the top of the page (Carlos, 2026-11-11: "all materials
    // become enumerated in the order in which they should be done"; the coding exercises stay out). The order IS
    // the agenda: add, move or remove a link there and the numbers, the file names and the ZIP follow on the next
    // build. A link's label is the material's name, so it must be a file name (no colon). A handout is linked
    // right after its deck as `<deck>-handout.pdf` and takes the deck's number. scripts/sync-materials.mjs stops
    // the build when the agenda and public/slides/we2/ or public/viz/we2/ disagree.
    download: {
      file: 'ainit-hs26-weekend-2.zip',
      note: 'The slides and games of this page with their numbers, the lecture notes, the handwritten summary, and the handouts in a folder of their own. The games open the coding exercises in Colab.',
      // Beside the ZIP button since 2026-11-12, without a number, and in the ZIP (Carlos: "The lecture notes, nearest
      // neighbors, and matrix factorization. I want you to put that next to download all slides and visualizations").
      // The 11:00 row held them until then, number 10. From lecture-notes/ of the public repository
      // eth-ainit-hs26/w2-recsys-bandits-lecture.
      notes: [
        {
          label: 'Lecture notes, nearest neighbors and matrix factorization',
          url: deck(2, 'ainit-hs26-lecture-notes-nearest-neighbors-and-matrix-factorization.pdf'),
        },
        // Carlos's handwritten summary of the lectures (inner product, matrix product, matrix factorization,
        // large-scale computing): pages 38 and 39 of his iPad copy of "01 Nearest neighbors" (exported 2026-11-14),
        // unchanged, in that order. His request that day: "take the last slide with the second to last handwriting
        // slide and put it on the website on the weekend".
        {
          label: 'Handwritten summary, inner product to large-scale computing',
          url: deck(2, 'ainit-hs26-handwritten-summary.pdf'),
        },
      ],
      // The combined case deck repeats the four block decks: it stays in the Materials list without a number, and out of the ZIP.
      // No handouts of the business cases since 2026-11-11 (Carlos: "Remove also the handouts for the business cases").
      // The semester cheat sheet the same way since 2026-11-12: off the agenda, in the Materials list without a number,
      // out of the ZIP, and by the title on the home page.
      extras: [deck(2, 'ainit-hs26-business-cases.pdf'), deck(2, 'ainit-hs26-cheat-sheet.pdf')],
    },
  },
  {
    id: 'we3',
    number: 3,
    title: 'Reinforcement Learning',
    theme: 'Markov decision processes, runs and cumulative rewards, REINFORCE',
    dates: '11–12 December 2026',
    startISO: '2026-12-11',
    fridayRoom: 'HG D 7.2',
    saturdayRoom: 'HG D 7.2',
    project: 'Reinforcement learning for vehicle routing',
    summary:
      'This weekend introduces reinforcement learning: Markov decision processes (MDPs), runs and cumulative rewards, and the REINFORCE algorithm, first as proto-REINFORCE, then with baselines. Guest lecture on Friday afternoon.',
    // Agenda from the Syllabus tab of the master spreadsheet, read on 2026-11-14 (Carlos that day: "update the schedule
    // to what I have so far, because I'm changing the schedule for that weekend"). Each day's first row stays at 08:15,
    // the Vorlesungsverzeichnis time, where the spreadsheet says 08:00; the break rows keep the programme office's
    // venues. The spreadsheet has no Saturday 12:00 row for this weekend.
    friday: [
      {
        time: '08:15',
        title: 'MDPs',
        type: 'lecture',
        // "Press Start", four games of the FS26 arcade, played only (Carlos, 2026-11-14: "In the first section, we're
        // going to show some video games for them to play"): Old Bessie, ANYmal, Last-Minute Pricing, Pokemon. Built
        // in the private repository eth-ainit-hs26/w3-cx-private, folder 01_arcade, copied here without its tools
        // and CLAUDE.md files.
        links: [{ label: 'Press Start, four games', url: viz(3, 'arcade') }],
      },
      { time: '09:00', title: 'MDPs', type: 'exercise' },
      { time: '10:00', title: 'Runs and cumulative rewards', type: 'lecture' },
      { time: '10:30', title: 'Coffee break at Dozentenfoyer, until 11:00', type: 'break' },
      { time: '11:00', title: 'proto-REINFORCE', type: 'lecture' },
      { time: '12:00', title: 'Coding bazaar', type: 'lab' },
      { time: '13:00', title: 'Lunch break at Dozentenfoyer, until 14:00', type: 'break' },
      { time: '14:00', title: 'proto-REINFORCE', type: 'exercise' },
      { time: '15:00', title: 'REINFORCE with baselines', type: 'lecture' },
      { time: '15:30', title: 'Coffee break at Polysnack, until 16:00', type: 'break' },
      { time: '16:00', title: 'Guest lecture: Alina Dubatovka', type: 'lecture' },
    ],
    saturday: [
      { time: '08:15', title: 'Preparation for the project', type: 'project' },
      { time: '09:00', title: 'Preparation for the project', type: 'exercise' },
      { time: '10:00', title: 'Coffee break outside the classroom, until 10:30', type: 'break' },
      { time: '10:30', title: 'More preparation for the project', type: 'project' },
      { time: '11:00', title: 'Project intro: Reinforcement learning for vehicle routing', type: 'project' },
    ],
    resources: [
      { group: 'Lecture slides', label: 'Reinforcement learning', url: SOON },
      { group: 'Coding exercises', label: 'MDPs', url: SOON },
      { group: 'Coding exercises', label: 'proto-REINFORCE', url: SOON },
      { group: 'Project', label: 'RL vehicle routing: project description', url: SOON },
      { group: 'Project', label: 'RL vehicle routing: Colab notebook', url: SOON },
      // { group: 'Project', label: 'RL vehicle routing: grading scheme', url: SOON },
    ],
  },
];

export const getWeekend = (id: string): Weekend | undefined =>
  weekends.find((w) => w.id === id);

/**
 * Room label for a weekend. Collapses to a single room when Friday and Saturday
 * share one, which is the case for all of HS26; keeps the two-room form so a
 * future split only needs the data file changed.
 */
export const weekendRoom = (w: Weekend): string | undefined => {
  const { fridayRoom: fri, saturdayRoom: sat } = w;
  if (fri && sat) return fri === sat ? fri : `Fri ${fri} · Sat ${sat}`;
  return fri ?? sat;
};
