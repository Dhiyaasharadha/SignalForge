import React, { useState } from 'react';
import { Search, Sliders, Database, Cpu, HelpCircle, Key, RefreshCw, ChevronDown, Newspaper } from 'lucide-react';
import { POPULAR_TICKERS } from '../services/stockApi';

interface NavbarProps {
  currentTicker: string;
  onSelectTicker: (ticker: string) => void;
  activeTab: 'dashboard' | 'pipeline' | 'models' | 'explainability' | 'news' | 'whatif';
  onChangeTab: (tab: 'dashboard' | 'pipeline' | 'models' | 'explainability' | 'news' | 'whatif') => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  dataSource: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTicker,
  onSelectTicker,
  activeTab,
  onChangeTab,
  onOpenSettings,
  onRefresh,
  isLoading,
  dataSource
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
      setIsDropdownOpen(false);
    }
  };

  const filteredTickers = POPULAR_TICKERS.filter(
    t =>
      t.symbol.includes(searchInput.toUpperCase()) ||
      t.name.toUpperCase().includes(searchInput.toUpperCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#EAE6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onChangeTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1E293B] text-[#FAF9F5] flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-[#0F172A] transition-colors">
                <span className="text-[#D4AF37]">S</span>F
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight text-[#0F172A]">SignalForge</span>
                <span className="text-[11px] text-[#64748B] -mt-1 hidden sm:inline">Explainable Market Intelligence</span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text with active indicator, single line) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#EAE6DF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onChangeTab('pipeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#EAE6DF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#C5A059]" />
              Data Pipeline
            </button>
            <button
              onClick={() => onChangeTab('models')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'models'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#EAE6DF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#C5A059]" />
              Model Arena
            </button>
            <button
              onClick={() => onChangeTab('explainability')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'explainability'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#EAE6DF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              Explainability
            </button>
            <button
              onClick={() => onChangeTab('news')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'news'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#EAE6DF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-[#C5A059]" />
              News Sentiment
            </button>
            <button
              onClick={() => onChangeTab('whatif')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'whatif'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#EAE6DF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
              What-If Simulator
            </button>
          </nav>

          {/* Zone 3: Search & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <form onSubmit={handleSubmit} className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter ticker (e.g. AAPL)..."
                  value={searchInput}
                  onChange={e => {
                    setSearchInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-36 sm:w-52 pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EAE6DF] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] transition-all font-mono uppercase"
                />
              </form>

              {/* Suggestions Dropdown */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-[#EAE6DF] rounded-md shadow-lg z-20 max-h-72 overflow-y-auto py-1">
                    <div className="px-3 py-1.5 text-[11px] font-medium text-[#64748B] border-b border-[#F1EFEA]">
                      Select Stock Symbol
                    </div>
                    {filteredTickers.map(item => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          onSelectTicker(item.symbol);
                          setSearchInput('');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF9F5] flex items-center justify-between transition-colors"
                      >
                        <span className="font-mono font-semibold text-[#0F172A]">{item.symbol}</span>
                        <span className="text-[#64748B] text-[11px] truncate max-w-[140px]">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh stock data"
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-white border border-transparent hover:border-[#EAE6DF] rounded-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C5A059]' : ''}`} />
            </button>

            {/* API Settings */}
            <button
              onClick={onOpenSettings}
              className="px-2.5 py-1.5 text-xs font-medium text-[#0F172A] bg-white hover:bg-[#FAF9F5] border border-[#EAE6DF] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Key className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">API Config</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Bar (if small screen) */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-[#EAE6DF] overflow-x-auto bg-[#FAF9F5]">
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-white text-[#0F172A] border border-[#EAE6DF]' : 'text-[#64748B]'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onChangeTab('pipeline')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'pipeline' ? 'bg-white text-[#0F172A] border border-[#EAE6DF]' : 'text-[#64748B]'
          }`}
        >
          Data Pipeline
        </button>
        <button
          onClick={() => onChangeTab('models')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'models' ? 'bg-white text-[#0F172A] border border-[#EAE6DF]' : 'text-[#64748B]'
          }`}
        >
          Model Arena
        </button>
        <button
          onClick={() => onChangeTab('explainability')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'explainability' ? 'bg-white text-[#0F172A] border border-[#EAE6DF]' : 'text-[#64748B]'
          }`}
        >
          Explainability
        </button>
        <button
          onClick={() => onChangeTab('news')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'news' ? 'bg-white text-[#0F172A] border border-[#EAE6DF]' : 'text-[#64748B]'
          }`}
        >
          News Sentiment
        </button>
        <button
          onClick={() => onChangeTab('whatif')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'whatif' ? 'bg-white text-[#0F172A] border border-[#EAE6DF]' : 'text-[#64748B]'
          }`}
        >
          What-If Simulator
        </button>
      </div>
    </header>
  );
};
