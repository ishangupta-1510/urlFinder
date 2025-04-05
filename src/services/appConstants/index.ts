import { z } from 'zod';

const appConstantsSchema = z.object({
    MongoDBUrl: z.string().url(),
    RedisUrl: z.string().url(),
});

const appConstants = appConstantsSchema.parse({
    MongoDBUrl: process.env.MongoDBUrl,
    RedisUrl: process.env.RedisUrl,
});

export default appConstants;