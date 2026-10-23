import { useState } from 'react'

export default function PublicResumeModal({
  isOpen,
  onClose,
  resumeId,
  isPublic,
  shareToken,
  onToggleShare
}) {
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)

  if (!isOpen) return null

  const shareUrl = shareToken
    ? `${window.location.origin}/?share=${shareToken}`
    : ''

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = async (targetPublic) => {
    setToggling(true)
    try {
      await onToggleShare(targetPublic)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">share</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Live Resume</h3>
            <p className="text-xs text-slate-500">Generate a public, ATS-verified read-only link</p>
          </div>
        </div>

        {/* Status card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#202524] border border-slate-200 dark:border-slate-700 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isPublic ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isPublic ? 'Public Sharing Active' : 'Private Draft Only'}
              </span>
            </div>
            <button
              onClick={() => handleToggle(!isPublic)}
              disabled={toggling}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                isPublic
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50'
                  : 'bg-[#00685f] text-white hover:bg-[#005049]'
              }`}
            >
              {toggling ? 'Updating...' : isPublic ? 'Revoke Public Link' : 'Enable Public Link'}
            </button>
          </div>

          {isPublic && shareUrl && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-700 dark:text-slate-200 select-all font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-[#00685f] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy statement */}
        <div className="flex items-start gap-2.5 text-slate-500 text-xs bg-slate-50/60 dark:bg-[#202524]/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
          <span className="material-symbols-outlined text-base text-[#00685f] flex-shrink-0 mt-0.5">
            security
          </span>
          <p className="leading-relaxed">
            Public links are unindexed and protected. Anyone with the URL can view your formatted resume in read-only mode without logging in. You can revoke access at any time.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
          {isPublic && shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#00685f] hover:bg-[#005049] text-white transition flex items-center gap-1"
            >
              <span>Open Public View</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
