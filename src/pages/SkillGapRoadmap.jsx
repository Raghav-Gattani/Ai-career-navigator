import React, { useState } from 'react'
import { toggleTask } from '../api/client'

export default function SkillGapRoadmap({ onNavigate, careerData, onRefreshData }) {
  const profile = careerData?.profile
  const analysis = careerData?.analysis
  const roadmap = careerData?.roadmap || []

  const targetRole = profile?.target_role || 'Target Career'
  const targetCompany = profile?.target_company || 'Benchmark'
  const readiness = analysis?.readiness_score ?? 0
  const criticalGaps = analysis?.critical_gaps || []
  const strongMatches = analysis?.strong_matches || []
  const hasAnalysis = Boolean(analysis)

  const [activeModal, setActiveModal] = useState(null)
  const [quizState, setQuizState] = useState({ selected: null, submitted: false })

  const handleTaskCheck = async (phaseNumber, taskIndex) => {
    try {
      await toggleTask(phaseNumber, taskIndex)
      onRefreshData?.()
    } catch (err) {
      console.warn('Task toggle failed:', err.message)
    }
  }

  // Active Phase calculation
  const activePhase = roadmap.find((p) => p.status === 'active') || roadmap[0]
  const phaseProgress = activePhase ? activePhase.progress_percent : 0

  return (
    <div className="flex flex-col w-full space-y-8">
      {/* Modals */}
      {activeModal === 'quiz' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">assignment</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {targetRole} Diagnostic Quiz
                </h3>
              </div>
              <button
                onClick={() => { setActiveModal(null); setQuizState({ selected: null, submitted: false }); }}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="font-label-md text-label-md text-on-surface font-semibold mb-3">
              Diagnostic Question: In distributed production systems, what is the primary benefit of idempotent API endpoints?
            </p>
            <div className="space-y-2 mb-4">
              {[
                { id: 'A', text: 'Safe retries during network timeouts without duplicate state mutations' },
                { id: 'B', text: 'Automatic horizontal sharding across multi-region databases' },
                { id: 'C', text: 'Lossless FP8 floating-point model quantization' },
                { id: 'D', text: 'Guaranteed sub-millisecond p99 database response times' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => !quizState.submitted && setQuizState({ ...quizState, selected: opt.id })}
                  className={`w-full text-left p-3 rounded-lg border text-body-sm transition-all flex items-center gap-3 cursor-pointer ${
                    quizState.selected === opt.id
                      ? 'border-primary bg-primary/10 text-on-surface font-medium'
                      : 'border-surface-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                    quizState.selected === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface'
                  }`}>
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            {quizState.submitted && (
              <div className={`p-3 rounded-lg text-body-sm mb-4 ${
                quizState.selected === 'A' ? 'bg-primary/15 text-primary' : 'bg-error-container text-on-error-container'
              }`}>
                {quizState.selected === 'A' ? (
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Correct! Idempotency guarantees that executing the same request multiple times yields the exact same outcome.
                  </span>
                ) : (
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Option A is correct: Idempotency enables safe retries under network unreliability without double processing.
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setQuizState({ selected: null, submitted: false }); }}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md cursor-pointer"
              >
                Close
              </button>
              {!quizState.submitted ? (
                <button
                  type="button"
                  disabled={!quizState.selected}
                  onClick={() => setQuizState({ ...quizState, submitted: true })}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container disabled:opacity-50 cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const topic = activeModal?.task?.title || 'Binary Search Tree'
                    setActiveModal(null)
                    onNavigate?.('learning-studio', { topic, taskTitle: topic })
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container cursor-pointer"
                >
                  Practice in Learning Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
              Strategic Diagnostics
            </span>
            <span className="text-outline text-body-sm">•</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Target: {targetRole}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Skill Gap &amp; Learning Roadmap
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 max-w-3xl">
            {hasAnalysis
              ? `Comparative analysis of your current competencies versus required benchmarks for ${targetRole} at ${targetCompany}.`
              : 'Complete your profile to generate your dynamic skill gap matrix and sequential roadmap.'}
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap self-start lg:self-center">
          <button
            onClick={() => onNavigate?.('career-analyzer')}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md shadow-sm active:scale-[0.99] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">terminal</span>
            <span>Update Skills</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-label-md text-label-md shadow-sm active:scale-[0.99] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Roadmap PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Identified Gaps</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {analysis?.critical_gaps_count ?? 0}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Competencies</span>
          </div>
          <div className="mt-space-sm flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary">
            <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-medium">
              {hasAnalysis ? `${analysis.critical_gaps_count} target deficits` : 'Awaiting Profile'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Roadmap Phases</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {roadmap.length}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Milestone Sprints</span>
          </div>
          <div className="mt-space-sm flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
            <span>{roadmap.length > 0 ? 'Sequential progression' : 'Configure career path'}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Competency Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {readiness}%
            </span>
            <span className="font-body-sm text-body-sm text-outline">/ 100% Bar</span>
          </div>
          <div className="mt-space-sm flex items-center gap-1.5 font-label-sm text-label-sm text-primary">
            <span className="material-symbols-outlined text-[16px]">north_east</span>
            <span className="font-medium">
              {readiness > 0 ? `${readiness}% match to target role` : '0% • Complete assessment'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Study Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {profile?.velocity_hrs || 10}h
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">/ week</span>
          </div>
          <div className="mt-space-sm flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">hourglass_bottom</span>
            <span>Allocated study pace</span>
          </div>
        </div>
      </div>

      {/* Competency Gap Matrix */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Competency Gap Matrix
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Discrepancy scoring calibrated directly against {targetRole} standards.
            </p>
          </div>
        </div>

        {criticalGaps.length > 0 || strongMatches.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Competency Topic</th>
                  <th className="py-3 px-4">Level vs Target Bar</th>
                  <th className="py-3 px-4">Gap Delta</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container">
                {criticalGaps.map((gap, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">build</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface font-semibold">{gap.name}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{gap.action}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 min-w-[180px]">
                      <div className="flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant mb-1.5">
                        <span>{gap.candidate}</span>
                        <span>{gap.benchmark}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold">
                        {gap.delta}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-label-sm text-label-sm px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 ${
                          gap.urgency?.includes('P0')
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-tertiary-fixed text-tertiary'
                        }`}
                      >
                        {gap.urgency || 'P1 High'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onNavigate?.('learning-studio', { topic: gap.name || gap.skill, taskTitle: gap.name })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-label-sm text-label-sm font-semibold shadow-sm cursor-pointer"
                        type="button"
                      >
                        <span>Practice</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-outline">
            No matrix generated yet. Select your target role and enter your current skills in the Career Analyzer.
          </div>
        )}
      </div>

      {/* Execution Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-space-lg">
            <div>
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                Sequential Path
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Execution Roadmap
              </h2>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-primary">insights</span>
              <span>{roadmap.length} Sprints</span>
            </div>
          </div>

          {roadmap.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-surface-variant">
              {roadmap.map((phase) => (
                <div key={phase.phase_number} className="relative pl-12">
                  <div
                    className={`absolute left-2.5 -translate-x-1/2 top-0 w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm ${
                      phase.progress_percent > 0
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {phase.phase_number < 10 ? `0${phase.phase_number}` : phase.phase_number}
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                            phase.status === 'active'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {phase.status.toUpperCase()}
                        </span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          {phase.phase_subtitle}
                        </h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {phase.progress_percent}% Complete
                      </span>
                    </div>

                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mb-space-md">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${phase.progress_percent}%` }}
                      ></div>
                    </div>

                    <div className="space-y-2 mb-space-md">
                      {phase.tasks?.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          onClick={() => handleTaskCheck(phase.phase_number, tIdx)}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest text-on-surface cursor-pointer hover:bg-surface-container-low transition-colors select-none"
                        >
                          <div className="flex items-center gap-space-sm">
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                task.done ? 'text-primary' : 'text-outline'
                              }`}
                            >
                              {task.done ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            <span
                              className={`font-body-sm text-body-sm ${
                                task.done ? 'line-through text-outline' : 'font-medium'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span
                            className={`font-label-sm text-label-sm px-2 py-0.5 rounded ${
                              task.done ? 'text-outline' : 'bg-primary/10 text-primary font-semibold'
                            }`}
                          >
                            {task.done ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {phase.status === 'active' && (
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            const firstIncompleteTask = (phase.tasks || []).find(t => !t.done)
                            const taskTitle = firstIncompleteTask?.title || phase.phase_title
                            onNavigate?.('learning-studio', { topic: taskTitle, taskTitle, phaseNumber: phase.phase_number })
                          }}
                          className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                          <span>Launch Lab</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-outline text-center py-6">
              Configure your career profile to generate milestone tasks.
            </p>
          )}
        </div>

        {/* Right Shelf: Quick Diagnostics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Action Accelerators
            </h3>
            <button
              type="button"
              onClick={() => setActiveModal('quiz')}
              className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group text-left cursor-pointer"
            >
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold block">
                    Diagnostic Quiz
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {targetRole} 5m check
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                chevron_right
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('ai-mock-interview')}
              className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group text-left cursor-pointer"
            >
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold block">
                    AI Mock Interview
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Evaluate measured depth
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
