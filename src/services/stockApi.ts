import { StockApiResponse, NewsSentimentFeed } from '../ml/types';

export const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Tech' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Software/Cloud' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Internet/AI' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Social Media' },
  { symbol: 'SPY', name: 'S&P 500 ETF', sector: 'Index ETF' }
];

export async function fetchStockData(symbol: string): Promise<StockApiResponse> {
  const ticker = (symbol || 'AAPL').toUpperCase().trim();
  const customKey = localStorage.getItem('signalforge_av_key') || '';

  const url = `/api/stock/${encodeURIComponent(ticker)}${
    customKey ? `?apiKey=${encodeURIComponent(customKey)}` : ''
  }`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
    }
    const data: StockApiResponse = await res.json();
    return data;
  } catch (err) {
    console.warn(`Direct proxy call failed for ${ticker}, using direct public feed fallback`, err);
    return fetchDirectStooqFallback(ticker);
  }
}

export async function fetchTickerNews(symbol: string): Promise<NewsSentimentFeed> {
  const ticker = (symbol || 'AAPL').toUpperCase().trim();
  const customKey = localStorage.getItem('signalforge_av_key') || '';

  const url = `/api/news/${encodeURIComponent(ticker)}${
    customKey ? `?apiKey=${encodeURIComponent(customKey)}` : ''
  }`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
    }
    const data: NewsSentimentFeed = await res.json();
    return data;
  } catch (err) {
    console.warn(`Failed to fetch news for ${ticker}:`, err);
    throw err;
  }
}

async function fetchDirectStooqFallback(ticker: string): Promise<StockApiResponse> {
  // Client-side fallback if server endpoint is inaccessible
  const res = await fetch(`/api/stock/${ticker}`);
  if (res.ok) {
    return res.json();
  }
  throw new Error(`Unable to fetch market data for ticker: ${ticker}`);
}
