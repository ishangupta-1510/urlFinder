import Redis from "ioredis";
import Url from "../../models/url";

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

    public async setUrl(key: string, value: string): Promise<void> {
        try {
            await this.client.set(key, value);
        } catch (error) {
            console.error("Error setting value in Redis:", error);
        }
    }

    public async getUrl(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error("Error getting value from Redis:", error);
            return null;
        }
    }

    public async delUrl(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error("Error deleting value from Redis:", error);
        }
    }

    public async existUrl(key: string): Promise<boolean> {
        try {
            return (await this.client.exists(key)) === 1;
        } catch (error) {
            console.error("Error checking existence in Redis:", error);
            return false;
        }
    }

    public async setProxy(key: string, value: number): Promise<void> {
        try {
            await this.client.set(key, value.toString());
        } catch (error) {
            console.error("Error setting proxy value in Redis:", error);
        }
    }

    public async getProxy(key: string): Promise<number | null> {
        try {
            const value = await this.client.get(key);
            return value ? parseInt(value) : null;
        } catch (error) {
            console.error("Error getting proxy value from Redis:", error);
            return null;
        }
    }

    public async getUrlWithMongoFallback(key: string): Promise<string | null> {
        try {
            const cachedValue = await this.client.get(key);

            if (cachedValue) {
                console.log("Found in Redis!");
                return cachedValue;
            }

            console.log("Not found in Redis, checking MongoDB...");

            const mongoDoc = await Url.findOne({ originalUrl: key }).lean();

            if (mongoDoc && mongoDoc.productUrl) {
                const valueFromMongo = mongoDoc.productUrl;

                await this.client.set(key, valueFromMongo);

                console.log("Cached value into Redis!");

                return valueFromMongo;
            }

            return null;
        } catch (error) {
            console.error("Error in getUrlWithMongoFallback:", error);
            return null;
        }
    }
}

export default new RedisService();
