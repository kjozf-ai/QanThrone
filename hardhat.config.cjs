// ============================================================
// Hardhat config — QAN TestNet (EVM-kompatibilis)
// ============================================================
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

function readPrivateKey() {
  const raw = (process.env.ADMIN_PRIVATE_KEY || "").trim();
  if (!raw) return [];
  const hex = raw.startsWith("0x") ? raw.slice(2) : raw;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    console.warn("[hardhat.config] ADMIN_PRIVATE_KEY helytelen formátumú");
    return [];
  }
  return ["0x" + hex];
}

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: {},
    qanTestnet: {
      url:     process.env.QAN_RPC_URL  || "https://rpc-testnet.qanplatform.com",
      chainId: Number(process.env.QAN_CHAIN_ID || 1121),
      accounts: readPrivateKey(),
      timeout: 120000,
    },
  },
  paths: {
    sources:  "./contracts",
    scripts:  "./scripts",
    artifacts:"./artifacts",
    cache:    "./cache",
  },
};
