import Redis from "ioredis";

const getRedisConfig = () => {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  return url;
};

// BullMQ এর জন্য আলাদা connection (maxRetriesPerRequest: null আবশ্যক)
export const bullmqRedis = new Redis(getRedisConfig(), {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// সাধারণ cache/session কাজের জন্য আলাদা connection
export const redis = new Redis(getRedisConfig(), {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      console.error("Redis connection failed after 3 retries");
      return null; // retry বন্ধ করবে
    }
    return Math.min(times * 200, 1000); // 200ms, 400ms, 600ms...
  },
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));