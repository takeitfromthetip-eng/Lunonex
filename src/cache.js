import redis from "redis";
const client = redis.createClient();

client.on("error", err => console.error("Redis error:", err));

export async function cacheArtifact(id, data) {
  client.set(`artifact:${id}`, JSON.stringify(data), "EX", 3600);
}

export async function getCachedArtifact(id) {
  return new Promise((resolve) => {
    client.get(`artifact:${id}`, (err, reply) => {
      if (err || !reply) return resolve(null);
      resolve(JSON.parse(reply));
    });
  });
}
