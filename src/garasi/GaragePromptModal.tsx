import { useState } from 'react';
import { Check, Copy, Sparkle, X } from '@phosphor-icons/react';
import {
  CHAPTER_PROMPTS,
  MASTER_PROMPT_16X9,
  MASTER_PROMPT_9X16,
  NEGATIVE_PROMPT,
} from './garagePrompts';

interface GaragePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GaragePromptModal({ isOpen, onClose }: GaragePromptModalProps) {
  const [activeTab, setActiveTab] = useState<'master-16x9' | 'master-9x16' | 'chapters'>('master-16x9');
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedChapter = CHAPTER_PROMPTS[selectedChapterIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[#0f1015] border border-cloud-white/20 shadow-2xl overflow-hidden text-cloud-white font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-white/10 bg-jet-black/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-berlin-red/20 border border-berlin-red/40 text-berlin-red">
              <Sparkle size={22} weight="fill" />
            </div>
            <div>
              <h2 id="prompt-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Prompt Video Gemini / Veo</span>
                <span className="rounded-full bg-berlin-red/20 px-2.5 py-0.5 text-[10px] font-semibold text-berlin-red border border-berlin-red/30">
                  Ready to Copy
                </span>
              </h2>
              <p className="text-xs text-cloud-white/60">Prompt video sinematik untuk animasi scroll garasi Berlin 188</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cloud-white/10 text-cloud-white/70 hover:bg-cloud-white/20 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup modal prompt"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-cloud-white/10 bg-jet-black/30 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('master-16x9')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'master-16x9'
                ? 'bg-berlin-red text-white shadow-float'
                : 'text-cloud-white/70 hover:text-white hover:bg-cloud-white/10'
            }`}
          >
            Master 16:9 (Desktop)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('master-9x16')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'master-9x16'
                ? 'bg-berlin-red text-white shadow-float'
                : 'text-cloud-white/70 hover:text-white hover:bg-cloud-white/10'
            }`}
          >
            Master 9:16 (Mobile)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-berlin-red text-white shadow-float'
                : 'text-cloud-white/70 hover:text-white hover:bg-cloud-white/10'
            }`}
          >
            5 Shot Spesifik per Bab
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'master-16x9' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{MASTER_PROMPT_16X9.title}</h3>
                  <p className="text-xs text-cloud-white/60">
                    Durasi: {MASTER_PROMPT_16X9.duration} • Rasio: {MASTER_PROMPT_16X9.aspectRatio}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(MASTER_PROMPT_16X9.prompt, 'master-16x9')}
                  className="flex items-center gap-1.5 rounded-xl bg-cloud-white/10 hover:bg-berlin-red px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {copiedKey === 'master-16x9' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedKey === 'master-16x9' ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-black/60 p-4 border border-cloud-white/10 font-mono text-xs leading-relaxed text-cloud-white/90 selection:bg-berlin-red">
                {MASTER_PROMPT_16X9.prompt}
              </div>

              <div className="rounded-xl bg-berlin-blue/15 border border-berlin-blue/30 p-3 text-xs text-cloud-white/80">
                <span className="font-semibold text-berlin-blue-light">💡 Tips Scroll: </span>
                Video 16:9 satu shot kontinu ini akan di-scrub frame-demi-frame saat user scroll halaman. Kamera meluncur mulus tanpa potongan adegan (*no cuts*).
              </div>
            </div>
          )}

          {activeTab === 'master-9x16' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{MASTER_PROMPT_9X16.title}</h3>
                  <p className="text-xs text-cloud-white/60">
                    Durasi: {MASTER_PROMPT_9X16.duration} • Rasio: {MASTER_PROMPT_9X16.aspectRatio}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(MASTER_PROMPT_9X16.prompt, 'master-9x16')}
                  className="flex items-center gap-1.5 rounded-xl bg-cloud-white/10 hover:bg-berlin-red px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {copiedKey === 'master-9x16' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedKey === 'master-9x16' ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-black/60 p-4 border border-cloud-white/10 font-mono text-xs leading-relaxed text-cloud-white/90 selection:bg-berlin-red">
                {MASTER_PROMPT_9X16.prompt}
              </div>

              <div className="rounded-xl bg-berlin-blue/15 border border-berlin-blue/30 p-3 text-xs text-cloud-white/80">
                <span className="font-semibold text-berlin-blue-light">💡 Khusus Smartphone: </span>
                Format vertikal (9:16) ideal jika Anda ingin visual garasi mengisi layar HP secara penuh dan imersif.
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-4">
              {/* Chapter Pill Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {CHAPTER_PROMPTS.map((chap, idx) => (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => setSelectedChapterIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedChapterIndex === idx
                        ? 'bg-cloud-white text-jet-black font-semibold'
                        : 'bg-cloud-white/5 text-cloud-white/70 hover:bg-cloud-white/15'
                    }`}
                  >
                    {chap.chapter}
                  </button>
                ))}
              </div>

              {/* Selected Chapter Details */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedChapter.title}</h3>
                  <p className="text-xs text-cloud-white/60">
                    Durasi: {selectedChapter.duration} • Kamera: {selectedChapter.cameraMovement}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedChapter.promptText, `chap-${selectedChapter.id}`)}
                  className="flex items-center gap-1.5 rounded-xl bg-cloud-white/10 hover:bg-berlin-red px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {copiedKey === `chap-${selectedChapter.id}` ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedKey === `chap-${selectedChapter.id}` ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-black/60 p-4 border border-cloud-white/10 font-mono text-xs leading-relaxed text-cloud-white/90 selection:bg-berlin-red">
                {selectedChapter.promptText}
              </div>

              <p className="text-xs text-cloud-white/60 italic">📌 {selectedChapter.notes}</p>
            </div>
          )}

          {/* Negative Prompt Section */}
          <div className="pt-4 border-t border-cloud-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cloud-white/80">Negative Prompt (Penting di Gemini / Veo):</span>
              <button
                type="button"
                onClick={() => copyToClipboard(NEGATIVE_PROMPT, 'negative')}
                className="flex items-center gap-1 text-[11px] text-berlin-red hover:underline cursor-pointer"
              >
                {copiedKey === 'negative' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'negative' ? 'Tersalin' : 'Salin Negative Prompt'}</span>
              </button>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-cloud-white/5 font-mono text-[11px] text-cloud-white/60">
              {NEGATIVE_PROMPT}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="rounded-2xl bg-jet-black/60 p-4 border border-cloud-white/10 space-y-2 text-xs text-cloud-white/75">
            <h4 className="font-semibold text-white">Cara Menaruh Video ke Project:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Generate video di Google Gemini / Veo dengan salah satu prompt di atas.</li>
              <li>Unduh video dalam format <code className="text-berlin-blue-light font-mono">.mp4</code>.</li>
              <li>
                Simpan video ke folder:
                <code className="block mt-1 p-2 rounded-lg bg-black/60 text-berlin-red font-mono text-[11px]">
                  public/videos/garage/garage-cinematic.mp4
                </code>
              </li>
              <li>Halaman ini akan otomatis mendeteksi video dan memutarnya secara interaktif saat di-scroll!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
