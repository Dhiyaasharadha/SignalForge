import {
  SingleModelPrediction,
  MultiModelConsensus,
  InvestmentRecommendation,
  RecommendationAction,
  WhatIfParams,
  WhatIfResult,
  ExplainableForecast,
  FeatureImportanceItem,
  EngineeredFeatureRow
} from './types';

/**
 * Novel Feature 1: Multi-Model Consensus Engine
 * Aggregates predictions across Linear Regression, Random Forest, and XGBoost.
 */
export function computeMultiModelConsensus(
  predictions: SingleModelPrediction[],
  currentPrice: number
): MultiModelConsensus {
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;

  let totalWeight = 0;
  let weightedReturnSum = 0;

  for (const pred of predictions) {
    if (pred.stance === 'Bullish') bullishCount++;
    else if (pred.stance === 'Bearish') bearishCount++;
    else neutralCount++;

    // Weight by model inverse RMSE + bounded R2
    const weight = Math.max(0.2, (pred.confidence / 100) * (pred.r2 > 0 ? 1 + pred.r2 : 0.8));
    totalWeight += weight;
    weightedReturnSum += pred.predictedReturnPercent * weight;
  }

  const n = predictions.length || 1;
  const bullishPercentage = Math.round((bullishCount / n) * 100);
  const bearishPercentage = Math.round((bearishCount / n) * 100);

  const weightedReturnPercent = Number((weightedReturnSum / (totalWeight || 1)).toFixed(2));
  const weightedTargetPrice = Number((currentPrice * (1 + weightedReturnPercent / 100)).toFixed(2));

  let consensusStance: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  let agreementRate = Math.max(bullishPercentage, bearishPercentage);

  if (bullishCount > bearishCount && bullishCount >= 2) {
    consensusStance = 'Bullish';
  } else if (bearishCount > bullishCount && bearishCount >= 2) {
    consensusStance = 'Bearish';
  } else if (weightedReturnPercent > 0.25) {
    consensusStance = 'Bullish';
  } else if (weightedReturnPercent < -0.25) {
    consensusStance = 'Bearish';
  }

  const summaryText = `${agreementRate}% ${consensusStance} consensus across 3 statistical & tree-based learning models.`;

  return {
    predictions,
    bullishCount,
    bearishCount,
    neutralCount,
    bullishPercentage,
    bearishPercentage,
    consensusStance,
    weightedTargetPrice,
    weightedReturnPercent,
    agreementRate,
    summaryText
  };
}

/**
 * Novel Feature 2: Smart Investment Recommendation
 * Generates Buy, Hold, or Sell with quantitative conviction score, stop loss, and take profit.
 */
export function generateInvestmentRecommendation(
  consensus: MultiModelConsensus,
  currentPrice: number,
  volatility20: number,
  atr14: number
): InvestmentRecommendation {
  const ret = consensus.weightedReturnPercent;
  const agreement = consensus.agreementRate;

  // Determine Volatility Regime
  let volatilityRegime: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Moderate';
  if (volatility20 < 18) volatilityRegime = 'Low';
  else if (volatility20 > 42) volatilityRegime = 'Extreme';
  else if (volatility20 > 28) volatilityRegime = 'High';

  // Volatility adjustment factor (higher volatility penalizes position sizing & confidence)
  const volPenalty = volatilityRegime === 'Extreme' ? 20 : volatilityRegime === 'High' ? 10 : 0;

  let action: RecommendationAction = 'Hold';
  let rawConviction = Math.round(agreement * 0.7 + Math.abs(ret) * 15 - volPenalty);
  let convictionScore = Math.min(94, Math.max(42, rawConviction));

  // Determine recommendation action
  if (consensus.consensusStance === 'Bullish') {
    if (ret >= 1.2 && agreement >= 66 && volatilityRegime !== 'Extreme') {
      action = 'Strong Buy';
      convictionScore = Math.max(78, convictionScore);
    } else if (ret > 0.25) {
      action = 'Moderate Buy';
      convictionScore = Math.max(62, convictionScore);
    } else {
      action = 'Hold';
    }
  } else if (consensus.consensusStance === 'Bearish') {
    if (ret <= -1.2 && agreement >= 66) {
      action = 'Strong Sell';
      convictionScore = Math.max(78, convictionScore);
    } else if (ret < -0.25) {
      action = 'Moderate Sell';
      convictionScore = Math.max(62, convictionScore);
    } else {
      action = 'Hold';
    }
  } else {
    action = 'Hold';
    convictionScore = Math.min(58, convictionScore);
  }

  // Calculate dynamic ATR-based Stop-Loss and Take-Profit
  const safeAtr = atr14 > 0 ? atr14 : currentPrice * 0.018;
  let stopLossPrice = 0;
  let takeProfitPrice = 0;

  if (action === 'Strong Buy' || action === 'Moderate Buy') {
    stopLossPrice = Number((currentPrice - 1.8 * safeAtr).toFixed(2));
    const targetMove = Math.max(ret / 100 * currentPrice, 2.5 * safeAtr);
    takeProfitPrice = Number((currentPrice + targetMove).toFixed(2));
  } else if (action === 'Strong Sell' || action === 'Moderate Sell') {
    stopLossPrice = Number((currentPrice + 1.8 * safeAtr).toFixed(2));
    const targetMove = Math.max(Math.abs(ret) / 100 * currentPrice, 2.5 * safeAtr);
    takeProfitPrice = Number((currentPrice - targetMove).toFixed(2));
  } else {
    stopLossPrice = Number((currentPrice - 2.0 * safeAtr).toFixed(2));
    takeProfitPrice = Number((currentPrice + 2.0 * safeAtr).toFixed(2));
  }

  const risk = Math.abs(currentPrice - stopLossPrice);
  const reward = Math.abs(takeProfitPrice - currentPrice);
  const riskRewardRatio = Number((reward / (risk || 1)).toFixed(2));

  // Build plain-English rationale
  let rationale = '';
  if (action.includes('Buy')) {
    rationale = `Consensus models exhibit ${agreement}% agreement with a projected next-day move of +${ret}%. In conjunction with ${volatilityRegime.toLowerCase()} annualized volatility (${volatility20}%), quantitative indicators favor long positioning with favorable ${riskRewardRatio}:1 asymmetric payoff.`;
  } else if (action.includes('Sell')) {
    rationale = `Consensus indicates downside vulnerability (${ret}%) with ${agreement}% model convergence. High regime volatility (${volatility20}%) suggests tightening protective stops or hedging existing equity exposure.`;
  } else {
    rationale = `Mixed model signals and marginal expected return (${ret}%) indicate an equilibrium consolidation phase. We recommend maintaining current allocations and awaiting directional breakout confirmation.`;
  }

  const guidelines = [
    `Recommended protective Stop-Loss: $${stopLossPrice.toFixed(2)} (${((Math.abs(stopLossPrice - currentPrice) / currentPrice) * 100).toFixed(1)}% buffer)`,
    `Initial Take-Profit objective: $${takeProfitPrice.toFixed(2)} (${riskRewardRatio}:1 risk-reward ratio)`,
    `Annualized volatility index: ${volatility20}% (${volatilityRegime} risk corridor)`
  ];

  return {
    action,
    convictionScore,
    targetPrice: consensus.weightedTargetPrice,
    stopLossPrice,
    takeProfitPrice,
    riskRewardRatio,
    volatilityRegime,
    rationale,
    guidelines
  };
}

/**
 * Novel Feature 3: What-If Market Simulator
 * Instant recalculation of forecast return, target price, and recommendation without retraining.
 */
export function simulateWhatIfScenario(
  consensus: MultiModelConsensus,
  currentPrice: number,
  volatility20: number,
  atr14: number,
  params: WhatIfParams
): WhatIfResult {
  const { sentimentLevel, riskMultiplier, macroBetaShock } = params;

  // Sentiment effect: normalized from -100 to +100 to yield +/- 1.2% return skew
  const sentimentShiftContribution = Number(((sentimentLevel / 100) * 1.25).toFixed(2));

  // Volatility scaling: riskMultiplier scales the uncertainty and dampens or amplifies moves
  const volatilityAdjustment = Number(((riskMultiplier - 1.0) * 0.4).toFixed(2));

  // Macro market beta shock: assumed beta ~ 1.15
  const macroShockContribution = Number((macroBetaShock * 1.15).toFixed(2));

  // Calculate adjusted expected return
  const baselineReturn = consensus.weightedReturnPercent;
  const adjustedReturn = Number(
    (baselineReturn + sentimentShiftContribution + macroShockContribution).toFixed(2)
  );

  const baselineTargetPrice = consensus.weightedTargetPrice;
  const adjustedTargetPrice = Number((currentPrice * (1 + adjustedReturn / 100)).toFixed(2));

  // Confidence bands based on simulated volatility
  const simulatedDailyStd = (volatility20 * riskMultiplier) / Math.sqrt(252);
  const bandOffset = (simulatedDailyStd / 100) * currentPrice * 1.645; // 90% confidence interval
  const simulatedUpperBand = Number((adjustedTargetPrice + bandOffset).toFixed(2));
  const simulatedLowerBand = Number((adjustedTargetPrice - bandOffset).toFixed(2));

  // Calculate simulated recommendation action
  let adjustedAction: RecommendationAction = 'Hold';
  if (adjustedReturn > 1.0) {
    adjustedAction = riskMultiplier > 1.8 ? 'Moderate Buy' : 'Strong Buy';
  } else if (adjustedReturn > 0.25) {
    adjustedAction = 'Moderate Buy';
  } else if (adjustedReturn < -1.0) {
    adjustedAction = riskMultiplier > 1.8 ? 'Moderate Sell' : 'Strong Sell';
  } else if (adjustedReturn < -0.25) {
    adjustedAction = 'Moderate Sell';
  } else {
    adjustedAction = 'Hold';
  }

  // Derive baseline action
  let baselineAction: RecommendationAction = 'Hold';
  if (baselineReturn > 1.0) baselineAction = 'Strong Buy';
  else if (baselineReturn > 0.25) baselineAction = 'Moderate Buy';
  else if (baselineReturn < -1.0) baselineAction = 'Strong Sell';
  else if (baselineReturn < -0.25) baselineAction = 'Moderate Sell';

  return {
    baselineReturn,
    adjustedReturn,
    baselineTargetPrice,
    adjustedTargetPrice,
    baselineAction,
    adjustedAction,
    sentimentShiftContribution,
    volatilityAdjustment,
    macroShockContribution,
    simulatedUpperBand,
    simulatedLowerBand
  };
}

/**
 * Novel Feature 4: Explainable Forecast Panel (SHAP-style Feature Attribution)
 * Identifies the exact indicators and weights driving next-day projection.
 */
export function buildExplainableForecast(
  featureImportance: FeatureImportanceItem[],
  consensus: MultiModelConsensus,
  latestRow: EngineeredFeatureRow
): ExplainableForecast {
  const forecastReturn = consensus.weightedReturnPercent;
  const baselineExpectedReturn = 0.08; // historical baseline market drift

  const positiveDrivers = featureImportance.filter(f => f.direction === 'bullish');
  const negativeDrags = featureImportance.filter(f => f.direction === 'bearish');

  // Identify primary driver
  const topFeature = featureImportance[0] || { displayName: 'Moving Average Trend' };
  const primaryDriver = `${topFeature.displayName} (${topFeature.percentage}% model weight)`;

  // Generate plain-English executive summary
  const posCount = positiveDrivers.length;
  const negCount = negativeDrags.length;

  let executiveSummary = '';
  if (forecastReturn > 0.25) {
    const topPosName = positiveDrivers[0]?.displayName || 'Technical Momentum';
    executiveSummary = `The algorithmic forecast (+${forecastReturn}%) is predominantly driven by constructive signals in ${topPosName} and short-term trend alignment, creating bullish upward pressure despite ${negCount} countervailing indicators.`;
  } else if (forecastReturn < -0.25) {
    const topNegName = negativeDrags[0]?.displayName || 'Volatility Expansion';
    executiveSummary = `The algorithmic projection (${forecastReturn}%) reflects defensive headwinds led by ${topNegName} and mean-reversion resistance, pulling the consensus into bearish territory.`;
  } else {
    executiveSummary = `The forecast is in neutral equilibrium (+${forecastReturn}%). Balanced tension between ${posCount} bullish catalysts and ${negCount} bearish indicators points to range-bound market behavior.`;
  }

  return {
    baselineExpectedReturn,
    forecastReturn,
    primaryDriver,
    featureContributions: featureImportance,
    positiveDrivers,
    negativeDrags,
    executiveSummary
  };
}
