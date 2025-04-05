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
exports.crawler = void 0;
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const redis_1 = __importDefault(require("../services/redis"));
const urlService_1 = __importDefault(require("../services/urlService"));
const crawler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const crawlerSchema = zod_1.z.object({
        urls: zod_1.z.array(zod_1.z.string().url()),
        hardCheck: zod_1.z.boolean().default(false),
    });
    const validation = crawlerSchema.parse(req.body);
    const urls = validation.urls;
    const domainUrlMap = {};
    yield Promise.all(urls.map((url) => __awaiter(void 0, void 0, void 0, function* () {
        let productUrls = [];
        try {
            productUrls = yield redis_1.default.getUrlWithMongoFallback(url);
        }
        catch (error) {
            console.log(`Error fetching URL from Redis or MongoDB: ${error}`);
        }
        if (productUrls && productUrls.length > 0) {
            if (validation.hardCheck) {
                yield Promise.allSettled(productUrls.map((productUrl) => __awaiter(void 0, void 0, void 0, function* () {
                    const isValid = yield urlService_1.default.testUrl(productUrl);
                    if (!isValid) {
                        console.log(`Invalid URL: ${productUrl}`);
                    }
                })));
            }
            const domain = new URL(url).hostname;
            domainUrlMap[domain] = domainUrlMap[domain] || [];
            domainUrlMap[domain].push(...productUrls);
        }
        else {
            console.log(`URL not found in Redis or MongoDB: ${url}`);
            const newUrls = yield urlService_1.default.getProductUrls(url, validation.hardCheck);
            const domain = new URL(url).hostname;
            domainUrlMap[domain] = domainUrlMap[domain] || [];
            domainUrlMap[domain].push(...newUrls);
        }
    })));
    res.status(http_status_codes_1.StatusCodes.ACCEPTED).send(domainUrlMap);
});
exports.crawler = crawler;
