export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockMetadata {
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number;
  high52: number;
  low52: number;
  dataPoints: number;
}

export interface StockApiResponse {
  ticker: string;
  companyName: string;
  sector: string;
  currency: string;
  dataSource: string;
  apiNotice: string | null;
  lastRefreshed: string;
  meta: StockMetadata;
  history: OHLCVBar[];
}

export interface PreprocessedBar extends OHLCVBar {
  isImputed?: boolean;
}

export interface EngineeredFeatureRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Core Indicators required by prompt
  sma7: number;
  sma30: number;
  dailyReturn: number; // percentage
  volatility20: number; // 20-day annualized std dev
  rsi14: number; // 14-day RSI (0-100)
  // Additional high-accuracy indicators
  macd: number;
  macdSignal: number;
  atr14: number;
  volumeRatio: number;
  // Targets for supervised learning
  targetNextDayReturn?: number; // % change on next day
  targetNextDayClose?: number; // close price on next day
}

export interface ScaledFeatureStats {
  feature: string;
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface CorrelationItem {
  featureA: string;
  featureB: string;
  correlation: number;
}

export interface FeatureImportanceItem {
  feature: string;
  displayName: string;
  score: number; // 0 to 1
  percentage: number; // 0 to 100%
  category: 'Trend' | 'Momentum' | 'Volatility' | 'Volume';
  currentContribution: number; // SHAP-style % impact on next forecast
  direction: 'bullish' | 'bearish' | 'neutral';
  explanation: string;
}

export type ModelType = 'linear_regression' | 'random_forest' | 'xgboost';

export interface ModelEvaluation {
  modelType: ModelType;
  displayName: string;
  rmse: number;
  mae: number;
  r2: number;
  directionalAccuracy: number; // %
  testSampleSize: number;
  testPredictions: { date: string; actual: number; predicted: number }[];
}

export interface SingleModelPrediction {
  modelType: ModelType;
  displayName: string;
  predictedReturnPercent: number;
  targetPrice: number;
  stance: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number; // 0 - 100%
  rmse: number;
  r2: number;
}

export interface MultiModelConsensus {
  predictions: SingleModelPrediction[];
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  bullishPercentage: number;
  bearishPercentage: number;
  consensusStance: 'Bullish' | 'Bearish' | 'Neutral';
  weightedTargetPrice: number;
  weightedReturnPercent: number;
  agreementRate: number; // 0 - 100%
  summaryText: string;
}

export type RecommendationAction = 'Strong Buy' | 'Moderate Buy' | 'Hold' | 'Moderate Sell' | 'Strong Sell';

export interface InvestmentRecommendation {
  action: RecommendationAction;
  convictionScore: number; // 0 - 100%
  targetPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: number;
  volatilityRegime: 'Low' | 'Moderate' | 'High' | 'Extreme';
  rationale: string;
  guidelines: string[];
}

export interface WhatIfParams {
  sentimentLevel: number; // -100 (Extreme Fear) to +100 (Extreme Greed)
  riskMultiplier: number; // 0.5x to 2.5x
  macroBetaShock: number; // -5.0% to +5.0%
}

export interface WhatIfResult {
  baselineReturn: number;
  adjustedReturn: number;
  baselineTargetPrice: number;
  adjustedTargetPrice: number;
  baselineAction: RecommendationAction;
  adjustedAction: RecommendationAction;
  sentimentShiftContribution: number;
  volatilityAdjustment: number;
  macroShockContribution: number;
  simulatedUpperBand: number;
  simulatedLowerBand: number;
}

export interface ExplainableForecast {
  baselineExpectedReturn: number;
  forecastReturn: number;
  primaryDriver: string;
  featureContributions: FeatureImportanceItem[];
  positiveDrivers: FeatureImportanceItem[];
  negativeDrags: FeatureImportanceItem[];
  executiveSummary: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  timePublished: string;
  source: string;
  summary: string;
  sentimentScore: number; // -1.0 (Extreme Bearish) to +1.0 (Extreme Bullish)
  sentimentLabel: 'Bullish' | 'Somewhat-Bullish' | 'Neutral' | 'Somewhat-Bearish' | 'Bearish';
  relevanceScore: number; // 0 to 1
  correlationWithModel: 'Supports Forecast' | 'Contradicts Forecast' | 'Neutral';
  correlationReason: string;
}

export interface NewsSentimentFeed {
  ticker: string;
  dataSource: string;
  lastUpdated: string;
  articles: NewsArticle[];
  averageSentimentScore: number; // -1.0 to 1.0
  sentimentLabel: 'Bullish' | 'Somewhat-Bullish' | 'Neutral' | 'Somewhat-Bearish' | 'Bearish';
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  sentimentDispersion: number;
}

export interface SentimentCorrelationAnalysis {
  correlationScore: number; // -1.0 to 1.0 concordance
  alignmentStatus: 'Strong Convergence' | 'Moderate Agreement' | 'Divergence Alert' | 'Inverse Contradiction' | 'Neutral Market';
  headlineAgreementPct: number; // % of headlines pointing in same direction as forecast
  synthesisNarrative: string;
  recommendedActionAdjustment: string;
}

export interface CompletePipelineResult {
  rawCount: number;
  cleanedCount: number;
  missingValuesFixed: number;
  features: EngineeredFeatureRow[];
  scaledStats: ScaledFeatureStats[];
  correlationMatrix: { features: string[]; matrix: number[][] };
  topTargetCorrelations: CorrelationItem[];
  featureImportance: FeatureImportanceItem[];
  evaluations: Record<ModelType, ModelEvaluation>;
  consensus: MultiModelConsensus;
  recommendation: InvestmentRecommendation;
  explainability: ExplainableForecast;
  latestBar: EngineeredFeatureRow;
}
