import React, { useState, useMemo } from 'react';
import { MultiModelConsensus, WhatIfParams } from '../ml/types';
import { simulateWhatIfScenario } from '../ml/consensusAndRecommendation';
import { Sliders, RotateCcw, Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface WhatIfSimulatorProps {
  consensus: MultiModelConsensus;
  currentPrice: number;
  volatility20: number;
  atr14: number;
  externalSentiment?: number | null;
  onClearExternalSentiment?: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  consensus,
  currentPrice,
  volatility20,
  atr14,
  externalSentiment,
  onClearExternalSentiment
}) => {
  const [params, setParams] = useState<WhatIfParams>({
    sentimentLevel: 0, // -100 to 100
    riskMultiplier: 1.0, // 0.5 to 2.5
    macroBetaShock: 0.0 // -5.0 to 5.0
  });

  // Synchronize if externalSentiment changes
  React.useEffect(() => {
    if (externalSentiment !== undefined && externalSentiment !== null) {
      setParams(prev => ({
        ...prev,
        sentimentLevel: Math.max(-100, Math.min(100, externalSentiment))
      }));
    }
  }, [externalSentiment]);

  const result = useMemo(() => {
    return simulateWhatIfScenario(consensus, currentPrice, volatility20, atr14, params);
  }, [consensus, currentPrice, volatility20, atr14, params]);

  const handleReset = () => {
    setParams({
      sentimentLevel: 0,
      riskMultiplier: 1.0,
      macroBetaShock: 0.0
    });
    if (onClearExternalSentiment) {
      onClearExternalSentiment();
    }
  };

  const getSentimentLabel = (val: number) => {
    if (val <= -60) return 'Extreme Fear / Panic Liquidation';
    if (val <= -20) return 'Bearish / Risk-Off Sentiment';
    if (val <= 20) return 'Neutral Market Equilibrium';
    if (val <= 60) return 'Greed / Risk-On Momentum';
    return 'Extreme Euphoria / FOMO Buying';
  };

  const getRiskLabel = (val: number) => {
    if (val <= 0.75) return 'Low Volatility / Complacent Regime';
    if (val <= 1.25) return 'Normal Historical Volatility';
    if (val <= 1.75) return 'Elevated Volatility / Wide Swings';
    return 'Extreme Turbulence / Flash Shock';
  };

  const isReturnDiffPositive = result.adjustedReturn >= result.baselineReturn;

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
            <h2 className="text-base font-semibold text-[#0F172A]">What-If Market Simulator</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time sensitivity analysis testing macro shocks, volatility regimes, and market sentiment without model retraining
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-mono font-medium text-[#475569] bg-[#FAF9F5] hover:bg-[#F1EFEA] border border-[#EAE6DF] rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
          Reset Baseline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Controls Column (Sliders) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Slider 1: Sentiment Level */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                1. Market Sentiment Level
              </label>
              <span className="text-xs font-mono font-bold text-[#0F172A] tabular-nums">
                {params.sentimentLevel > 0 ? '+' : ''}{params.sentimentLevel}%
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              {getSentimentLabel(params.sentimentLevel)}
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={params.sentimentLevel}
                onChange={e => setParams(prev => ({ ...prev, sentimentLevel: Number(e.target.value) }))}
                className="w-full h-2 bg-[#EAE6DF] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] mt-1">
                <span>-100% (Extreme Fear)</span>
                <span>0 (Neutral)</span>
                <span>+100% (Extreme Greed)</span>
              </div>
            </div>
          </div>

          {/* Slider 2: Risk / Volatility Multiplier */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                2. Volatility & Risk Multiplier
              </label>
              <span className="text-xs font-mono font-bold text-[#0F172A] tabular-nums">
                {params.riskMultiplier.toFixed(2)}x
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              {getRiskLabel(params.riskMultiplier)}
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={params.riskMultiplier}
                onChange={e => setParams(prev => ({ ...prev, riskMultiplier: Number(e.target.value) }))}
                className="w-full h-2 bg-[#EAE6DF] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] mt-1">
                <span>0.5x (Defensive)</span>
                <span>1.0x (Standard)</span>
                <span>2.5x (High Volatility)</span>
              </div>
            </div>
          </div>

          {/* Slider 3: Macro Beta Shock */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                3. Macro S&P 500 Index Shock
              </label>
              <span className="text-xs font-mono font-bold text-[#0F172A] tabular-nums">
                {params.macroBetaShock > 0 ? '+' : ''}{params.macroBetaShock.toFixed(1)}%
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              Simulates broad market systematic index movement with beta ~ 1.15
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="-5.0"
                max="5.0"
                step="0.5"
                value={params.macroBetaShock}
                onChange={e => setParams(prev => ({ ...prev, macroBetaShock: Number(e.target.value) }))}
                className="w-full h-2 bg-[#EAE6DF] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] mt-1">
                <span>-5.0% Market Selloff</span>
                <span>0.0% Unchanged</span>
                <span>+5.0% Macro Rally</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Output Comparison Column */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Main Comparison Card */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-5 flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
              <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Instant Simulation Result
              </span>
              <span className="text-[11px] font-mono text-[#C5A059] flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Zero Retraining Latency
              </span>
            </div>

            {/* Baseline vs Simulated Returns */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white border border-[#EAE6DF] rounded-md p-3">
                <div className="text-[11px] text-[#64748B]">Baseline Forecast</div>
                <div className="text-xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                  ${result.baselineTargetPrice.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-[#64748B] mt-0.5">
                  {result.baselineReturn >= 0 ? '+' : ''}{result.baselineReturn}% ({result.baselineAction})
                </div>
              </div>

              <div className="bg-white border border-[#C5A059]/40 rounded-md p-3 shadow-xs">
                <div className="text-[11px] text-[#C5A059] font-semibold">What-If Adjusted Forecast</div>
                <div className="text-xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                  ${result.adjustedTargetPrice.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-mono font-bold mt-0.5 tabular-nums ${
                    result.adjustedReturn >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                  }`}
                >
                  {result.adjustedReturn >= 0 ? '+' : ''}{result.adjustedReturn}% ({result.adjustedAction})
                </div>
              </div>
            </div>

            {/* Contribution Breakdown */}
            <div className="mt-4 pt-3 border-t border-[#EAE6DF] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Sentiment Shift Impact:</span>
                <span className={`font-semibold ${result.sentimentShiftContribution >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {result.sentimentShiftContribution >= 0 ? '+' : ''}{result.sentimentShiftContribution}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Macro Beta Shock Impact:</span>
                <span className={`font-semibold ${result.macroShockContribution >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {result.macroShockContribution >= 0 ? '+' : ''}{result.macroShockContribution}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Net Delta vs Baseline:</span>
                <span className={`font-bold ${isReturnDiffPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {isReturnDiffPositive ? '+' : ''}{(result.adjustedReturn - result.baselineReturn).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Simulated 90% Confidence Interval Band */}
            <div className="mt-4 pt-3 border-t border-[#EAE6DF]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                <span>Simulated Lower Band: <strong>${result.simulatedLowerBand.toFixed(2)}</strong></span>
                <span>Upper Band: <strong>${result.simulatedUpperBand.toFixed(2)}</strong></span>
              </div>
              <div className="w-full h-2 bg-[#EAE6DF] rounded-full mt-2 overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-[#C5A059] rounded-full"
                  style={{
                    left: '25%',
                    width: '50%'
                  }}
                />
              </div>
              <div className="text-[10px] text-center text-[#94A3B8] mt-1 font-mono">
                90% confidence distribution under {params.riskMultiplier}x volatility regime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
