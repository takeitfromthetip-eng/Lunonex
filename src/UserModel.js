import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "creator" } // roles: creator, moderator, sovereign
});

export const UserModel = mongoose.model("User", UserSchema);
