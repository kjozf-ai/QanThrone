import React from "react";
import { useThrone } from "./hooks/useThrone";
import { ThroneHero } from "./components/ThroneHero";
import { SeasonPanel } from "./components/SeasonPanel";
import { Leaderboard } from "./components/Leaderboard";
import { RecentFeed } from "./components/RecentFeed";
import { ShareCard } from "./components/ShareCard";
import { AchievementGrid } from "./components/AchievementBadge";

// ── Header ───────────────────────────────────────────────────
function Header({ wallet, chainOk, onConnect }: {
  wallet: string; chainOk: boolean; onConnect: () => void;
}) {
  const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <header className="sticky top-0 z-50 border-b border-throne-border/50"
      style={{ background: "rgba(8,8,15,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <span className="font-display font-bold text-throne-gold tracking-wider">QAN THRONE</span>
          <span className="hidden sm:inline-block text-[10px] text-throne-muted border border-throne-border px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-1">
            TestNet
          </span>
        </div>
        <div className="flex items-center gap-2">
          {wallet ? (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${chainOk ? "bg-throne-success" : "bg-throne-crimson"}`} />
              <span className="font-mono text-xs text-throne-muted hidden sm:inline">
                {shortAddr(wallet)}
              </span>
              {!chainOk && (
                <button
                  onClick={onConnect}
                  className="text-xs bg-throne-crimson/15 border border-throne-crimson/30 text-throne-crimson px-3 py-1 rounded-lg hover:bg-throne-crimson/25 transition-all"
                >
                  Hálózat váltás
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="text-xs bg-throne-gold/10 border border-throne-gold/30 text-throne-gold px-4 py-1.5 rounded-lg hover:bg-throne-gold/20 transition-all font-medium"
            >
              Wallet csatlakoztatása
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-throne-border/30 py-8 mt-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="font-display font-bold text-throne-gold/60 text-sm tracking-wider">
          QAN THRONE
        </span>
        <div className="flex items-center gap-4 text-xs text-throne-muted">
          <a href="https://qanplatform.com" target="_blank" rel="noreferrer"
             className="hover:text-throne-gold transition-colors">QAN Platform</a>
          <a href="https://faucet.qanplatform.com" target="_blank" rel="noreferrer"
             className="hover:text-throne-gold transition-colors">Faucet</a>
          <a href="https://testnet.qanscan.com" target="_blank" rel="noreferrer"
             className="hover:text-throne-gold transition-colors">QANScan</a>
        </div>
        <p className="text-throne-muted/40 text-[10px]">
          EVM kompatibilis · QAN TestNet · Solidity 0.8.20
        </p>
      </div>
    </footer>
  );
}

// ── Achievement szekció ───────────────────────────────────────
function AchievementsSection({ bits }: { bits: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-panel border border-throne-border rounded-2xl p-5 text-left hover:border-throne-border/80 transition-all group"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-gradient-gold flex items-center gap-2">
            <span>🏅</span> Achievementek
          </h2>
          <span className="text-throne-muted group-hover:text-throne-text transition-colors">
            {open ? "▲" : "▼"}
          </span>
        </div>
        {!open && (
          <p className="text-throne-muted text-xs mt-1">
            6 különböző achievement megszerezhető a játék során
          </p>
        )}
      </button>
      {open && (
        <div className="bg-panel border border-t-0 border-throne-border rounded-b-2xl p-5">
          <AchievementGrid bits={bits} />
        </div>
      )}
    </section>
  );
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  const throne = useThrone();

  const myBits = throne.wallet
    ? (throne.topKings.find(
        (k) => k.address.toLowerCase() === throne.wallet.toLowerCase()
      )?.achievements ?? 0)
    : 0;

  const isKing =
    throne.currentKing?.address &&
    throne.wallet &&
    throne.currentKing.address.toLowerCase() === throne.wallet.toLowerCase();

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text">
      <Header
        wallet={throne.wallet}
        chainOk={throne.chainOk}
        onConnect={throne.connectWallet}
      />

      <main>
        {/* Hero / Throne claiming */}
        <ThroneHero
          currentKing={throne.currentKing}
          wallet={throne.wallet}
          chainOk={throne.chainOk}
          txPending={throne.txPending}
          error={throne.error}
          isConfigured={throne.isContractConfigured}
          onConnect={throne.connectWallet}
          onClaim={throne.claimThrone}
          onClearError={throne.clearError}
        />

        {/* Share card — csak ha az aktuális királynak */}
        {isKing && throne.currentKing && (
          <ShareCard
            king={throne.currentKing}
            season={throne.season?.number ?? 1}
          />
        )}

        {/* Season info */}
        <SeasonPanel season={throne.season} />

        {/* Leaderboard + Feed */}
        <div className="max-w-5xl mx-auto px-4 py-4 grid md:grid-cols-2 gap-4">
          <div>
            <Leaderboard
              kings={throne.topKings}
              wallet={throne.wallet}
            />
          </div>
          <div>
            <RecentFeed events={throne.feed} />
          </div>
        </div>

        {/* Achievements */}
        <AchievementsSection bits={myBits} />
      </main>

      <Footer />
    </div>
  );
}
