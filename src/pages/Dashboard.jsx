import React from 'react'

export default function Dashboard({ onNavigate, careerData, currentUser, onAnalyze }) {
  const profile = careerData?.profile
  const analysis = careerData?.analysis
  const roadmap = careerData?.roadmap || []
  const latestInterview = careerData?.interview

  const readiness = analysis?.readiness_score ?? profile?.readiness_score ?? 0
  const targetRole = profile?.target_role || ''
  const targetCompany = profile?.target_company || 'Benchmark Bar'
  const matchedCount = analysis?.matched_count ?? 0
  const totalCount = analysis?.total_target_count ?? 0
  const criticalGapsCount = analysis?.critical_gaps_count ?? 0
  const criticalGaps = analysis?.critical_gaps || []
  const velocityHrs = profile?.velocity_hrs ?? 10
  const hasProfile = Boolean(targetRole && analysis)

  // Determine current active roadmap phase
  const activePhase = roadmap.find((p) => p.status === 'active') || roadmap[0]
  const phaseProgress = activePhase ? activePhase.progress_percent : 0
  const activeTask = activePhase?.tasks?.find((t) => !t.done) || activePhase?.tasks?.[0]

  return (
    <div className="flex flex-col w-full space-y-8">
      {/* Top Target Context Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 lg:p-8 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {hasProfile ? 'ACTIVE TRAJECTORY' : 'ONBOARDING'}
              </span>
              {hasProfile ? (
                <>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                    Target: {targetCompany}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Runway: {profile?.runway_weeks || 8} Weeks
                  </span>
                </>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  Profile Incomplete
                </span>
              )}
            </div>

            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              {hasProfile
                ? `Your path to ${targetRole}.`
                : `Welcome, ${currentUser?.name || 'Candidate'}! Let's map your career.`}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {hasProfile
                ? `Track your measured readiness, skill deficiencies, and learning velocity toward ${targetRole} at ${targetCompany}.`
                : 'Select your target career path and enter your current skills to calculate an objective readiness score and generated roadmap.'}
            </p>
          </div>

          {/* Active Module Resume Card */}
          <div className="bg-surface-container-low rounded-xl p-5 lg:p-6 border border-surface-variant/30 min-w-[320px] max-w-md shadow-sm">
            {hasProfile && activePhase ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Current Milestone
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    {phaseProgress}% Complete
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate mb-1">
                  {activePhase.phase_subtitle}
                </p>
                <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${phaseProgress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate mr-2">
                    {activeTask ? activeTask.title : 'Phase 01 Active Sprint'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('skill-gap-and-roadmap')}
                    className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm text-left active:scale-[0.99] flex-shrink-0 cursor-pointer"
                  >
                    <span>View Roadmap</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-label-sm uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  <span>Get Started</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Complete your profile assessment
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Add your skills and experience to baseline your career readiness.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('career-analyzer')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <span>Start Career Assessment</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Card 1: Readiness */}
        <div
          onClick={() => onNavigate?.('career-analyzer')}
          className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
              Career Readiness
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-metric-display text-metric-display text-on-surface">
              {readiness}%
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              {readiness > 0 ? 'Fulfillment Bar' : 'Uncalibrated'}
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {targetRole ? `Bar: ${targetRole}` : 'Select a target career'}
            </span>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              Recalibrate →
            </span>
          </div>
        </div>

        {/* Card 2: Skill Match */}
        <div
          onClick={() => onNavigate?.('skill-gap-and-roadmap')}
          className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
              Skills Matched vs Gap
            </span>
            <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:bg-primary group-hover:text-on-primary transition-all">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-metric-display text-metric-display text-on-surface">
              {matchedCount}
            </span>
            <span className="font-headline-sm text-headline-sm text-outline">
              / {totalCount > 0 ? totalCount : 0} Target
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-error font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>{' '}
              {criticalGapsCount} Deficiencies
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold group-hover:underline">
              View Matrix →
            </span>
          </div>
        </div>

        {/* Card 3: Weekly Dedication */}
        <div
          onClick={() => onNavigate?.('learning-studio')}
          className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
              Weekly Study Goal
            </span>
            <div className="w-9 h-9 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-metric-display text-metric-display text-on-surface">
              {velocityHrs}h
            </span>
            <span className="font-headline-sm text-headline-sm text-outline">
              / week
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Studio allocation
            </span>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">school</span> Practice Lab →
            </span>
          </div>
        </div>

        {/* Card 4: Mock Interview Score */}
        <div
          onClick={() => onNavigate?.('ai-mock-interview')}
          className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
              Latest AI Interview
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container group-hover:bg-primary group-hover:text-on-primary transition-all">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            {latestInterview ? (
              <>
                <span className="font-metric-display text-metric-display text-on-surface">
                  {latestInterview.overall_score}
                </span>
                <span className="font-headline-sm text-headline-sm text-outline">/ 100</span>
              </>
            ) : (
              <span className="font-headline-lg text-headline-lg text-outline font-bold">
                Not Taken
              </span>
            )}
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[150px]">
              {latestInterview ? latestInterview.scenario_title : 'Architecture Defense'}
            </span>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary/10 text-primary font-bold tracking-tight group-hover:underline">
              {latestInterview ? 'Retake →' : 'Start Sim →'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Asymmetric 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Priority Skill Gaps */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Priority Skill Gaps
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {hasProfile
                    ? `Deficiencies identified against ${targetRole} benchmarks`
                    : 'Complete your profile to see your personalized career skill gaps'}
                </p>
              </div>
              {hasProfile && (
                <button
                  type="button"
                  onClick={() => onNavigate?.('skill-gap-and-roadmap')}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto text-left cursor-pointer"
                >
                  <span>View Roadmap Matrix</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              )}
            </div>

            {criticalGaps.length > 0 ? (
              <div className="space-y-4">
                {criticalGaps.slice(0, 3).map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-space-md rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-md"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">
                          {gap.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                            gap.urgency?.includes('P0')
                              ? 'bg-error/10 text-error'
                              : 'bg-tertiary-fixed text-tertiary'
                          }`}
                        >
                          {gap.urgency || 'Critical Priority'}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-md text-body-sm">
                        <span className="text-on-surface-variant">{gap.candidate}</span>
                        <span className="text-outline">→</span>
                        <span className="text-on-surface-variant">{gap.benchmark}</span>
                        <span className="text-error font-medium">({gap.delta} Delta)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-sm flex-shrink-0 self-end md:self-center">
                      <button
                        onClick={() => onNavigate?.('learning-studio', { topic: gap.name || gap.skill, taskTitle: gap.name })}
                        className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>Practice Lab</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">
                  fact_check
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  No gaps evaluated yet
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-md">
                  Select a target career and enter your current skills to calculate your real competency gaps.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('career-analyzer')}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container cursor-pointer"
                >
                  Configure Skills in Career Analyzer
                </button>
              </div>
            )}
          </div>

          {/* Weekly Learning Activity Chart */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Weekly Study Cadence
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Target pace: {velocityHrs} hours per week ({(velocityHrs / 7).toFixed(1)}h/day)
                </p>
              </div>
              <div className="flex items-center gap-space-sm self-start sm:self-auto">
                <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span> Allocated Target
                </span>
              </div>
            </div>

            <div className="w-full">
              <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 180">
                <line stroke="#dee4e1" strokeDasharray="3,3" strokeWidth="1" x1="40" x2="680" y1="40" y2="40"></line>
                <line stroke="#dee4e1" strokeDasharray="3,3" strokeWidth="1" x1="40" x2="680" y1="90" y2="90"></line>
                <line stroke="#bcc9c6" strokeWidth="1" x1="40" x2="680" y1="140" y2="140"></line>

                <text fill="#6d7a77" fontSize="10" textAnchor="end" x="30" y="44">4h</text>
                <text fill="#6d7a77" fontSize="10" textAnchor="end" x="30" y="94">2h</text>
                <text fill="#6d7a77" fontSize="10" textAnchor="end" x="30" y="144">0h</text>

                {/* Target line */}
                <line stroke="#008378" strokeDasharray="4,4" strokeWidth="1.5" x1="40" x2="680" y1="100" y2="100"></line>
                <text fill="#00685f" fontSize="9" fontWeight="600" textAnchor="end" x="675" y="94">
                  TARGET: {(velocityHrs / 7).toFixed(1)}h/day
                </text>

                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const x = 70 + idx * 86
                  return (
                    <g key={day}>
                      <rect
                        fill="#eaefed"
                        height="40"
                        rx="4"
                        width="48"
                        x={x}
                        y="100"
                        className="hover:fill-primary/60 transition-colors"
                      ></rect>
                      <text fill="#3d4947" fontSize="11" textAnchor="middle" x={x + 24} y="160">
                        {day}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recommended Next Action */}
          <div className="bg-primary/10 rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center gap-space-xs text-primary mb-2">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Recommended Action
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
              {hasProfile && criticalGaps[0]
                ? `Remediate ${criticalGaps[0].name}`
                : 'Select Career Path & Baseline Skills'}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              {hasProfile && criticalGaps[0]
                ? criticalGaps[0].action
                : 'Complete your profile setup to generate your active sprint roadmap and technical simulations.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.(hasProfile ? 'learning-studio' : 'career-analyzer', hasProfile && criticalGaps[0] ? { topic: criticalGaps[0].name || criticalGaps[0].skill, taskTitle: criticalGaps[0].name } : null)}
              className="w-full py-2.5 px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <span>{hasProfile ? 'Launch Practice Lab' : 'Configure Profile'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Real Roadmap Milestones */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Execution Milestones
              </h2>
              <span className="font-label-sm text-label-sm text-outline font-medium">
                {roadmap.length} Phases
              </span>
            </div>

            {roadmap.length > 0 ? (
              <div className="space-y-4">
                {roadmap.map((phase) => (
                  <div key={phase.phase_number} className="flex gap-space-sm items-start">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold flex-shrink-0 mt-0.5 ${
                        phase.progress_percent > 0
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {phase.phase_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate text-[14px]">
                          {phase.phase_subtitle}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-label-sm text-label-sm text-[11px] font-semibold ${
                            phase.progress_percent > 0
                              ? 'bg-primary/10 text-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {phase.progress_percent}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${phase.progress_percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-outline text-center py-4">
                Milestones will appear once your career roadmap is generated.
              </p>
            )}
          </div>

          {/* Recent Mock Interview Results Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                AI Mock Evaluation
              </h2>
              <button
                type="button"
                onClick={() => onNavigate?.('ai-mock-interview')}
                className="font-label-sm text-label-sm text-primary font-semibold hover:underline text-left cursor-pointer"
              >
                {latestInterview ? 'Retake' : 'Start'}
              </button>
            </div>

            {latestInterview ? (
              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                    {latestInterview.scenario_title}
                  </p>
                  <p className="font-body-sm text-body-sm text-outline line-clamp-1">
                    {latestInterview.critique_summary}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {latestInterview.overall_score}
                  </span>
                  <span className="text-[11px] text-outline block">/ 100</span>
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-outline text-center py-4">
                No simulated interviews completed yet. Test your technical systems defense.
              </p>
            )}

            <div className="mt-space-md pt-space-xs">
              <button
                type="button"
                onClick={() => onNavigate?.('ai-mock-interview')}
                className="w-full py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors flex items-center justify-center gap-1 active:scale-[0.99] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                <span>Launch Mock Interview Simulation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
