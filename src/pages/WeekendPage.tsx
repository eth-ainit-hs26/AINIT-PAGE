import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { weekends, getWeekend, weekendRoom, downloadZip } from '../data/weekends';
import { ScheduleTable } from '../components/ScheduleTable';
import type { Resource } from '../types';
import { downloadKind } from '../lib/links';
import { materialsIndex } from '../lib/materials';

/**
 * One entry of the Materials list. A numbered material shows its number, `tag`,
 * and a numbered PDF is saved under its numbered name, `download`.
 */
function ResourceLink({ resource, download, tag }: { resource: Resource; download?: string; tag?: string }) {
  const isPlaceholder = resource.url === '#';
  if (isPlaceholder) {
    return (
      <li>
        <span className="reslink reslink--placeholder">
          {resource.label}
          <span className="reslink__arrow">Soon</span>
        </span>
      </li>
    );
  }
  const kind = downloadKind(resource.url);
  return (
    <li>
      <a
        className="reslink"
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        {...(kind ? { download: download ?? '' } : {})}
      >
        <span>
          {tag && <span className="reslink__num">{tag} </span>}
          {resource.label}
        </span>
        <span className="reslink__arrow">
          {kind === 'pdf'
            ? 'PDF ↓'
            : kind === 'notebook'
              ? 'Notebook ↓'
              : kind === 'archive'
                ? 'ZIP ↓'
                : '↗'}
        </span>
      </a>
    </li>
  );
}

export function WeekendPage() {
  const { id } = useParams();
  const weekend = id ? getWeekend(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!weekend) {
    return (
      <section className="section">
        <div className="container">
          <p>Weekend not found.</p>
          <Link to="/">← Back to all weekends</Link>
        </div>
      </section>
    );
  }

  const index = weekends.findIndex((w) => w.id === weekend.id);
  const prev = index > 0 ? weekends[index - 1] : undefined;
  const next = index < weekends.length - 1 ? weekends[index + 1] : undefined;

  const [friDate, satDate] =
    weekend.dates.split('–').length === 2
      ? weekend.dates.split('–')
      : [weekend.dates, weekend.dates];

  const room = weekendRoom(weekend);

  // The weekend's decks and visualizations, numbered in the agenda's order, and
  // the notebooks its games open, which the page leaves off (src/lib/materials.ts).
  const materials = materialsIndex(weekend);
  const numbered = materials.entries();
  // The rest of the Materials list: what the numbered list does not already show.
  const resources = weekend.resources.filter(
    (r) => !materials.numbered(r.url) && (r.keepWithGames || !materials.hidden(r.url)),
  );
  const hasRealResources = numbered.length > 0 || resources.some((r) => r.url !== '#');

  // Group resources by their optional `group`, preserving first-seen order.
  const resourceGroups: { name?: string; items: Resource[] }[] = [];
  for (const r of resources) {
    let g = resourceGroups.find((x) => x.name === r.group);
    if (!g) {
      g = { name: r.group, items: [] };
      resourceGroups.push(g);
    }
    g.items.push(r);
  }
  const isGrouped = numbered.length > 0 || resourceGroups.some((g) => g.name);

  return (
    <article className="section">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">All weekends</Link> &nbsp;/&nbsp; Weekend {weekend.number}
        </nav>

        <header className="wdetail-head">
          <div className="wdetail-head__eyebrow">
            <span className="wdetail-head__num">Weekend {weekend.number}</span>
          </div>
          <h1>{weekend.title}</h1>
          <p className="wdetail-head__theme">{weekend.theme}</p>
          <dl className="wdetail-meta">
            <div>
              <dt>Dates</dt>
              <dd>{weekend.dates}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>Friday &amp; Saturday</dd>
            </div>
            {room && (
              <div>
                <dt>Room</dt>
                <dd>{room}</dd>
              </div>
            )}
            {weekend.project && (
              <div>
                <dt>Project</dt>
                <dd>{weekend.project}</dd>
              </div>
            )}
          </dl>
          <p className="wdetail-head__summary">{weekend.summary}</p>
          {/*
            The whole weekend in one ZIP, numbered in the order to work through
            it (Carlos, 2026-11-11). At the top, so it is the first thing a
            participant sees on the weekend's page.
          */}
          {weekend.download && (
            <div className="wdetail-head__cta">
              <div className="wdetail-head__buttons">
                <a className="btn" href={downloadZip(weekend.download.file)} download="">
                  Download all slides and visualizations (ZIP)
                </a>
                {(weekend.download.notes ?? []).map((n) => (
                  <a key={n.url} className="btn btn--ghost" href={n.url} download={`${n.label}.pdf`}>
                    {n.label} (PDF)
                  </a>
                ))}
              </div>
              <p className="wdetail-head__note">{weekend.download.note}</p>
            </div>
          )}
        </header>

        <div className="days">
          <ScheduleTable
            day="Friday"
            date={friDate.trim()}
            sessions={weekend.friday}
            room={weekend.fridayRoom}
            materials={materials}
          />
          <ScheduleTable
            day="Saturday"
            date={satDate.trim()}
            sessions={weekend.saturday}
            room={weekend.saturdayRoom}
            materials={materials}
          />
        </div>

        <section className="resources">
          <h2>Materials</h2>
          <p className="resources__note">
            {hasRealResources
              ? 'Slides, notebooks and project descriptions for this weekend.'
              : 'Materials for this weekend will be linked here once they are uploaded.'}
          </p>
          {numbered.length > 0 && (
            <div className="resgroup">
              <h3 className="resgroup__title">Slides and visualizations</h3>
              <ul className="reslist">
                {numbered.map((e) => (
                  <ResourceLink
                    key={e.url}
                    resource={{ label: e.label, url: e.url }}
                    download={e.download}
                    tag={e.tag}
                  />
                ))}
              </ul>
            </div>
          )}
          {isGrouped ? (
            resourceGroups.map((g, gi) => (
              <div className="resgroup" key={gi}>
                {g.name && <h3 className="resgroup__title">{g.name}</h3>}
                <ul className="reslist">
                  {g.items.map((r, i) => (
                    <ResourceLink key={i} resource={r} />
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <ul className="reslist">
              {resources.map((r, i) => (
                <ResourceLink key={i} resource={r} />
              ))}
            </ul>
          )}
        </section>

        <nav className="wnav">
          {prev ? (
            <Link to={`/weekend/${prev.id}`}>
              <span className="wnav__label">Previous</span>
              Weekend {prev.number}: {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/weekend/${next.id}`} className="wnav__next">
              <span className="wnav__label">Next</span>
              Weekend {next.number}: {next.title}
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
