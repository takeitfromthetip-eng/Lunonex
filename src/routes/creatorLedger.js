import { getCodexForCreator } from "../mythologyCodex";
// GET /creator/:id/codex
router.get("/creator/:id/codex", (req, res) => {
  const creatorId = req.params.id;
  const entries = getCodexForCreator(creatorId);
  res.json({ entries });
});
// --- Tier Badges Utility ---
// Badge system for creator achievements and milestones
// Can be moved to src/utils/creatorBadges.js for better reuse
const tierBadges = {
  Founding25: {
    label: "Founding Creator",
    color: "#FFD700", // gold
    icon: "🌟",
  },
  Standard: {
    label: "Standard Creator",
    color: "#00BFFF", // blue
    icon: "🎨",
  },
  MidTier: {
    label: "Mid-Tier Creator",
    color: "#32CD32", // green
    icon: "🚀",
  },
  AdultAccess: {
    label: "Adult Access",
    color: "#FF69B4", // pink
    icon: "🔞",
  },
};

function getBadgeForTier(tier) {
  return tierBadges[tier] || {
    label: "Unknown Tier",
    color: "#999999",
    icon: "❓",
  };
}
// GET /creator/:id/badge
router.get("/creator/:id/badge", (req, res) => {
  const creatorId = req.params.id;
  const ledger = getCreatorLedger(creatorId);
  const latest = ledger.sort((a, b) => b.timestamp - a.timestamp)[0];

  if (!latest) {
    return res.status(404).json({ error: "No ledger entries found." });
  }

  const badge = getBadgeForTier(latest.tier);
  res.json({ creatorId, tier: latest.tier, badge });
});
import express from "express";
import { getCreatorLedger } from "../utils/runtimeIntrospect";

const router = express.Router();

// Example route handler

// GET /creator/:id/ledger
router.get("/creator/:id/ledger", (req, res) => {
  const creatorId = req.params.id;
  const ledger = getCreatorLedger(creatorId);
  res.json({ ledger });
});

// GET /creator/:id/summary
router.get("/creator/:id/summary", (req, res) => {
  const creatorId = req.params.id;
  const ledger = getCreatorLedger(creatorId);

  const totalGross = ledger.reduce((sum, e) => sum + e.gross, 0);
  const totalPayout = ledger.reduce((sum, e) => sum + e.payout, 0);
  const tierCounts = ledger.reduce((acc, e) => {
    acc[e.tier] = (acc[e.tier] || 0) + 1;
    return acc;
  }, {});

  res.json({
    creatorId,
    totalGross,
    totalPayout,
    tierCounts,
    entries: ledger.length,
  });
});

// GET /creator/:id/latest
router.get("/creator/:id/latest", (req, res) => {
  const creatorId = req.params.id;
  const ledger = getCreatorLedger(creatorId);
  const latest = ledger.sort((a, b) => b.timestamp - a.timestamp)[0];
  res.json({ latest });
});

export default router;
