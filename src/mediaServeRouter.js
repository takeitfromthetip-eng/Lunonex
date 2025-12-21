import express from "express";
import path from "path";

const router = express.Router();
const mediaPath = path.resolve("uploads");

router.get("/media/:filename", (req, res) => {
  const file = path.join(mediaPath, req.params.filename);
  res.sendFile(file);
});

export default router;
