import React from 'react';
import { EngineeredFeatureRow } from '../ml/types';
import { Activity, Gauge, TrendingUp, TrendingDown, Crosshair } from 'lucide-react';

interface TechnicalIndicatorsCardProps {
  latestBar: EngineeredFeatureRow;
}

export const TechnicalIndicatorsCard: React.FC<TechnicalIndicatorsCardProps> = ({ latestBar }) => {
  const isGoldenCross = latestBar.sma7 > latestBar.sma30;
  const smaSpreadPct = (((latestBar.sma7 - latestBar.sma30) / latestBar.sma30) * 100).toFixed(2);

  // RSI status
  let rsiStatus = 'Neutral Corridor';
  let rsiColor = 'text-[#0F172A]';
  if (latestBar.rsi14 < 30) {
    rsiStatus = 'Oversold / Reversal Zone';
    rsiColor = 'text-[#16A34A]';
  } else if (latestBar.rsi14 > 70) {
    rsiStatus = 'Overbought / Exhaustion Risk';
    rsiColor = 'text-[#DC2626]';
  }

  // Volatility regime
  let volRegime = 'Normal';
  if (latestBar.volatility20 < 18) volRegime = 'Subdued / Low';
  else if (latestBar.volatility20 > 38) volRegime = 'Extreme Turbulence';
  else if (latestBar.volatility20 > 25) volRegime = 'Elevated';

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">Core Technical Indicators</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Engineered feature vectors feeding the multi-model decision matrix
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#94A3B8]">Session: {latestBar.date}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Indicator 1: RSI (14-Day) */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>RSI (14-Day)</span>
            <Activity className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${rsiColor}`}>
              {latestBar.rsi14.toFixed(1)}
            </span>
            <span className="text-[11px] text-[#64748B] font-mono">/ 100</span>
          </div>
          {/* Visual RSI bar */}
          <div className="w-full h-1.5 bg-[#EAE6DF] rounded-full mt-2 overflow-hidden relative">
            <div
              className={`h-full rounded-full ${
                latestBar.rsi14 < 30 ? 'bg-[#16A34A]' : latestBar.rsi14 > 70 ? 'bg-[#DC2626]' : 'bg-[#0F172A]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, latestBar.rsi14))}%` }}
            />
          </div>
          <div className="text-[11px] text-[#64748B] mt-1.5 font-mono truncate">
            {rsiStatus}
          </div>
        </div>

        {/* Indicator 2: SMA 7 vs SMA 30 Trend */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>Moving Average Trend</span>
            {isGoldenCross ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#DC2626]" />
            )}
          </div>
          <div className="text-sm font-mono font-bold text-[#0F172A] mt-1">
            {isGoldenCross ? 'Bullish Alignment (SMA7 > SMA30)' : 'Bearish Alignment (SMA7 < SMA30)'}
          </div>
          <div className="text-xs font-mono text-[#64748B] mt-1">
            Spread: <strong className={isGoldenCross ? 'text-[#16A34A]' : 'text-[#DC2626]'}>{smaSpreadPct}%</strong>
          </div>
          <div className="text-[11px] font-mono text-[#94A3B8] mt-1">
            7d: ${latestBar.sma7.toFixed(2)} · 30d: ${latestBar.sma30.toFixed(2)}
          </div>
        </div>

        {/* Indicator 3: 20-Day Annualized Volatility */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>20-Day Volatility</span>
            <Gauge className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
            {latestBar.volatility20.toFixed(1)}%
          </div>
          <div className="text-xs font-mono text-[#64748B] mt-0.5">
            Regime: <strong className="text-[#0F172A]">{volRegime}</strong>
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1 font-mono">
            Daily Std: {(latestBar.volatility20 / Math.sqrt(252)).toFixed(2)}%
          </div>
        </div>

        {/* Indicator 4: ATR & Volume Ratio */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>ATR (14) & Liquidity</span>
            <Crosshair className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
            ${latestBar.atr14.toFixed(2)}
          </div>
          <div className="text-xs font-mono text-[#64748B] mt-0.5">
            Vol Ratio: <strong className="text-[#0F172A]">{latestBar.volumeRatio}x 20d avg</strong>
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1 font-mono">
            Average True Range Risk Envelope
          </div>
        </div>
      </div>
    </div>
  );
};
