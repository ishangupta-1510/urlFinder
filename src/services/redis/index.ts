import Redis from "ioredis";

class RedisService {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 3
        });

        this.client.on("error", (err) => {
            console.error("Redis error:", err);
        });
    }

    public async set(key: string, value: string): Promise<void> {
        try {
            await this.client.set(key, value);
        } catch (error) {
            console.error("Error setting value in Redis:", error);
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            const value = await this.client.get(key);
            return value;
        } catch (error) {
            console.error("Error getting value from Redis:", error);
            return null;
        }
    }

    public async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error("Error deleting value from Redis:", error);
        }
    }

    public async exists(key: string): Promise<boolean> {
        try {
            const exists = await this.client.exists(key);
            return exists === 1;
        } catch (error) {
            console.error("Error checking existence in Redis:", error);
            return false;
        }
    }

    public async setQueryNumber(key: string): Promise<number> {
        try {
            const value = await this.client.incr(key);
            return value;
        }
        catch (error) {
            console.error("Error incrementing query number in Redis:", error);
            return 0;
        }
    }
}

export default new RedisService();