import React, { useState } from 'react';
import { ModelEvaluation, SingleModelPrediction, ModelType } from '../ml/types';
import { CheckCircle2, Trophy, BarChart2, ShieldCheck, Zap } from 'lucide-react';

interface ModelArenaViewProps {
  evaluations: Record<ModelType, ModelEvaluation>;
  predictions: SingleModelPrediction[];
  currentPrice: number;
}

export const ModelArenaView: React.FC<ModelArenaViewProps> = ({
  evaluations,
  predictions,
  currentPrice
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('xgboost');

  const modelsList: ModelType[] = ['linear_regression', 'random_forest', 'xgboost'];

  const modelDescriptions: Record<ModelType, { description: string; strengths: string; bestFor: string }> = {
    linear_regression: {
      description: 'Multivariate Ordinary Least Squares (OLS) with L2 Ridge regularizer. Solves closed-form normal equations on standardized feature vectors.',
      strengths: 'High interpretability, stable baseline, low sensitivity to sample noise.',
      bestFor: 'Identifying linear baseline drift and benchmark comparative analysis.'
    },
    random_forest: {
      description: 'Ensemble of 20+ bagged regression decision trees with recursive mean squared error reduction and random feature subspace subsampling.',
      strengths: 'Non-linear threshold capture, robust to outliers, reduces model variance via bootstrap bagging.',
      bestFor: 'Capturing non-linear indicator regimes (e.g. RSI extremes combined with moving average crosses).'
    },
    xgboost: {
      description: 'Sequential gradient boosting regressor. Sequentially fits weak decision tree learners to negative gradient pseudo-residuals with learning rate shrinkage.',
      strengths: 'Highest predictive capacity on complex financial interactions, minimizes residual error.',
      bestFor: 'Capturing multi-factor alpha signals and fine-grained market momentum shifts.'
    }
  };

  const currentEval = evaluations[selectedModel];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1EFEA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
              <h2 className="text-base font-semibold text-[#0F172A]">Model Arena: Algorithmic Benchmark</h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Rigorous out-of-sample backtest comparison across RMSE, MAE, R², and Directional Accuracy
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF9F5] border border-[#EAE6DF] p-1 rounded-lg">
            {modelsList.map(type => (
              <button
                key={type}
                onClick={() => setSelectedModel(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedModel === type
                    ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {evaluations[type].displayName}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Model Comparison Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE6DF] text-[#64748B]">
              <tr>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4 text-right">RMSE</th>
                <th className="py-3 px-4 text-right">MAE</th>
                <th className="py-3 px-4 text-right">R² Score</th>
                <th className="py-3 px-4 text-right">Directional Acc.</th>
                <th className="py-3 px-4 text-right">Next-Day Target</th>
                <th className="py-3 px-4 text-center">Stance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {modelsList.map(type => {
                const ev = evaluations[type];
                const pred = predictions.find(p => p.modelType === type);
                const isSelected = selectedModel === type;

                return (
                  <tr
                    key={type}
                    onClick={() => setSelectedModel(type)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#FAF9F5] font-semibold' : 'hover:bg-[#FAF9F5]/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-[#0F172A] flex items-center gap-2">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                      {ev.displayName}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">{ev.rmse}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{ev.mae}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{ev.r2}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-[#16A34A] font-bold">
                      {ev.directionalAccuracy}%
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-[#0F172A] font-bold">
                      ${pred ? pred.targetPrice.toFixed(2) : '-'} ({pred && pred.predictedReturnPercent >= 0 ? '+' : ''}{pred?.predictedReturnPercent}%)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-sm font-bold ${
                          pred?.stance === 'Bullish'
                            ? 'bg-[#16A34A]/10 text-[#16A34A]'
                            : pred?.stance === 'Bearish'
                            ? 'bg-[#DC2626]/10 text-[#DC2626]'
                            : 'bg-[#64748B]/10 text-[#64748B]'
                        }`}
                      >
                        {pred?.stance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Deep Dive */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA] mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">
              {currentEval.displayName} Out-of-Sample Backtest Curve
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Evaluating predicted return vs actual market realization on chronological test split ({currentEval.testSampleSize} sessions)
            </p>
          </div>
          <span className="text-xs font-mono text-[#0F172A] bg-[#FAF9F5] border border-[#EAE6DF] px-2.5 py-1 rounded-md">
            Accuracy: <strong>{currentEval.directionalAccuracy}%</strong>
          </span>
        </div>

        {/* Backtest Prediction vs Actual Table */}
        <div className="overflow-x-auto border border-[#EAE6DF] rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE6DF] text-[#64748B]">
              <tr>
                <th className="py-2.5 px-3">Session Date</th>
                <th className="py-2.5 px-3 text-right">Actual Return</th>
                <th className="py-2.5 px-3 text-right">Model Forecast</th>
                <th className="py-2.5 px-3 text-right">Residual Error</th>
                <th className="py-2.5 px-3 text-center">Direction Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {currentEval.testPredictions.slice(-10).map((pt, i) => {
                const diff = (pt.predicted - pt.actual).toFixed(2);
                const matched =
                  (pt.actual >= 0 && pt.predicted >= 0) || (pt.actual < 0 && pt.predicted < 0);

                return (
                  <tr key={i} className="hover:bg-[#FAF9F5]/60 transition-colors">
                    <td className="py-2 px-3 text-[#0F172A] font-semibold">{pt.date}</td>
                    <td className={`py-2 px-3 text-right tabular-nums ${pt.actual >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {pt.actual >= 0 ? '+' : ''}{pt.actual.toFixed(2)}%
                    </td>
                    <td className={`py-2 px-3 text-right tabular-nums font-semibold ${pt.predicted >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {pt.predicted >= 0 ? '+' : ''}{pt.predicted.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-[#64748B]">
                      {diff}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        matched ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'
                      }`}>
                        {matched ? 'HIT' : 'MISS'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Algorithmic Details Card */}
        <div className="mt-4 p-4 bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg">
          <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
            Algorithmic Profile: {currentEval.displayName}
          </h4>
          <p className="text-xs text-[#475569] leading-relaxed">
            {modelDescriptions[selectedModel].description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#EAE6DF] text-xs">
            <div>
              <span className="font-semibold text-[#0F172A]">Core Strengths:</span>{' '}
              <span className="text-[#64748B]">{modelDescriptions[selectedModel].strengths}</span>
            </div>
            <div>
              <span className="font-semibold text-[#0F172A]">Optimal Application:</span>{' '}
              <span className="text-[#64748B]">{modelDescriptions[selectedModel].bestFor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
