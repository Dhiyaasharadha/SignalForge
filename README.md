# SignalForge – Explainable Market Intelligence Platform

SignalForge is an explainable stock forecasting and financial analytics platform. It operationalizes a complete 7-stage Data Science Lifecycle on real-world equity market data with multi-model consensus, feature importance attribution, and real-time sensitivity simulation.

---

## Key Features

### 1. Real Market Data Ingestion
- **Alpha Vantage API Integration**: Fetches real daily historical OHLCV series using the Alpha Vantage REST API.
- **Resilient Fallback Stream**: If Alpha Vantage daily rate limits are hit or an API key is not supplied, SignalForge automatically falls back to live financial feeds (e.g. Stooq) without breaking application flow.
- **Ticker Flexibility**: Search and analyze any stock ticker (default: `AAPL`, with quick selectors for `NVDA`, `MSFT`, `TSLA`, `AMZN`, `GOOGL`, `SPY`).

### 2. Complete 7-Stage Data Science Pipeline
1. **Data Collection**: Ingestion of historical Open, High, Low, Close, and Volume series.
2. **Data Preprocessing**: Anomaly detection, date alignment, missing value interpolation, and Z-score standardization / Min-Max scaling.
3. **Feature Engineering**:
   - 7-Day Simple Moving Average (SMA7)
   - 30-Day Simple Moving Average (SMA30)
   - Daily Returns (% change)
   - 20-Day Annualized Volatility
   - 14-Day Relative Strength Index (RSI)
   - 14-Day Average True Range (ATR) & MACD
4. **Feature Selection**:
   - Pearson Correlation Matrix calculating collinearity and target signal strength.
   - Domain-weighted feature importance ranking.
5. **Model Training**:
   - **Linear Regression**: Multivariate Ridge/OLS closed-form analytical solver.
   - **Random Forest**: Bagged ensemble of 20+ regression decision trees with feature subspace sampling.
   - **XGBoost / Gradient Boosted Trees**: Sequential gradient boosting weak learners with shrinkage ($\eta = 0.1$).
6. **Model Evaluation**:
   - Chronological 80/20 train/test holdout evaluation.
   - Metrics: **RMSE**, **MAE**, **R² Score**, and **Directional Accuracy (%)**.
7. **Forecast Generation**:
   - Next-day price movement and expected return projection.

---

## Novel Features

### 1. Multi-Model Consensus Engine
Aggregates predictions across all 3 trained architectures. Displays individual model stances and agreement percentage (e.g., *66% Bullish* or *100% Bullish*), alongside an inverse-error weighted price target.

### 2. Smart Investment Recommendation
Synthesizes the consensus direction, annualized volatility regime, and confidence boundaries into a clear recommendation:
- **Action**: `Strong Buy`, `Moderate Buy`, `Hold`, `Moderate Sell`, `Strong Sell`
- **Conviction Score**: 0 to 100% certainty rating
- **Risk Protection**: 1.8x ATR dynamic Stop-Loss and Take-Profit target levels
- **Risk/Reward Ratio**: Quantified trade payoff asymmetry

### 3. What-If Market Simulator
Enables instant sensitivity testing without retraining models:
- **Sentiment Level Slider**: -100% (Extreme Fear) to +100% (Extreme Greed)
- **Volatility Multiplier**: 0.5x (Defensive) to 2.5x (High Volatility)
- **Macro Beta Shock**: -5% to +5% broad index shock
- Instantly recalculates adjusted forecast, target price, and simulated 90% confidence bands in real time.

### 4. Explainable Forecast Panel (XAI)
Transparent attribution revealing which indicators drove the forecast:
- **Ranked Feature Importance**: Visual bar chart showing relative influence.
- **Positive Catalysts vs. Negative Headwinds**: Explains which specific indicators exerted upward or downward pressure.
- **Executive Summary**: Clear plain-English takeaway for investment committees.

### 5. News Sentiment Feed & Model Correlation Engine
Integrates real-time financial headlines for the selected ticker and correlates them against quantitative model predictions:
- **Dual-Stream News Ingestion**: Fetches from Alpha Vantage `NEWS_SENTIMENT` API with seamless direct financial wire fallback.
- **Headline Sentiment Scoring**: Normalized scores from `-1.00` (Extreme Bearish) to `+1.00` (Extreme Bullish).
- **Concordance Correlation Index**: Measures alignment between media sentiment ($r$) and algorithmic price projections.
- **Headline Classification**: Classifies each article as *Supports Forecast* (validates quantitative breakout/support) or *Contradicts Forecast* (flags headline friction / event risk).
- **One-Click Simulator Sync**: Allows traders to test news sentiment directly within the What-If Simulator with a single click.

---

## Design System

Crafted with a luxury financial aesthetic:
- **Ivory Background**: `#FAF9F5` / `#F7F5F0`
- **Clean White Cards**: Single-elevation border cards (`#EAE6DF`)
- **Soft Gold Accents**: `#C5A059` and `#D4AF37`
- **Modern Typography**: `Plus Jakarta Sans` for editorial clarity paired with `JetBrains Mono` for tabular numerals (`font-mono tabular-nums`).
- **Zero-Pill Discipline**: Metadata displayed with clean unboxed typographic separators (`·`).

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend / Proxy**: Express, Node.js (`server.ts`)
- **Machine Learning**: Native TypeScript statistical algorithms (OLS Ridge, Bagged Decision Trees, Gradient Boosted Decision Trees)
- **Containerization**: Docker, Docker Compose

---

## Getting Started

### 1. Local Development

```bash
# Clone the repository and install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Optional: Add your Alpha Vantage API key to .env
# ALPHA_VANTAGE_API_KEY="YOUR_KEY"

# Start the full-stack development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 2. Docker Deployment

```bash
# Build and run using Docker Compose
docker-compose up --build
```

The container runs on port `3000` with production build optimization.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key for stock market queries | Optional (Auto fallback to real feeds) |
| `PORT` | Server listening port | `3000` |
| `NODE_ENV` | Runtime environment (`development` or `production`) | `development` |

---

## Architecture

```
/
├── server.ts                       # Express full-stack proxy & Vite dev server
├── Dockerfile                      # Multi-stage production container
├── docker-compose.yml              # Container orchestration
├── src/
│   ├── App.tsx                     # Main dashboard container & state coordinator
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles & typography
│   ├── services/
│   │   └── stockApi.ts             # API client & ticker definitions
│   ├── ml/
│   │   ├── types.ts                # TypeScript interfaces for ML pipeline
│   │   ├── preprocessing.ts        # Imputation, date sorting, Z-score & MinMax scaling
│   │   ├── featureEngineering.ts   # SMA7, SMA30, Daily Return, Volatility, RSI, ATR
│   │   ├── featureSelection.ts     # Pearson correlation matrix & importance ranking
│   │   ├── models.ts               # Linear Regression, Random Forest, XGBoost
│   │   ├── consensusAndRecommendation.ts # Consensus Engine, Recommender, What-If, XAI
│   │   └── pipeline.ts             # Master pipeline orchestrator
│   └── components/
│       ├── Navbar.tsx              # 3-Zone Top Navigation bar
│       ├── StockHeader.tsx         # Stock overview & quick selector
│       ├── PriceChart.tsx          # SVG candlestick/line chart with SMA overlays
│       ├── TechnicalIndicatorsCard.tsx # RSI, Volatility, SMA trend metrics
│       ├── ConsensusEngineCard.tsx # Novel Feature 1: Multi-Model Consensus
│       ├── RecommendationCard.tsx  # Novel Feature 2: Smart Investment Recommendation
│       ├── WhatIfSimulator.tsx     # Novel Feature 3: What-If Market Simulator
│       ├── ExplainabilityPanel.tsx # Novel Feature 4: Explainable Forecast Panel
│       ├── DataPipelineView.tsx    # 7-stage Data Science Explorer
│       ├── ModelArenaView.tsx      # Side-by-side model comparison & backtest
│       └── ApiSettingsModal.tsx    # API key configuration drawer
```

---

## License

Apache-2.0
