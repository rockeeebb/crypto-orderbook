const WebSocket = require('ws');
const axios = require('axios');

const SYMBOL = 'btcusdt';
const WS_URL = `wss://stream.binance.com:9443/ws/${SYMBOL}@depth@100ms`;
const REST_URL = `https://api.binance.com/api/v3/depth?symbol=${SYMBOL.toUpperCase()}&limit=1000`;

class BinanceConnector {
  constructor(orderbook) {
    this.orderbook = orderbook;
    this.ws = null;
    this.buffer = [];
    this.synced = false;
    this.reconnectDelay = 1000;
  }

  start() {
    this.connect();
  }

  connect() {
    console.log('[Binance] Connecting to WebSocket...');
    this.synced = false;
    this.buffer = [];
    this.ws = new WebSocket(WS_URL);

    this.ws.on('open', () => {
      console.log('[Binance] WebSocket connected');
      this.reconnectDelay = 1000;
      // Buffer events briefly before requesting the REST snapshot,
      // per Binance's depth-stream sync procedure.
      setTimeout(() => this.fetchSnapshot(), 500);
    });

    this.ws.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString());
        if (!this.synced) this.buffer.push(event);
        else this.processEvent(event);
      } catch (e) {
        console.error('[Binance] Parse error:', e.message);
      }
    });

    this.ws.on('close', () => {
      console.log('[Binance] WebSocket closed, reconnecting...');
      this.synced = false;
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    });

    this.ws.on('error', (err) => {
      console.error('[Binance] WebSocket error:', err.message);
    });
  }

  async fetchSnapshot() {
    try {
      console.log('[Binance] Fetching REST snapshot...');
      const { data } = await axios.get(REST_URL, { timeout: 10000 });
      this.orderbook.applySnapshot(data);
      console.log(`[Binance] Snapshot lastUpdateId=${data.lastUpdateId}`);

      const valid = this.buffer.filter((e) => e.u > data.lastUpdateId);
      if (valid.length > 0) {
        const first = valid[0];
        if (first.U > data.lastUpdateId + 1) {
          console.warn('[Binance] First-event gap, re-syncing...');
          this.buffer = [];
          return setTimeout(() => this.fetchSnapshot(), 1000);
        }
        for (const event of valid) this.processEvent(event);
      }
      this.buffer = [];
      this.synced = true;
      console.log('[Binance] Order book synced and live');
    } catch (err) {
      console.error('[Binance] Snapshot error:', err.message);
      setTimeout(() => this.fetchSnapshot(), 2000);
    }
  }

  processEvent(event) {
    if (event.u <= this.orderbook.lastUpdateId) return;
    if (event.U > this.orderbook.lastUpdateId + 1) {
      console.warn('[Binance] Sequence gap, resyncing...');
      this.synced = false;
      this.buffer = [];
      return setTimeout(() => this.fetchSnapshot(), 500);
    }
    this.orderbook.applyDiff(event.b, event.a);
    this.orderbook.lastUpdateId = event.u;
  }
}

module.exports = BinanceConnector;
