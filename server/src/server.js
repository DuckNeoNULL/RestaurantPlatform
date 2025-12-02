import dotenv from "dotenv";
dotenv.config();

import http from 'http';
import app from "./app.js";
import db from "./config/db.js";
import { setupExpirationChecker } from "./services/CronServices.js";
import { initWebSocket } from './utils/WebSocketManager.js';
// import { ensureChatMessageTTLIndex } from './dao/mongoDAO.js';

const { sequelize } = db;
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("MySQL Connected...");

    const server = http.createServer(app);

    // Ensure TTL index for chatMessage collection (90 days)
    try {
      // await ensureChatMessageTTLIndex(90);
      console.log('Ensured chatMessage TTL index (90 days)');
    } catch (err) {
      console.error('Failed to ensure chat TTL index:', err?.message || err);
    }

    // Attach WebSocket server using ws
    initWebSocket(server, { path: '/ws' });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Khởi động Cron kiểm tra hết hạn (CONFIRMED -> EXPIRED sau N ngày)
      setupExpirationChecker({ days: 2 });
    });

  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('API is running');
});

startServer();
