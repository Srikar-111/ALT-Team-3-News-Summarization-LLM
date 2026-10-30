'use client';
import { useState, useEffect } from 'react';
import { Activity, Bot, Cloud, Settings, X, Check } from 'lucide-react';
import { healthCheck } from '@/lib/api';

export default function Header() {
  const [isOnline, setIsOnline] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [isCloudBackend, setIsCloudBackend] = useState(false);

  const checkStatus = () => {
    healthCheck()
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('backend_url') || '';
      setBackendUrl(saved);
      setIsCloudBackend(!!saved);
    }
    checkStatus();
  }, []);

  const saveBackendUrl = () => {
    if (typeof window !== 'undefined') {
      if (backendUrl.trim()) {
        const clean = backendUrl.trim().replace(/\/$/, '');
        localStorage.setItem('backend_url', clean);
        setIsCloudBackend(true);
      } else {
        localStorage.removeItem('backend_url');
        setIsCloudBackend(false);
      }
    }
    setShowModal(false);
    setTimeout(checkStatus, 500);
  };

  const resetToLocal = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('backend_url');
      setBackendUrl('');
      setIsCloudBackend(false);
    }
    setShowModal(false);
    setTimeout(checkStatus, 500);
  };

  return (
    <header className="w-full border-b border-white/[0.08] bg-background/75 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-slate-950 flex items-center justify-center shadow-[0_8px_22px_rgba(242,182,84,0.2)]">
            <Bot className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block leading-none">Newsroom</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 mt-1 block">AI summary lab</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white/[0.045] hover:bg-white/[0.09] px-3.5 py-2 rounded-full border border-white/[0.08] transition-all text-xs font-semibold text-white/80"
          >
            <Cloud className="w-3.5 h-3.5 text-primary" />
            <span>{isCloudBackend ? 'Colab Cloud GPU' : 'Connect Colab GPU'}</span>
            <Settings className="w-3 h-3 text-white/40" />
          </button>

          <div className="flex items-center gap-2 bg-white/[0.045] px-3 py-2 rounded-full border border-white/[0.08]">
            <Activity className={`w-3.5 h-3.5 ${isOnline ? 'text-secondary' : 'text-amber-300'}`} />
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-[0.12em]">
              {isOnline ? (isCloudBackend ? 'Cloud GPU' : 'Local Ready') : 'Connecting'}
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connect Google Colab GPU</h3>
                <p className="text-xs text-white/50">Run T5, BART & Pegasus in the cloud for free</p>
              </div>
            </div>

            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              Run the Colab notebook, copy the generated <code className="bg-white/10 text-primary px-1.5 py-0.5 rounded">trycloudflare.com</code> URL, and paste it below:
            </p>

            <div className="flex flex-col gap-2 mb-5">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Colab Backend URL</label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://random-word.trycloudflare.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/60 transition-all"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetToLocal}
                className="text-xs text-white/50 hover:text-white transition-all underline"
              >
                Reset to Local
              </button>
              <button
                type="button"
                onClick={saveBackendUrl}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
