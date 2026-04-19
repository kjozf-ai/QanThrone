import React from "react";
import { FeedEvent } from "../hooks/useThrone";

interface Props {
  events: FeedEvent[];
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60)   return `${diff}mp`;
  if (diff < 3600) return `${Math.floor(diff / 60)}p`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}ó`;
  return `${Math.floor(diff / 86400)}n`;
}

function shortAddr(a: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "?";
}

function EventRow({ ev }: { ev: FeedEvent }) {
  const name = ev.nickname || shortAddr(ev.king);

  const content = ev.type === "claimed"
    ? <><span className="text-throne-gold font-semibold">{name}</span> <span className="text-throne-muted">elfoglalta a trónt</span> 👑</>
    : ev.type === "achievement"
    ? <><span className="text-throne-purple2 font-semibold">{shortAddr(ev.king)}</span> <span className="text-throne-muted">megszerezte:</span> <span className="text-throne-gold2">{ev.extra}</span> 🏅</>
    : <><span className="text-throne-success">{ev.extra}</span> 🏆</>;

  const dot = ev.type === "claimed"
    ? "bg-throne-gold"
    : ev.type === "achievement"
    ? "bg-throne-purple2"
    : "bg-throne-success";

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-throne-border/40 last:border-0 animate-slide-in">
      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <div className="flex-1 text-sm text-throne-text leading-snug">{content}</div>
      <div className="text-xs text-throne-muted flex-shrink-0 font-mono">{timeAgo(ev.timestamp)}</div>
    </div>
  );
}

export function RecentFeed({ events }: Props) {
  return (
    <div className="bg-panel border border-throne-border rounded-2xl p-6 h-full">
        <h2 className="font-display font-bold text-xl text-gradient-gold mb-4 flex items-center gap-2">
          <span>⚡</span> Élő feed
          <span className="ml-auto w-2 h-2 rounded-full bg-throne-success animate-pulse" />
        </h2>

        {!events.length ? (
          <div className="text-center py-10 text-throne-muted">
            <p className="text-sm">Még nem történt semmi. Légy az első!</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto pr-1">
            {events.map((ev) => (
              <EventRow key={ev.id} ev={ev} />
            ))}
          </div>
        )}
    </div>
  );
}
