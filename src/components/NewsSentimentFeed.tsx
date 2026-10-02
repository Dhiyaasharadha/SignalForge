import React, { useState, useMemo } from 'react';
import {
  NewsSentimentFeed as NewsSentimentFeedType,
  MultiModelConsensus
} from '../ml/types';
import { analyzeNewsModelCorrelation } from '../ml/newsCorrelation';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Sparkles,
  Sliders,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface NewsSentimentFeedProps {
  newsFeed: NewsSentimentFeedType | null;
  consensus: MultiModelConsensus;
  ticker: string;
  onApplyToWhatIf?: (sentimentPercent: number) => void;
  isLoading?: boolean;
}

export const NewsSentimentFeed: React.FC<NewsSentimentFeedProps> = ({
  newsFeed,
  consensus,
  ticker,
  onApplyToWhatIf,
  isLoading
}) => {
  const [filter, setFilter] = useState<'all' | 'supports' | 'contradicts' | 'bullish' | 'bearish'>('all');

  const { analyzedArticles, correlation } = useMemo(() => {
    if (!newsFeed) {
      return {
        analyzedArticles: [],
        correlation: {
          correlationScore: 0,
          alignmentStatus: 'Neutral Market' as const,
          headlineAgreementPct: 50,
          synthesisNarrative: 'Awaiting market headlines data.',
          recommendedActionAdjustment: 'Maintain baseline model positioning.'
        }
      };
    }
    return analyzeNewsModelCorrelation(newsFeed, consensus);
  }, [newsFeed, consensus]);

  const filteredArticles = useMemo(() => {
    if (filter === 'supports') return analyzedArticles.filter(a => a.correlationWithModel === 'Supports Forecast');
    if (filter === 'contradicts') return analyzedArticles.filter(a => a.correlationWithModel === 'Contradicts Forecast');
    if (filter === 'bullish') return analyzedArticles.filter(a => a.sentimentScore > 0.1);
    if (filter === 'bearish') return analyzedArticles.filter(a => a.sentimentScore < -0.1);
    return analyzedArticles;
  }, [analyzedArticles, filter]);

  if (isLoading || !newsFeed) {
    return (
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-6 shadow-xs mb-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0F172A]">
          <Newspaper className="w-4 h-4 text-[#C5A059] animate-pulse" />
          Ingesting Latest Financial News & Computing Sentiment Vectors for {ticker}...
        </div>
        <p className="text-xs text-[#64748B] mt-1 font-mono">
          Correlating headline tone against multi-model algorithmic projections
        </p>
      </div>
    );
  }

  const isModelBullish = consensus.consensusStance === 'Bullish';
  const isNewsBullish = newsFeed.averageSentimentScore >= 0.15;
  const isNewsBearish = newsFeed.averageSentimentScore <= -0.15;

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-xl p-5 shadow-xs mb-6">
      {/* Header & Source Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
            <h2 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              News Sentiment & Model Forecast Correlation
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time headline sentiment analysis correlated with multi-model quantitative forecast
          </p>
        </div>

        {/* Source metadata unboxed text with · */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] bg-[#FAF9F5] border border-[#EAE6DF] px-3 py-1.5 rounded-md">
          <Newspaper className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>{newsFeed.dataSource}</span>
          <span aria-hidden="true">·</span>
          <span>{newsFeed.articles.length} Headlines</span>
        </div>
      </div>

      {/* Top Correlation Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        
        {/* Metric 1: Average News Sentiment Score */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">News Sentiment Score</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                isNewsBullish ? 'text-[#16A34A]' : isNewsBearish ? 'text-[#DC2626]' : 'text-[#0F172A]'
              }`}
            >
              {newsFeed.averageSentimentScore >= 0 ? '+' : ''}{newsFeed.averageSentimentScore.toFixed(2)}
            </span>
            <span className="text-xs font-mono font-semibold text-[#475569]">
              ({newsFeed.sentimentLabel})
            </span>
          </div>

          {/* Visual gradient bar (-1 to +1) */}
          <div className="w-full h-1.5 bg-[#EAE6DF] rounded-full mt-2 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                newsFeed.averageSentimentScore >= 0.15 ? 'bg-[#16A34A]' : newsFeed.averageSentimentScore <= -0.15 ? 'bg-[#DC2626]' : 'bg-[#C5A059]'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, ((newsFeed.averageSentimentScore + 1) / 2) * 100))}%`
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] mt-1">
            <span>-1.0 Bearish</span>
            <span>0 Neutral</span>
            <span>+1.0 Bullish</span>
          </div>
        </div>

        {/* Metric 2: Model Quantitative Stance */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Algorithmic Forecast</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                isModelBullish ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {consensus.weightedReturnPercent >= 0 ? '+' : ''}{consensus.weightedReturnPercent}%
            </span>
            <span className="text-xs font-mono font-semibold text-[#475569]">
              ({consensus.consensusStance})
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#64748B] mt-2">
            Target Price: <strong className="text-[#0F172A]">${consensus.weightedTargetPrice.toFixed(2)}</strong>
          </div>
        </div>

        {/* Metric 3: Sentiment-Model Correlation Index */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Concordance Correlation</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                correlation.correlationScore > 0 ? 'text-[#16A34A]' : correlation.correlationScore < 0 ? 'text-[#DC2626]' : 'text-[#0F172A]'
              }`}
            >
              r = {correlation.correlationScore >= 0 ? '+' : ''}{correlation.correlationScore.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#64748B]">Concordance</span>
          </div>
          <div className="text-[11px] font-mono text-[#64748B] mt-2">
            Headline Agreement: <strong className="text-[#0F172A]">{correlation.headlineAgreementPct}%</strong>
          </div>
        </div>

        {/* Metric 4: Alignment Regime & Action */}
        <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Alignment Status</div>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-xs text-[#0F172A]">
              {correlation.alignmentStatus.includes('Convergence') ? (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              ) : correlation.alignmentStatus.includes('Divergence') ? (
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
              ) : (
                <Minus className="w-4 h-4 text-[#64748B] shrink-0" />
              )}
              <span>{correlation.alignmentStatus}</span>
            </div>
          </div>

          {/* Quick Action: Apply News to What-If Simulator */}
          {onApplyToWhatIf && (
            <button
              onClick={() => onApplyToWhatIf(Math.round(newsFeed.averageSentimentScore * 100))}
              className="mt-2 w-full px-2.5 py-1.5 text-[11px] font-mono font-medium text-[#0F172A] bg-white hover:bg-[#FAF9F5] border border-[#C5A059]/40 hover:border-[#C5A059] rounded-md transition-all shadow-2xs flex items-center justify-center gap-1.5"
              title="Inject measured news sentiment into What-If Simulator"
            >
              <Sliders className="w-3 h-3 text-[#C5A059]" />
              <span>Sync to What-If Simulator</span>
            </button>
          )}
        </div>
      </div>

      {/* Synthesis Narrative Box */}
      <div className="mt-4 p-4 bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Synthesis & Market Commentary</span>
        </div>
        <p className="text-xs text-[#334155] leading-relaxed">
          {correlation.synthesisNarrative}
        </p>
        <div className="mt-2.5 pt-2 border-t border-[#EAE6DF] text-xs font-mono text-[#64748B] flex items-center gap-1.5">
          <span className="font-semibold text-[#0F172A]">Tactical Takeaway:</span>
          <span>{correlation.recommendedActionAdjustment}</span>
        </div>
      </div>

      {/* Headlines Filter Tabs (Clean segmented control buttons) */}
      <div className="flex items-center justify-between mt-5 pb-3 border-b border-[#F1EFEA] flex-wrap gap-2">
        <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
          <span>Recent Market Headlines</span>
          <span className="text-[#94A3B8] font-mono font-normal">({filteredArticles.length} of {analyzedArticles.length})</span>
        </h3>

        <div className="flex items-center gap-1 p-0.5 bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-[#0F172A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Headlines
          </button>
          <button
            onClick={() => setFilter('supports')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              filter === 'supports' ? 'bg-white text-[#16A34A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#16A34A]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
            Supports Model
          </button>
          <button
            onClick={() => setFilter('contradicts')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              filter === 'contradicts' ? 'bg-white text-[#D97706] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#D97706]'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-[#D97706]" />
            Divergent
          </button>
          <button
            onClick={() => setFilter('bullish')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'bullish' ? 'bg-white text-[#0F172A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Bullish ({newsFeed.bullishCount})
          </button>
          <button
            onClick={() => setFilter('bearish')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'bearish' ? 'bg-white text-[#0F172A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Bearish ({newsFeed.bearishCount})
          </button>
        </div>
      </div>

      {/* Headlines List */}
      <div className="divide-y divide-[#F1EFEA] mt-2">
        {filteredArticles.map(article => {
          const isSupports = article.correlationWithModel === 'Supports Forecast';
          const isContradicts = article.correlationWithModel === 'Contradicts Forecast';
          const isArticleBullish = article.sentimentScore > 0.1;
          const isArticleBearish = article.sentimentScore < -0.1;

          return (
            <div key={article.id} className="py-3.5 hover:bg-[#FAF9F5]/60 transition-colors rounded-lg px-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1">
                  {/* Article Title */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#0F172A] hover:text-[#C5A059] transition-colors leading-snug inline-flex items-center gap-1 group"
                  >
                    <span>{article.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8]" />
                  </a>

                  {/* Clean unboxed metadata with · */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] mt-1 font-mono">
                    <span className="font-medium text-[#475569]">{article.source}</span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span>{article.timePublished}</span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span>Relevance: {(article.relevanceScore * 100).toFixed(0)}%</span>
                  </div>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-xs text-[#475569] mt-1.5 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>

                {/* Sentiment & Correlation Badges */}
                <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 mt-2 sm:mt-0">
                  {/* Sentiment Score */}
                  <div
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 ${
                      isArticleBullish
                        ? 'bg-[#16A34A]/10 text-[#16A34A]'
                        : isArticleBearish
                        ? 'bg-[#DC2626]/10 text-[#DC2626]'
                        : 'bg-[#64748B]/10 text-[#64748B]'
                    }`}
                  >
                    {isArticleBullish ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : isArticleBearish ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    <span>{article.sentimentScore >= 0 ? '+' : ''}{article.sentimentScore.toFixed(2)}</span>
                    <span className="text-[10px] font-normal hidden sm:inline">({article.sentimentLabel})</span>
                  </div>

                  {/* Model Correlation Tag */}
                  <div
                    className={`text-[10px] font-mono font-medium flex items-center gap-1 ${
                      isSupports
                        ? 'text-[#16A34A]'
                        : isContradicts
                        ? 'text-[#D97706]'
                        : 'text-[#64748B]'
                    }`}
                    title={article.correlationReason}
                  >
                    {isSupports && <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />}
                    {isContradicts && <AlertTriangle className="w-3 h-3 text-[#D97706]" />}
                    {!isSupports && !isContradicts && <Minus className="w-3 h-3 text-[#64748B]" />}
                    <span>{article.correlationWithModel}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Correlation Note */}
              <div className="mt-2 text-[11px] font-mono text-[#64748B] bg-[#FAF9F5] border border-[#EAE6DF] px-2.5 py-1 rounded-sm">
                <span className="font-semibold text-[#0F172A]">Correlation Analysis:</span> {article.correlationReason}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
