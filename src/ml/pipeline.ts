import { OHLCVBar, CompletePipelineResult } from './types';
import { preprocessOHLCV } from './preprocessing';
import { engineerFeatures } from './featureEngineering';
import { analyzeFeatures } from './featureSelection';
import { trainAndEvaluateModels } from './models';
import {
  computeMultiModelConsensus,
  generateInvestmentRecommendation,
  buildExplainableForecast
} from './consensusAndRecommendation';

/**
 * Executes the complete 7-stage Data Science Lifecycle on stock market data.
 */
export function runDataSciencePipeline(rawBars: OHLCVBar[]): CompletePipelineResult {
  // 1. Data Collection count
  const rawCount = rawBars.length;

  // 2. Data Preprocessing
  const { cleaned, missingCount, stats } = preprocessOHLCV(rawBars);

  // 3. Feature Engineering
  const features = engineerFeatures(cleaned);

  if (features.length < 15) {
    throw new Error('Insufficient historical data to construct feature vectors (minimum 35 trading days required).');
  }

  // 4. Feature Selection & Correlation
  const { correlationMatrix, topTargetCorrelations, featureImportance } = analyzeFeatures(features);

  // 5. Model Training & 6. Model Evaluation
  const { evaluations, predictions } = trainAndEvaluateModels(features);

  const latestBar = features[features.length - 1];

  // 7. Forecast Generation & Novel Features
  // Multi-Model Consensus
  const consensus = computeMultiModelConsensus(predictions, latestBar.close);

  // Smart Investment Recommendation
  const recommendation = generateInvestmentRecommendation(
    consensus,
    latestBar.close,
    latestBar.volatility20,
    latestBar.atr14
  );

  // Explainability Panel (SHAP-style Feature Attribution)
  const explainability = buildExplainableForecast(featureImportance, consensus, latestBar);

  return {
    rawCount,
    cleanedCount: cleaned.length,
    missingValuesFixed: missingCount,
    features,
    scaledStats: stats,
    correlationMatrix,
    topTargetCorrelations,
    featureImportance,
    evaluations,
    consensus,
    recommendation,
    explainability,
    latestBar
  };
}
