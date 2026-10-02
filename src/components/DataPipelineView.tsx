import React, { useState } from 'react';
import { CompletePipelineResult } from '../ml/types';
import { Database, Filter, Sliders, Table, Cpu, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface DataPipelineViewProps {
  pipeline: CompletePipelineResult;
  ticker: string;
}

export const DataPipelineView: React.FC<DataPipelineViewProps> = ({ pipeline, ticker }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    { num: 1, title: 'Data Collection', desc: 'Raw historical OHLCV data ingestion' },
    { num: 2, title: 'Data Preprocessing', desc: 'Imputation, date normalization, scaling' },
    { num: 3, title: 'Feature Engineering', desc: 'SMA7, SMA30, Volatility, RSI, ATR' },
    { num: 4, title: 'Feature Selection', desc: 'Pearson correlation & importance ranking' },
    { num: 5, title: 'Model Training', desc: 'Linear Regression, Random Forest, XGBoost' },
    { num: 6, title: 'Model Evaluation', desc: 'RMSE, MAE, R², Directional Accuracy' },
    { num: 7, title: 'Forecast Generation', desc: 'Next-day movement prediction & consensus' }
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Navigation Stepper */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA] mb-3">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">End-to-End Data Science Lifecycle</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Transparent 7-stage machine learning workflow powering SignalForge intelligence
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-[#C5A059] bg-[#FAF9F5] border border-[#EAE6DF] px-2.5 py-1 rounded-md">
            Pipeline Status: Verified & Calibrated
          </span>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {steps.map(step => (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`p-2.5 rounded-lg text-left transition-all border ${
                activeStep === step.num
                  ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-xs'
                  : 'bg-[#FAF9F5] hover:bg-[#F1EFEA] text-[#475569] border-[#EAE6DF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${activeStep === step.num ? 'text-[#D4AF37]' : 'text-[#94A3B8]'}`}>
                  Stage 0{step.num}
                </span>
                <CheckCircle2 className={`w-3 h-3 ${activeStep === step.num ? 'text-[#D4AF37]' : 'text-[#16A34A]'}`} />
              </div>
              <div className="text-xs font-semibold mt-1 truncate">{step.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stage Details Content */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-6 shadow-xs">
        {/* Stage 1: Data Collection */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
                  Stage 1: Historical Market Data Collection
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Direct ingestion of daily Open, High, Low, Close, and Volume (OHLCV) observations for {ticker}.
                </p>
              </div>
              <div className="text-xs font-mono text-[#0F172A] bg-[#FAF9F5] border border-[#EAE6DF] px-3 py-1.5 rounded-md">
                Total Samples: <strong>{pipeline.rawCount} sessions</strong>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="overflow-x-auto border border-[#EAE6DF] rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF9F5] border-b border-[#EAE6DF] text-[#64748B]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Open ($)</th>
                    <th className="py-2.5 px-3 text-right">High ($)</th>
                    <th className="py-2.5 px-3 text-right">Low ($)</th>
                    <th className="py-2.5 px-3 text-right">Close ($)</th>
                    <th className="py-2.5 px-3 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {pipeline.features.slice(-8).map(row => (
                    <tr key={row.date} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-2 px-3 text-[#0F172A] font-semibold">{row.date}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.open.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.high.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.low.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold text-[#0F172A]">${row.close.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-[#64748B]">{row.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] font-mono text-[#94A3B8]">
              Displaying latest 8 chronological sessions from historical dataset.
            </p>
          </div>
        )}

        {/* Stage 2: Data Preprocessing */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
                  Stage 2: Data Cleaning & Feature Scaling
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Chronological alignment, anomalous spike filtering, missing value imputation, and Z-score standardization parameters.
                </p>
              </div>
              <span className="text-xs font-mono text-[#16A34A] bg-[#16A34A]/10 border border-[#16A34A]/20 px-3 py-1.5 rounded-md">
                Imputed Gaps: {pipeline.missingValuesFixed} (0 missing values remaining)
              </span>
            </div>

            {/* Scaling Statistics Table */}
            <div className="overflow-x-auto border border-[#EAE6DF] rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF9F5] border-b border-[#EAE6DF] text-[#64748B]">
                  <tr>
                    <th className="py-2.5 px-3">Feature Name</th>
                    <th className="py-2.5 px-3 text-right">Sample Mean (μ)</th>
                    <th className="py-2.5 px-3 text-right">Std Dev (σ)</th>
                    <th className="py-2.5 px-3 text-right">Min</th>
                    <th className="py-2.5 px-3 text-right">Max</th>
                    <th className="py-2.5 px-3">Standardization Formula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {pipeline.scaledStats.map(stat => (
                    <tr key={stat.feature} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-2 px-3 font-semibold text-[#0F172A]">{stat.feature}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stat.mean.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stat.std.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stat.min.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stat.max.toLocaleString()}</td>
                      <td className="py-2 px-3 text-[#64748B]">z = (x - {stat.mean}) / {stat.std}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stage 3: Feature Engineering */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
                  Stage 3: Feature Engineering & Indicator Transformation
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Calculation of 7-Day SMA, 30-Day SMA, Daily Returns, 20-Day Annualized Volatility, 14-Day RSI, and ATR.
                </p>
              </div>
            </div>

            {/* Feature preview table */}
            <div className="overflow-x-auto border border-[#EAE6DF] rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF9F5] border-b border-[#EAE6DF] text-[#64748B]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">SMA 7</th>
                    <th className="py-2.5 px-3 text-right">SMA 30</th>
                    <th className="py-2.5 px-3 text-right">Daily Return</th>
                    <th className="py-2.5 px-3 text-right">Volatility (20D)</th>
                    <th className="py-2.5 px-3 text-right">RSI (14D)</th>
                    <th className="py-2.5 px-3 text-right">ATR (14D)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {pipeline.features.slice(-8).map(row => (
                    <tr key={row.date} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-2 px-3 text-[#0F172A] font-semibold">{row.date}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-[#C5A059] font-medium">${row.sma7.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-[#334155] font-medium">${row.sma30.toFixed(2)}</td>
                      <td className={`py-2 px-3 text-right tabular-nums ${row.dailyReturn >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                        {row.dailyReturn >= 0 ? '+' : ''}{row.dailyReturn.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">{row.volatility20.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right tabular-nums">{row.rsi14.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.atr14.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stage 4: Feature Selection */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
                  Stage 4: Feature Selection & Pearson Correlation Matrix
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Pairwise correlation analysis measuring collinearity and signal strength against next-day return.
                </p>
              </div>
            </div>

            {/* Correlation Heatmap Table */}
            <div className="overflow-x-auto border border-[#EAE6DF] rounded-lg">
              <table className="w-full text-center text-xs font-mono">
                <thead className="bg-[#FAF9F5] border-b border-[#EAE6DF] text-[#64748B]">
                  <tr>
                    <th className="py-2 px-3 text-left">Indicator</th>
                    {pipeline.correlationMatrix.features.map(f => (
                      <th key={f} className="py-2 px-2 text-[10px] whitespace-nowrap">{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {pipeline.correlationMatrix.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 text-left font-semibold text-[#0F172A] whitespace-nowrap">
                        {pipeline.correlationMatrix.features[i]}
                      </td>
                      {row.map((val, j) => {
                        const isSelf = i === j;
                        const isHigh = Math.abs(val) > 0.4 && !isSelf;
                        return (
                          <td
                            key={j}
                            className={`py-2 px-2 tabular-nums text-[11px] ${
                              isSelf
                                ? 'bg-[#FAF9F5] text-[#94A3B8]'
                                : val > 0.3
                                ? 'bg-[#16A34A]/10 text-[#16A34A] font-semibold'
                                : val < -0.3
                                ? 'bg-[#DC2626]/10 text-[#DC2626] font-semibold'
                                : 'text-[#475569]'
                            }`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Target Correlation Ranking */}
            <div className="mt-4 pt-3 border-t border-[#F1EFEA]">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2">
                Correlation Ranking vs. Next-Day Target Return
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pipeline.topTargetCorrelations.slice(0, 4).map(item => (
                  <div key={item.featureA} className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-md p-2.5 text-xs font-mono">
                    <div className="text-[#64748B] text-[11px]">{item.featureA}</div>
                    <div className={`text-sm font-bold mt-1 ${item.correlation >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      r = {item.correlation >= 0 ? '+' : ''}{item.correlation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stage 5 & 6: Model Training & Evaluation */}
        {(activeStep === 5 || activeStep === 6) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
                  Stage {activeStep}: Machine Learning Models & Holdout Evaluation
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Chronological 80/20 train/test evaluation across RMSE, MAE, R² Score, and Directional Accuracy.
                </p>
              </div>
            </div>

            {/* Model Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(pipeline.evaluations).map(evalData => (
                <div key={evalData.modelType} className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
                  <div className="text-xs font-semibold text-[#0F172A] pb-2 border-b border-[#EAE6DF]">
                    {evalData.displayName}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs font-mono">
                    <div>
                      <div className="text-[#64748B] text-[10px]">RMSE</div>
                      <div className="text-base font-bold text-[#0F172A] mt-0.5">{evalData.rmse}</div>
                    </div>
                    <div>
                      <div className="text-[#64748B] text-[10px]">MAE</div>
                      <div className="text-base font-bold text-[#0F172A] mt-0.5">{evalData.mae}</div>
                    </div>
                    <div>
                      <div className="text-[#64748B] text-[10px]">R² Score</div>
                      <div className="text-base font-bold text-[#0F172A] mt-0.5">{evalData.r2}</div>
                    </div>
                    <div>
                      <div className="text-[#64748B] text-[10px]">Directional Acc.</div>
                      <div className="text-base font-bold text-[#16A34A] mt-0.5">{evalData.directionalAccuracy}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 7: Forecast Generation */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
                  Stage 7: Production Forecast & Consensus Synthesis
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Weighted ensemble output synthesizing all model vectors into a single actionable forecast.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
                <div className="text-[11px] text-[#64748B]">Next-Day Price Target</div>
                <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
                  ${pipeline.consensus.weightedTargetPrice.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-[#16A34A] mt-0.5">
                  +{pipeline.consensus.weightedReturnPercent}% expected move
                </div>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
                <div className="text-[11px] text-[#64748B]">Consensus Agreement</div>
                <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
                  {pipeline.consensus.agreementRate}% {pipeline.consensus.consensusStance}
                </div>
                <div className="text-xs font-mono text-[#64748B] mt-0.5">
                  {pipeline.consensus.bullishCount} Bullish · {pipeline.consensus.bearishCount} Bearish
                </div>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-4">
                <div className="text-[11px] text-[#64748B]">Tactical Recommendation</div>
                <div className="text-2xl font-bold font-mono text-[#C5A059] mt-1">
                  {pipeline.recommendation.action}
                </div>
                <div className="text-xs font-mono text-[#64748B] mt-0.5">
                  {pipeline.recommendation.convictionScore}% statistical conviction
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
