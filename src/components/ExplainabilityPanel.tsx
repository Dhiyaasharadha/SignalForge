import React from 'react';
import { ExplainableForecast, FeatureImportanceItem } from '../ml/types';
import { HelpCircle, ArrowUpRight, ArrowDownRight, Layers, Info } from 'lucide-react';

interface ExplainabilityPanelProps {
  explainability: ExplainableForecast;
  currentTicker: string;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  explainability,
  currentTicker
}) => {
  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
            <h2 className="text-base font-semibold text-[#0F172A]">Explainable Forecast Panel (XAI)</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Transparent attribution revealing the technical indicators governing model decision weights
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] bg-[#FAF9F5] border border-[#EAE6DF] px-3 py-1.5 rounded-md">
          <Info className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Primary Driver: <strong className="text-[#0F172A]">{explainability.primaryDriver}</strong></span>
        </div>
      </div>

      {/* Plain-English Executive Summary */}
      <div className="mt-4 p-4 bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
          <span>Algorithmic Rationale & Market Attribution</span>
        </div>
        <p className="text-xs text-[#334155] leading-relaxed">
          {explainability.executiveSummary}
        </p>
      </div>

      {/* Two Column Layout: Feature Importance Ranking & Catalysts vs Drags */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Left Column: Feature Importance Ranking Bars */}
        <div className="lg:col-span-6 bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE6DF] mb-3">
            <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
              Feature Importance Ranking
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">Ensemble Weight</span>
          </div>

          <div className="space-y-3">
            {explainability.featureContributions.map((item, idx) => (
              <div key={item.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#0F172A] flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#94A3B8]">0{idx + 1}</span>
                    {item.displayName}
                    <span className="text-[10px] text-[#64748B] font-mono">({item.category})</span>
                  </span>
                  <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#EAE6DF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E293B] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Directional Attribution (Catalysts vs Headwinds) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Positive Catalysts */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] uppercase tracking-wider pb-2 border-b border-[#EAE6DF] mb-3">
              <ArrowUpRight className="w-4 h-4" />
              <span>Positive Bullish Catalysts ({explainability.positiveDrivers.length})</span>
            </div>

            {explainability.positiveDrivers.length > 0 ? (
              <div className="space-y-2.5">
                {explainability.positiveDrivers.map(item => (
                  <div key={item.feature} className="bg-white border border-[#EAE6DF] rounded-md p-2.5 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-[#0F172A] font-semibold">{item.displayName}</span>
                      <span className="font-mono text-[#16A34A] font-bold">+{item.currentContribution}%</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8] italic py-2">
                No active positive catalysts identified in current technical regime.
              </div>
            )}
          </div>

          {/* Negative Headwinds */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] uppercase tracking-wider pb-2 border-b border-[#EAE6DF] mb-3">
              <ArrowDownRight className="w-4 h-4" />
              <span>Downside Headwinds ({explainability.negativeDrags.length})</span>
            </div>

            {explainability.negativeDrags.length > 0 ? (
              <div className="space-y-2.5">
                {explainability.negativeDrags.map(item => (
                  <div key={item.feature} className="bg-white border border-[#EAE6DF] rounded-md p-2.5 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-[#0F172A] font-semibold">{item.displayName}</span>
                      <span className="font-mono text-[#DC2626] font-bold">{item.currentContribution}%</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8] italic py-2">
                No active negative headwinds identified in current technical regime.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
