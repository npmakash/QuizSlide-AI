import './config/env.js'; // MUST be the first import to load environment variables before other modules run!
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS setup - Must allow credentials for sessions to work via cross-origin cookies
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost or local network IP (192.168.x.x, 10.x.x.x, 172.x.x.x) on any port
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isLocalIp = /^http:\/\/(?:192\.168|10|172\.(?:1[6-9]|2\d|3[01]))\.\d+\.\d+:\d+$/.test(origin);
    
    if (isLocalhost || isLocalIp || origin === frontendUrl) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Session Configuration (In-Memory Store)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_development_session_secret_123!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // Must be false for Localhost HTTP development
    sameSite: isProd ? 'none' : 'lax', // Lax for Localhost, None for cross-site prod HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 5. Global Rate Limiting
app.use('/api/', apiLimiter);

// 6. Base Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 7. Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// 8. Unhandled Route Fail-through
app.use((req, res, next) => {
  res.status(404).json({
    error: 'NotFoundError',
    message: `Resource not found: ${req.method} ${req.url}`
  });
});

// 9. Error Handler
app.use(errorHandler);

// 10. Start Server Listener
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`   QUIZ AUTOMATION SERVER RUNNING        `);
  console.log(`   Port: ${PORT}                         `);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend CORS URL: ${frontendUrl}      `);
  console.log(`=========================================`);
});
