import React from 'react';
import { MultiModelConsensus } from '../ml/types';
import { Award, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2 } from 'lucide-react';

interface ConsensusEngineCardProps {
  consensus: MultiModelConsensus;
  currentPrice: number;
}

export const ConsensusEngineCard: React.FC<ConsensusEngineCardProps> = ({
  consensus,
  currentPrice
}) => {
  const isBullish = consensus.consensusStance === 'Bullish';
  const isBearish = consensus.consensusStance === 'Bearish';

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Title & Agreement Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
            <h2 className="text-base font-semibold text-[#0F172A]">Multi-Model Consensus Engine</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cross-validation of statistical and tree-based machine learning architectures
          </p>
        </div>

        {/* Prominent Consensus Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Consensus Stance</div>
            <div
              className={`text-base font-bold font-mono ${
                isBullish ? 'text-[#16A34A]' : isBearish ? 'text-[#DC2626]' : 'text-[#64748B]'
              }`}
            >
              {consensus.agreementRate}% {consensus.consensusStance}
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
              isBullish
                ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                : isBearish
                ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20'
                : 'bg-[#64748B]/10 text-[#64748B] border border-[#64748B]/20'
            }`}
          >
            {isBullish ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : isBearish ? (
              <ArrowDownRight className="w-5 h-5" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Consensus Progress Bar */}
      <div className="mt-4 pt-1">
        <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5 font-mono">
          <span>{consensus.bullishCount} of 3 Bullish</span>
          <span>Weighted Target: <strong className="text-[#0F172A] font-bold">${consensus.weightedTargetPrice.toFixed(2)}</strong> ({consensus.weightedReturnPercent >= 0 ? '+' : ''}{consensus.weightedReturnPercent}%)</span>
          <span>{consensus.bearishCount} of 3 Bearish</span>
        </div>
        <div className="w-full h-2.5 bg-[#FAF9F5] border border-[#EAE6DF] rounded-full overflow-hidden flex">
          <div
            className="bg-[#16A34A] transition-all duration-500"
            style={{ width: `${consensus.bullishPercentage}%` }}
            title={`Bullish: ${consensus.bullishPercentage}%`}
          />
          <div
            className="bg-[#94A3B8] transition-all duration-500"
            style={{ width: `${100 - consensus.bullishPercentage - consensus.bearishPercentage}%` }}
            title="Neutral"
          />
          <div
            className="bg-[#DC2626] transition-all duration-500"
            style={{ width: `${consensus.bearishPercentage}%` }}
            title={`Bearish: ${consensus.bearishPercentage}%`}
          />
        </div>
      </div>

      {/* 3 Model Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {consensus.predictions.map((pred, i) => {
          const isPredBullish = pred.stance === 'Bullish';
          const isPredBearish = pred.stance === 'Bearish';

          return (
            <div
              key={pred.modelType}
              className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4 transition-all hover:border-[#C5A059]/50"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE6DF]">
                <div>
                  <span className="text-[11px] font-mono text-[#94A3B8]">Model 0{i + 1}</span>
                  <h3 className="text-xs font-semibold text-[#0F172A] tracking-tight">{pred.displayName}</h3>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                    isPredBullish
                      ? 'bg-[#16A34A]/10 text-[#16A34A]'
                      : isPredBearish
                      ? 'bg-[#DC2626]/10 text-[#DC2626]'
                      : 'bg-[#64748B]/10 text-[#64748B]'
                  }`}
                >
                  {pred.stance}
                </span>
              </div>

              {/* Price Target & Return */}
              <div className="mt-3">
                <div className="text-[11px] text-[#64748B] uppercase tracking-wider">Next-Day Target</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold font-mono text-[#0F172A] tabular-nums">
                    ${pred.targetPrice.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold tabular-nums ${
                      pred.predictedReturnPercent >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {pred.predictedReturnPercent >= 0 ? '+' : ''}
                    {pred.predictedReturnPercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Model Diagnostics */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#EAE6DF] text-[11px] font-mono text-[#64748B]">
                <div>
                  <span className="text-[#94A3B8]">RMSE:</span> <span className="text-[#0F172A] font-semibold">{pred.rmse}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8]">R² Score:</span> <span className="text-[#0F172A] font-semibold">{pred.r2}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Confidence:</span> <span className="text-[#0F172A] font-semibold">{pred.confidence}%</span>
                </div>
                <div className="flex items-center text-[#16A34A] gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Converged</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Rationale */}
      <div className="mt-4 pt-3 border-t border-[#F1EFEA] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#64748B] gap-2">
        <span>{consensus.summaryText}</span>
        <span className="font-mono text-[#94A3B8] text-[11px]">
          Confidence-weighted aggregation algorithm
        </span>
      </div>
    </div>
  );
};
