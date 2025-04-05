import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();


const appConstantsSchema = z.object({
    MONGO_DB_URL: z.string().url(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.string().transform((val) => parseInt(val, 10)),
    REDIS_PASSWORD: z.string(),
});

const appConstants = appConstantsSchema.parse({
    MONGO_DB_URL: process.env.MONGO_DB_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
});

export default appConstants;