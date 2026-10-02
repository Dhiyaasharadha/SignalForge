import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, ExternalLink, ShieldCheck, Database, RefreshCw } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentSource: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentSource
}) => {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('signalforge_av_key') || '';
    setApiKey(existing);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('signalforge_av_key', apiKey.trim());
    onSaveKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('signalforge_av_key');
    setApiKey('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#EAE6DF] rounded-xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1EFEA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#EAE6DF] flex items-center justify-center">
              <Key className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">Alpha Vantage API Configuration</h3>
              <p className="text-xs text-[#64748B]">Real-Time Market Data Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="mt-4 p-3 bg-[#FAF9F5] border border-[#EAE6DF] rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[#64748B]">Active Data Pipeline:</span>
            <span className="font-semibold text-[#0F172A]">{currentSource}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
              Alpha Vantage API Key
            </label>
            <input
              type="text"
              placeholder="e.g. demo or your personal Alpha Vantage key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF9F5] border border-[#EAE6DF] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
            />
            <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
              Alpha Vantage provides free API keys with a standard allowance of 25 requests/day. Keys are stored locally in your browser session.
            </p>
          </div>

          {/* Guide Card */}
          <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-md p-3 text-xs text-[#475569] space-y-2">
            <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              Resilient Dual-Stream Ingestion
            </div>
            <p className="text-[11px] leading-relaxed">
              If an Alpha Vantage key is not supplied or encounters rate limits, SignalForge seamlessly synchronizes with our real-time exchange feeds, guaranteeing 100% data continuity without synthetic gaps.
            </p>
            <div className="pt-1">
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#C5A059] hover:underline font-medium inline-flex items-center gap-1"
              >
                Claim a Free Alpha Vantage API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F1EFEA]">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-[#64748B] hover:text-[#DC2626] font-medium transition-colors"
            >
              Clear Stored Key
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] bg-white border border-[#EAE6DF] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-[#0F172A] rounded-md transition-colors shadow-xs flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                    Saved
                  </>
                ) : (
                  'Apply & Refresh'
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
