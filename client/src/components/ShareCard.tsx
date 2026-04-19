import React, { useState } from "react";
import { KingInfo } from "../hooks/useThrone";
import { AchievementBadge } from "./AchievementBadge";

interface Props {
  king:   KingInfo;
  season: number;
}

export function ShareCard({ king, season }: Props) {
  const [copied, setCopied] = useState(false);
  const [open,   setOpen]   = useState(false);

  const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  const name = king.nickname || shortAddr(king.address);

  const shareText =
    `👑 Én vagyok a QAN Throne királya!\n` +
    `Név: ${name}\n` +
    `Szezon: #${season}\n` +
    `Cím: ${king.address}\n` +
    `\n🔗 qanplatform.com | #QANThrone`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: "QAN Throne", text: shareText });
    } else {
      handleCopy();
    }
  }

  if (!open) {
    return (
      <div className="flex justify-center py-4">
        <button
          onClick={() => setOpen(true)}
          className="text-throne-muted text-sm hover:text-throne-gold transition-colors flex items-center gap-1.5"
        >
          <span>🔗</span> Eredménykártya megosztása
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="bg-panel border border-throne-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-throne-gold">📤 Megosztás</h3>
          <button onClick={() => setOpen(false)} className="text-throne-muted hover:text-throne-text">✕</button>
        </div>

        {/* Preview card */}
        <div className="border-gold-glow-strong rounded-2xl p-8 text-center mb-6 bg-gradient-to-br from-throne-panel to-throne-surface"
             style={{ background: "linear-gradient(135deg, #12102a, #1a1630)" }}>
          <div className="text-5xl mb-3">👑</div>
          <div className="font-display font-black text-3xl text-gradient-gold mb-1">
            QAN THRONE
          </div>
          <div className="text-throne-muted text-xs uppercase tracking-widest mb-4">
            King of the Hill · Szezon #{season}
          </div>
          <div className="text-throne-text font-bold text-2xl mb-1">{name}</div>
          <div className="font-mono text-throne-muted text-xs mb-4">{king.address}</div>
          {king.achievements > 0 && (
            <div className="flex justify-center mb-3">
              <AchievementBadge bits={king.achievements} size="sm" />
            </div>
          )}
          <div className="text-throne-muted text-xs">#QANThrone · qanplatform.com</div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-throne-surface border border-throne-border text-throne-text px-5 py-2.5 rounded-xl hover:border-throne-gold/40 transition-all text-sm font-medium"
          >
            {copied ? "✅ Másolva!" : "📋 Szöveg másolása"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-gradient-to-r from-throne-gold to-throne-gold2 text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all"
          >
            🔗 Megosztás
          </button>
        </div>
      </div>
    </div>
  );
}
