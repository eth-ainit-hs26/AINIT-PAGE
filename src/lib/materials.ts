import type { Resource, Session, Weekend } from '../types';
// Written by scripts/sync-materials.mjs before every `npm run dev` and `npm run build`; not committed.
import notebooksInGamesJson from '../data/generated/notebooks-in-games.json';

/**
 * THE NUMBERED MATERIALS OF A WEEKEND, derived from its agenda (Carlos, 2026-11-11).
 *
 * In a weekend with a `download`, every deck and visualization of this site
 * linked on the agenda gets a number from its place there: Friday's rows top to
 * bottom, then Saturday's, each row's links left to right. A handout,
 * `<deck>-handout.pdf`, linked right after its deck, takes the deck's number.
 * The number and the link's label make the material's one name, "04 Business
 * cases, Etsy and Airbnb", used on the agenda, in the Materials list, as the
 * name of the saved file and in the weekend's ZIP. No list stores the numbers,
 * so adding, removing or moving a link renumbers everything on the next build.
 * scripts/sync-materials.mjs checks what this cannot: files, names, order.
 *
 * Separately, for every weekend: a link to a notebook that one of the weekend's
 * games already opens is left off the page (Carlos, 2026-11-11: the agenda was
 * "getting very cluttered"). It comes back by itself if the game stops opening it.
 */

const NOTEBOOKS_IN_GAMES: Record<string, string[]> = notebooksInGamesJson;

export interface Material {
  number: number;
  /** The number as shown, zero padded: "04". */
  tag: string;
  /** The label of its link on the agenda: "Business cases, Etsy and Airbnb". */
  name: string;
  url: string;
  kind: 'pdf' | 'viz';
  /** Its file name on the page and in the ZIP: "04 Business cases, Etsy and Airbnb.pdf". */
  fileName: string;
  handout?: { url: string; fileName: string };
}

/** How the page shows one link: its label, the name a PDF is saved under, or nothing at all. */
export interface LinkView {
  label: string;
  /** For the download attribute: the numbered file name, '' for the file's own name. */
  download?: string;
  tag?: string;
}

const isLocal = (url: string): boolean =>
  !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('//') && url !== '#';
export const isPdf = (url: string): boolean => /\.pdf$/i.test(url);
export const isViz = (url: string): boolean => /(^|\/)viz\/we\d+\/[^/]+\/index\.html$/.test(url);
/** The deck of a handout link, or null when the link is no handout. */
export const deckOfHandout = (url: string): string | null =>
  /-handout\.pdf$/i.test(url) ? url.replace(/-handout\.pdf$/i, '.pdf') : null;

/** A deck or a visualization served by this site. */
export const isLocalMaterial = (url: string): boolean => isLocal(url) && (isPdf(url) || isViz(url));

/** Every link of the agenda in its order: each row's title link, then its chips. */
export function agendaLinks(weekend: Weekend): Resource[] {
  const rows: Session[] = [...weekend.friday, ...weekend.saturday];
  return rows.flatMap((s) => [...(s.url ? [{ label: s.title, url: s.url }] : []), ...(s.links ?? [])]);
}

export function numberedMaterials(weekend: Weekend): Material[] {
  if (!weekend.download) return [];
  const list: Material[] = [];
  const byUrl = new Map<string, Material>();
  for (const link of agendaLinks(weekend)) {
    if (!isLocalMaterial(link.url) || byUrl.has(link.url)) continue;
    const deck = deckOfHandout(link.url);
    if (deck) {
      const material = byUrl.get(deck);
      if (material && !material.handout) material.handout = { url: link.url, fileName: '' };
      continue;
    }
    const material: Material = {
      number: list.length + 1,
      tag: '',
      name: link.label,
      url: link.url,
      kind: isPdf(link.url) ? 'pdf' : 'viz',
      fileName: '',
    };
    list.push(material);
    byUrl.set(link.url, material);
  }
  const width = Math.max(2, String(list.length).length);
  for (const m of list) {
    m.tag = String(m.number).padStart(width, '0');
    m.fileName = `${m.tag} ${m.name}.${m.kind === 'pdf' ? 'pdf' : 'html'}`;
    if (m.handout) m.handout.fileName = `${m.tag} ${m.name} (handout).pdf`;
  }
  return list;
}

/** The notebook file a link opens, "02_cx_recsys_student.ipynb", or null. */
const notebookOf = (url: string): string | null => url.match(/([^/?#]+\.ipynb)(?:[?#].*)?$/)?.[1] ?? null;

/** What the weekend page needs: the numbered list and how to show each link. */
export function materialsIndex(weekend: Weekend) {
  const list = numberedMaterials(weekend);
  const views = new Map<string, { chip: LinkView; entry: LinkView }>();
  for (const m of list) {
    const view = { label: m.name, tag: m.tag, download: m.kind === 'pdf' ? m.fileName : undefined };
    views.set(m.url, { chip: view, entry: view });
    if (m.handout) {
      const h = { tag: m.tag, download: m.handout.fileName };
      views.set(m.handout.url, {
        chip: { ...h, label: 'Handout' },
        entry: { ...h, label: `${m.name} (handout)` },
      });
    }
  }
  const notebooks = new Set(NOTEBOOKS_IN_GAMES[weekend.id] ?? []);
  const hidden = (url: string): boolean => {
    const notebook = notebookOf(url);
    return notebook !== null && notebooks.has(notebook);
  };
  return {
    list,
    hidden,
    /** True for a link the numbered list already shows. */
    numbered: (url: string): boolean => views.has(url),
    /** An agenda chip: tag "04" and label "Business cases, Etsy and Airbnb", a handout "04" "Handout", other links as they are. */
    chip: (link: Resource): LinkView => views.get(link.url)?.chip ?? { label: link.label },
    /** The numbered part of the Materials list, each handout after its deck: "04" "Business cases, Etsy and Airbnb (handout)". */
    entries: (): (LinkView & { url: string })[] =>
      list.flatMap((m) => [
        { url: m.url, ...views.get(m.url)!.entry },
        ...(m.handout ? [{ url: m.handout.url, ...views.get(m.handout.url)!.entry }] : []),
      ]),
  };
}

export type MaterialsIndex = ReturnType<typeof materialsIndex>;
