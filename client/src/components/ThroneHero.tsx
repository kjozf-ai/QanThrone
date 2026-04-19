import React, { useState, useEffect, useRef } from "react";
import { KingInfo } from "../hooks/useThrone";
import { AchievementBadge } from "./AchievementBadge";
import { ENTRY_FEE_QANX } from "../lib/config";

interface Props {
  currentKing:    KingInfo | null;
  wallet:         string;
  chainOk:        boolean;
  txPending:      boolean;
  error:          string;
  isConfigured:   boolean;
  onConnect:      () => void;
  onClaim:        (nickname: string) => Promise<boolean>;
  onClearError:   () => void;
}

// ── Trón SVG ────────────────────────────────────────────────
function CrownSVG({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f5a623"/>
          <stop offset="50%"  stopColor="#fcd34d"/>
          <stop offset="100%" stopColor="#f5a623"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Crown shape */}
      <path
        d="M 10 65 L 10 30 L 30 50 L 50 10 L 70 50 L 90 30 L 90 65 Z"
        fill="url(#crownGrad)"
        filter="url(#glow)"
      />
      {/* Base */}
      <rect x="8" y="62" width="84" height="12" rx="4" fill="url(#crownGrad)" filter="url(#glow)"/>
      {/* Gems */}
      <circle cx="50" cy="18" r="5" fill="#ef4444" filter="url(#glow)"/>
      <circle cx="30" cy="52" r="4" fill="#8b5cf6" filter="url(#glow)"/>
      <circle cx="70" cy="52" r="4" fill="#3b82f6" filter="url(#glow)"/>
      <circle cx="50" cy="68" r="3" fill="#fcd34d" filter="url(#glow)"/>
    </svg>
  );
}

// ── Particle effekt ──────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left:            `${10 + Math.random() * 80}%`,
            bottom:          "20%",
            width:           `${2 + Math.random() * 4}px`,
            height:          `${2 + Math.random() * 4}px`,
            opacity:         0.6 + Math.random() * 0.4,
            animationDelay:  `${Math.random() * 3}s`,
            animationDuration:`${1.5 + Math.random() * 2}s`,
            background:      i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#fcd34d" : "#f5a623",
          }}
        />
      ))}
    </div>
  );
}

// ── Reigntime counter ────────────────────────────────────────
function ReignTimer({ king }: { king: KingInfo }) {
  const [secs, setSecs] = useState(king.reignSeconds);
  useEffect(() => {
    setSecs(king.reignSeconds);
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [king.reignSeconds]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="font-mono text-throne-gold2 text-lg font-bold tracking-widest">
      {h > 0 && <>{fmt(h)}:</>}{fmt(m)}:{fmt(s)}
    </span>
  );
}

// ── Fő komponens ─────────────────────────────────────────────
export function ThroneHero({
  currentKing, wallet, chainOk, txPending, error,
  isConfigured, onConnect, onClaim, onClearError,
}: Props) {
  const [nickname, setNickname] = useState("");
  const [claimed,  setClaimed]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOwnKing = wallet && currentKing?.address?.toLowerCase() === wallet.toLowerCase();

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onClaim(nickname);
    if (ok) { setClaimed(true); setTimeout(() => setClaimed(false), 3000); }
  }

  const shortAddr = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

  return (
    <section className="relative stars-bg py-16 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-throne-purple/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2 animate-fade-in-up">
          <span className="text-throne-muted text-sm font-display tracking-widest uppercase">QAN Testnet</span>
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl text-gradient-gold mb-2 leading-none">
          THRONE
        </h1>
        <p className="text-throne-muted text-sm tracking-widest uppercase mb-10">
          King of the Hill · Achievements · Live Feed
        </p>

        {/* Crown + Current King card */}
        <div className="relative inline-block mb-10">
          {/* Glowing ring */}
          <div className="absolute inset-0 rounded-2xl animate-glow-pulse" style={{ margin: "-4px" }} />

          <div className="relative bg-panel border-gold-glow rounded-2xl p-8 md:p-10 overflow-hidden">
            <Particles />

            {/* Crown */}
            <div className="flex justify-center mb-4 animate-crown">
              <CrownSVG size={72} />
            </div>

            {currentKing && currentKing.address !== "0x0000000000000000000000000000000000000000" ? (
              <>
                <div className="text-throne-muted text-xs uppercase tracking-widest mb-1">
                  👑 Jelenleg trónoló
                </div>
                <div className="text-gradient-gold font-display font-bold text-3xl md:text-4xl mb-1">
                  {currentKing.nickname || shortAddr(currentKing.address)}
                </div>
                <div className="font-mono text-throne-muted text-xs mb-3">
                  {shortAddr(currentKing.address)}
                </div>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <span className="text-throne-muted text-xs">Trónon:</span>
                  <ReignTimer king={currentKing} />
                </div>
                {currentKing.achievements > 0 && (
                  <div className="flex justify-center mb-2">
                    <AchievementBadge bits={currentKing.achievements} size="sm" />
                  </div>
                )}
                {isOwnKing && (
                  <div className="mt-3 inline-block bg-throne-gold/10 border border-throne-gold/30 text-throne-gold text-xs px-3 py-1 rounded-full animate-bounce-sm">
                    🎉 Te vagy a jelenlegi király!
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-throne-muted text-sm mb-2">A trón üres…</div>
                <div className="text-2xl font-display font-bold text-throne-muted">
                  Senki sem ül a trónon
                </div>
                <div className="text-throne-muted text-xs mt-2">Légy az első!</div>
              </>
            )}
          </div>
        </div>

        {/* Claim form */}
        {!isConfigured ? (
          <div className="bg-throne-surface border border-throne-border rounded-xl p-6 text-throne-muted text-sm">
            ⚙️ A kontraktot még nem deployolták. Futtasd: <code className="font-mono text-throne-gold2">npm run deploy</code>
          </div>
        ) : !wallet ? (
          <button
            onClick={onConnect}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-throne-gold to-throne-gold2 text-black font-bold font-display text-lg px-10 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(245,166,35,0.4)] active:scale-100"
          >
            <span>🦊</span>
            <span>Wallet csatlakoztatása</span>
          </button>
        ) : !chainOk ? (
          <button
            onClick={onConnect}
            className="inline-flex items-center gap-2 bg-throne-purple text-white font-bold px-8 py-3 rounded-xl hover:bg-throne-purple2 transition-all hover:scale-105"
          >
            🔗 Váltás QAN TestNetre
          </button>
        ) : isOwnKing ? (
          <div className="text-throne-gold font-display text-lg">
            👑 Te vagy a király! Tartsd meg a trónodat.
          </div>
        ) : (
          <form onSubmit={handleClaim} className="flex flex-col items-center gap-4">
            {claimed && (
              <div className="animate-fade-in-up bg-throne-success/10 border border-throne-success/30 text-throne-success px-6 py-3 rounded-xl font-medium">
                🎉 Sikeresen elfoglaltad a trónt!
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-md">
              <input
                ref={inputRef}
                type="text"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); onClearError(); }}
                placeholder="Beceneved (pl. ThroneMaster)"
                maxLength={24}
                minLength={2}
                required
                className="flex-1 bg-throne-surface border border-throne-border rounded-xl px-4 py-3 text-throne-text placeholder-throne-muted/50 focus:outline-none focus:border-throne-gold/50 focus:ring-1 focus:ring-throne-gold/30 font-sans transition-all"
              />
              <button
                type="submit"
                disabled={txPending}
                className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-throne-gold to-throne-gold2 text-black font-bold px-7 py-3 rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(245,166,35,0.4)] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
              >
                {txPending ? (
                  <><span className="animate-spin">⚙️</span> Folyamatban…</>
                ) : (
                  <><span>👑</span> Foglald el! ({ENTRY_FEE_QANX} QANX)</>
                )}
              </button>
            </div>
            <p className="text-throne-muted text-xs">
              Az előző királynak visszajár a befizetésed 60%-a · 30% a szezon nyereménypottba kerül
            </p>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 animate-fade-in-up bg-throne-crimson/10 border border-throne-crimson/30 text-throne-crimson text-sm px-5 py-3 rounded-xl inline-flex items-center gap-2">
            <span>⚠️</span> {error}
            <button onClick={onClearError} className="ml-2 text-throne-crimson/60 hover:text-throne-crimson">✕</button>
          </div>
        )}
      </div>
    </section>
  );
}
