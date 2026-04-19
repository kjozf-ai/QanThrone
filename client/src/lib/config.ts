// ── QAN TestNet konfiguráció ───────────────────────────────────
export const QAN_CHAIN_ID = 1121;

export const QAN_NETWORK = {
  chainId:         "0x" + QAN_CHAIN_ID.toString(16),
  chainName:       "QAN TestNet",
  rpcUrls:         ["https://rpc-testnet.qanplatform.com"],
  nativeCurrency:  { name: "QANX", symbol: "QANX", decimals: 18 },
  blockExplorerUrls: ["https://testnet.qanscan.com"],
};

export const ENTRY_FEE_QANX = "0.001";   // human-readable
export const ENTRY_FEE_WEI  = "1000000000000000"; // 0.001 * 10^18

export const ACHIEVEMENTS: Record<number, { icon: string; name: string; desc: string; color: string }> = {
  1:  { icon: "⚔️",  name: "First Blood",      desc: "Elsőként foglaltad el a trónt",    color: "#ef4444" },
  2:  { icon: "👑",  name: "Triple Crown",      desc: "3× voltál király",                color: "#f5a623" },
  4:  { icon: "🌟",  name: "Legendary King",    desc: "5× voltál király",                color: "#fcd34d" },
  8:  { icon: "⏳",  name: "Long Reign",         desc: "Több mint 1 órát uraltál",        color: "#8b5cf6" },
  16: { icon: "🔥",  name: "Epic Reign",         desc: "Több mint 24 órát uraltál",       color: "#f97316" },
  32: { icon: "🏆",  name: "Season Champion",   desc: "Megnyerted a szezont!",            color: "#22c55e" },
};

export const POLL_INTERVAL_MS = 12_000; // 12 mp

// Placeholder ha nincs még deploy
export const NO_CONTRACT_MSG =
  "A QanThrone kontraktot még nem deployolták. Futtasd: npm run deploy";
