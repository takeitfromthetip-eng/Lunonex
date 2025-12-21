import express from "express";
import {
  submitRemixAppeal,
  reviewAppeals,
  adjudicateAppeal
} from "./remixAppeals.js";

const router = express.Router();

router.post("/appeal", (req, res) => {
  submitRemixAppeal(req.body);
  res.json({ success: true });
});

router.get("/appeals", (req, res) => {
  res.json(reviewAppeals());
});

router.post("/appeals/:index", (req, res) => {
  const { index } = req.params;
  const { outcome } = req.body;
  adjudicateAppeal(parseInt(index), outcome);
  res.json({ success: true });
});

export default router;
