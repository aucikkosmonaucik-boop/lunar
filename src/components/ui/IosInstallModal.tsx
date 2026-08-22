import React, { useState } from 'react';
import { X, Share, PlusSquare, Check, Copy, Sparkles } from 'lucide-react';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#1c1c1e] text-white w-full max-w-lg rounded-t-[32px] sm:rounded-[28px] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C1A98F]/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#242424] border border-[#C1A98F]/30 p-2 flex items-center justify-center shadow-inner">
              <img src="/icons/apple-touch-icon.png" alt="Lunar App Icon" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#C1A98F]">Install Lunar on iPhone</h3>
                <span className="text-[10px] bg-[#C1A98F]/20 text-[#C1A98F] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  iOS PWA
                </span>
              </div>
              <p className="text-xs text-gray-400">Add to Home Screen for native experience</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Guide */}
        <div className="py-6 space-y-4">
          
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-3.5 bg-[#252528] rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#C1A98F] flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
              1
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Open in Safari
              </h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Make sure you are viewing this page in <strong>Safari</strong> on your iPhone (not inside Instagram or Chrome).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-3.5 bg-[#252528] rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#C1A98F] flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
              2
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Tap the Share Button
                <span className="inline-flex items-center justify-center bg-[#0a84ff]/20 text-[#0a84ff] p-1 rounded-md ml-1">
                  <Share className="w-3.5 h-3.5" />
                </span>
              </h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Tap the <strong>Share</strong> icon located in the bottom toolbar of Safari.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-3.5 bg-[#252528] rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#C1A98F] flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
              3
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Select "Add to Home Screen"
                <span className="inline-flex items-center justify-center bg-white/10 text-white p-1 rounded-md ml-1">
                  <PlusSquare className="w-3.5 h-3.5" />
                </span>
              </h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Scroll down in the share menu and tap <strong>"Add to Home Screen"</strong> (<em>Dodaj do ekranu początkowego</em>).
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 p-3.5 bg-[#252528] rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#C1A98F] flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
              4
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm font-semibold text-white">
                Tap "Add" in the Top Right
              </h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Tap <strong>Add</strong> to confirm. The Lunar icon will now appear on your iPhone screen like a native app!
              </p>
            </div>
          </div>

        </div>

        {/* Benefits reminder */}
        <div className="bg-[#242424] p-3 rounded-xl border border-white/5 flex items-center gap-2.5 text-xs text-gray-300 text-left">
          <Sparkles className="w-4 h-4 text-[#C1A98F] shrink-0" />
          <span>Full-screen view, faster load times & offline wishlist support.</span>
        </div>

        {/* Bottom Actions */}
        <div className="pt-5 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCopyUrl}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Store URL!' : 'Copy Link for Safari'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#C1A98F] hover:bg-[#b0967a] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <span>Got it!</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default IosInstallModal;
