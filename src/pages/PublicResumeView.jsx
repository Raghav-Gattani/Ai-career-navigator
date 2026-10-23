import { useState, useEffect } from 'react'
import ResumePreview from '../components/resume/ResumePreview'
import { fetchPublicResume, exportResumePdfBlob } from '../api/client'

export default function PublicResumeView({ shareToken, onBackToApp }) {
  const [resume, setResume] = useState(null)
  const [template, setTemplate] = useState('modern')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await fetchPublicResume(shareToken)
        if (isMounted && res?.resume) {
          setResume(res.resume)
          setTemplate(res.resume.template || 'modern')
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Public resume not found or access has been revoked.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [shareToken])

  const handleExportPdf = async () => {
    if (!resume?.resume_data) return
    setIsExporting(true)
    try {
      const blob = await exportResumePdfBlob({
        template,
        resume_data: resume.resume_data
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const candName = resume.resume_data.personal_info?.name || 'Resume'
      a.download = `${candName.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export PDF: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111413] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#00685f]/20 border-t-[#00685f] rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading verified resume...</p>
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111413] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Resume Not Available</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          {error || 'This public resume link has either expired or been set to private by the candidate.'}
        </p>
        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="px-4 py-2 bg-[#00685f] text-white text-xs font-semibold rounded-xl"
          >
            Go to AI Career Navigator
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#111413] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Public Bar */}
        <div className="bg-white dark:bg-[#191c1b] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00685f]/10 text-[#00685f] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {resume.title || 'Verified Candidate Resume'}
              </h2>
              <p className="text-[11px] text-slate-500">
                AI Career Navigator • Verified Technical Portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-[#202524] rounded-xl text-xs">
              {['modern', 'classic', 'minimal'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                    template === t
                      ? 'bg-white dark:bg-[#2a302f] text-[#00685f] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isExporting ? 'sync' : 'download'}
              </span>
              <span>{isExporting ? 'Rendering...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Live Resume Document */}
        <div className="shadow-xl rounded-2xl overflow-hidden">
          <ResumePreview resumeData={resume.resume_data} template={template} />
        </div>
      </div>
    </div>
  )
}
