import React, { useState } from 'react';
import { usePWAInstall } from '@/lib/usePWAInstall';
import { Download, Smartphone, CheckCircle2, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'card' | 'sidebar';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // Automatically hide if the app is already running in standalone mode
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstalledSuccess(true);
      }
    } else {
      // Fallback for iOS/Safari or desktop/browsers without active beforeinstallprompt
      setShowIOSModal(true);
    }
  };

  // Fallback modal for iOS / Safari / manual install instructions
  const renderFallbackModal = () => {
    if (!showIOSModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
          <button
            type="button"
            onClick={() => setShowIOSModal(false)}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Install SOACA App</h3>
              <p className="text-xs text-slate-500">
                {isIOS ? 'Install on iPhone / iPad' : 'Add to your device'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5 text-sm">
                <span>To install on iPhone / iPad:</span>
              </p>
              <div className="space-y-2 text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">1.</span>
                  <span>Tap the <strong>Share</strong> button <Share2 className="h-3.5 w-3.5 inline text-sky-600 mx-0.5" /> in the Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">2.</span>
                  <span>Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="h-3.5 w-3.5 inline text-slate-600 mx-0.5" />.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">3.</span>
                  <span>Tap <strong>Add</strong> in the top-right corner.</span>
                </div>
              </div>
            </div>

            {!isIOS && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold text-slate-800 mb-1">Android / Desktop Chrome:</p>
                <p className="text-slate-600">
                  Tap the browser menu <strong>(⋮)</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-all ${className}`}
        >
          <Smartphone className="h-4 w-4 text-sky-600 flex-shrink-0" />
          <span className="truncate">Install SOACA App</span>
          <Download className="h-3.5 w-3.5 ml-auto text-sky-500 flex-shrink-0" />
        </button>
        {renderFallbackModal()}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <div
          className={`rounded-2xl border border-sky-200 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-5 text-white shadow-lg relative overflow-hidden ${className}`}
        >
          {/* Ambient light glow */}
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-inner">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    Progressive Web App
                  </span>
                  <span className="inline-flex items-center rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-400/30">
                    PWA
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Install SOACA Portal on your device
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Launch with one tap from your home screen with instant loading and offline support.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-sky-300 active:scale-95 hover:shadow-sky-400/25 flex-shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Install SOACA App</span>
            </button>
          </div>

          {installedSuccess && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>SOACA App installed successfully!</span>
            </div>
          )}
        </div>
        {renderFallbackModal()}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-all active:scale-95 ${className}`}
      >
        <Smartphone className="h-4 w-4" />
        <span>Install SOACA App</span>
      </button>
      {renderFallbackModal()}
    </>
  );
};
