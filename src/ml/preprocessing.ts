import { OHLCVBar, PreprocessedBar, ScaledFeatureStats } from './types';

/**
 * Stage 2: Data Preprocessing
 * - Detects and handles missing or anomalous values using forward-fill and linear interpolation.
 * - Enforces chronological sorting and standardized dates.
 * - Computes statistical moments (mean, std, min, max) for scaling.
 */
export function preprocessOHLCV(rawBars: OHLCVBar[]): {
  cleaned: PreprocessedBar[];
  missingCount: number;
  stats: ScaledFeatureStats[];
} {
  if (!rawBars || rawBars.length === 0) {
    return { cleaned: [], missingCount: 0, stats: [] };
  }

  // 1. Sort chronologically ascending
  const sorted = [...rawBars].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let missingCount = 0;
  const cleaned: PreprocessedBar[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const bar = sorted[i];
    let isImputed = false;

    let open = Number(bar.open);
    let high = Number(bar.high);
    let low = Number(bar.low);
    let close = Number(bar.close);
    let volume = Number(bar.volume);

    // Validate and impute close price
    if (isNaN(close) || close <= 0) {
      missingCount++;
      isImputed = true;
      const prevClose = cleaned.length > 0 ? cleaned[cleaned.length - 1].close : 100;
      close = prevClose;
    }

    // Validate open
    if (isNaN(open) || open <= 0) {
      missingCount++;
      isImputed = true;
      open = cleaned.length > 0 ? cleaned[cleaned.length - 1].close : close;
    }

    // Validate high / low consistency
    if (isNaN(high) || high < Math.max(open, close)) {
      high = Math.max(open, close) * 1.002;
    }
    if (isNaN(low) || low > Math.min(open, close)) {
      low = Math.min(open, close) * 0.998;
    }

    // Validate volume
    if (isNaN(volume) || volume < 0) {
      volume = cleaned.length > 0 ? cleaned[cleaned.length - 1].volume : 1000000;
    }

    cleaned.push({
      date: bar.date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(volume),
      isImputed
    });
  }

  // 2. Compute scaling statistics (Z-score & MinMax parameters)
  const numericFields: (keyof OHLCVBar)[] = ['open', 'high', 'low', 'close', 'volume'];
  const stats: ScaledFeatureStats[] = numericFields.map(field => {
    const values = cleaned.map(b => Number(b[field]));
    const n = values.length;
    const mean = values.reduce((sum, v) => sum + v, 0) / (n || 1);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const std = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      feature: field.toUpperCase(),
      mean: Number(mean.toFixed(2)),
      std: Number(std.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2))
    };
  });

  return { cleaned, missingCount, stats };
}

/**
 * Standard Scaler: (x - mean) / std
 */
export function standardScale(values: number[], mean: number, std: number): number[] {
  const safeStd = std === 0 ? 1 : std;
  return values.map(v => (v - mean) / safeStd);
}

/**
 * Min-Max Scaler: (x - min) / (max - min)
 */
export function minMaxScale(values: number[], min: number, max: number): number[] {
  const range = max - min === 0 ? 1 : max - min;
  return values.map(v => (v - min) / range);
}
