import { useState, useEffect } from 'react'
import ResumeEditor from '../components/resume/ResumeEditor'
import ResumePreview from '../components/resume/ResumePreview'
import PublicResumeModal from '../components/resume/PublicResumeModal'
import StudyFocusTimer from '../components/study/StudyFocusTimer'
import StudyGoalTracker from '../components/study/StudyGoalTracker'
import {
  generateResume,
  regenerateResumeSection,
  saveResume,
  fetchResumes,
  fetchResume,
  deleteResume,
  toggleResumeShare,
  exportResumePdfBlob,
  fetchProfile
} from '../api/client'

const CAREER_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Data Analyst',
  'Cybersecurity Analyst'
]

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState(null)
  const [currentResumeId, setCurrentResumeId] = useState(null)
  const [resumeTitle, setResumeTitle] = useState('My Professional Resume')
  const [targetRole, setTargetRole] = useState('Frontend Developer')
  const [template, setTemplate] = useState('modern') // 'modern', 'classic', 'minimal'
  const [shareToken, setShareToken] = useState(null)
  const [isPublic, setIsPublic] = useState(false)

  const [savedResumes, setSavedResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [regeneratingSection, setRegeneratingSection] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // UI view controls
  const [viewMode, setViewMode] = useState('split') // 'split', 'editor', 'preview'
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showDraftsMenu, setShowDraftsMenu] = useState(false)
  const [showStudySidebar, setShowStudySidebar] = useState(false)

  // Initial load
  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        setLoading(true)
        // 1. Fetch user's saved drafts
        const draftRes = await fetchResumes().catch(() => null)
        const drafts = draftRes?.resumes || []
        if (isMounted) setSavedResumes(drafts)

        if (drafts.length > 0) {
          // Load latest draft
          const latest = await fetchResume(drafts[0].id)
          if (isMounted && latest?.resume) {
            setCurrentResumeId(latest.resume.id)
            setResumeTitle(latest.resume.title || 'My Professional Resume')
            setTargetRole(latest.resume.target_role || 'Frontend Developer')
            setTemplate(latest.resume.template || 'modern')
            setResumeData(latest.resume.resume_data || {})
            setShareToken(latest.resume.share_token)
            setIsPublic(Boolean(latest.resume.is_public))
            setLoading(false)
            return
          }
        }

        // 2. No saved drafts: fetch profile & generate initial truthful resume
        const profileRes = await fetchProfile().catch(() => null)
        const profileRole = profileRes?.profile?.target_role || 'Frontend Developer'
        if (isMounted) setTargetRole(profileRole)

        const genRes = await generateResume({ target_role: profileRole })
        if (isMounted && genRes?.resume_data) {
          setResumeData(genRes.resume_data)
          setTargetRole(genRes.target_role || profileRole)
        }
      } catch (err) {
        console.error('Initialization error:', err)
        if (isMounted) setErrorMsg('Could not load resume data. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Full AI Generation / Refresh
  const handleGenerateFullResume = async (roleOverride = null) => {
    const roleToUse = roleOverride || targetRole
    setIsGenerating(true)
    setErrorMsg('')
    try {
      const res = await generateResume({ target_role: roleToUse })
      if (res?.resume_data) {
        setResumeData(res.resume_data)
        setTargetRole(res.target_role || roleToUse)
        setSaveStatus('Generated truthful resume from your verified profile & roadmap')
        setTimeout(() => setSaveStatus(''), 4000)
      }
    } catch (err) {
      console.error('Generate full resume error:', err)
      setErrorMsg(err.message || 'Failed to generate resume')
    } finally {
      setIsGenerating(false)
    }
  }

  // Single Section Regeneration
  const handleRegenerateSection = async (sectionName, instructions = '') => {
    if (!resumeData) return
    setRegeneratingSection(sectionName)
    try {
      const res = await regenerateResumeSection({
        section_name: sectionName,
        target_role: targetRole,
        current_resume_data: resumeData,
        instructions
      })
      if (res?.section_data) {
        setResumeData((prev) => ({
          ...prev,
          [res.section_name]: res.section_data
        }))
        setSaveStatus(`Regenerated ${sectionName} section`)
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (err) {
      console.error('Section regeneration error:', err)
      setErrorMsg(`Failed to regenerate ${sectionName}`)
    } finally {
      setRegeneratingSection(null)
    }
  }

  // Save Draft
  const handleSaveDraft = async () => {
    if (!resumeData) return
    setIsSaving(true)
    setErrorMsg('')
    try {
      const res = await saveResume({
        id: currentResumeId,
        title: resumeTitle,
        target_role: targetRole,
        template,
        resume_data: resumeData
      })
      if (res?.resume) {
        setCurrentResumeId(res.resume.id)
        setShareToken(res.resume.share_token)
        setIsPublic(Boolean(res.resume.is_public))
        setSaveStatus('Draft saved successfully')
        // Refresh saved list
        const updatedList = await fetchResumes().catch(() => null)
        if (updatedList?.resumes) setSavedResumes(updatedList.resumes)
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (err) {
      console.error('Save draft error:', err)
      setErrorMsg(err.message || 'Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  // Load a different draft
  const handleLoadDraft = async (draftId) => {
    setLoading(true)
    setShowDraftsMenu(false)
    try {
      const res = await fetchResume(draftId)
      if (res?.resume) {
        setCurrentResumeId(res.resume.id)
        setResumeTitle(res.resume.title || 'My Professional Resume')
        setTargetRole(res.resume.target_role || 'Frontend Developer')
        setTemplate(res.resume.template || 'modern')
        setResumeData(res.resume.resume_data || {})
        setShareToken(res.resume.share_token)
        setIsPublic(Boolean(res.resume.is_public))
      }
    } catch (err) {
      setErrorMsg('Failed to load selected resume draft')
    } finally {
      setLoading(false)
    }
  }

  // Delete draft
  const handleDeleteDraft = async (e, draftId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this resume draft? This cannot be undone.')) return
    try {
      await deleteResume(draftId)
      const updatedList = await fetchResumes().catch(() => null)
      if (updatedList?.resumes) setSavedResumes(updatedList.resumes)
      if (currentResumeId === draftId) {
        if (updatedList?.resumes?.length > 0) {
          handleLoadDraft(updatedList.resumes[0].id)
        } else {
          setCurrentResumeId(null)
          handleGenerateFullResume()
        }
      }
    } catch (err) {
      setErrorMsg('Failed to delete draft')
    }
  }

  // Export Selectable Vector PDF
  const handleExportPdf = async () => {
    if (!resumeData) return
    setIsExporting(true)
    setErrorMsg('')
    try {
      const blob = await exportResumePdfBlob({
        template,
        resume_data: resumeData
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const candName = resumeData.personal_info?.name || 'Resume'
      a.download = `${candName.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setSaveStatus('ATS-friendly PDF downloaded!')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (err) {
      console.error('PDF export error:', err)
      setErrorMsg(err.message || 'Failed to download PDF')
    } finally {
      setIsExporting(false)
    }
  }

  // Toggle public share
  const handleToggleShare = async (targetPublic) => {
    if (!currentResumeId) {
      // Must save draft first to get an ID
      await handleSaveDraft()
    }
    if (!currentResumeId) return

    try {
      const res = await toggleResumeShare(currentResumeId, targetPublic)
      if (res?.share) {
        setIsPublic(Boolean(res.share.is_public))
        setShareToken(res.share.share_token)
      }
    } catch (err) {
      setErrorMsg('Failed to update share settings')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-[#00685f]/20 border-t-[#00685f] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Loading AI Resume Builder...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Toolbar */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Target Role */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="font-black text-base sm:text-lg text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#00685f] focus:outline-none px-0.5"
                />
                {/* Drafts dropdown button */}
                <div className="relative">
                  <button
                    onClick={() => setShowDraftsMenu(!showDraftsMenu)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#202524] px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <span>Drafts ({savedResumes.length})</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDraftsMenu && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-[#191c1b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 p-2 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                        Saved Resume Drafts
                      </div>
                      {savedResumes.length === 0 ? (
                        <p className="text-xs text-slate-500 px-2 py-2">No saved drafts yet.</p>
                      ) : (
                        savedResumes.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => handleLoadDraft(d.id)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                              currentResumeId === d.id
                                ? 'bg-[#00685f]/10 text-[#00685f] font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-[#202524] text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate font-semibold">{d.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{d.target_role}</p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteDraft(e, d.id)}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="Delete draft"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Target Role Selector */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">Target Role:</span>
                <select
                  value={targetRole}
                  onChange={(e) => {
                    const newRole = e.target.value
                    setTargetRole(newRole)
                    if (window.confirm(`Re-tailor resume to ${newRole}?`)) {
                      handleGenerateFullResume(newRole)
                    }
                  }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-[#00685f] dark:text-[#4a9e95] focus:outline-none"
                >
                  {CAREER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Refresh from profile */}
            <button
              onClick={() => handleGenerateFullResume()}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-[#00685f] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#202524] transition"
              title="Re-sync with your profile, verified roadmap skills, and learning activities"
            >
              <span className={`material-symbols-outlined text-base text-[#00685f] ${isGenerating ? 'animate-spin' : ''}`}>
                {isGenerating ? 'sync' : 'auto_awesome'}
              </span>
              <span>{isGenerating ? 'Analyzing...' : 'AI Full Sync'}</span>
            </button>

            {/* Save Draft */}
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#00685f] hover:bg-[#005049] text-white shadow-sm transition"
            >
              <span className="material-symbols-outlined text-base">
                {isSaving ? 'sync' : 'save'}
              </span>
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {/* Export Vector PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              title="Download ATS-Friendly Selectable Text PDF"
            >
              <span className={`material-symbols-outlined text-base ${isExporting ? 'animate-spin' : ''}`}>
                {isExporting ? 'sync' : 'download'}
              </span>
              <span>{isExporting ? 'Rendering...' : 'Download PDF'}</span>
            </button>

            {/* Share link button */}
            <button
              onClick={() => {
                if (!currentResumeId) {
                  handleSaveDraft().then(() => setIsShareModalOpen(true))
                } else {
                  setIsShareModalOpen(true)
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#202524] text-slate-700 dark:text-slate-200 transition"
              title="Public Share Link"
            >
              <span className="material-symbols-outlined text-base text-[#00685f]">share</span>
              <span>Share</span>
            </button>

            {/* StudyMate Sidebar Toggle */}
            <button
              onClick={() => setShowStudySidebar(!showStudySidebar)}
              className={`p-2 rounded-xl text-xs font-semibold border transition ${
                showStudySidebar
                  ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900/50'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202524]'
              }`}
              title="StudyMate Productivity Sidebar"
            >
              <span className="material-symbols-outlined text-base">timer</span>
            </button>
          </div>
        </div>

        {/* Status notification toast bar */}
        {(saveStatus || errorMsg) && (
          <div
            className={`mt-3 px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
              errorMsg
                ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                {errorMsg ? 'error' : 'check_circle'}
              </span>
              <span>{errorMsg || saveStatus}</span>
            </div>
            {errorMsg && (
              <button onClick={() => setErrorMsg('')} className="text-red-500 font-bold ml-2">
                &times;
              </button>
            )}
          </div>
        )}

        {/* Second bar: Template Selector & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Templates */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Template:</span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-[#202524] rounded-xl">
              {[
                { id: 'modern', label: 'Modern Tech', icon: 'palette' },
                { id: 'classic', label: 'Classic ATS', icon: 'article' },
                { id: 'minimal', label: 'Minimalist', icon: 'view_headline' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    template === t.id
                      ? 'bg-white dark:bg-[#2a302f] text-[#00685f] dark:text-[#4a9e95] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">View:</span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-[#202524] rounded-xl">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-[#2a302f] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('editor')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'editor'
                    ? 'bg-white dark:bg-[#2a302f] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Editor Only
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-[#2a302f] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Preview Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={viewMode === 'split' ? (showStudySidebar ? 'lg:col-span-6' : 'lg:col-span-6') : 'lg:col-span-12'}>
            <div className="bg-white/60 dark:bg-[#191c1b]/60 backdrop-blur-xs p-1 rounded-2xl">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#00685f]">edit_note</span>
                  Structured Resume Editor
                </h3>
                <span className="text-[11px] text-slate-400">Edits update preview in real-time</span>
              </div>
              <ResumeEditor
                resumeData={resumeData || {}}
                onChange={setResumeData}
                onRegenerateSection={handleRegenerateSection}
                regeneratingSection={regeneratingSection}
              />
            </div>
          </div>
        )}

        {/* Right Pane: Live Document Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={viewMode === 'split' ? (showStudySidebar ? 'lg:col-span-4' : 'lg:col-span-6') : 'lg:col-span-12'}>
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600">visibility</span>
                  Live ATS Document Preview
                </h3>
                <span className="text-[11px] font-mono text-slate-400">A4 • ATS Compliant</span>
              </div>
              <div className="overflow-auto max-h-[85vh] p-2 bg-slate-200/50 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ResumePreview resumeData={resumeData} template={template} />
              </div>
            </div>
          </div>
        )}

        {/* Optional Study Support Sidebar */}
        {showStudySidebar && (
          <div className="lg:col-span-2 space-y-4">
            <StudyFocusTimer
              currentTopic={`Resume Sprint: ${targetRole}`}
              compact={false}
            />
            <StudyGoalTracker />
          </div>
        )}
      </div>

      {/* Public Share Modal */}
      <PublicResumeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        resumeId={currentResumeId}
        isPublic={isPublic}
        shareToken={shareToken}
        onToggleShare={handleToggleShare}
      />
    </div>
  )
}
