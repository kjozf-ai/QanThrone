// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
//  QAN Throne — King of the Hill a QAN TestNeten
// ------------------------------------------------------------
//  Játékszabályok:
//    • Bárki lefoglalhatja a trónt 0.001 QANX befizetésével.
//    • Az előző királynak visszajár a befizetés 60%-a (jutalom).
//    • 30% a szezon nyereménypottba kerül.
//    • 10% az owner-nek (fenntartási cost).
//    • Ha nincs előző király: 90% → pot, 10% → owner.
//    • Szezonok (7 nap): a legtöbbet trónoló nyer (totalReignSeconds).
//    • Achievementek: First Blood, Triple Crown, Legendary King,
//      Long Reign (>1h), Epic Reign (>24h), Season Champion.
// ============================================================

contract QanThrone {

    // ── Achievement bit-maszkok ──────────────────────────────────
    uint8 public constant ACH_FIRST_BLOOD   = 1;   // első trónfoglalás
    uint8 public constant ACH_TRIPLE_CROWN  = 2;   // 3× király
    uint8 public constant ACH_LEGENDARY     = 4;   // 5× király
    uint8 public constant ACH_LONG_REIGN    = 8;   // >1 óra uralom
    uint8 public constant ACH_EPIC_REIGN    = 16;  // >24 óra uralom
    uint8 public constant ACH_SEASON_CHAMP  = 32;  // szezon bajnok

    uint256 public constant ENTRY_FEE        = 0.001 ether;
    uint256 public constant SEASON_DURATION  = 7 days;

    uint256 public constant KING_SHARE_BPS   = 6000;   // 60% → előző király
    uint256 public constant POT_SHARE_BPS    = 3000;   // 30% → season pot
    uint256 public constant OWNER_SHARE_BPS  = 1000;   // 10% → owner
    uint256 public constant BPS_DENOM        = 10000;

    // ── Adatstruktúrák ───────────────────────────────────────────
    struct Reign {
        address king;
        string  nickname;
        uint256 claimedAt;
        uint256 endedAt;    // 0 = még aktív
        uint256 index;
    }

    struct KingStats {
        string  nickname;
        uint256 timesKing;
        uint256 totalReignSeconds;  // szezonon belüli összeg
        uint8   achievements;
        bool    exists;
    }

    // ── Állapot ──────────────────────────────────────────────────
    Reign public currentReign;
    Reign[] public reignHistory;

    mapping(address => KingStats) public kingStats;
    address[] public allKingAddresses;

    uint256 public seasonNumber;
    uint256 public seasonStart;
    uint256 public seasonPot;
    uint256 public totalClaims;
    uint256 public totalUniquePlayers;

    address public immutable owner;

    // ── Events ───────────────────────────────────────────────────
    event ThroneClaimed(
        address indexed newKing,
        address indexed oldKing,
        string  nickname,
        uint256 reignIndex,
        uint256 timestamp,
        uint256 entryFee
    );
    event AchievementUnlocked(
        address indexed user,
        uint8   achievement,
        string  name
    );
    event SeasonEnded(
        address indexed champion,
        uint256 indexed seasonNum,
        uint256 totalReignSeconds,
        uint256 prize
    );
    event SeasonStarted(
        uint256 indexed seasonNum,
        uint256 startTime
    );

    // ── Constructor ──────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        seasonStart = block.timestamp;
        seasonNumber = 1;
        emit SeasonStarted(1, block.timestamp);
    }

    // ── Fő akció: trón foglalása ──────────────────────────────────
    function claimThrone(string calldata nickname) external payable {
        require(msg.value >= ENTRY_FEE,  "Kell 0.001 QANX belepo");
        require(
            bytes(nickname).length >= 2 && bytes(nickname).length <= 24,
            "Nev: 2-24 karakter"
        );
        require(currentReign.king != msg.sender, "Mar te vagy a kiraly!");

        // Szezon lezárása ha lejárt
        if (block.timestamp >= seasonStart + SEASON_DURATION) {
            _endSeason();
        }

        address prevKing    = currentReign.king;
        uint256 kingPayout  = 0;

        // ── Előző király lezárása ─────────────────────────────────
        if (prevKing != address(0)) {
            uint256 duration = block.timestamp - currentReign.claimedAt;
            KingStats storage prev = kingStats[prevKing];
            prev.totalReignSeconds += duration;

            // Achievementek az előző királynak
            if (duration >= 3600 && (prev.achievements & ACH_LONG_REIGN) == 0) {
                prev.achievements |= ACH_LONG_REIGN;
                emit AchievementUnlocked(prevKing, ACH_LONG_REIGN, "Long Reign");
            }
            if (duration >= 86400 && (prev.achievements & ACH_EPIC_REIGN) == 0) {
                prev.achievements |= ACH_EPIC_REIGN;
                emit AchievementUnlocked(prevKing, ACH_EPIC_REIGN, "Epic Reign");
            }

            // Előző uralom rögzítése
            Reign memory closed = currentReign;
            closed.endedAt = block.timestamp;
            reignHistory.push(closed);

            // Kifizetési összeg az előző királynak
            kingPayout = (msg.value * KING_SHARE_BPS) / BPS_DENOM;
        }

        // ── Pot és owner share ────────────────────────────────────
        uint256 potShare;
        uint256 ownerShare;

        if (prevKing != address(0)) {
            potShare   = (msg.value * POT_SHARE_BPS)   / BPS_DENOM;
            ownerShare = msg.value - kingPayout - potShare;
        } else {
            // Első király: 90% pot, 10% owner
            potShare   = (msg.value * 9000) / BPS_DENOM;
            ownerShare = msg.value - potShare;
        }
        seasonPot += potShare;

        // ── Új király statisztikái ────────────────────────────────
        KingStats storage ns = kingStats[msg.sender];
        if (!ns.exists) {
            ns.exists = true;
            allKingAddresses.push(msg.sender);
            totalUniquePlayers++;

            ns.achievements |= ACH_FIRST_BLOOD;
            emit AchievementUnlocked(msg.sender, ACH_FIRST_BLOOD, "First Blood");
        }
        ns.timesKing++;
        ns.nickname = nickname;
        totalClaims++;

        if (ns.timesKing == 3 && (ns.achievements & ACH_TRIPLE_CROWN) == 0) {
            ns.achievements |= ACH_TRIPLE_CROWN;
            emit AchievementUnlocked(msg.sender, ACH_TRIPLE_CROWN, "Triple Crown");
        }
        if (ns.timesKing == 5 && (ns.achievements & ACH_LEGENDARY) == 0) {
            ns.achievements |= ACH_LEGENDARY;
            emit AchievementUnlocked(msg.sender, ACH_LEGENDARY, "Legendary King");
        }

        // ── Trón átadás ───────────────────────────────────────────
        uint256 newIndex = reignHistory.length;
        currentReign = Reign({
            king:      msg.sender,
            nickname:  nickname,
            claimedAt: block.timestamp,
            endedAt:   0,
            index:     newIndex
        });

        emit ThroneClaimed(msg.sender, prevKing, nickname, newIndex, block.timestamp, msg.value);

        // ── Kifizetések ───────────────────────────────────────────
        if (kingPayout > 0 && prevKing != address(0)) {
            (bool ok1,) = prevKing.call{value: kingPayout}("");
            // Nem revert ha a régi király contract és nem fogadja: silently skip
            if (!ok1) { seasonPot += kingPayout; }
        }
        if (ownerShare > 0) {
            (bool ok2,) = owner.call{value: ownerShare}("");
            if (!ok2) { seasonPot += ownerShare; }
        }
    }

    // ── Szezon manuális lezárása (bárki hívhatja, ha lejárt) ─────
    function triggerSeasonEnd() external {
        require(
            block.timestamp >= seasonStart + SEASON_DURATION,
            "A szezon meg nem ert veget"
        );
        _endSeason();
    }

    // ── Szezon belső lezárása ─────────────────────────────────────
    function _endSeason() internal {
        // Az aktuális király eddig felhalmozott uralom idejét is számítja
        if (currentReign.king != address(0)) {
            uint256 sofar = block.timestamp - currentReign.claimedAt;
            kingStats[currentReign.king].totalReignSeconds += sofar;
            currentReign.claimedAt = block.timestamp; // új szezonban az óra nulláról indul
        }

        // Bajnok megkeresése (legtöbb totalReignSeconds)
        address champion;
        uint256 maxTime;
        uint256 total = allKingAddresses.length;
        for (uint256 i = 0; i < total; i++) {
            address k = allKingAddresses[i];
            if (kingStats[k].totalReignSeconds > maxTime) {
                maxTime = kingStats[k].totalReignSeconds;
                champion = k;
            }
        }

        uint256 prize = seasonPot;
        seasonPot = 0;

        if (champion != address(0)) {
            KingStats storage cs = kingStats[champion];
            if ((cs.achievements & ACH_SEASON_CHAMP) == 0) {
                cs.achievements |= ACH_SEASON_CHAMP;
                emit AchievementUnlocked(champion, ACH_SEASON_CHAMP, "Season Champion");
            }
            emit SeasonEnded(champion, seasonNumber, maxTime, prize);

            if (prize > 0) {
                (bool ok,) = champion.call{value: prize}("");
                if (!ok) { seasonPot = prize; } // visszarakja ha sikertelen
            }
        } else {
            emit SeasonEnded(address(0), seasonNumber, 0, 0);
        }

        // Reign idők resetje az új szezonhoz
        for (uint256 i = 0; i < total; i++) {
            kingStats[allKingAddresses[i]].totalReignSeconds = 0;
        }

        seasonNumber++;
        seasonStart = block.timestamp;
        emit SeasonStarted(seasonNumber, block.timestamp);
    }

    // ── View: aktuális király ─────────────────────────────────────
    function getCurrentKing() external view returns (
        address king,
        string memory nickname,
        uint256 claimedAt,
        uint256 reignSeconds,
        uint8   achievements
    ) {
        king        = currentReign.king;
        nickname    = currentReign.nickname;
        claimedAt   = currentReign.claimedAt;
        reignSeconds = (king != address(0))
            ? block.timestamp - claimedAt
            : 0;
        achievements = (king != address(0))
            ? kingStats[king].achievements
            : 0;
    }

    // ── View: toplista (timesKing szerint csökkenő) ───────────────
    function getTopKings(uint256 limit) external view returns (
        address[] memory kings,
        string[]  memory nicknames,
        uint256[] memory timesClaimed,
        uint256[] memory reignSeconds,
        uint8[]   memory achievements
    ) {
        uint256 total = allKingAddresses.length;
        if (limit > total) limit = total;

        // Selection sort (testnet → kis lista, OK)
        address[] memory sorted = new address[](total);
        for (uint256 i = 0; i < total; i++) sorted[i] = allKingAddresses[i];

        for (uint256 i = 0; i < limit; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < total; j++) {
                if (kingStats[sorted[j]].timesKing > kingStats[sorted[maxIdx]].timesKing)
                    maxIdx = j;
            }
            if (maxIdx != i) {
                address tmp  = sorted[i];
                sorted[i]    = sorted[maxIdx];
                sorted[maxIdx] = tmp;
            }
        }

        kings        = new address[](limit);
        nicknames    = new string[](limit);
        timesClaimed = new uint256[](limit);
        reignSeconds = new uint256[](limit);
        achievements = new uint8[](limit);

        for (uint256 i = 0; i < limit; i++) {
            address k = sorted[i];
            KingStats memory s = kingStats[k];
            kings[i]        = k;
            nicknames[i]    = s.nickname;
            timesClaimed[i] = s.timesKing;
            reignSeconds[i] = s.totalReignSeconds;
            achievements[i] = s.achievements;
        }
    }

    // ── View: uralom-előzmények (legújabb elöl) ───────────────────
    function getReignHistory(uint256 offset, uint256 limit) external view returns (
        Reign[] memory reigns
    ) {
        uint256 total = reignHistory.length;
        if (offset >= total) return new Reign[](0);
        uint256 end   = offset + limit;
        if (end > total) end = total;
        uint256 count = end - offset;
        reigns = new Reign[](count);
        for (uint256 i = 0; i < count; i++) {
            reigns[i] = reignHistory[total - 1 - offset - i];
        }
    }

    // ── View: szezon info ─────────────────────────────────────────
    function getSeasonInfo() external view returns (
        uint256 number,
        uint256 start,
        uint256 ends,
        uint256 pot,
        uint256 remaining,
        uint256 totalKings,
        uint256 claims
    ) {
        number     = seasonNumber;
        start      = seasonStart;
        ends       = seasonStart + SEASON_DURATION;
        pot        = seasonPot;
        remaining  = (ends > block.timestamp) ? ends - block.timestamp : 0;
        totalKings = allKingAddresses.length;
        claims     = totalClaims;
    }

    // ── View: egyéni stats ────────────────────────────────────────
    function getPlayerStats(address player) external view returns (
        string  memory nickname,
        uint256 timesKing,
        uint256 totalReignSec,
        uint8   achievements,
        bool    isCurrentKing
    ) {
        KingStats memory s = kingStats[player];
        nickname     = s.nickname;
        timesKing    = s.timesKing;
        totalReignSec = s.totalReignSeconds;
        achievements  = s.achievements;
        isCurrentKing = (currentReign.king == player);
    }

    // ── Emergency owner withdraw ──────────────────────────────────
    function emergencyWithdraw() external {
        require(msg.sender == owner, "Nem az owner");
        (bool ok,) = owner.call{value: address(this).balance}("");
        require(ok, "Withdraw hiba");
    }

    receive() external payable {}
}
