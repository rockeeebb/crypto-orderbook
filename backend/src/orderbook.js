class OrderBook {
  constructor() {
    this.bids = new Map();
    this.asks = new Map();
    this.lastUpdateId = 0;
  }

  applySnapshot(snapshot) {
    this.bids.clear();
    this.asks.clear();
    for (const [price, qty] of snapshot.bids) {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q > 0) this.bids.set(p, q);
    }
    for (const [price, qty] of snapshot.asks) {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q > 0) this.asks.set(p, q);
    }
    this.lastUpdateId = snapshot.lastUpdateId;
  }

  applyDiff(bids, asks) {
    for (const [price, qty] of bids) {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q === 0) this.bids.delete(p);
      else this.bids.set(p, q);
    }
    for (const [price, qty] of asks) {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q === 0) this.asks.delete(p);
      else this.asks.set(p, q);
    }
  }

  getTopLevels(n = 100) {
    const bids = [...this.bids.entries()]
      .sort((a, b) => b[0] - a[0])
      .slice(0, n);
    const asks = [...this.asks.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, n);
    return { bids, asks };
  }

  getBestBid() {
    let best = 0;
    for (const p of this.bids.keys()) if (p > best) best = p;
    return best;
  }

  getBestAsk() {
    let best = Infinity;
    for (const p of this.asks.keys()) if (p < best) best = p;
    return best === Infinity ? 0 : best;
  }

  getMidPrice() {
    const bid = this.getBestBid();
    const ask = this.getBestAsk();
    if (bid === 0 || ask === 0) return 0;
    return (bid + ask) / 2;
  }
}

module.exports = OrderBook;
