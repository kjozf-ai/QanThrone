import React from "react";
import { TopKing } from "../hooks/useThrone";
import { AchievementBadge } from "./AchievementBadge";

interface Props {
  kings:   TopKing[];
  wallet:  string;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = [
  "from-yellow-500/10 border-yellow-500/30",
  "from-gray-400/10 border-gray-400/30",
  "from-amber-700/10 border-amber-700/30",
];

function fmtTime(secs: number): string {
  if (secs === 0) return "—";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}ó ${m}p`;
  return `${m}p`;
}

function ShortAddr({ addr }: { addr: string }) {
  return (
    <span className="font-mono text-xs text-throne-muted">
      {addr.slice(0, 6)}…{addr.slice(-4)}
    </span>
  );
}

export function Leaderboard({ kings, wallet }: Props) {
  return (
    <div className="bg-panel border border-throne-border rounded-2xl p-6 h-full">
        <h2 className="font-display font-bold text-xl text-gradient-gold mb-5 flex items-center gap-2">
          <span>🏆</span> Toplista
        </h2>

        {!kings.length ? (
          <div className="text-center py-12 text-throne-muted">
            <div className="text-4xl mb-3">👑</div>
            <p>Még nincs adat. Légy az első király!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {kings.map((k, i) => {
              const isMe = wallet && k.address.toLowerCase() === wallet.toLowerCase();
              const medal = MEDALS[i] ?? `#${i + 1}`;
              const rankStyle = RANK_COLORS[i] ?? "from-throne-surface/0 border-throne-border";

              return (
                <div
                  key={k.address}
                  className={`
                    group relative flex items-center gap-4 p-3.5 rounded-xl border
                    bg-gradient-to-r ${rankStyle}
                    transition-all hover:scale-[1.01]
                    ${isMe ? "ring-1 ring-throne-gold/40" : ""}
                  `}
                >
                  {/* Rank */}
                  <div className="w-8 text-center text-xl flex-shrink-0">
                    {typeof medal === "string" && medal.startsWith("#")
                      ? <span className="text-throne-muted font-bold text-sm">{medal}</span>
                      : medal}
                  </div>

                  {/* Name + address */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-throne-text truncate max-w-[140px]">
                        {k.nickname || "?"}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-throne-gold/15 text-throne-gold border border-throne-gold/30 px-1.5 py-0.5 rounded-full">
                          Te
                        </span>
                      )}
                      <ShortAddr addr={k.address} />
                    </div>
                    {k.achievements > 0 && (
                      <div className="mt-1">
                        <AchievementBadge bits={k.achievements} size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-throne-gold font-bold font-mono">
                      {k.timesClaimed}×
                    </div>
                    <div className="text-throne-muted text-xs">foglalás</div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden md:block">
                    <div className="text-throne-purple2 font-mono text-sm font-medium">
                      {fmtTime(k.reignSeconds)}
                    </div>
                    <div className="text-throne-muted text-xs">uralom</div>
                  </div>

                  {/* Explorer link */}
                  <a
                    href={`https://testnet.qanscan.com/address/${k.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 text-throne-muted hover:text-throne-gold transition-colors opacity-0 group-hover:opacity-100"
                    title="Megnyitás QANScan-ben"
                  >
                    ↗
                  </a>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
