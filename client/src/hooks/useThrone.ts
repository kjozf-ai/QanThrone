import { useState, useEffect, useCallback, useRef } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import { QAN_CHAIN_ID, QAN_NETWORK, ENTRY_FEE_WEI, POLL_INTERVAL_MS } from "../lib/config";
import addressesData from "../lib/addresses.json";
import abiData from "../lib/abi/QanThrone.json";

// ── Típusok ───────────────────────────────────────────────────
export interface KingInfo {
  address:      string;
  nickname:     string;
  claimedAt:    number;
  reignSeconds: number;
  achievements: number;
}

export interface TopKing {
  address:      string;
  nickname:     string;
  timesClaimed: number;
  reignSeconds: number;
  achievements: number;
}

export interface FeedEvent {
  id:        string;
  type:      "claimed" | "achievement" | "season";
  king:      string;
  nickname:  string;
  extra?:    string;
  timestamp: number;
}

export interface SeasonInfo {
  number:     number;
  start:      number;
  ends:       number;
  pot:        string;   // ETH formatted
  remaining:  number;   // seconds
  totalKings: number;
  claims:     number;
}

// ── Hook ─────────────────────────────────────────────────────
export function useThrone() {
  const [provider,    setProvider]    = useState<BrowserProvider | null>(null);
  const [contract,    setContract]    = useState<Contract | null>(null);
  const [wallet,      setWallet]      = useState<string>("");
  const [chainOk,     setChainOk]     = useState(false);
  const [currentKing, setCurrentKing] = useState<KingInfo | null>(null);
  const [topKings,    setTopKings]    = useState<TopKing[]>([]);
  const [feed,        setFeed]        = useState<FeedEvent[]>([]);
  const [season,      setSeason]      = useState<SeasonInfo | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [txPending,   setTxPending]   = useState(false);
  const [error,       setError]       = useState<string>("");
  const [contractReady, setContractReady] = useState(false);

  const throneAddr = (addressesData as any).contracts?.throne as string;
  const abi        = (abiData as any).abi as ethers.InterfaceAbi;

  // ── Contract elérhetőség ──────────────────────────────────
  const isContractConfigured = !!(throneAddr && throneAddr.length > 5 && abi.length > 0);

  // ── Read-only provider (no wallet) ───────────────────────
  const roProvider = useRef<ethers.JsonRpcProvider | null>(null);
  const roContract = useRef<Contract | null>(null);

  useEffect(() => {
    if (!isContractConfigured) return;
    try {
      roProvider.current = new ethers.JsonRpcProvider(
        "https://rpc-testnet.qanplatform.com",
        { chainId: QAN_CHAIN_ID, name: "qan-testnet" }
      );
      roContract.current = new Contract(throneAddr, abi, roProvider.current);
      setContractReady(true);
      fetchAll();
    } catch (e) {
      console.error("RO provider init hiba:", e);
    }
  }, [isContractConfigured]);

  // ── Adatok lekérése ───────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!roContract.current) return;
    try {
      await Promise.all([fetchKing(), fetchTop(), fetchSeason(), fetchFeed()]);
    } catch (e) {
      console.warn("fetchAll hiba:", e);
    }
  }, []);

  const fetchKing = useCallback(async () => {
    if (!roContract.current) return;
    try {
      const [king, nickname, claimedAt, reignSec, achievements] =
        await roContract.current.getCurrentKing();
      setCurrentKing({
        address:      king as string,
        nickname:     nickname as string,
        claimedAt:    Number(claimedAt),
        reignSeconds: Number(reignSec),
        achievements: Number(achievements),
      });
    } catch (e) {
      console.warn("fetchKing hiba:", e);
    }
  }, []);

  const fetchTop = useCallback(async () => {
    if (!roContract.current) return;
    try {
      const [kings, nicknames, times, reigns, achs] =
        await roContract.current.getTopKings(10);
      const result: TopKing[] = [];
      for (let i = 0; i < (kings as string[]).length; i++) {
        if ((kings as string[])[i] === ethers.ZeroAddress) continue;
        result.push({
          address:      (kings as string[])[i],
          nickname:     (nicknames as string[])[i],
          timesClaimed: Number((times as bigint[])[i]),
          reignSeconds: Number((reigns as bigint[])[i]),
          achievements: Number((achs as number[])[i]),
        });
      }
      setTopKings(result);
    } catch (e) {
      console.warn("fetchTop hiba:", e);
    }
  }, []);

  const fetchSeason = useCallback(async () => {
    if (!roContract.current) return;
    try {
      const [num, start, ends, pot, rem, totalK, claims] =
        await roContract.current.getSeasonInfo();
      setSeason({
        number:     Number(num),
        start:      Number(start),
        ends:       Number(ends),
        pot:        ethers.formatEther(pot as bigint),
        remaining:  Number(rem),
        totalKings: Number(totalK),
        claims:     Number(claims),
      });
    } catch (e) {
      console.warn("fetchSeason hiba:", e);
    }
  }, []);

  // ── Feed: eseménynapló az events-ből ─────────────────────
  const fetchFeed = useCallback(async () => {
    if (!roContract.current || !roProvider.current) return;
    try {
      const latestBlock = await roProvider.current.getBlockNumber();
      const fromBlock   = Math.max(0, latestBlock - 5000);

      const claimedFilter = roContract.current.filters.ThroneClaimed();
      const claimedLogs   = await roContract.current.queryFilter(claimedFilter, fromBlock);

      const achFilter  = roContract.current.filters.AchievementUnlocked();
      const achLogs    = await roContract.current.queryFilter(achFilter, fromBlock);

      const seasonFilter = roContract.current.filters.SeasonEnded();
      const seasonLogs   = await roContract.current.queryFilter(seasonFilter, fromBlock);

      const events: FeedEvent[] = [];

      for (const log of claimedLogs) {
        const args = (log as ethers.EventLog).args;
        events.push({
          id:        log.transactionHash + log.index,
          type:      "claimed",
          king:      args[0] as string,
          nickname:  args[2] as string,
          timestamp: (await log.getBlock()).timestamp,
        });
      }
      for (const log of achLogs) {
        const args = (log as ethers.EventLog).args;
        events.push({
          id:        log.transactionHash + "a" + log.index,
          type:      "achievement",
          king:      args[0] as string,
          nickname:  "",
          extra:     args[2] as string,
          timestamp: (await log.getBlock()).timestamp,
        });
      }
      for (const log of seasonLogs) {
        const args = (log as ethers.EventLog).args;
        events.push({
          id:        log.transactionHash + "s" + log.index,
          type:      "season",
          king:      args[0] as string,
          nickname:  "",
          extra:     `Szezon #${args[1]} vége — nyeremény: ${ethers.formatEther(args[3] as bigint)} QANX`,
          timestamp: (await log.getBlock()).timestamp,
        });
      }

      events.sort((a, b) => b.timestamp - a.timestamp);
      setFeed(events.slice(0, 30));
    } catch (e) {
      console.warn("fetchFeed hiba:", e);
    }
  }, []);

  // ── Wallet csatlakozás ────────────────────────────────────
  const connectWallet = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) { setError("MetaMask nem található!"); return; }
    try {
      setError("");
      const prov = new BrowserProvider(eth);
      const accounts: string[] = await prov.send("eth_requestAccounts", []);
      if (!accounts.length) { setError("Nincs elérhető account"); return; }
      setProvider(prov);
      setWallet(accounts[0]);

      const network = await prov.getNetwork();
      if (Number(network.chainId) !== QAN_CHAIN_ID) {
        await switchToQAN(eth);
      } else {
        setChainOk(true);
      }

      if (isContractConfigured) {
        const signer = await prov.getSigner();
        setContract(new Contract(throneAddr, abi, signer));
      }
    } catch (e: any) {
      setError(e.message || "Wallet csatlakozási hiba");
    }
  }, [isContractConfigured]);

  const switchToQAN = async (eth: any) => {
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: QAN_NETWORK.chainId }],
      });
      setChainOk(true);
    } catch (switchErr: any) {
      if (switchErr.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [QAN_NETWORK],
          });
          setChainOk(true);
        } catch (addErr: any) {
          setError("QAN TestNet hozzáadása sikertelen: " + addErr.message);
        }
      } else {
        setError("Hálózat váltás sikertelen: " + switchErr.message);
      }
    }
  };

  // ── Trón foglalása ────────────────────────────────────────
  const claimThrone = useCallback(async (nickname: string): Promise<boolean> => {
    if (!contract) { setError("Nem csatlakoztál walletre!"); return false; }
    if (!chainOk)  { setError("Kapcsolódj a QAN TestNethez!"); return false; }
    if (nickname.trim().length < 2) { setError("A becenév legalább 2 karakter!"); return false; }
    setError("");
    setTxPending(true);
    try {
      const tx = await contract.claimThrone(nickname.trim(), {
        value: BigInt(ENTRY_FEE_WEI),
      });
      await tx.wait();
      setTxPending(false);
      await fetchAll();
      return true;
    } catch (e: any) {
      const msg: string = e?.reason || e?.message || "Tranzakció hiba";
      setError(msg.includes("user rejected") ? "Tranzakciót visszautasítottad." : msg);
      setTxPending(false);
      return false;
    }
  }, [contract, chainOk, fetchAll]);

  // ── Poll ─────────────────────────────────────────────────
  useEffect(() => {
    if (!contractReady) return;
    const id = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [contractReady, fetchAll]);

  // ── MetaMask account/chain változás ──────────────────────
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const onAccount = (accs: string[]) => { setWallet(accs[0] ?? ""); };
    const onChain   = (cid: string)   => { setChainOk(parseInt(cid, 16) === QAN_CHAIN_ID); };
    eth.on("accountsChanged", onAccount);
    eth.on("chainChanged",    onChain);
    return () => {
      eth.removeListener("accountsChanged", onAccount);
      eth.removeListener("chainChanged",    onChain);
    };
  }, []);

  return {
    // state
    wallet, chainOk, provider,
    currentKing, topKings, feed, season,
    loading, txPending, error, isContractConfigured,
    // actions
    connectWallet, claimThrone,
    refresh: fetchAll,
    clearError: () => setError(""),
  };
}
