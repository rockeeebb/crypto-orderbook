const DEPTH = 60;

function calculateMetrics(orderbook) {
  const { bids, asks } = orderbook.getTopLevels(DEPTH);
  const currentPrice = orderbook.getMidPrice();

  if (bids.length < DEPTH || asks.length < DEPTH || currentPrice === 0) {
    return null;
  }

  // Linear descending weights: row 0 (closest to mid) = DEPTH, last row = 1.
  let weightedBuySum = 0;
  let weightedSellSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < DEPTH; i++) {
    const weight = DEPTH - i; // 100, 99, ..., 1
    const [bidPrice, bidQty] = bids[i];
    const [askPrice, askQty] = asks[i];
    const bidValueUsdt = bidPrice * bidQty;
    const askValueUsdt = askPrice * askQty;
    weightedBuySum += bidValueUsdt * weight;
    weightedSellSum += askValueUsdt * weight;
    totalWeight += weight;
  }

  const weightedBuyAvg = weightedBuySum / totalWeight;
  const weightedSellAvg = weightedSellSum / totalWeight;

  const denom = weightedBuyAvg + weightedSellAvg;
  const imbalancePct =
    denom === 0 ? 0 : ((weightedBuyAvg - weightedSellAvg) / denom) * 100;

  // 100th order (index 99). Depth spread is positive (ask > bid at depth).
  const bid100Price = bids[DEPTH - 1][0];
  const ask100Price = asks[DEPTH - 1][0];
  const depthSpread = ask100Price - bid100Price;

  const valueChange = depthSpread * (imbalancePct / 100);
  const predictedPrice = currentPrice + valueChange;

  return {
    timestamp: Date.now(),
    currentPrice,
    imbalancePct,
    valueChange,
    predictedPrice,
  };
}

module.exports = { calculateMetrics };
