import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Terminal,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { UpdateInfo } from "../services/updater";
import { api } from "../services/api";
import { isMac } from "../utils/platform";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  error: string | null;
  isChecking: boolean;
  onCheckAgain: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  error,
  isChecking,
  onCheckAgain,
}) => {
  const [copiedBrew, setCopiedBrew] = useState(false);

  if (!isOpen) return null;

  const handleCopyBrew = () => {
    navigator.clipboard.writeText("brew upgrade --cask skillhub");
    setCopiedBrew(true);
    setTimeout(() => setCopiedBrew(false), 2000);
  };

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      api.openBrowserUrl(updateInfo.downloadUrl);
    } else if (updateInfo?.releaseUrl) {
      api.openBrowserUrl(updateInfo.releaseUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-[#141517] border border-zinc-800 rounded-xl shadow-2xl p-5 text-zinc-100 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold tracking-tight">Software Updates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {error ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
              <div className="text-xs font-semibold text-rose-300 mb-1">Check Failed</div>
              <div className="text-[11px] text-zinc-400 max-w-xs">{error}</div>
              <button
                onClick={onCheckAgain}
                className="mt-3 px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700"
              >
                Try Again
              </button>
            </div>
          ) : updateInfo?.hasUpdate ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-500/30">
                <div>
                  <div className="text-xs font-bold text-purple-300">
                    {updateInfo.releaseName || `SkillHub v${updateInfo.latestVersion}`}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Installed: <span className="font-mono text-zinc-300">v{updateInfo.currentVersion}</span> → Latest:{" "}
                    <span className="font-mono text-emerald-400 font-semibold">v{updateInfo.latestVersion}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  New
                </span>
              </div>

              {/* Release Notes */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1.5">
                  What's New in this Release
                </label>
                <div className="p-3 bg-[#0d0e10] rounded-lg border border-zinc-800/80 text-xs text-zinc-300 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line font-mono text-[11px]">
                  {updateInfo.releaseNotes}
                </div>
              </div>

              {/* Homebrew Option for macOS */}
              {isMac && (
                <div className="p-3 rounded-lg bg-[#0d0e10] border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-orange-400" />
                      Homebrew Upgrade
                    </span>
                    <button
                      onClick={handleCopyBrew}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedBrew ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block p-2 rounded bg-black/60 font-mono text-[11px] text-zinc-300 select-all border border-zinc-800">
                    brew upgrade --cask skillhub
                  </code>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <div className="text-xs font-bold text-zinc-100">You're Up to Date!</div>
              <div className="text-[11px] text-zinc-400 mt-1">
                SkillHub <span className="font-mono text-zinc-300">v{updateInfo?.currentVersion}</span> is currently the latest version.
              </div>
              <button
                onClick={onCheckAgain}
                disabled={isChecking}
                className="mt-3 px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 disabled:opacity-50"
              >
                {isChecking ? "Checking..." : "Check Again"}
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 shrink-0">
          <button
            onClick={() => {
              if (updateInfo?.releaseUrl) {
                api.openBrowserUrl(updateInfo.releaseUrl);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>GitHub Release</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              Close
            </button>

            {updateInfo?.hasUpdate && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download & Install</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
