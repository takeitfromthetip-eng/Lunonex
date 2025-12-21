import mongoose from "mongoose";

const RemixEntry = new mongoose.Schema({
  action: String,
  actor: String,
  newArtifactId: String
}, { _id: false });

const ArtifactSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  actor: String,
  type: String,
  format: String,
  tags: [String],
  remixHistory: [RemixEntry],
  tier: String,
  crowned: Boolean,
  graveyarded: Boolean,
  graveyardedBy: String,
  graveyardedAt: String,
  createdAt: { type: Date, default: Date.now },
  fingerprint: String
});

export const ArtifactModel = mongoose.model("Artifact", ArtifactSchema);
