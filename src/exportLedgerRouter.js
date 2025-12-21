import express from "express";
import { exportLedgerSnapshot } from "./exportLedgerSnapshot.js";
import fs from "fs";

const router = express.Router();

router.get("/export-ledger", async (req, res) => {
  const path = await exportLedgerSnapshot();
  const file = fs.readFileSync(path);
  res.setHeader("Content-Disposition", `attachment; filename=${path}`);
  res.setHeader("Content-Type", "application/json");
  res.send(file);
});

export default router;
