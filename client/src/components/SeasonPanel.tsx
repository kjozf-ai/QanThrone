import React, { useState, useEffect } from "react";
import { SeasonInfo } from "../hooks/useThrone";

interface Props {
  season: SeasonInfo | null;
}

function useCountdown(remaining: number) {
  const [secs, setSecs] = useState(remaining);
  useEffect(() => {
    setSecs(remaining);
    if (remaining <= 0) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);
  return secs;
}

function StatCard({ icon, label, value, sub }: {
  icon: string; label: string; value: string; sub?: string;
}) {
  return (
    <div className="bg-throne-surface border border-throne-border rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-throne-text font-bold text-xl font-mono">{value}</div>
      {sub && <div className="text-throne-gold text-xs font-mono">{sub}</div>}
      <div className="text-throne-muted text-xs mt-0.5">{label}</div>
    </div>
  );
}

export function SeasonPanel({ season }: Props) {
  const remaining = useCountdown(season?.remaining ?? 0);

  if (!season) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-throne-surface border border-throne-border rounded-2xl p-6 animate-pulse">
          <div className="h-4 bg-throne-border rounded w-1/4 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-throne-border rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");
  const timeStr = d > 0
    ? `${d}n ${fmt(h)}:${fmt(m)}:${fmt(s)}`
    : `${fmt(h)}:${fmt(m)}:${fmt(s)}`;

  const isEnded = remaining === 0;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-panel border border-throne-border rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-xl text-gradient-gold">
              🏅 Szezon #{season.number}
            </h2>
            <p className="text-throne-muted text-xs mt-0.5">
              Aki legtöbbet ül a trónon, nyeri a szezont
            </p>
          </div>
          {!isEnded && (
            <div className="text-right">
              <div className="text-throne-muted text-xs uppercase tracking-wider">Hátralévő idő</div>
              <div className="font-mono font-bold text-throne-gold2 text-lg tabular-nums">
                {timeStr}
              </div>
            </div>
          )}
          {isEnded && (
            <div className="bg-throne-gold/10 border border-throne-gold/30 text-throne-gold text-sm px-4 py-2 rounded-xl animate-bounce-sm">
              🎉 A szezon véget ért!
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon="🏆"
            label="Szezon nyereménypot"
            value={`${parseFloat(season.pot).toFixed(4)}`}
            sub="QANX"
          />
          <StatCard
            icon="👑"
            label="Egyedi királyok"
            value={season.totalKings.toString()}
            sub="játékos"
          />
          <StatCard
            icon="⚔️"
            label="Összes foglalás"
            value={season.claims.toString()}
            sub="alkalom"
          />
          <StatCard
            icon="⏰"
            label="Szezon vége"
            value={new Date(season.ends * 1000).toLocaleDateString("hu-HU", {
              month: "short", day: "numeric",
            })}
            sub={new Date(season.ends * 1000).toLocaleTimeString("hu-HU", {
              hour: "2-digit", minute: "2-digit",
            })}
          />
        </div>

        {/* Progress bar */}
        {!isEnded && season.ends > season.start && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-throne-muted mb-1">
              <span>Szezon kezdete</span>
              <span>Vége</span>
            </div>
            <div className="h-1.5 bg-throne-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-throne-gold to-throne-gold2 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (1 - remaining / (season.ends - season.start)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
