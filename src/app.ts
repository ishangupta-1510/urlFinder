import express from 'express';
import router from './routes';
import connectDB from './shared/mongoDb';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const port = 3000;

// Security headers with Helmet
app.use(helmet());

// Parse incoming JSON requests
app.use(express.json());

// General Rate Limiter (applies to all routes)
const generalLimiter = rateLimit({
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
const crawlerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many crawler requests from this IP, please try again later.',
});

// Apply stricter limiter only to `/crawler` endpoint
app.use('/api/crawler', crawlerLimiter);

// Application Routes
app.use(router);

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();
