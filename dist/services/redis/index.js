"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const url_1 = __importDefault(require("../../models/url"));
const appConstants_1 = __importDefault(require("../appConstants"));
class RedisService {
    constructor() {
        this.client = new ioredis_1.default({
            host: appConstants_1.default.REDIS_HOST,
            port: appConstants_1.default.REDIS_PORT,
            password: appConstants_1.default.REDIS_PASSWORD,
            maxRetriesPerRequest: 3
        });
        this.client.on("error", (err) => {
            console.error("Redis error:", err);
        });
    }
    setUrl(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.set(key, JSON.stringify(value));
            }
            catch (error) {
                console.error("Error setting value in Redis:", error);
            }
        });
    }
    getUrl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.get(key);
            }
            catch (error) {
                console.error("Error getting value from Redis:", error);
                return null;
            }
        });
    }
    delUrl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(key);
            }
            catch (error) {
                console.error("Error deleting value from Redis:", error);
            }
        });
    }
    existUrl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield this.client.exists(key)) === 1;
            }
            catch (error) {
                console.error("Error checking existence in Redis:", error);
                return false;
            }
        });
    }
    setProxy(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.set(key, value.toString());
            }
            catch (error) {
                console.error("Error setting proxy value in Redis:", error);
            }
        });
    }
    getProxy(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = yield this.client.get(key);
                return value ? parseInt(value) : null;
            }
            catch (error) {
                console.error("Error getting proxy value from Redis:", error);
                return null;
            }
        });
    }
    getUrlWithMongoFallback(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cachedValue = yield this.client.get(key);
                if (cachedValue) {
                    console.log("Found in Redis!");
                    return JSON.parse(cachedValue);
                }
                console.log("Not found in Redis, checking MongoDB...");
                const mongoDoc = yield url_1.default.findOne({ originalUrl: key }).lean();
                if (mongoDoc && mongoDoc.productUrl) {
                    const valueFromMongo = mongoDoc.productUrl;
                    yield this.client.set(key, JSON.stringify(valueFromMongo));
                    console.log("Cached value into Redis!");
                    return valueFromMongo;
                }
                console.log("Not found in MongoDB!");
                return null;
            }
            catch (error) {
                console.error("Error in getUrlWithMongoFallback:", error);
                return null;
            }
        });
    }
    setUrlWithMongoFallback(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.set(key, JSON.stringify(value));
                console.log("Cached value into Redis!");
                const mongoDoc = yield url_1.default.findOne({ originalUrl: key });
                if (mongoDoc) {
                    mongoDoc.productUrl = value;
                    yield mongoDoc.save();
                    console.log("Cached value into MongoDB!");
                }
                else {
                    const newUrl = new url_1.default({
                        originalUrl: key,
                        productUrl: value
                    });
                    yield newUrl.save();
                    console.log("Created new URL in MongoDB!");
                }
            }
            catch (error) {
                console.error("Error in setUrlWithMongoFallback:", error);
            }
        });
    }
}
exports.default = new RedisService();
