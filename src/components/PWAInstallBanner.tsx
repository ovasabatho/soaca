import React, { useState } from 'react';
import { usePWAInstall } from '@/lib/usePWAInstall';
import { Download, Smartphone, CheckCircle2, HelpCircle, X, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallBannerProps {
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed and running standalone, or dismissed, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
      }
    } else {
      // Show step-by-step instructions for Android or iOS
      setShowInstructions(true);
    }
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 text-white shadow-lg ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-500/20 blur-2xl" />
        <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Mobile App Available
                </span>
                <span className="inline-flex items-center rounded-full bg-sky-400/20 px-1.5 py-0.5 text-[10px] font-medium text-sky-300 border border-sky-400/30">
                  PWA
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Install SOACA Portal on your phone
              </h3>
              <p className="text-xs text-slate-300">
                Fast home-screen access, offline support & smooth experience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-sky-400 active:scale-95 hover:shadow-sky-500/25"
            >
              <Download className="h-4 w-4" />
              <span>Install Android App</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              title="Installation Instructions"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              title="Dismiss"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {installSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            App installed successfully! Look for SOACA Portal on your home screen.
          </div>
        )}
      </div>

      {/* Manual Install Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-800">
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">How to Install SOACA App</h3>
                <p className="text-xs text-slate-500">
                  {isAndroid ? 'Android (Chrome / Samsung Internet)' : isIOS ? 'iOS (Safari)' : 'Android & Mobile Browsers'}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">1</span>
                  <span>On Android (Chrome / Edge / Opera):</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Tap the <strong>three dots (⋮)</strong> menu icon at the top right of your browser.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Confirm by tapping <strong>Install</strong>.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-white">2</span>
                  <span className="flex items-center gap-1">
                    On iPhone / iPad (Safari) <Share2 className="h-3.5 w-3.5 inline text-sky-600" />:
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Tap the <strong>Share</strong> button at the bottom toolbar.</li>
                  <li>Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="h-3 w-3 inline text-slate-500" />.</li>
                  <li>Tap <strong>Add</strong> at top right.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    setShowInstructions(false);
                    await install();
                  }}
                  className="btn-primary flex-1 py-2.5 text-xs font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Install Now
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
