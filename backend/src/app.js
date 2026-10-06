const express = require('express');
const cors = require('cors');
const { sendError } = require('./utils/apiResponse');

const authRoutes = require('./routes/authRoutes');
const recipientRoutes = require('./routes/recipientRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'Email Campaign Platform API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 Route Handler
app.use((req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global API Error]', err);
  return sendError(res, err.status || 500, err.message || 'Internal Server Error');
});

module.exports = app;
