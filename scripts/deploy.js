// ============================================================
//  QAN Throne — Deploy script
// ------------------------------------------------------------
//  Deployolja a QanThrone kontraktot a QAN TestNetre,
//  majd elmenti:
//    - deployments/qan-testnet.json   (backend info)
//    - client/src/lib/addresses.json  (frontend config)
//    - client/src/lib/abi/QanThrone.json (frontend ABI)
// ============================================================
const hre  = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("Nincs deployer. Állítsd be az ADMIN_PRIVATE_KEY-t a .env fájlban!");

  const net = await hre.ethers.provider.getNetwork();
  const bal = await hre.ethers.provider.getBalance(deployer.address);

  console.log("──────────────────────────────────────────────");
  console.log(" QAN Throne — deploy");
  console.log("──────────────────────────────────────────────");
  console.log(" Hálózat:  ", net.name, "(chainId:", net.chainId.toString(), ")");
  console.log(" Deployer: ", deployer.address);
  console.log(" Egyenleg: ", hre.ethers.formatEther(bal), "QANX");
  console.log("──────────────────────────────────────────────\n");

  if (bal === 0n) {
    console.warn("⚠  Nulla QANX egyenleg! Kérj a faucetről: https://faucet.qanplatform.com");
  }

  console.log("→ Deploy QanThrone...");
  const Throne  = await hre.ethers.getContractFactory("QanThrone");
  const throne  = await Throne.deploy();
  await throne.waitForDeployment();
  const throneAddr = await throne.getAddress();
  console.log(`  ✓ QanThrone: ${throneAddr}`);

  // ── Összegzés JSON ────────────────────────────────────────
  const summary = {
    network: {
      name:     net.name,
      chainId:  Number(net.chainId),
      rpc:      hre.network.config.url,
      explorer: process.env.QAN_EXPLORER || "https://testnet.qanscan.com",
    },
    deployer:    deployer.address,
    deployedAt:  new Date().toISOString(),
    contracts: {
      throne: throneAddr,
    },
    entryFee: "0.001",
    entryFeeCurrency: "QANX",
  };

  // deployments/
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const deployFile = path.join(deploymentsDir, "qan-testnet.json");
  fs.writeFileSync(deployFile, JSON.stringify(summary, null, 2));
  console.log(`\n✓ Deployment info: ${deployFile}`);

  // client/src/lib/addresses.json
  const libDir = path.join(__dirname, "..", "client", "src", "lib");
  fs.mkdirSync(libDir, { recursive: true });
  fs.writeFileSync(
    path.join(libDir, "addresses.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log(`✓ Frontend addresses: ${libDir}/addresses.json`);

  // client/src/lib/abi/QanThrone.json
  const abiDir = path.join(libDir, "abi");
  fs.mkdirSync(abiDir, { recursive: true });
  const artifact = await hre.artifacts.readArtifact("QanThrone");
  fs.writeFileSync(
    path.join(abiDir, "QanThrone.json"),
    JSON.stringify({ abi: artifact.abi }, null, 2)
  );
  console.log(`✓ ABI exportálva: ${abiDir}/QanThrone.json`);

  console.log("\n──────────────────────────────────────────────");
  console.log(" DEPLOY SIKERES");
  console.log("──────────────────────────────────────────────");
  console.log(` Explorer: ${summary.network.explorer}/address/${throneAddr}`);
  console.log(" Következő lépések:");
  console.log("   npm run build   → frontend build");
  console.log("   npm run dev     → lokális fejlesztés");
  console.log("   npm run start   → Railway-kompatibilis szerver");
  console.log("──────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("\n❌ Deploy hiba:\n", err);
  process.exit(1);
});
