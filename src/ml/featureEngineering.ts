import { PreprocessedBar, EngineeredFeatureRow } from './types';

/**
 * Stage 3: Feature Engineering
 * Calculates technical indicators & prepares supervised learning targets.
 */
export function engineerFeatures(bars: PreprocessedBar[]): EngineeredFeatureRow[] {
  if (bars.length < 35) {
    // Return partial set if data points are low
    return [];
  }

  const rows: EngineeredFeatureRow[] = [];
  const closes = bars.map(b => b.close);

  // Helper: Simple Moving Average
  const getSMA = (series: number[], index: number, period: number): number => {
    if (index < period - 1) return series[index];
    let sum = 0;
    for (let i = index - period + 1; i <= index; i++) {
      sum += series[i];
    }
    return sum / period;
  };

  // Helper: Exponential Moving Average
  const calculateEMAArray = (series: number[], period: number): number[] => {
    const ema: number[] = new Array(series.length);
    const k = 2 / (period + 1);
    let prev = series[0];
    ema[0] = prev;
    for (let i = 1; i < series.length; i++) {
      prev = series[i] * k + prev * (1 - k);
      ema[i] = prev;
    }
    return ema;
  };

  const ema12 = calculateEMAArray(closes, 12);
  const ema26 = calculateEMAArray(closes, 26);
  const macdRaw = ema12.map((v, i) => v - ema26[i]);
  const macdSignalRaw = calculateEMAArray(macdRaw, 9);

  // Helper: 14-Day RSI (Wilder's smoothing)
  const calculateRSIArray = (series: number[], period: number = 14): number[] => {
    const rsi: number[] = new Array(series.length).fill(50);
    if (series.length <= period) return rsi;

    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i <= period; i++) {
      const diff = series[i] - series[i - 1];
      if (diff >= 0) avgGain += diff;
      else avgLoss += Math.abs(diff);
    }

    avgGain /= period;
    avgLoss /= period;

    const rsInitial = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[period] = 100 - (100 / (1 + rsInitial));

    for (let i = period + 1; i < series.length; i++) {
      const diff = series[i] - series[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) {
        rsi[i] = 100;
      } else {
        const rs = avgGain / avgLoss;
        rsi[i] = 100 - (100 / (1 + rs));
      }
    }

    return rsi;
  };

  const rsiArray = calculateRSIArray(closes, 14);

  // Calculate True Range for ATR
  const trArray: number[] = new Array(bars.length);
  trArray[0] = bars[0].high - bars[0].low;
  for (let i = 1; i < bars.length; i++) {
    const h = bars[i].high;
    const l = bars[i].low;
    const cp = bars[i - 1].close;
    trArray[i] = Math.max(h - l, Math.abs(h - cp), Math.abs(l - cp));
  }

  // Calculate daily returns first
  const dailyReturns: number[] = new Array(bars.length).fill(0);
  for (let i = 1; i < bars.length; i++) {
    const prev = bars[i - 1].close;
    dailyReturns[i] = prev !== 0 ? ((bars[i].close - prev) / prev) * 100 : 0;
  }

  // Iterate to build feature rows (starting from day 30 so 30-day SMA has full history)
  for (let i = 30; i < bars.length; i++) {
    const bar = bars[i];
    const sma7 = getSMA(closes, i, 7);
    const sma30 = getSMA(closes, i, 30);
    const returnVal = dailyReturns[i];

    // 20-day rolling annualized volatility
    let volSum = 0;
    const volWindow = 20;
    const startIndex = Math.max(0, i - volWindow + 1);
    const windowSlice = dailyReturns.slice(startIndex, i + 1);
    const sliceMean = windowSlice.reduce((a, b) => a + b, 0) / windowSlice.length;
    for (const ret of windowSlice) {
      volSum += Math.pow(ret - sliceMean, 2);
    }
    const sampleVariance = windowSlice.length > 1 ? volSum / (windowSlice.length - 1) : 0;
    const dailyStd = Math.sqrt(sampleVariance);
    // Annualized volatility (%): dailyStd * sqrt(252)
    const volatility20 = Number((dailyStd * Math.sqrt(252)).toFixed(2));

    // RSI
    const rsi14 = Number(rsiArray[i].toFixed(2));

    // MACD
    const macd = Number(macdRaw[i].toFixed(2));
    const macdSignal = Number(macdSignalRaw[i].toFixed(2));

    // ATR 14
    let atrSum = 0;
    const atrStart = Math.max(0, i - 14 + 1);
    for (let k = atrStart; k <= i; k++) {
      atrSum += trArray[k];
    }
    const atr14 = Number((atrSum / Math.min(14, i - atrStart + 1)).toFixed(2));

    // 20-day Volume SMA & Volume Ratio
    let volSmaSum = 0;
    const volSmaStart = Math.max(0, i - 20 + 1);
    for (let k = volSmaStart; k <= i; k++) {
      volSmaSum += bars[k].volume;
    }
    const volSma20 = volSmaSum / (i - volSmaStart + 1);
    const volumeRatio = Number((bar.volume / (volSma20 || 1)).toFixed(2));

    // Next-day target (for i < bars.length - 1)
    let targetNextDayReturn: number | undefined = undefined;
    let targetNextDayClose: number | undefined = undefined;

    if (i < bars.length - 1) {
      const nextClose = bars[i + 1].close;
      targetNextDayReturn = Number((((nextClose - bar.close) / bar.close) * 100).toFixed(3));
      targetNextDayClose = Number(nextClose.toFixed(2));
    }

    rows.push({
      date: bar.date,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
      sma7: Number(sma7.toFixed(2)),
      sma30: Number(sma30.toFixed(2)),
      dailyReturn: Number(returnVal.toFixed(2)),
      volatility20,
      rsi14,
      macd,
      macdSignal,
      atr14,
      volumeRatio,
      targetNextDayReturn,
      targetNextDayClose
    });
  }

  return rows;
}
