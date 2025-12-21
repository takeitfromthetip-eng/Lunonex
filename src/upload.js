import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const actor = req.body.actor || "unknown";
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\W+/g, "_");
    cb(null, `${actor}_${timestamp}_${safeName}`);
  }
});

export const upload = multer({ storage });
