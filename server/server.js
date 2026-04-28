require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');
const QueueManager = require('./QueueManager');
const WebSocketManager = require('./websocket');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

const queueManager = new QueueManager();
const wsManager = new WebSocketManager(server);
wsManager.setQueueManager(queueManager);

const tokensRouter = require('./routes/tokens');
tokensRouter.setQueueManager(queueManager);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/counters', require('./routes/counters'));
app.use('/api/tokens', tokensRouter);
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admin', require('./routes/admin'));

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// wire queueManager into services and staff routes
const servicesRouter = require('./routes/services');
if (servicesRouter.setQueueManager) servicesRouter.setQueueManager(queueManager);
const staffRouter = require('./routes/staff');
if (staffRouter.setQueueManager) staffRouter.setQueueManager(queueManager);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    await queueManager.initialize();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = server;
