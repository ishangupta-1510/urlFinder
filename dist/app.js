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
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const mongoDb_1 = __importDefault(require("./shared/mongoDb"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
const port = 3000;
// Security headers with Helmet
app.use((0, helmet_1.default)());
// Parse incoming JSON requests
app.use(express_1.default.json());
// General Rate Limiter (applies to all routes)
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
        });
    },
});
// Apply the general limiter globally
app.use(generalLimiter);
// Define a stricter rate limiter for specific routes (e.g., `/crawler`)
const crawlerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many crawler requests from this IP, please try again later.',
});
// Apply stricter limiter only to `/crawler` endpoint
app.use('/api/crawler', crawlerLimiter);
// Application Routes
app.use(routes_1.default);
// Start the server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoDb_1.default)();
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
startServer();
