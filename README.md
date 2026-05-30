# BTC/USDT Orderbook Pulse

A real-time cryptocurrency order book dashboard. Connects to the public Binance
WebSocket, maintains a 100-level order book in memory, and computes 5
weighted-imbalance metrics every second.

- Current price vs predicted price (color-coded by buy/sell pressure)
- Weighted Order Book Imbalance (OBI) %
- Value change and predicted move
- 20 minute rolling history (chart + table)

Free to run, no API key needed.

---

## Requirements

| | Windows | macOS / Linux |
|---|---|---|
| **Node.js 18+** | [nodejs.org → LTS .msi](https://nodejs.org/) | [nodejs.org → LTS .pkg](https://nodejs.org/) or `brew install node` |
| **Git** | [git-scm.com/download/win](https://git-scm.com/download/win) | preinstalled, or `brew install git` |
| Browser | Edge / Chrome / Firefox | any modern browser |

Verify both are installed (open **PowerShell** on Windows, or **Terminal** on macOS):

```bash
node --version    # should print v18 or higher
git --version
```

---

## Get the code

```bash
git clone https://github.com/YOUR-USERNAME/crypto-orderbook.git
cd crypto-orderbook
```

(Replace `YOUR-USERNAME` with the actual GitHub URL you'll receive.)

---

## Run it — two terminals

You need **two** PowerShell / Terminal windows open at the same time: one for the
backend, one for the frontend.

### Terminal 1 — backend

```bash
cd backend
npm install
npm start
```

Wait for these lines to appear:

```
[Binance] WebSocket connected
[Binance] Order book synced and live
[Server] HTTP+WS listening on http://localhost:4000
```

Leave this window running.

### Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

Vite prints something like:

```
  VITE v5  ready in 312 ms
  ➜  Local:   http://localhost:5173/
```

Open that URL in your browser. The dashboard should connect within ~1 second
and the chart will fill out tick by tick over the next 20 minutes.

To stop either server: press `Ctrl + C` in its terminal window.

---

## Troubleshooting (Windows)

- **`'node' is not recognized as an internal or external command`** — close and
  reopen PowerShell after installing Node (the installer updates `PATH` but
  existing terminals won't pick it up until restarted).
- **Windows Defender Firewall pops up** the first time Node listens on a port —
  click **Allow access**. (Private network is enough; you don't need public.)
- **`EADDRINUSE` / port already in use** — something else is on port 4000 or
  5173. Close other dev servers, or change the backend port:
  ```powershell
  $env:PORT=4001; npm start
  ```
- **Dashboard stuck on "Waiting for data"** — open
  [http://localhost:4000/health](http://localhost:4000/health) in the browser.
  It should return JSON with `"bookSynced": true` and a non-zero
  `historyLength`. If `bookSynced` stays `false`, your network is blocking
  `wss://stream.binance.com` — try a different network (mobile hotspot is a
  good test).
- **First load shows nothing for a few seconds** — that's normal. The backend
  needs one full second after sync to produce the first tick.

---

## How the metrics are computed

Every second, against the top 100 bid + top 100 ask levels:

| Metric | Formula |
|---|---|
| Current Price | mid-price = `(best bid + best ask) / 2` |
| Weight Change % (OBI) | Linear weights `100, 99, …, 1` per row; `valueᵢ = priceᵢ × qtyᵢ`; `imbalance = ((wBuyAvg − wSellAvg) / (wBuyAvg + wSellAvg)) × 100` |
| Value Change | `(ask₁₀₀ − bid₁₀₀) × (OBI / 100)` |
| Predicted Price | `Current + Value Change` |

Order book is synced using Binance's recommended REST-snapshot + diff-stream
procedure, with automatic resync on sequence gaps or disconnects.

---

## Project layout

```
crypto-orderbook/
├── backend/                  Node.js + Express + ws
│   └── src/
│       ├── server.js         HTTP + WS server, 1-second tick loop
│       ├── binance.js        Binance sync (REST snapshot + WS diff)
│       ├── orderbook.js      In-memory bids/asks
│       └── metrics.js        5-metric calculator
└── frontend/                 React + Vite + Tailwind + Recharts
    └── src/
        ├── App.jsx
        ├── hooks/
        │   └── useOrderBookSocket.js
        └── components/       PriceHeader, MetricsRow, PriceChart, MetricsTable
```

Educational project — not financial advice.
