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
 * 08:15 rather than 08:00.
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
        time: '08:15',
        title: 'Language models with the Ge\'ez games',
        type: 'lecture',
        // "Annotated" is the same deck as Carlos wrote on it in the lecture, an
        // iPad export, and it sits right after the deck it annotates on every
        // lecture row, as on the FDD site. Carlos asked for that on 2026-09-05,
        // when the last four copies arrived. Their embedded fonts are damaged,
        // see the note on the Materials list below.

        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      {
        time: '09:00',
        title: 'Ge\'ez games',
        type: 'exercise',
        // Three browser exercises run in this slot. All are self-contained
        // pages, so 'Open in browser' would name them all: the labels say
        // WHICH exercise instead, in the order the TA runs them.

        // links: [
        //   {
        //     label: 'Ge\'ez games',
        //     url: exercise(1, ''),
        //   },
        // ],
      },
      {
        time: '10:00',
        title: 'Large language models',
        type: 'lecture',
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      { time: '10:30', title: 'Coffee break at Dozentenfoyer, until 11:00', type: 'break' },
      {
        time: '11:00',
        title: 'Reasoning, prompt engineering, and OPRO',
        type: 'lecture',
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      {
        time: '12:00',
        title: 'Coding bazaar',
        type: 'lab',
      },
      { time: '13:00', title: 'Lunch break at Dozentenfoyer, until 14:00', type: 'break' },
      {
        time: '14:00',
        title: 'Prompt engineering',
        type: 'exercise',
        // links: [
        //   {
        //     label: 'Prompt engineering notebook',
        //     url: colab('w1-cx-public', ''),
        //   },
        // ]
      },
      {
        time: '15:00',
        title: 'Summary of GEPA',
        type: 'lecture',
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      { time: '15:30', title: 'Coffee break at Dozentenfoyer, until 16:00', type: 'break' },
      {
        time: '16:00',
        title: "OPRO",
        type: 'exercise',
        // links: [
        //   {
        //     label: 'OPRO notebook',
        //     url: colab('w1-cx-public', ''),
        //   },
        // ]
      },
    ],
    saturday: [
      {
        time: '08:15',
        title: 'MLOps',
        type: 'lecture',
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      {
        time: '09:00',
        title: 'MLOps',
        type: 'exercise',
        // links: [
        //   {
        //     label: 'MLOps notebook',
        //     url: colab('w1-cx-public', ''),
        //   },
        // ]
      },
      { time: '10:00', title: 'Coffee break at HG D30.0075, until 10:30', type: 'break' },
      {
        time: '10:30',
        title: 'The future of AI',
        type: 'lecture',
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   { label: 'Annotated', url: deck(1, '') },
        // ],
      },
      {
        time: '11:00',
        title: 'Cosine similarity and basics of linear algebra',
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
        // links: [
        //   { label: 'Slides', url: deck(1, '') },
        //   {
        //     label: 'Project Notebook',
        //     url: colab('w1-project-public', ''),
        //   },
        // ],
      },
    ],
    resources: [
      /* Centralized list of all the weekend's resources */

      /* Slides */
      // { group: 'Lecture slides', label: 'Language models with the Ge\'ez games', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Language models with the Ge\'ez games (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Large language models', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Large language models (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Reasoning, prompt engineering, and OPRO', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Reasoning, prompt engineering, and OPRO (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Summary of GEPA', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Summary of GEPA (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'MLOps', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'MLOps (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'MLOps (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'The future of AI', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'The future of AI (Annotated)', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Cosine similarity and basics of linear algebra', url: deck(1, '') },
      // { group: 'Lecture slides', label: 'Cosine similarity and basics of linear algebra (Annotated)', url: deck(1, '') },

      /* Coding exercises */
      // { group: 'Coding exercises', label: "Ge'ez games", url: exercise(1, '') },
      // { group: 'Coding exercises', label: 'Prompt engineering', url: colab('w1-cx-public', '') },
      // { group: 'Coding exercises', label: 'OPRO', url: colab('w1-cx-public', '') },
      // { group: 'Coding exercises', label: 'MLOps', url: colab('w1-cx-public', '') },

      /* Project */
      // {
      //   group: 'Project',
      //   label: 'Project 1 slides',
      //   url: deck(1, ''),
      // },
      // {
      //   group: 'Project',
      //   label: 'Project 1 Colab notebook',
      //   url: colab('w1-project-public', ''),
      // },
      // { group: 'Project', label: 'Project 1 grading scheme', url: SOON },


      // Demos of how other types of resources can be added
      // {
      //   group: 'Visualizations',
      //   label: ''
      //   url:  viz(1, 'filename'),
      // },
      // {
      //   group: 'Setup',
      //   label: 'Setting up Claude Code: VS Code, a terminal, and your licence',
      //   url: guide('filename'),
      // },
    ],
  },
  {
    id: 'we2',
    number: 2,
    title: 'Representation Learning',
    theme: 'Recommendation systems, matrix factorization, and bandits',
    dates: '13–14 November 2026',
    startISO: '2026-11-13',
    fridayRoom: 'HG D 7.2',
    saturdayRoom: 'HG D 7.2',
    project: 'Recommender for online retail',
    summary:
      'This weekend introduces the notion of representation learning, with a focus on recommendation systems, matrix factorization, and bandit algorithms. Guest lectures on Saturday.',
    friday: [
      { time: '08:15', title: 'Recommendation systems', type: 'lecture' },
      { time: '09:00', title: 'Recommendation systems', type: 'exercise' },
      { time: '10:00', title: 'Matrix factorization', type: 'lecture' },
      { time: '10:30', title: 'Coffee break at Polysnack, until 11:00', type: 'break' },
      { time: '11:00', title: 'Matrix factorization', type: 'exercise' },
      { time: '12:00', title: 'Coding bazaar', type: 'lab' },
      { time: '13:00', title: 'Lunch break at Polysnack, until 14:00', type: 'break' },
      { time: '14:00', title: 'Bandits', type: 'lecture' },
      // { time: '14:30', title: 'Bandits', type: 'lecture' },
      { time: '15:30', title: 'Coffee break at Polysnack, until 16:00', type: 'break' },
      { time: '16:00', title: 'Bandits', type: 'exercise' },
    ],
    saturday: [
      { time: '08:15', title: 'Tales of failures of AI', type: 'lecture' },
      { time: '09:00', title: 'Guest lecture: Joachim M. Buhmann', type: 'lecture' },
      { time: '10:00', title: 'Coffee break at HG D30.0075, until 10:30', type: 'break' },
      { time: '10:30', title: 'Guest lecture: Joachim M. Buhmann', type: 'lecture' },
      { time: '11:00', title: 'Guest lecture: Joachim M. Buhmann', type: 'lecture' },
      { time: '12:00', title: 'Project intro: Recommender for online retail', type: 'project' },
    ],
    resources: [
      { group: 'Lecture slides', label: 'Recommendation systems', url: SOON },
      { group: 'Lecture slides', label: 'Matrix factorization', url: SOON },
      { group: 'Lecture slides', label: 'Bandits', url: SOON },
      { group: 'Lecture slides', label: 'Tales of failures of AI', url: SOON },
      { group: 'Lecture slides', label: 'Guest lecture: Joachim M. Buhmann', url: SOON },
      { group: 'Coding exercises', label: 'Recommendation systems', url: SOON },
      { group: 'Coding exercises', label: 'Matrix factorization', url: SOON },
      { group: 'Coding exercises', label: 'Bandits', url: SOON },
      { group: 'Project', label: 'Recommender for online retail: project description', url: SOON },
      { group: 'Project', label: 'Recommender for online retail: Colab notebook', url: SOON },
      { group: 'Project', label: 'Recommender for online retail: grading scheme', url: SOON },
    ],
  },
  {
    id: 'we3',
    number: 3,
    title: 'Reinforcement Learning',
    theme: 'Markov decision processes, Bellman equations, RL algorithms',
    dates: '11–12 December 2026',
    startISO: '2026-12-11',
    fridayRoom: 'HG D 7.2',
    saturdayRoom: 'HG D 7.2',
    project: 'Reinforcement learning for vehicle routing',
    summary:
      'This weekend introduces the fundamentals of reinforcement learning, from the formalism of Markov decision processes (MDPs) to algorithms like epsilon-greedy, SARSA and REINFORCE.',
    friday: [
      { time: '08:15', title: 'MDPs and epsilon-greedy', type: 'lecture' },
      { time: '09:00', title: 'ANYmal and Casinos', type: 'exercise' },
      { time: '10:00', title: 'Epsilon-greedy (continued)', type: 'lecture' },
      { time: '10:30', title: 'Coffee break at Dozentenfoyer, until 11:00', type: 'break' },
      { time: '11:00', title: 'Bellman equations', type: 'lecture' },
      { time: '12:00', title: 'Coding bazaar', type: 'lab' },
      { time: '13:00', title: 'Lunch break at Dozentenfoyer, until 14:00', type: 'break' },
      { time: '14:00', title: 'Bellman equations', type: 'exercise' },
      { time: '14:30', title: 'Robbins-Monro and epsilon greedy', type: 'lecture' },
      { time: '15:30', title: 'Coffee break at HG D30.0075, until 16:00', type: 'break' },
      { time: '16:00', title: 'Robbins-Monro and epsilon greedy', type: 'exercise' },
    ],
    saturday: [
      { time: '08:15', title: 'SARSA', type: 'lecture' },
      { time: '09:00', title: 'SARSA', type: 'exercise' },
      { time: '10:00', title: 'Coffee break at HG D30.0075, until 10:30', type: 'break' },
      { time: '10:30', title: 'REINFORCE', type: 'lecture' },
      { time: '11:00', title: 'Recap', type: 'quiz' },
      { time: '12:00', title: 'Project intro: RL vehicle routing', type: 'project' },
    ],
    resources: [
      { group: 'Lecture slides', label: 'Reinforcement learning', url: SOON },
      { group: 'Coding exercises', label: 'ANYmal game', url: SOON },
      { group: 'Coding exercises', label: 'Casinos game', url: SOON },
      // { group: 'Coding exercises', label: 'Genie game', url: SOON },
      // { group: 'Coding exercises', label: 'Darts game', url: SOON },
      { group: 'Coding exercises', label: 'Bellman equations', url: SOON },
      { group: 'Coding exercises', label: 'Robbins-Monro and epsilon greedy', url: SOON },
      { group: 'Coding exercises', label: 'SARSA', url: SOON },
      { group: 'Project', label: 'RL vehicle routing: project description', url: SOON },
      { group: 'Project', label: 'RL vehicle routing: Colab notebook', url: SOON },
      { group: 'Project', label: 'RL vehicle routing: grading scheme', url: SOON },
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
