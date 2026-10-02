import {
  NewsSentimentFeed,
  NewsArticle,
  MultiModelConsensus,
  SentimentCorrelationAnalysis
} from './types';

/**
 * Analyzes correlation and alignment between latest news headlines
 * and the quantitative model consensus forecast.
 */
export function analyzeNewsModelCorrelation(
  newsFeed: NewsSentimentFeed,
  consensus: MultiModelConsensus
): {
  analyzedArticles: NewsArticle[];
  correlation: SentimentCorrelationAnalysis;
} {
  const modelReturn = consensus.weightedReturnPercent; // e.g. +0.85% or -0.65%
  const isModelBullish = consensus.consensusStance === 'Bullish' || modelReturn > 0.2;
  const isModelBearish = consensus.consensusStance === 'Bearish' || modelReturn < -0.2;

  let supportingCount = 0;
  let contradictingCount = 0;

  // Process each article
  const analyzedArticles: NewsArticle[] = newsFeed.articles.map(article => {
    const score = article.sentimentScore;
    let correlationWithModel: 'Supports Forecast' | 'Contradicts Forecast' | 'Neutral' = 'Neutral';
    let correlationReason = '';

    if (isModelBullish) {
      if (score >= 0.15) {
        correlationWithModel = 'Supports Forecast';
        correlationReason = `Bullish news sentiment (+${score.toFixed(2)}) reinforces the model's +${modelReturn}% upward forecast.`;
        supportingCount++;
      } else if (score <= -0.15) {
        correlationWithModel = 'Contradicts Forecast';
        correlationReason = `Bearish headline tone (${score.toFixed(2)}) introduces headline friction against algorithmic bullish forecast.`;
        contradictingCount++;
      } else {
        correlationWithModel = 'Neutral';
        correlationReason = `Headline tone is balanced, reflecting neutral fundamental impact.`;
      }
    } else if (isModelBearish) {
      if (score <= -0.15) {
        correlationWithModel = 'Supports Forecast';
        correlationReason = `Negative news sentiment (${score.toFixed(2)}) validates the quantitative downside projection (${modelReturn}%).`;
        supportingCount++;
      } else if (score >= 0.15) {
        correlationWithModel = 'Contradicts Forecast';
        correlationReason = `Constructive headline sentiment (+${score.toFixed(2)}) counters the algorithmic bearish thesis.`;
        contradictingCount++;
      } else {
        correlationWithModel = 'Neutral';
        correlationReason = `Headline tone is balanced, reflecting neutral fundamental impact.`;
      }
    } else {
      // Model is neutral
      if (Math.abs(score) < 0.2) {
        correlationWithModel = 'Supports Forecast';
        correlationReason = `Balanced sentiment (${score.toFixed(2)}) aligns with range-bound consolidation forecast.`;
        supportingCount++;
      } else {
        correlationWithModel = 'Neutral';
        correlationReason = `Headline displays directional drift (${score.toFixed(2)}) while models project consolidation.`;
      }
    }

    return {
      ...article,
      correlationWithModel,
      correlationReason
    };
  });

  const totalArticles = analyzedArticles.length || 1;
  const headlineAgreementPct = Math.round((supportingCount / totalArticles) * 100);

  // Compute concordance score between news average score [-1, 1] and model return normalized [-1, 1]
  const normalizedModelScore = Math.max(-1, Math.min(1, modelReturn / 2.0));
  const avgNewsScore = newsFeed.averageSentimentScore;

  // Correlation score: measures how directional signs and magnitude agree
  const rawCorr = avgNewsScore * normalizedModelScore;
  const correlationScore = Number(
    (Math.sign(rawCorr) * Math.min(1.0, Math.sqrt(Math.abs(rawCorr)) * 1.2)).toFixed(2)
  );

  // Determine Alignment Status
  let alignmentStatus: 'Strong Convergence' | 'Moderate Agreement' | 'Divergence Alert' | 'Inverse Contradiction' | 'Neutral Market' = 'Neutral Market';
  let synthesisNarrative = '';
  let recommendedActionAdjustment = '';

  if (isModelBullish && avgNewsScore >= 0.3) {
    alignmentStatus = 'Strong Convergence';
    synthesisNarrative = `Both algorithmic consensus (+${modelReturn}%) and financial media sentiment (+${avgNewsScore}) display strong positive convergence. Institutional headline tone validates the quantitative momentum and technical trend.`;
    recommendedActionAdjustment = 'High alpha conviction. Technical breakout is supported by positive fundamental catalysts.';
  } else if (isModelBearish && avgNewsScore <= -0.3) {
    alignmentStatus = 'Strong Convergence';
    synthesisNarrative = `Downside algorithmic forecast (${modelReturn}%) is substantiated by negative news headlines (${avgNewsScore}). Fundamental commentary aligns with technical resistance.`;
    recommendedActionAdjustment = 'Heightened downside vulnerability. Tighten trailing stops or hedge delta exposure.';
  } else if (isModelBullish && avgNewsScore <= -0.2) {
    alignmentStatus = 'Divergence Alert';
    synthesisNarrative = `Noticeable divergence detected: Quantitative indicators project upside (+${modelReturn}%), yet headline sentiment is defensive (${avgNewsScore}). This suggests algorithmic dip-buying or transient headline noise.`;
    recommendedActionAdjustment = 'Monitor headline catalysts closely; technical support may be tested by negative media coverage.';
  } else if (isModelBearish && avgNewsScore >= 0.2) {
    alignmentStatus = 'Divergence Alert';
    synthesisNarrative = `Divergence identified: Algorithmic models forecast downside (${modelReturn}%), but headlines reflect optimistic sentiment (+${avgNewsScore}). Technical overextension or profit-taking may override headline optimism.`;
    recommendedActionAdjustment = 'Exercise caution with long positions; quantitative momentum indicators show vulnerability despite positive press.';
  } else if (headlineAgreementPct >= 60) {
    alignmentStatus = 'Moderate Agreement';
    synthesisNarrative = `Moderate concordance (${headlineAgreementPct}% headline agreement) between technical forecasts and news flow. Media narrative is broadly constructive alongside quantitative projections.`;
    recommendedActionAdjustment = 'Maintain standard position sizing aligned with ATR volatility bounds.';
  } else {
    alignmentStatus = 'Neutral Market';
    synthesisNarrative = `Headline sentiment is evenly balanced (${avgNewsScore}) relative to model projection (${modelReturn >= 0 ? '+' : ''}${modelReturn}%). No extreme narrative distortion present.`;
    recommendedActionAdjustment = 'Proceed with model baseline targets without sentiment penalty.';
  }

  return {
    analyzedArticles,
    correlation: {
      correlationScore,
      alignmentStatus,
      headlineAgreementPct,
      synthesisNarrative,
      recommendedActionAdjustment
    }
  };
}
