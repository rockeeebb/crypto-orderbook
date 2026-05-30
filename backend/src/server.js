const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');
const OrderBook = require('./orderbook');
const BinanceConnector = require('./binance');
const { calculateMetrics } = require('./metrics');

const PORT = process.env.PORT || 4000;
const HISTORY_LIMIT = 600; // 10 minutes at 1 Hz

const app = express();
app.use(cors());

const DIST_DIR = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  console.log(`[Server] Serving built frontend from ${DIST_DIR}`);
}

const orderbook = new OrderBook();
const binance = new BinanceConnector(orderbook);
binance.start();

const history = [];

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log(`[Server] Client connected (${wss.clients.size} total)`);
  ws.send(JSON.stringify({ type: 'history', data: history }));
  ws.on('close', () => console.log('[Server] Client disconnected'));
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

setInterval(() => {
  if (!binance.synced) return;
  const m = calculateMetrics(orderbook);
  if (!m) return;
  history.push(m);
  if (history.length > HISTORY_LIMIT) history.shift();
  broadcast({ type: 'update', data: m });
}, 1000);

app.get(/^\/(?!ws|health).*/, (_req, res, next) => {
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  return next();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    historyLength: history.length,
    bookSynced: binance.synced,
    bestBid: orderbook.getBestBid(),
    bestAsk: orderbook.getBestAsk(),
    bidsCount: orderbook.bids.size,
    asksCount: orderbook.asks.size,
  });
});

server.listen(PORT, () => {
  console.log(`[Server] HTTP+WS listening on http://localhost:${PORT}`);
  console.log(`[Server] WebSocket endpoint:    ws://localhost:${PORT}/ws`);
  console.log(`[Server] Health endpoint:       http://localhost:${PORT}/health`);
});
