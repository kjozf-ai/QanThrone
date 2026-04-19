# QAN Throne — Telepítési útmutató

## Mi ez?
King of the Hill dApp a QAN TestNeten. Bárki elfoglalhatja a trónt 0.001 QANX befizetésével.
Az előző királynak visszajár a befizetés 60%-a, 30% a szezon nyereménypottba kerül.

---

## 1. Előkövetelmények

- Node.js 18+ (`node --version`)
- MetaMask böngésző extension
- QAN TestNet QANX a faucetről: https://faucet.qanplatform.com

---

## 2. Telepítés

```bash
cd qan-throne
npm install
```

---

## 3. Környezeti változók (.env fájl)

```bash
cp .env.example .env
```

Töltsd ki a `.env`-t:
```
ADMIN_PRIVATE_KEY=<64 hex karakter, 0x nélkül>
QAN_RPC_URL=https://rpc-testnet.qanplatform.com
QAN_CHAIN_ID=1121
```

A privát kulcsot exportálhatod MetaMaskból:
MetaMask → Account Details → Export Private Key (a `0x` prefixet NE add hozzá!)

---

## 4. Kontraktus deploy (QAN TestNet)

```bash
npm run deploy
```

Ez:
- Deployolja a `QanThrone.sol` kontraktot
- Elmenti a kontraktcímet `client/src/lib/addresses.json`-ba
- Elmenti az ABI-t `client/src/lib/abi/QanThrone.json`-ba

---

## 5. Lokális fejlesztés

```bash
npm run dev
```

Megnyitja: http://localhost:5173

---

## 6A. Railway deploy (ajánlott, ingyenes)

1. Hozz létre fiókot: https://railway.app
2. New Project → Deploy from GitHub repo
3. Töltsd fel a mappát (vagy push GitHub-ra)
4. Add hozzá a Variables-t:
   - `ADMIN_PRIVATE_KEY` (ha szükséges)
5. Railway automatikusan felismeri a `railway.json`-t
6. Deploy → kapsz egy `.railway.app` URL-t ✓

---

## 6B. Vercel deploy (statikus, ingyenes)

```bash
npm run build
```

Majd:
1. https://vercel.com → New Project → import repo/mappa
2. Framework: Other (auto-detect)
3. A `vercel.json` már be van konfigurálva
4. Deploy ✓

---

## 7. Hogyan működik?

### Trón foglalása
- `claimThrone(nickname)` → 0.001 QANX befizetés
- 60% → előző királynak (azonnali kifizetés)
- 30% → szezon nyereménypot
- 10% → owner (szerver fenntartás)

### Achievementek
| Achievement     | Feltétel              |
|-----------------|-----------------------|
| ⚔️ First Blood  | Első trónfoglalás     |
| 👑 Triple Crown | 3× volt király        |
| 🌟 Legendary    | 5× volt király        |
| ⏳ Long Reign   | >1 óra uralom         |
| 🔥 Epic Reign   | >24 óra uralom        |
| 🏆 Season Champ | Szezon győztes        |

### Szezon
- 7 naponként reset
- Aki legtöbbet ül a trónon (összes másodperc), nyeri a pot-ot
- `triggerSeasonEnd()` meghívható ha lejárt a szezon (bárki hívhatja)

---

## 8. QAN TestNet hozzáadása MetaMaskhoz

| Mező              | Érték                                 |
|-------------------|---------------------------------------|
| Network Name      | QAN TestNet                           |
| RPC URL           | https://rpc-testnet.qanplatform.com   |
| Chain ID          | 1121                                  |
| Currency Symbol   | QANX                                  |
| Block Explorer    | https://testnet.qanscan.com           |

A frontend automatikusan felajánlja a hálózat hozzáadását!

---

## 9. Hasznos linkek

- QAN Platform: https://qanplatform.com
- Faucet: https://faucet.qanplatform.com
- QANScan Explorer: https://testnet.qanscan.com
- RPC: https://rpc-testnet.qanplatform.com
