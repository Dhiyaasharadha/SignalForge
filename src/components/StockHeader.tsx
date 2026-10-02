import React from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Database } from 'lucide-react';
import { StockMetadata } from '../ml/types';
import { POPULAR_TICKERS } from '../services/stockApi';

interface StockHeaderProps {
  ticker: string;
  companyName: string;
  sector: string;
  meta: StockMetadata;
  dataSource: string;
  apiNotice: string | null;
  lastRefreshed: string;
  onSelectTicker: (ticker: string) => void;
}

export const StockHeader: React.FC<StockHeaderProps> = ({
  ticker,
  companyName,
  sector,
  meta,
  dataSource,
  apiNotice,
  lastRefreshed,
  onSelectTicker
}) => {
  const isPositive = meta.change >= 0;

  // 52-Week Range calculation
  const rangeSpan = meta.high52 - meta.low52 || 1;
  const currentPosPct = Math.min(100, Math.max(0, ((meta.currentPrice - meta.low52) / rangeSpan) * 100));

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Top Banner Row: Ticker & Meta */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">{ticker}</h1>
            <span className="text-lg font-medium text-[#475569]">{companyName}</span>
          </div>
          
          {/* Zero-Pill Unboxed Metadata with · separator */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] mt-1">
            <span>{sector}</span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-[#C5A059]" />
              {dataSource}
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#94A3B8]" />
              Last Close: {lastRefreshed}
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span>{meta.dataPoints} Market Sessions</span>
          </div>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#64748B] font-medium mr-1">Quick Select:</span>
          {POPULAR_TICKERS.slice(0, 6).map(item => (
            <button
              key={item.symbol}
              onClick={() => onSelectTicker(item.symbol)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                ticker === item.symbol
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'bg-[#FAF9F5] text-[#475569] hover:bg-[#F1EFEA] border border-[#EAE6DF]'
              }`}
            >
              {item.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Notice bar if fallback / rate-limit note */}
      {apiNotice && (
        <div className="mt-3 px-3 py-2 bg-[#FAF9F5] border border-[#EAE6DF] rounded-md text-[11px] text-[#64748B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
            <span>{apiNotice}</span>
          </div>
          <span className="font-mono text-[#94A3B8] hidden sm:inline">Real Market Mode</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-1">
        {/* Metric 1: Current Price */}
        <div>
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Current Price</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-[#0F172A] tabular-nums">
              ${meta.currentPrice.toFixed(2)}
            </span>
            <span
              className={`flex items-center text-xs font-mono font-semibold tabular-nums ${
                isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {isPositive ? '+' : ''}
              {meta.change.toFixed(2)} ({isPositive ? '+' : ''}
              {meta.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Metric 2: Today's Range */}
        <div>
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Day High / Low</div>
          <div className="text-sm font-mono font-semibold text-[#0F172A] mt-1 tabular-nums">
            ${meta.high.toFixed(2)} <span className="text-[#94A3B8] font-normal">/</span> ${meta.low.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
            Open: ${meta.open.toFixed(2)}
          </div>
        </div>

        {/* Metric 3: Volume */}
        <div>
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Trading Volume</div>
          <div className="text-sm font-mono font-semibold text-[#0F172A] mt-1 tabular-nums">
            {meta.volume.toLocaleString()} shares
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            Active Market Liquidity
          </div>
        </div>

        {/* Metric 4: 52-Week Range */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>52-Wk Low: ${meta.low52.toFixed(2)}</span>
            <span>High: ${meta.high52.toFixed(2)}</span>
          </div>
          <div className="relative w-full h-2 bg-[#F1EFEA] rounded-full mt-2 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#94A3B8] via-[#C5A059] to-[#0F172A] rounded-full"
              style={{ width: `${currentPosPct}%` }}
            />
          </div>
          <div className="text-[11px] text-[#64748B] mt-1 font-mono text-right tabular-nums">
            {currentPosPct.toFixed(0)}% of 52-Wk Range
          </div>
        </div>
      </div>
    </div>
  );
};
