// NovaTrix Backend Server
// Express server with authentication and API routes

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import annotationsRoutes from './routes/annotations.routes.js';
import controlsRoutes from './routes/controls.routes.js';
import interviewsRoutes from './routes/interviews.routes.js';
import activitiesRoutes from './routes/activities.routes.js';
import soaRoutes from './routes/soa.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { warmupModel } from './services/ollamaService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin matches localhost:5173-5183 pattern
    const allowedPattern = /^http:\/\/localhost:(517[3-9]|518[0-3])$/;

    if (allowedPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/annotations', annotationsRoutes);
app.use('/api/controls', controlsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/soa', soaRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 NovaTrix Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173-5183`);
  console.log(`\n✅ Server ready to accept requests`);

  // Warm up Ollama model (optional, runs in background)
  setTimeout(() => {
    warmupModel().catch(err => {
      console.log('ℹ️  Ollama warmup skipped - will load on first request');
    });
  }, 2000); // Wait 2 seconds after server starts
});

export default app;
