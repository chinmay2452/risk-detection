require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const net = require('net');
const uploadRoutes = require('./routes/upload.routes');
const extractRoutes = require('./routes/extract.routes');
const validateRoutes = require('./routes/validate.routes');
const analyzeRoutes = require('./routes/analyze.routes');

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware — allow all localhost origins in development
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) or any localhost origin
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);
app.use('/api', extractRoutes);
app.use('/api', validateRoutes);
app.use('/api', analyzeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
        return;
      }
      reject(error);
    });

    probe.once('listening', () => {
      probe.close(() => resolve(startPort));
    });

    probe.listen(startPort);
  });
}

async function startServer() {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    const server = app.listen(port, () => {
      if (port !== DEFAULT_PORT) {
        console.warn(`Port ${DEFAULT_PORT} is busy. Using port ${port} instead.`);
      }
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error) => {
      console.error('Server failed to start:', error.message);
    });

    server.on('close', () => {
      console.warn('Server was closed.');
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
