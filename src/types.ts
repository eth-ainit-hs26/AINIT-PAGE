export type SessionType =
  | 'lecture'
  | 'exercise'
  | 'lab'
  | 'quiz'
  | 'break'
  | 'project'
  | 'tba';

export interface Session {
  time: string;
  /** Empty for slots the syllabus leaves open (rendered as a quiet placeholder row). */
  title: string;
  type: SessionType;
  /** Optional single link for this session, e.g. one notebook opened in Colab. */
  url?: string;
  /** Optional multiple labelled links, e.g. slides plus a handout. */
  links?: Resource[];
}

export interface Resource {
  label: string;
  url: string;
  /**
   * Optional sub-section heading on the weekend's Materials list, e.g.
   * "Lecture slides", "Coding exercises", "Project". Resources sharing a group
   * are rendered together under that heading, groups appear in first-seen
   * order. Resources without a group render as a single flat list.
   */
  group?: string;
  /**
   * Show this link even when it is a notebook that one of the weekend's games
   * already opens (src/lib/materials.ts hides those by default).
   */
  keepWithGames?: boolean;
}

/**
 * Turns on the numbered materials of a weekend (src/lib/materials.ts): every
 * deck and visualization on its agenda is numbered in the agenda's order, on the
 * page, in the saved file names and in one ZIP behind a button at the top of
 * the page. scripts/sync-materials.mjs builds the ZIP and checks the agenda
 * against public/ before every `npm run dev` and `npm run build`.
 */
export interface Download {
  /** File name of the ZIP, served from downloads/, e.g. "ainit-hs26-weekend-2.zip". */
  file: string;
  /** One line under the button: what the ZIP holds. */
  note: string;
  /**
   * deck() or viz() links in the Materials list that are on purpose not on the
   * agenda: shown without a number, left out of the ZIP. Any other deck or
   * visualization of the weekend must be on the agenda, or the build stops.
   */
  extras?: string[];
  /**
   * Lecture notes (deck() links to PDFs): buttons beside the ZIP button, without a
   * number, off the agenda, and in the ZIP's folder under their label (Carlos,
   * 2026-11-12). The label is the file name, so no colon.
   */
  notes?: Resource[];
}

export interface Weekend {
  /** Stable slug used in the URL, e.g. "we2". */
  id: string;
  number: number;
  title: string;
  /** Short theme / subtitle. */
  theme: string;
  /** Human-readable date range, e.g. "4–5 September 2026". */
  dates: string;
  /** ISO date of the Friday the weekend starts on (Saturday is the next day). */
  startISO: string;
  /** Project introduced at this weekend, if any. */
  project?: string;
  /** Authored short description of the weekend. */
  summary: string;
  /** Room / location for the Friday schedule, if known. */
  fridayRoom?: string;
  /** Room / location for the Saturday schedule, if known. */
  saturdayRoom?: string;
  friday: Session[];
  saturday: Session[];
  resources: Resource[];
  /** The weekend's slides and visualizations in one ZIP, numbered in order. */
  download?: Download;
}
