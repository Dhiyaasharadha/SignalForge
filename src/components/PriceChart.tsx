import React, { useState, useMemo } from 'react';
import { EngineeredFeatureRow } from '../ml/types';
import { BarChart3, LineChart as LineChartIcon, Eye, EyeOff } from 'lucide-react';

interface PriceChartProps {
  features: EngineeredFeatureRow[];
  currentTicker: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ features, currentTicker }) => {
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | 'ALL'>('3M');
  const [showSMA7, setShowSMA7] = useState(true);
  const [showSMA30, setShowSMA30] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter based on selected time range
  const visibleData = useMemo(() => {
    if (features.length === 0) return [];
    if (timeRange === '1M') return features.slice(-22);
    if (timeRange === '3M') return features.slice(-66);
    if (timeRange === '6M') return features.slice(-130);
    return features;
  }, [features, timeRange]);

  const activeBar = hoverIndex !== null && visibleData[hoverIndex] ? visibleData[hoverIndex] : visibleData[visibleData.length - 1];

  // SVG Geometry calculations
  const width = 800;
  const priceChartHeight = 260;
  const volumeChartHeight = 70;
  const padding = { top: 20, right: 60, bottom: 25, left: 15 };

  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (visibleData.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    let min = Infinity;
    let max = -Infinity;
    let volMax = 0;

    for (const d of visibleData) {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
      if (d.sma7 && d.sma7 < min) min = d.sma7;
      if (d.sma30 && d.sma30 < min) min = d.sma30;
      if (d.sma7 && d.sma7 > max) max = d.sma7;
      if (d.sma30 && d.sma30 > max) max = d.sma30;
      if (d.volume > volMax) volMax = d.volume;
    }

    const priceRange = max - min || 1;
    return {
      minPrice: min - priceRange * 0.05,
      maxPrice: max + priceRange * 0.05,
      maxVolume: volMax || 1
    };
  }, [visibleData]);

  const priceRange = maxPrice - minPrice || 1;

  const getYPrice = (price: number) => {
    return priceChartHeight - ((price - minPrice) / priceRange) * (priceChartHeight - padding.top);
  };

  const getYVolume = (vol: number) => {
    return volumeChartHeight - (vol / maxVolume) * (volumeChartHeight - 10);
  };

  const getX = (index: number) => {
    const usableWidth = width - padding.left - padding.right;
    const step = usableWidth / Math.max(1, visibleData.length - 1);
    return padding.left + index * step;
  };

  // Generate SVG paths
  const linePath = useMemo(() => {
    if (visibleData.length === 0) return '';
    return visibleData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYPrice(d.close).toFixed(1)}`)
      .join(' ');
  }, [visibleData, minPrice, maxPrice]);

  const sma7Path = useMemo(() => {
    if (visibleData.length === 0) return '';
    return visibleData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYPrice(d.sma7).toFixed(1)}`)
      .join(' ');
  }, [visibleData, minPrice, maxPrice]);

  const sma30Path = useMemo(() => {
    if (visibleData.length === 0) return '';
    return visibleData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYPrice(d.sma30).toFixed(1)}`)
      .join(' ');
  }, [visibleData, minPrice, maxPrice]);

  // Price grid ticks
  const priceTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const val = minPrice + ratio * priceRange;
    return {
      val: Number(val.toFixed(2)),
      y: getYPrice(val)
    };
  });

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1EFEA]">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            Historical Price Action & Technical Overlays
          </h2>
          <div className="text-xs text-[#64748B] mt-0.5">
            OHLCV analysis with 7-day and 30-day Moving Averages and volume distribution
          </div>
        </div>

        {/* Chart Options */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-0.5">
            <button
              onClick={() => setChartType('line')}
              title="Line Chart"
              className={`p-1 text-xs rounded transition-colors ${
                chartType === 'line' ? 'bg-white text-[#0F172A] shadow-2xs font-medium' : 'text-[#64748B]'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              title="Candlestick Chart"
              className={`p-1 text-xs rounded transition-colors ${
                chartType === 'candlestick' ? 'bg-white text-[#0F172A] shadow-2xs font-medium' : 'text-[#64748B]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-0.5">
            {(['1M', '3M', '6M', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                  timeRange === range ? 'bg-white text-[#0F172A] font-semibold shadow-2xs' : 'text-[#64748B]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Overlays Toggles */}
          <button
            onClick={() => setShowSMA7(!showSMA7)}
            className={`px-2 py-1 text-[11px] font-mono rounded-md border transition-colors flex items-center gap-1 ${
              showSMA7
                ? 'bg-[#FAF9F5] border-[#C5A059] text-[#9A7B38] font-medium'
                : 'bg-white border-[#EAE6DF] text-[#94A3B8] opacity-60'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#C5A059] rounded-full inline-block"></span>
            SMA 7
          </button>
          <button
            onClick={() => setShowSMA30(!showSMA30)}
            className={`px-2 py-1 text-[11px] font-mono rounded-md border transition-colors flex items-center gap-1 ${
              showSMA30
                ? 'bg-[#FAF9F5] border-[#334155] text-[#334155] font-medium'
                : 'bg-white border-[#EAE6DF] text-[#94A3B8] opacity-60'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#334155] rounded-full inline-block"></span>
            SMA 30
          </button>
        </div>
      </div>

      {/* Active Bar Inspector Strip */}
      {activeBar && (
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono py-2 text-[#475569] border-b border-[#F1EFEA] bg-[#FAF9F5]/50 px-2 rounded-md my-2">
          <span className="text-[#0F172A] font-semibold">{activeBar.date}</span>
          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
          <span>O: <strong className="text-[#0F172A]">${activeBar.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-[#0F172A]">${activeBar.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-[#0F172A]">${activeBar.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-[#0F172A]">${activeBar.close.toFixed(2)}</strong></span>
          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
          <span>Vol: <strong className="text-[#0F172A]">{activeBar.volume.toLocaleString()}</strong></span>
          {showSMA7 && <span>SMA7: <strong className="text-[#C5A059]">${activeBar.sma7.toFixed(2)}</strong></span>}
          {showSMA30 && <span>SMA30: <strong className="text-[#334155]">${activeBar.sma30.toFixed(2)}</strong></span>}
          <span>RSI: <strong className={activeBar.rsi14 < 30 ? 'text-[#16A34A]' : activeBar.rsi14 > 70 ? 'text-[#DC2626]' : 'text-[#0F172A]'}>{activeBar.rsi14}</strong></span>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${priceChartHeight + volumeChartHeight}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const svgX = (clientX / rect.width) * width;
            const usableWidth = width - padding.left - padding.right;
            const ratio = (svgX - padding.left) / usableWidth;
            const index = Math.round(ratio * (visibleData.length - 1));
            if (index >= 0 && index < visibleData.length) {
              setHoverIndex(index);
            }
          }}
        >
          {/* Background horizontal grid lines */}
          {priceTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#F1EFEA"
                strokeDasharray="3 3"
              />
              <text
                x={width - padding.right + 8}
                y={tick.y + 4}
                className="text-[10px] font-mono fill-[#94A3B8]"
              >
                ${tick.val.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Price Chart Rendering */}
          {chartType === 'line' ? (
            <>
              {/* Subtle gradient area beneath close price */}
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`${linePath} L ${getX(visibleData.length - 1)} ${priceChartHeight} L ${getX(0)} ${priceChartHeight} Z`}
                fill="url(#priceGradient)"
              />
              <path
                d={linePath}
                fill="none"
                stroke="#1E293B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            /* Candlestick bars */
            visibleData.map((d, i) => {
              const x = getX(i);
              const isUp = d.close >= d.open;
              const yHigh = getYPrice(d.high);
              const yLow = getYPrice(d.low);
              const yOpen = getYPrice(d.open);
              const yClose = getYPrice(d.close);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));
              const candleWidth = Math.max(2, Math.min(8, (width / visibleData.length) * 0.65));

              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={isUp ? '#16A34A' : '#DC2626'}
                    strokeWidth="1.2"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={isUp ? '#16A34A' : '#DC2626'}
                    rx="0.5"
                  />
                </g>
              );
            })
          )}

          {/* SMA 7 Overlay */}
          {showSMA7 && (
            <path
              d={sma7Path}
              fill="none"
              stroke="#C5A059"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* SMA 30 Overlay */}
          {showSMA30 && (
            <path
              d={sma30Path}
              fill="none"
              stroke="#334155"
              strokeWidth="1.6"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Volume Section Divider */}
          <line
            x1={padding.left}
            y1={priceChartHeight + 5}
            x2={width - padding.right}
            y2={priceChartHeight + 5}
            stroke="#EAE6DF"
          />
          <text
            x={padding.left}
            y={priceChartHeight + 18}
            className="text-[10px] font-mono fill-[#94A3B8] font-medium"
          >
            Volume (Shares)
          </text>

          {/* Volume Bars */}
          {visibleData.map((d, i) => {
            const x = getX(i);
            const isUp = d.close >= d.open;
            const barHeight = Math.max(2, (d.volume / maxVolume) * (volumeChartHeight - 25));
            const y = priceChartHeight + volumeChartHeight - barHeight;
            const barWidth = Math.max(1.5, Math.min(7, (width / visibleData.length) * 0.6));

            return (
              <rect
                key={i}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={isUp ? 'rgba(22, 163, 74, 0.45)' : 'rgba(220, 38, 38, 0.45)'}
                rx="0.5"
              />
            );
          })}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={priceChartHeight + volumeChartHeight}
                stroke="#64748B"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getYPrice(visibleData[hoverIndex].close)}
                r="4"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Dates (Sample 5-6 points) */}
          {visibleData.map((d, i) => {
            const step = Math.floor(visibleData.length / 5);
            if (i % step === 0 || i === visibleData.length - 1) {
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={priceChartHeight + volumeChartHeight - 4}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-[#94A3B8]"
                >
                  {d.date.slice(5)}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-3 mt-1 border-t border-[#F1EFEA]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1E293B]"></span>
            <span>Close Price</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#C5A059]"></span>
            <span>7-Day SMA</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#334155] border-dashed border-b"></span>
            <span>30-Day SMA</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#16A34A]/40 rounded-xs"></span>
            <span className="w-2.5 h-2.5 bg-[#DC2626]/40 rounded-xs -ml-1"></span>
            <span>Volume</span>
          </span>
        </div>
        <span className="font-mono text-[#94A3B8]">Hover over chart to inspect daily technical values</span>
      </div>
    </div>
  );
};
