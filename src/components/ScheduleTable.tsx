import type { Session } from '../types';
import { SessionTypeChip } from './SessionTypeChip';
import { downloadKind } from '../lib/links';
import type { MaterialsIndex } from '../lib/materials';

interface Props {
  day: string;
  date: string;
  sessions: Session[];
  room?: string;
  /** Numbers the weekend's decks and visualizations and leaves off notebooks a game opens. */
  materials: MaterialsIndex;
}

export function ScheduleTable({ day, date, sessions, room, materials }: Props) {
  return (
    <div className="day">
      <div className="day__head">
        <h3>{day}</h3>
        <span className="day__meta">
          <span className="day__date">{date}</span>
          {room && <span className="day__room">{room}</span>}
        </span>
      </div>
      <div className="schedule">
        {sessions.map((s, i) => {
          // Coding exercises are prefixed with "CX" to match the course convention.
          const title = s.type === 'exercise' ? `CX ${s.title}` : s.title;
          // A row whose own link is a notebook that a game already opens keeps
          // its title, without the link.
          const url = s.url && !materials.hidden(s.url) ? s.url : undefined;
          // PDFs and notebooks are offered as a download rather than opened in
          // the browser viewer. This applies to the chips below as well as the
          // title, so a deck saves the same way whether it is reached from here
          // or from the weekend's Materials list.
          const isFile = !!url && downloadKind(url) !== null;
          const quiet = s.type === 'break' || s.type === 'tba';
          const links = (s.links ?? []).filter((l) => !materials.hidden(l.url));
          return (
            <div key={i} className={`srow${quiet ? ` srow--${s.type}` : ''}`}>
              <div className="srow__time">{s.time}</div>
              <div className="srow__body">
                {url ? (
                  <a
                    className="srow__title srow__title--link"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...(isFile ? { download: '' } : {})}
                  >
                    {title}
                    <span className="srow__ext" aria-hidden="true">
                      {isFile ? '↓' : '↗'}
                    </span>
                  </a>
                ) : (
                  <span className="srow__title">{title}</span>
                )}
                {s.type !== 'break' && (
                  <span className="srow__meta">
                    <SessionTypeChip type={s.type} />
                    {links.map((l, j) => {
                      const isLinkFile = downloadKind(l.url) !== null;
                      // A numbered material shows its number and is saved under
                      // its numbered name; other links show their label.
                      const view = materials.chip(l);
                      const download = view.download ?? (isLinkFile ? '' : undefined);
                      return (
                        <a
                          key={j}
                          className="srow__link"
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...(download !== undefined ? { download } : {})}
                        >
                          {/* The space keeps "04 Handout" in the copied text; the flex layout drops it, the margin shows it. */}
                          {view.tag && <span className="srow__num">{view.tag} </span>}
                          {view.label}
                          <span className="srow__ext" aria-hidden="true">
                            {isLinkFile ? '↓' : '↗'}
                          </span>
                        </a>
                      );
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
