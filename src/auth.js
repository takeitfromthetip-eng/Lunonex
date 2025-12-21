import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "./UserModel.js";

const SECRET = process.env.JWT_SECRET || (() => {
  throw new Error("JWT_SECRET environment variable is required");
})();

export async function registerUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new UserModel({ username, passwordHash });
  await user.save();
  return user;
}

export async function authenticateUser(username, password) {
  const user = await UserModel.findOne({ username });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const token = jwt.sign({ username, role: user.role }, SECRET, { expiresIn: "7d" });
  return { token, role: user.role };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
