'use client';

import { useState } from 'react';
import { AlertCircle, Check, ChevronDown, ChevronUp, Cloud, Cpu, FileText, Gauge, Globe, Link, ListTree, Loader2, Sparkles, WandSparkles } from 'lucide-react';
import { MODEL_OPTIONS, ModelName, SummarizationRequest } from '@/lib/types';
import { extractArticleFromUrl } from '@/lib/api';

interface Props {
  onSubmit: (request: SummarizationRequest) => void;
  isLoading: boolean;
}

const sampleArticle = `The European Central Bank cut interest rates by a quarter point on Thursday, a widely expected move that offers some relief to consumers and businesses following a prolonged period of aggressive monetary tightening.

The ECB's Governing Council lowered its key deposit rate to 3.75% from a record high of 4.0%, marking its first rate cut in nearly five years. The decision comes as inflation across the 20-nation euro zone has cooled significantly, dropping from a peak of over 10% in late 2022 to 2.6% in May.

Based on an updated assessment of the inflation outlook, the dynamics of underlying inflation and the strength of monetary policy transmission, it is now appropriate to moderate the degree of monetary policy restriction, the ECB said in a statement.`;

const sampleReference = `European Central Bank cuts key deposit rate by 25 basis points to 3.75%. Move marks the first interest rate reduction in nearly five years as Eurozone inflation eases.`;

export default function InputPanel({ onSubmit, isLoading }: Props) {
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');
  const [articleText, setArticleText] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedTitle, setExtractedTitle] = useState<string | null>(null);

  const [referenceSummary, setReferenceSummary] = useState('');
  const [showRefInput, setShowRefInput] = useState(false);
  const [selectedModels, setSelectedModels] = useState<ModelName[]>(['llm']);
  const [maxLength, setMaxLength] = useState(150);
  const [minLength, setMinLength] = useState(30);

  const words = articleText.trim() ? articleText.trim().split(/\s+/).length : 0;
  const stats = {
    words,
    sentences: articleText.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length,
    tokens: Math.round(words * 1.3),
  };

  const toggleModel = (name: ModelName) => {
    setSelectedModels((current) => (
      current.includes(name) ? current.filter((model) => model !== name) : [...current, name]
    ));
  };

  const handleTrySample = () => {
    setInputMode('text');
    setArticleText(sampleArticle);
    setReferenceSummary(sampleReference);
    setExtractedTitle(null);
    setShowRefInput(true);
  };

  const handleExtractUrl = async () => {
    if (!articleUrl.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const data = await extractArticleFromUrl(articleUrl.trim());
      setArticleText(data.text);
      setExtractedTitle(data.title || null);
      if (data.description) {
        setReferenceSummary(data.description);
        setShowRefInput(true);
      }
      // Return to text mode so the user sees the extracted content
      setInputMode('text');
    } catch (err: any) {
      setExtractError(err.message || 'Failed to extract article from this link. Try pasting the text directly.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <section className="glass-card p-5 sm:p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Source article</p>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">Set the brief</h2>
          <p className="text-sm leading-relaxed text-white/50 mt-1">Paste article text or enter a live news web link.</p>
        </div>
        <button
          type="button"
          onClick={handleTrySample}
          className="btn-secondary shrink-0 px-3 py-2 text-xs flex items-center gap-1.5"
        >
          <WandSparkles className="w-3.5 h-3.5 text-primary" /> Try sample
        </button>
      </div>

      {/* Input Mode Selector: Paste Text vs Enter URL */}
      <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/[0.08]">
        <button
          type="button"
          onClick={() => { setInputMode('text'); setExtractError(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            inputMode === 'text'
              ? 'bg-primary text-slate-950 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Paste Text
        </button>
        <button
          type="button"
          onClick={() => { setInputMode('url'); setExtractError(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            inputMode === 'url'
              ? 'bg-primary text-slate-950 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Fetch from News Link / URL
        </button>
      </div>

      {/* URL Input Form */}
      {inputMode === 'url' ? (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-black/25 border border-white/[0.09] animate-fade-in">
          <label htmlFor="article-url" className="text-xs font-bold text-white/70 flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-primary" /> Paste News Article URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="article-url"
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleExtractUrl(); } }}
              placeholder="https://edition.cnn.com/2026/... or any news site"
              className="flex-1 bg-black/30 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-all"
            />
            <button
              type="button"
              onClick={handleExtractUrl}
              disabled={isExtracting || !articleUrl.trim()}
              className="btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" /> Extract Article
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
            <span>Try sample article:</span>
            <button
              type="button"
              onClick={() => {
                const sampleUrl = 'https://www.bbc.com/news/articles/ck8dz8j5n993o';
                setArticleUrl(sampleUrl);
              }}
              className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-primary transition-all border border-white/[0.08]"
            >
              BBC News Story
            </button>
            <button
              type="button"
              onClick={() => {
                const sampleUrl = 'https://www.theguardian.com/science/article/2024/aug/15/scientists-discover-water-deep-inside-mars';
                setArticleUrl(sampleUrl);
              }}
              className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-primary transition-all border border-white/[0.08]"
            >
              The Guardian Story
            </button>
          </div>
          <p className="text-[11px] text-white/40">
            Note: Paste an individual news article story URL (e.g. <code>domain.com/news/...</code>), not just the homepage. Supports CNN, BBC, Reuters, The Guardian, TechCrunch, etc.
          </p>
          {extractError && (
            <div className="p-3 rounded-lg bg-red-400/[0.1] border border-red-400/20 text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{extractError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Textarea Input */
        <div className="relative">
          {extractedTitle && (
            <div className="mb-2 p-2.5 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90 truncate mr-2">📰 {extractedTitle}</span>
              <button
                type="button"
                onClick={() => setExtractedTitle(null)}
                className="text-[10px] text-white/40 hover:text-white underline shrink-0"
              >
                Clear
              </button>
            </div>
          )}
          <label htmlFor="article-text" className="sr-only">Article text</label>
          <textarea
            id="article-text"
            value={articleText}
            onChange={(event) => setArticleText(event.target.value)}
            placeholder="Paste a news article, report, or transcript here, or switch to 'Fetch from News Link' above..."
            className="w-full h-56 bg-black/20 border border-white/[0.1] rounded-2xl p-4 pr-6 text-white/90 leading-relaxed placeholder:text-white/30 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all resize-none"
          />
          <div className="absolute bottom-4 right-4 h-10 w-1 rounded-full bg-gradient-to-b from-primary to-secondary opacity-70 pointer-events-none" />
        </div>
      )}

      {/* Optional Reference Summary Accordion */}
      <div className="border border-white/[0.08] rounded-xl bg-black/15 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowRefInput(!showRefInput)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <span>Reference Summary (Ground Truth for ROUGE)</span>
          <span className="flex items-center gap-1 text-[11px] text-primary">
            {showRefInput ? 'Hide' : (referenceSummary ? 'Added' : 'Optional')}
            {showRefInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>
        {showRefInput && (
          <div className="p-3 border-t border-white/[0.08] animate-fade-in">
            <textarea
              value={referenceSummary}
              onChange={(e) => setReferenceSummary(e.target.value)}
              placeholder="Paste gold reference summary here for exact ROUGE comparison (or leave empty to use journalistic Lead-3 baseline automatically)..."
              rows={2}
              className="w-full bg-black/25 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-primary/50 resize-none"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="metric-chip"><FileText className="w-3.5 h-3.5 text-primary" /><span><b className="text-white">{stats.words}</b> words</span></div>
        <div className="metric-chip"><ListTree className="w-3.5 h-3.5 text-secondary" /><span><b className="text-white">{stats.sentences}</b> sentences</span></div>
        <div className="metric-chip"><Gauge className="w-3.5 h-3.5 text-amber-200" /><span><b className="text-white">{stats.tokens}</b> tokens</span></div>
      </div>

      <div className="h-px bg-white/[0.08] w-full" />

      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="section-label flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> Model desk</p>
            <p className="text-sm text-white/60 mt-1">Pick the models to run in parallel.</p>
          </div>
          <span className="text-xs font-bold text-primary">{selectedModels.length}/4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MODEL_OPTIONS.map((model) => {
            const active = selectedModels.includes(model.name);
            const isCloud = model.name === 'llm';

            return (
              <button
                key={model.name}
                type="button"
                onClick={() => toggleModel(model.name)}
                aria-pressed={active}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-primary/[0.12] border-primary/55 shadow-[0_8px_24px_rgba(242,182,84,0.08)]'
                    : 'bg-black/15 border-white/[0.08] hover:bg-white/[0.055] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`font-bold text-sm block ${active ? 'text-white' : 'text-white/70'}`}>{model.display_name}</span>
                    <span className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/40 flex items-center gap-1">
                      {isCloud ? <Cloud className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                      {isCloud ? 'Cloud' : 'Local'}
                    </span>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${active ? 'bg-primary border-primary text-slate-950' : 'border-white/25'}`}>
                    {active && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/[0.08] w-full" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 mb-3">
            Minimum length <b className="text-secondary text-xs">{minLength} words</b>
          </span>
          <input
            type="range"
            min="10"
            max="100"
            value={minLength}
            onChange={(event) => setMinLength(+event.target.value)}
            className="w-full accent-secondary"
          />
        </label>
        <label className="block">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 mb-3">
            Maximum length <b className="text-primary text-xs">{maxLength} words</b>
          </span>
          <input
            type="range"
            min="50"
            max="300"
            value={maxLength}
            onChange={(event) => setMaxLength(+event.target.value)}
            className="w-full accent-primary"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => onSubmit({
          article_text: articleText,
          reference_summary: referenceSummary.trim() || undefined,
          models: selectedModels,
          max_length: maxLength,
          min_length: minLength,
          num_beams: 4
        })}
        disabled={isLoading || articleText.length < 50 || selectedModels.length === 0}
        className="btn-primary w-full mt-1 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {isLoading ? 'Building summaries...' : 'Generate summaries'}
      </button>
    </section>
  );
}
