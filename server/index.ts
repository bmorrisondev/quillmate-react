import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { createProxyMiddleware } from 'http-proxy-middleware';
import articlesRouter from './routes/articles';


console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const app = express();
const PORT = process.env.PORT || 3000;
const VITE_PORT = process.env.VITE_PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.url}`);
  next();
});

app.use('/api/articles', articlesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Development: Proxy all non-API requests to Vite dev server
if (process.env.NODE_ENV !== 'production') {
  app.use(
    '/',
    createProxyMiddleware({
      target: `http://localhost:${VITE_PORT}`,
      changeOrigin: true,
      ws: true,
      // Don't proxy /api requests
      filter: (pathname: string) => !pathname.startsWith('/api'),
    })
  );
} else {
  // Production: Serve static files
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React routing in production
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Proxying non-API requests to http://localhost:${VITE_PORT}`);
  }
});
