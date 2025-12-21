// VaultEntry model for sealed/unlockable artifacts
import { ObjectId } from 'mongodb';

export class VaultEntry {
  constructor({
    _id = new ObjectId(),
    userId,
    sealed = true,
    unlockAt = new Date(),
    metadata = {},
  }) {
    this._id = _id;
    this.userId = userId;
    this.sealed = sealed;
    this.unlockAt = unlockAt;
    this.metadata = metadata;
  }
}
