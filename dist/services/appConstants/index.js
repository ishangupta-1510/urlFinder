"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const appConstantsSchema = zod_1.z.object({
    MONGO_DB_URL: zod_1.z.string().url(),
    REDIS_HOST: zod_1.z.string(),
    REDIS_PORT: zod_1.z.string().transform((val) => parseInt(val, 10)),
    REDIS_PASSWORD: zod_1.z.string(),
});
const appConstants = appConstantsSchema.parse({
    MONGO_DB_URL: process.env.MONGO_DB_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
});
exports.default = appConstants;
