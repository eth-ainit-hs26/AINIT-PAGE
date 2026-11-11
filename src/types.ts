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
}

/**
 * One step of a weekend's download: a deck or a visualization of this site.
 * Its number in the ZIP is its place in the list.
 */
export interface DownloadItem {
  /**
   * Its name in the ZIP, after the number: "03 Once Upon a Video Store.html".
   * A file name on every system, so none of < > : " / \ | ? *
   */
  name: string;
  /** deck() of a PDF or viz() of a visualization, as linked on the page. */
  url: string;
  /** deck() of the deck's handout, filed in the ZIP's Handouts folder under the same number. */
  handout?: string;
}

/**
 * Everything of a weekend in one ZIP, for the button at the top of its page.
 * scripts/build-downloads.mjs builds the ZIP from these files in public/ on
 * every `npm run build`, so it always holds what the site serves.
 */
export interface Download {
  /** File name, served from downloads/, e.g. "ainit-hs26-weekend-2.zip". */
  file: string;
  /** One line under the button: what the ZIP holds. */
  note: string;
  /** The steps in the order to work through them. */
  items: DownloadItem[];
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
