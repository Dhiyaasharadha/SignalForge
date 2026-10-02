/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StockHeader } from './components/StockHeader';
import { PriceChart } from './components/PriceChart';
import { TechnicalIndicatorsCard } from './components/TechnicalIndicatorsCard';
import { ConsensusEngineCard } from './components/ConsensusEngineCard';
import { RecommendationCard } from './components/RecommendationCard';
import { NewsSentimentFeed } from './components/NewsSentimentFeed';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { DataPipelineView } from './components/DataPipelineView';
import { ModelArenaView } from './components/ModelArenaView';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { fetchStockData, fetchTickerNews } from './services/stockApi';
import { runDataSciencePipeline } from './ml/pipeline';
import { StockApiResponse, CompletePipelineResult, NewsSentimentFeed as NewsSentimentFeedType } from './ml/types';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTicker, setCurrentTicker] = useState<string>('AAPL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'models' | 'explainability' | 'news' | 'whatif'>('dashboard');
  const [stockData, setStockData] = useState<StockApiResponse | null>(null);
  const [pipelineResult, setPipelineResult] = useState<CompletePipelineResult | null>(null);
  const [newsFeed, setNewsFeed] = useState<NewsSentimentFeedType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [syncedSentiment, setSyncedSentiment] = useState<number | null>(null);

  // Load stock data and run complete Data Science lifecycle
  const loadStock = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setIsNewsLoading(true);
    setError(null);

    // Fetch stock historical data and news sentiment concurrently
    try {
      const [data, news] = await Promise.allSettled([
        fetchStockData(symbol),
        fetchTickerNews(symbol)
      ]);

      if (data.status === 'rejected') {
        throw new Error(data.reason?.message || `Failed to ingest stock market data for ${symbol}.`);
      }

      const stockPayload = data.value;
      setStockData(stockPayload);

      if (!stockPayload.history || stockPayload.history.length < 35) {
        throw new Error(`Insufficient historical market sessions received for ${symbol}. Minimum 35 trading days required.`);
      }

      // Execute 7-stage ML pipeline
      const result = runDataSciencePipeline(stockPayload.history);
      setPipelineResult(result);

      if (news.status === 'fulfilled') {
        setNewsFeed(news.value);
      } else {
        console.warn('News fetch failed:', news.reason);
      }
    } catch (err: any) {
      console.error('Data Pipeline Error:', err);
      setError(err?.message || 'Failed to ingest stock market data.');
    } finally {
      setIsLoading(false);
      setIsNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStock(currentTicker);
  }, [currentTicker, loadStock]);

  const handleSelectTicker = (newTicker: string) => {
    if (newTicker !== currentTicker) {
      setCurrentTicker(newTicker);
      setSyncedSentiment(null);
    }
  };

  const handleRefresh = () => {
    loadStock(currentTicker);
  };

  const handleApplySentimentToWhatIf = (sentimentPercent: number) => {
    setSyncedSentiment(sentimentPercent);
    setActiveTab('whatif');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E293B] flex flex-col font-sans selection:bg-[#E9DFCF]">
      {/* 3-Zone Navigation Header */}
      <Navbar
        currentTicker={currentTicker}
        onSelectTicker={handleSelectTicker}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        dataSource={stockData?.dataSource || 'Real Stock Feed'}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Loading State */}
        {isLoading && !stockData && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-3" />
            <div className="text-sm font-semibold text-[#0F172A]">
              Ingesting Market Data & Executing Data Science Pipeline...
            </div>
            <div className="text-xs text-[#64748B] mt-1 font-mono">
              Running preprocessing, feature scaling, and training 3 predictive architectures for {currentTicker}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white border border-[#DC2626]/30 rounded-xl p-6 text-center my-8 shadow-xs max-w-xl mx-auto">
            <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#0F172A]">Market Feed Ingestion Failure</h3>
            <p className="text-xs text-[#64748B] mt-1 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E293B] hover:bg-[#0F172A] rounded-md transition-colors"
            >
              Retry Ingestion
            </button>
          </div>
        )}

        {/* Loaded Dashboard View */}
        {stockData && pipelineResult && (
          <>
            {/* Stock Metadata & Quick Selector */}
            <StockHeader
              ticker={stockData.ticker}
              companyName={stockData.companyName}
              sector={stockData.sector}
              meta={stockData.meta}
              dataSource={stockData.dataSource}
              apiNotice={stockData.apiNotice}
              lastRefreshed={stockData.lastRefreshed}
              onSelectTicker={handleSelectTicker}
            />

            {/* TAB: DASHBOARD (Comprehensive SaaS Layout) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 1. Historical Price Chart */}
                <PriceChart features={pipelineResult.features} currentTicker={currentTicker} />

                {/* 2. Core Technical Indicators Strip */}
                <TechnicalIndicatorsCard latestBar={pipelineResult.latestBar} />

                {/* 3. Novel Feature 1: Multi-Model Consensus Engine */}
                <ConsensusEngineCard
                  consensus={pipelineResult.consensus}
                  currentPrice={stockData.meta.currentPrice}
                />

                {/* 4. Novel Feature 2: Smart Investment Recommendation */}
                <RecommendationCard
                  recommendation={pipelineResult.recommendation}
                  currentPrice={stockData.meta.currentPrice}
                />

                {/* 5. News Sentiment Feed Component (Correlated with Model Forecast) */}
                <NewsSentimentFeed
                  newsFeed={newsFeed}
                  consensus={pipelineResult.consensus}
                  ticker={currentTicker}
                  onApplyToWhatIf={handleApplySentimentToWhatIf}
                  isLoading={isNewsLoading}
                />

                {/* 6. Novel Feature 4: Explainable Forecast Panel */}
                <ExplainabilityPanel
                  explainability={pipelineResult.explainability}
                  currentTicker={currentTicker}
                />

                {/* 7. Novel Feature 3: What-If Market Simulator */}
                <WhatIfSimulator
                  consensus={pipelineResult.consensus}
                  currentPrice={stockData.meta.currentPrice}
                  volatility20={pipelineResult.latestBar.volatility20}
                  atr14={pipelineResult.latestBar.atr14}
                  externalSentiment={syncedSentiment}
                  onClearExternalSentiment={() => setSyncedSentiment(null)}
                />
              </div>
            )}

            {/* TAB: DATA PIPELINE (7-Stage Data Science Explorer) */}
            {activeTab === 'pipeline' && (
              <DataPipelineView pipeline={pipelineResult} ticker={currentTicker} />
            )}

            {/* TAB: MODEL ARENA (Model Evaluation Comparison) */}
            {activeTab === 'models' && (
              <ModelArenaView
                evaluations={pipelineResult.evaluations}
                predictions={pipelineResult.consensus.predictions}
                currentPrice={stockData.meta.currentPrice}
              />
            )}

            {/* TAB: EXPLAINABILITY (Detailed Feature Attribution Focus) */}
            {activeTab === 'explainability' && (
              <ExplainabilityPanel
                explainability={pipelineResult.explainability}
                currentTicker={currentTicker}
              />
            )}

            {/* TAB: NEWS SENTIMENT (Dedicated Full Feed View) */}
            {activeTab === 'news' && (
              <NewsSentimentFeed
                newsFeed={newsFeed}
                consensus={pipelineResult.consensus}
                ticker={currentTicker}
                onApplyToWhatIf={handleApplySentimentToWhatIf}
                isLoading={isNewsLoading}
              />
            )}

            {/* TAB: WHAT-IF SIMULATOR (Interactive Scenario Focus) */}
            {activeTab === 'whatif' && (
              <WhatIfSimulator
                consensus={pipelineResult.consensus}
                currentPrice={stockData.meta.currentPrice}
                volatility20={pipelineResult.latestBar.volatility20}
                atr14={pipelineResult.latestBar.atr14}
                externalSentiment={syncedSentiment}
                onClearExternalSentiment={() => setSyncedSentiment(null)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE6DF] bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F172A]">SignalForge</span>
            <span aria-hidden="true">·</span>
            <span>Explainable Market Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-[#94A3B8]">
            <span>Alpha Vantage Compliant</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Machine Learning Models</span>
          </div>
        </div>
      </footer>

      {/* API Configuration Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={() => loadStock(currentTicker)}
        currentSource={stockData?.dataSource || 'Real Stock Feed'}
      />
    </div>
  );
}
