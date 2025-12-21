
import { ArtifactModel } from "./ArtifactModel.js";

export const ArtifactLedger = {
  async get(id) {
    return await ArtifactModel.findOne({ id });
  },
  async getAll() {
    return await ArtifactModel.find({});
  },
  async set(id, data) {
    await ArtifactModel.findOneAndUpdate({ id }, data, { upsert: true });
  },
  async appendRemix(id, remixEntry) {
    await ArtifactModel.updateOne(
      { id },
      { $push: { remixHistory: remixEntry } }
    );
  }
};
