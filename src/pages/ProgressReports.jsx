import React, { useState } from 'react'
import { toggleTask } from '../api/client'

export default function ProgressReports({ onNavigate, careerData, currentUser }) {
  const profile = careerData?.profile
  const analysis = careerData?.analysis
  const roadmap = careerData?.roadmap || []
  const latestInterview = careerData?.interview

  const targetRole = profile?.target_role || 'Target Career'
  const readiness = analysis?.readiness_score ?? 0
  const hasAnalysis = Boolean(analysis)

  // Derive verified completed tasks from real user roadmap
  const completedRoadmapTasks = []
  roadmap.forEach((phase) => {
    phase.tasks?.forEach((task) => {
      if (task.done) {
        completedRoadmapTasks.push({
          title: task.title,
          phase: phase.phase_subtitle,
          phaseNumber: phase.phase_number
        })
      }
    })
  })

  // Priority uncompleted tasks
  const pendingTasks = []
  roadmap.forEach((phase) => {
    phase.tasks?.forEach((task, tIdx) => {
      if (!task.done && pendingTasks.length < 4) {
        pendingTasks.push({
          title: task.title,
          phaseNumber: phase.phase_number,
          taskIndex: tIdx,
          phaseSubtitle: phase.phase_subtitle
        })
      }
    })
  })

  const [dateRange, setDateRange] = useState('Current Cycle')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [activeProofModal, setActiveProofModal] = useState(null)

  const handleTogglePriorityTask = async (phaseNum, taskIdx) => {
    try {
      await toggleTask(phaseNum, taskIdx)
      window.location.reload()
    } catch (err) {
      console.warn('Failed to toggle:', err.message)
    }
  }

  // Calculate realistic percentile category
  const getPercentileLabel = (score) => {
    if (score === 0) return 'Uncalibrated'
    if (score < 40) return 'Foundational'
    if (score < 70) return 'Mid Cohort'
    if (score < 85) return 'Senior Tier'
    return 'Top Tier'
  }

  return (
    <div className="flex flex-col w-full">
      {/* Proof Detail Modal */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {activeProofModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveProofModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] text-on-surface font-semibold">
                  {activeProofModal.phase}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/15 text-primary">
                  VERIFIED IMPLEMENTED
                </span>
              </div>
              <p>
                Milestone task completed and saved in SQLite database under user session for {currentUser?.email}.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveProofModal(null)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md cursor-pointer hover:bg-primary-container"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Header / Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-1">
            <span className="inline-flex items-center gap-1 text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span> Calibration Dossier
            </span>
            <span>•</span>
            <span>Target: {targetRole}</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Performance &amp; Readiness Reports
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
            Multi-dimensional benchmarking calibrated directly to verified self-reported skills and measured interview results.
          </p>
        </div>

        {/* Actions Strip */}
        <div className="flex items-center gap-space-sm self-start md:self-center">
          <div className="relative inline-block">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-variant/40"
              id="dateRangeBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
              <span>{dateRange}</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </button>
            {showDateDropdown && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-surface-container-lowest border border-surface-variant/40 shadow-lg py-1 z-30">
                {['Current Cycle', 'Last 4 Weeks', 'All Time'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setDateRange(opt); setShowDateDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-body-sm hover:bg-surface-container-low cursor-pointer ${
                      dateRange === opt ? 'font-bold text-primary bg-primary/10' : 'text-on-surface'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container transition-all active:scale-[0.99] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Dossier PDF</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Strip (Dynamic from real data) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        {/* Metric 1: Overall Readiness */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">target</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Overall Readiness
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
              readiness >= 75 ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {readiness >= 75 ? 'Qualified' : readiness > 0 ? 'In Training' : 'Uncalibrated'}
            </span>
          </div>
          <div>
            <div className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">
              {readiness}%
            </div>
            <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
              <span>{hasAnalysis ? `Calibrated for ${targetRole}` : 'Complete skills assessment'}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Simulations Done */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">terminal</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Simulations Evaluated
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium">
              {latestInterview ? 'Evaluated' : 'Awaiting'}
            </span>
          </div>
          <div>
            <div className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">
              {latestInterview ? '1 Round' : '0 Rounds'}
            </div>
            <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
              <span>{latestInterview ? 'System defense recorded' : 'No interviews taken yet'}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Measured Defense Score */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">pie_chart</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Interview Defense
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              Measured
            </span>
          </div>
          <div>
            <div className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">
              {latestInterview ? (
                <>
                  {latestInterview.overall_score} <span className="font-body-md text-body-md text-outline font-normal">/ 100</span>
                </>
              ) : (
                <span className="text-outline">--</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
              <span>{latestInterview ? 'Objective architectural rubric' : 'Take a simulation to score'}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Cohort Level */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">leaderboard</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Cohort Rating
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-bold">
              {getPercentileLabel(readiness)}
            </span>
          </div>
          <div>
            <div className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">
              {readiness > 0 ? `${profile?.experience_level || 'Junior'}` : 'Uncalibrated'}
            </div>
            <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
              <span>Based on self-reported proficiencies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (7 cols): Gaps & Verified Proofs */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Section: Competency Mastery Breakdown */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                  Competency Breakdown
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {hasAnalysis ? `Evaluated against ${targetRole} benchmarks` : 'Awaiting profile skills'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                {analysis?.critical_gaps?.length || 0} Deficiencies
              </span>
            </div>

            {analysis?.critical_gaps && analysis.critical_gaps.length > 0 ? (
              <div className="space-y-4">
                {analysis.critical_gaps.map((gap, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {gap.name}
                      </span>
                      <span className="text-[12px] font-bold text-tertiary">
                        {gap.delta}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-outline">
                      <span>{gap.candidate}</span>
                      <span>{gap.benchmark}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-outline text-center py-6">
                No competencies evaluated yet. Complete your skills in Career Analyzer.
              </p>
            )}
          </div>

          {/* Section: Real Verified Proof of Mastery from Roadmap */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                  Verified Proof of Mastery
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Completed tasks recorded in your saved execution roadmap
                </p>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                {completedRoadmapTasks.length} Completed
              </span>
            </div>

            {completedRoadmapTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completedRoadmapTasks.map((proof, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveProofModal(proof)}
                    className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        check_circle
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary">
                        PASSED
                      </span>
                    </div>
                    <h3 className="font-label-md text-label-md font-semibold text-on-surface line-clamp-2">
                      {proof.title}
                    </h3>
                    <p className="text-[11px] text-outline mt-1">{proof.phase}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-outline bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-[32px] mb-1">pending_actions</span>
                <p className="font-medium text-body-sm text-on-surface">No tasks completed yet</p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Check off completed tasks in your Skill Gap &amp; Roadmap to record verified proofs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): AI Coach & Next-Week Priority Interventions */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* AI Coach Callout */}
          <div className="p-space-lg rounded-2xl bg-primary/10 border border-primary/20 flex flex-col relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-space-sm mb-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-primary">
                  Navigator Synthesis
                </span>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {targetRole} Trajectory
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface font-medium leading-snug mt-1">
              {analysis?.pro_insight || 'Complete your career assessment to receive your personalized strategic intervention plan.'}
            </p>
            <div className="flex items-center justify-between mt-space-md pt-space-sm border-t border-primary/20 text-[12px]">
              <span className="text-on-surface-variant">Recommended next simulation:</span>
              <button
                type="button"
                onClick={() => onNavigate?.('ai-mock-interview')}
                className="font-semibold text-primary cursor-pointer hover:underline text-right"
              >
                Launch Simulation →
              </button>
            </div>
          </div>

          {/* Next-Week Priority Action Items from real roadmap */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                  Priority Action Items
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Next milestone tasks from your active sprint
                </p>
              </div>
              <span className="font-label-sm text-label-sm text-outline font-semibold">
                {pendingTasks.length} pending
              </span>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-2.5">
                {pendingTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group select-none"
                  >
                    <div
                      onClick={() => handleTogglePriorityTask(task.phaseNumber, task.taskIndex)}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] mt-0.5">
                        check_box_outline_blank
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-outline mt-0.5">
                          {task.phaseSubtitle}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('learning-studio', { topic: task.title, taskTitle: task.title, phaseNumber: task.phaseNumber })}
                      className="px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0 ml-2"
                    >
                      <span>Lab</span>
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-outline text-center py-4">
                No pending tasks remaining in current sprint!
              </p>
            )}

            <button
              onClick={() => onNavigate?.('skill-gap-and-roadmap')}
              className="w-full mt-space-md py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
              <span>Open Execution Roadmap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
