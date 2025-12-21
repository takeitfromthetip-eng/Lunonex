import mongoose from "mongoose";

export async function connectToDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/vanguard";
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("🧬 Connected to MongoDB");
}
