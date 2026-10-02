import React from 'react';
import { InvestmentRecommendation } from '../ml/types';
import { ShieldAlert, Target, ShieldCheck, ArrowRight, Activity, Percent } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: InvestmentRecommendation;
  currentPrice: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  currentPrice
}) => {
  const isBuy = recommendation.action.includes('Buy');
  const isSell = recommendation.action.includes('Sell');

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
            <h2 className="text-base font-semibold text-[#0F172A]">Smart Investment Recommendation</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Algorithmic action derived from consensus forecast, volatility regime, and confidence boundaries
          </p>
        </div>

        {/* Action Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-lg font-mono font-bold text-sm tracking-wide uppercase border ${
              isBuy
                ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30'
                : isSell
                ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
                : 'bg-[#64748B]/10 text-[#475569] border-[#64748B]/30'
            }`}
          >
            {recommendation.action}
          </div>
        </div>
      </div>

      {/* Conviction & Volatility Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {/* Metric 1: Conviction Score */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Conviction Score</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#0F172A] tabular-nums">
              {recommendation.convictionScore}%
            </span>
            <span className="text-xs text-[#64748B] font-mono">Statistical Certainty</span>
          </div>
          <div className="w-full h-1.5 bg-[#EAE6DF] rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                recommendation.convictionScore > 75
                  ? 'bg-[#16A34A]'
                  : recommendation.convictionScore > 55
                  ? 'bg-[#C5A059]'
                  : 'bg-[#94A3B8]'
              }`}
              style={{ width: `${recommendation.convictionScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Stop-Loss Target */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>Stop-Loss Level</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#DC2626] mt-1 tabular-nums">
            ${recommendation.stopLossPrice.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-[#64748B] mt-1">
            {((Math.abs(recommendation.stopLossPrice - currentPrice) / currentPrice) * 100).toFixed(1)}% risk buffer (1.8x ATR)
          </div>
        </div>

        {/* Metric 3: Take-Profit Target */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
            <span>Take-Profit Target</span>
            <Target className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#16A34A] mt-1 tabular-nums">
            ${recommendation.takeProfitPrice.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-[#64748B] mt-1">
            {((Math.abs(recommendation.takeProfitPrice - currentPrice) / currentPrice) * 100).toFixed(1)}% expected upside
          </div>
        </div>

        {/* Metric 4: Risk / Reward Ratio */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Risk / Reward Ratio</div>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
            {recommendation.riskRewardRatio} : 1.0
          </div>
          <div className="text-[11px] font-mono text-[#64748B] mt-1">
            Volatility: <strong className="text-[#0F172A]">{recommendation.volatilityRegime}</strong>
          </div>
        </div>
      </div>

      {/* Rationale & Tactical Directives */}
      <div className="mt-4 p-4 bg-[#FAF9F5]/70 border border-[#EAE6DF] rounded-lg">
        <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
          Quantitative Execution Rationale
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed">
          {recommendation.rationale}
        </p>

        <div className="mt-3 pt-3 border-t border-[#EAE6DF] flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-[#64748B]">
          {recommendation.guidelines.map((guide, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
              <span>{guide}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
