import React, { useState, useEffect, useMemo } from 'react'
import SimulationRegistry from '../components/simulations/SimulationRegistry'
import ErrorBoundary from '../components/common/ErrorBoundary'
import StudyFocusTimer from '../components/study/StudyFocusTimer'
import {
  generateSimulation,
  saveSimulation,
  fetchSavedSimulations,
  deleteSavedSimulation,
  recordLearningActivity,
  fetchLearningHistory,
  fetchSuggestedTopics,
  completeRoadmapTask
} from '../api/client'

export default function LearningStudio({ onNavigate, showNotification, careerData, navigationParams }) {
  const profile = careerData?.profile
  const targetRole = profile?.target_role || 'Full-Stack Developer'

  // Topic search & generation state
  const [topicInput, setTopicInput] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate') // 'beginner' | 'intermediate' | 'advanced'
  const [isLoading, setIsLoading] = useState(false)
  const [activeSpec, setActiveSpec] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Suggested career topics & gaps
  const [suggestedTopics, setSuggestedTopics] = useState([])
  const [savedSimulations, setSavedSimulations] = useState([])
  const [learningHistory, setLearningHistory] = useState([])

  // Side view / drawer: 'simulation' | 'library' | 'history'
  const [activeView, setActiveView] = useState('simulation')

  // Practice Quiz / Checkpoint state
  const [selectedOption, setSelectedOption] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(null)

  // Linked roadmap task completion state
  const [linkedTaskCompleted, setLinkedTaskCompleted] = useState(false)
  const [isCompletingTask, setIsCompletingTask] = useState(false)
  const [showTimer, setShowTimer] = useState(false)

  // Critical gaps from profile for smart suggestions
  const criticalGaps = useMemo(() => {
    return careerData?.analysis?.critical_gaps || []
  }, [careerData])

  // Load initial suggested topics & library
  useEffect(() => {
    async function loadInitial() {
      try {
        const topicsRes = await fetchSuggestedTopics(targetRole)
        if (topicsRes && topicsRes.topics) {
          setSuggestedTopics(topicsRes.topics)
        }
      } catch (e) {
        console.warn('Suggested topics fetch error:', e.message)
      }

      try {
        const savedRes = await fetchSavedSimulations()
        if (savedRes && savedRes.saved_simulations) {
          setSavedSimulations(savedRes.saved_simulations)
        }
      } catch (e) {
        console.warn('Saved simulations fetch error:', e.message)
      }

      try {
        const historyRes = await fetchLearningHistory(10)
        if (historyRes && historyRes.history) {
          setLearningHistory(historyRes.history)
        }
      } catch (e) {
        console.warn('Learning history fetch error:', e.message)
      }
    }
    loadInitial()
  }, [targetRole])

  // Only auto-generate if explicitly launched with topic from another screen
  useEffect(() => {
    if (navigationParams?.topic) {
      setTopicInput(navigationParams.topic)
      handleGenerate(navigationParams.topic)
    }
  }, [navigationParams])

  const handleGenerate = async (topicToUse) => {
    const query = (topicToUse || topicInput).trim()
    if (!query) {
      setErrorMsg('Please enter a topic to visualize.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')
    setSelectedOption(null)
    setQuizSubmitted(false)
    setQuizScore(null)
    setLinkedTaskCompleted(false)

    try {
      const res = await generateSimulation({
        topic: query,
        difficulty,
        career_context: targetRole
      })

      if (res && res.spec) {
        setActiveSpec(res.spec)
        setActiveView('simulation')
        // Refresh history
        const hRes = await fetchLearningHistory(10)
        if (hRes && hRes.history) setLearningHistory(hRes.history)
      } else {
        setErrorMsg('Failed to generate simulation. Please check your topic or try a preset.')
      }
    } catch (err) {
      console.error('Simulation generation error:', err)
      setErrorMsg(err.message || 'Simulation generation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToLibrary = async () => {
    if (!activeSpec) return
    try {
      const res = await saveSimulation({
        topic: activeSpec.topic,
        normalized_topic: activeSpec.normalized_topic,
        concept_category: activeSpec.concept_category,
        renderer_type: activeSpec.renderer_type,
        difficulty: activeSpec.difficulty || difficulty,
        spec: activeSpec,
        notes: `Saved from Learning Studio for role ${targetRole}`
      })
      if (res && res.success) {
        showNotification?.(`"${activeSpec.topic}" saved to your personal library!`)
        const savedRes = await fetchSavedSimulations()
        if (savedRes && savedRes.saved_simulations) {
          setSavedSimulations(savedRes.saved_simulations)
        }
      }
    } catch (err) {
      showNotification?.('Failed to save simulation: ' + err.message, 'error')
    }
  }

  const handleDeleteSaved = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteSavedSimulation(id)
      setSavedSimulations(prev => prev.filter(s => s.id !== id))
      showNotification?.('Simulation removed from library.')
    } catch (err) {
      showNotification?.('Failed to delete simulation: ' + err.message, 'error')
    }
  }

  const handleLoadSaved = (savedItem) => {
    setActiveSpec(savedItem.spec)
    setTopicInput(savedItem.topic)
    setActiveView('simulation')
    setSelectedOption(null)
    setQuizSubmitted(false)
    showNotification?.(`Loaded "${savedItem.topic}" from library!`)
  }

  const handleActionLog = async (logItem) => {
    try {
      await recordLearningActivity({
        topic: activeSpec?.topic || topicInput,
        activity_type: 'interaction',
        difficulty,
        details: logItem
      })
    } catch (e) {
      // background telemetry
    }
  }

  const handleVerifyQuiz = async () => {
    if (selectedOption === null || !activeSpec?.practice_exercise) return
    const exercise = activeSpec.practice_exercise
    const opts = exercise.options || []
    const selectedOpt = opts[selectedOption]
    const isCorrect = typeof selectedOpt === 'object' && selectedOpt !== null && selectedOpt.correct !== undefined
      ? Boolean(selectedOpt.correct)
      : selectedOption === exercise.correct_index

    const score = isCorrect ? 100 : 0
    setQuizSubmitted(true)
    setQuizScore(isCorrect)

    try {
      await recordLearningActivity({
        topic: activeSpec.topic,
        activity_type: 'quiz_completed',
        difficulty,
        score,
        details: { question: exercise.question, selectedOption, isCorrect }
      })
      const hRes = await fetchLearningHistory(10)
      if (hRes && hRes.history) setLearningHistory(hRes.history)
    } catch (e) {
      console.warn('Failed to record quiz activity:', e)
    }
  }

  const handleCompleteLinkedTask = async () => {
    const taskTitle = navigationParams?.taskTitle || activeSpec?.topic
    if (!taskTitle) return

    setIsCompletingTask(true)
    try {
      const res = await completeRoadmapTask({
        task_title: taskTitle,
        phase_number: navigationParams?.phaseNumber,
        topic: activeSpec?.topic
      })
      if (res && res.updated) {
        setLinkedTaskCompleted(true)
        showNotification?.(`Roadmap task "${taskTitle}" marked completed!`)
      } else {
        showNotification?.('Task completed in Learning Studio!', 'info')
        setLinkedTaskCompleted(true)
      }
    } catch (err) {
      showNotification?.('Failed to update task: ' + err.message, 'error')
    } finally {
      setIsCompletingTask(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
      {/* Top Meta / Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-md mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold tracking-wide uppercase">
              {targetRole}
            </span>
            <span className="text-outline text-label-sm">•</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Interactive Simulation Engine
            </span>
            <span className="text-outline text-label-sm">•</span>
            <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Engine Online (SQLite + Gemini)
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Learning Studio: Visual Simulation Engine
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            Hands-on architecture and algorithm simulator. Calibrate parameters in real-time, inspect invariants, and verify technical comprehension.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-surface-variant/40">
          <button
            type="button"
            onClick={() => setActiveView('simulation')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'simulation'
                ? 'bg-surface text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Simulation Lab</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('library')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'library'
                ? 'bg-surface text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bookmarks</span>
            <span>Saved Library ({savedSimulations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'history'
                ? 'bg-surface text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Activity Log ({learningHistory.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTimer(!showTimer)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              showTimer
                ? 'bg-[#00685f] text-white shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="Toggle Pomodoro Focus Timer"
          >
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span>Focus Block</span>
          </button>
        </div>
      </div>

      {/* Focus Timer Docked Widget */}
      {showTimer && (
        <div className="mb-6 p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1">
            <StudyFocusTimer
              currentTopic={activeSpec?.topic || topicInput || 'Visual Lab Sprint'}
              compact={true}
              onSessionComplete={() => {
                showNotification?.('25m Focus Sprint completed! Activity recorded.')
                fetchLearningHistory(20).then((res) => res && setLearningHistory(res.history || []))
              }}
            />
          </div>
          <button
            onClick={() => setShowTimer(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 cursor-pointer"
            title="Hide Timer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Prominent Topic Input Ribbon */}
      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[22px]">
              search
            </span>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="What do you want to learn or visualize? (e.g. Binary Search, Binary Search Tree, TCP Handshake, SQL INNER JOIN, Neural Network...)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 border border-outline-variant/30 transition-all"
            />
          </div>

          {/* Difficulty Pills */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  difficulty === lvl
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isLoading || !topicInput.trim()}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Spec...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>Generate Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Topics & Skill Gaps Ribbon */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-variant/30">
          <span className="text-xs font-semibold text-on-surface-variant mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">tips_and_updates</span>
            Suggested for {targetRole}:
          </span>

          {suggestedTopics.map((top) => {
            const isCriticalGap = criticalGaps.some(g => (g.name || g.skill || '').toLowerCase().includes(top.toLowerCase()))
            return (
              <button
                key={top}
                type="button"
                onClick={() => {
                  setTopicInput(top)
                  handleGenerate(top)
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCriticalGap
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30'
                }`}
              >
                {isCriticalGap && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />}
                <span>{top}</span>
                {isCriticalGap && <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase">Gap</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MAIN VIEW: SIMULATION LAB */}
      {activeView === 'simulation' && (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 animate-pulse">
                <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Synthesizing Interactive Simulation</h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md">
                Constructing validated algorithm parameters, state machines, and mathematical models for <strong className="text-primary">{topicInput}</strong>...
              </p>
            </div>
          )}

          {/* Stable Empty State (When no simulation is selected yet) */}
          {!isLoading && !activeSpec && (
            <div className="p-8 lg:p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col items-center text-center max-w-4xl mx-auto my-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-3xl">model_training</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">
                Interactive Visual Simulation Engine
              </h2>
              <p className="text-xs text-on-surface-variant mt-1.5 max-w-xl leading-relaxed">
                Enter any CS concept above or launch one of our dedicated, interactive simulation sandboxes calibrated for {targetRole}.
              </p>

              {/* Quick Starter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 w-full mt-8 text-left">
                {[
                  { title: 'Binary Search', cat: 'Array Algorithm', desc: 'Divide-and-conquer low, mid, and high pointers with O(log n) lookups.', icon: 'manage_search' },
                  { title: 'Binary Search Tree', cat: 'Data Structure', desc: 'Interactive node insertion, search path, and tree balancing.', icon: 'account_tree' },
                  { title: 'TCP Three-Way Handshake', cat: 'Networking', desc: 'Packet timeline, SYN / SYN-ACK / ACK sequence math.', icon: 'sync_alt' },
                  { title: 'SQL INNER JOIN', cat: 'Databases', desc: 'Side-by-side relational table matching and NULL handling.', icon: 'table_view' },
                  { title: 'Neural Network Forward Propagation', cat: 'AI / Machine Learning', desc: 'Live weights, matrix dot-products, ReLU, and Sigmoid activations.', icon: 'hub' },
                  { title: 'CSS Flexbox & Grid', cat: 'Frontend', desc: 'Real-time box model sandbox, alignment controls, and live CSS export.', icon: 'view_quilt' },
                ].map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => {
                      setTopicInput(card.title)
                      handleGenerate(card.title)
                    }}
                    className="p-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low hover:border-primary/50 hover:bg-surface-container transition-all flex flex-col justify-between gap-3 group text-left cursor-pointer shadow-xs"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">{card.icon}</span>
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold">{card.cat}</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors mt-2">
                        {card.title}
                      </span>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-primary flex items-center gap-1 pt-1">
                      <span>Launch Lab</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Simulation View */}
          {!isLoading && activeSpec && (
            <div className="flex flex-col gap-6">
              {/* Active Simulation Header Card */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary font-mono">
                      {activeSpec.concept_category || 'Concept Simulation'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize bg-secondary-container text-on-secondary-container font-mono">
                      {activeSpec.difficulty || difficulty}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                      activeSpec.source === 'real_gemini_ai'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      <span className="material-symbols-outlined text-[13px]">
                        {activeSpec.source === 'real_gemini_ai' ? 'auto_awesome' : 'tune'}
                      </span>
                      <span>{activeSpec.source === 'real_gemini_ai' ? 'Gemini AI Verified' : 'Calibrated Engine'}</span>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface tracking-tight mt-1">{activeSpec.topic}</h2>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">{activeSpec.summary}</p>
                </div>

                {/* Actions: Save & Linked Task */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border border-outline-variant/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">bookmark_add</span>
                    <span>Save to Library</span>
                  </button>

                  {navigationParams?.taskTitle && (
                    <button
                      type="button"
                      onClick={handleCompleteLinkedTask}
                      disabled={linkedTaskCompleted || isCompletingTask}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        linkedTaskCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-primary text-white hover:bg-primary-hover'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {linkedTaskCompleted ? 'check_circle' : 'task_alt'}
                      </span>
                      <span>{linkedTaskCompleted ? 'Linked Task Completed!' : 'Mark Roadmap Task Done'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Canvas & Simulation Core Protected by ErrorBoundary */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">play_circle</span>
                    Interactive Simulation Canvas
                  </span>
                  <span className="text-[11px] font-mono text-on-surface-variant">
                    Renderer: <strong className="text-primary">{activeSpec.renderer_type}</strong>
                  </span>
                </div>

                <ErrorBoundary title="Simulation Render Error" onReset={() => setActiveSpec(null)}>
                  <SimulationRegistry spec={activeSpec} onActionLog={handleActionLog} />
                </ErrorBoundary>
              </div>

              {/* Deep-Dive Steps & Practice Exercise Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Step-by-Step Breakdown */}
                <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">format_list_numbered</span>
                      Algorithmic Invariants & Step Breakdown
                    </span>
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      {(activeSpec.steps || []).length} phases
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(activeSpec.steps || []).map((step, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 text-xs">
                        <div className="flex items-center gap-2 font-bold text-on-surface">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-mono font-bold">
                            {step.step || idx + 1}
                          </span>
                          <span>{step.title || step.action || `Phase ${idx + 1}`}</span>
                        </div>
                        <p className="text-on-surface-variant mt-1.5 pl-7 text-[11px] leading-relaxed">
                          {step.desc || step.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Exercise Checkpoint */}
                <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">quiz</span>
                        Knowledge Checkpoint
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                        Interactive
                      </span>
                    </div>

                    {activeSpec.practice_exercise ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-medium text-on-surface leading-relaxed">
                          {activeSpec.practice_exercise.question}
                        </p>

                        <div className="space-y-2">
                          {(activeSpec.practice_exercise.options || []).map((opt, oIdx) => {
                            const isSelected = selectedOption === oIdx
                            const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || opt?.id || String(opt))
                            const isThisCorrect = typeof opt === 'object' && opt !== null && opt.correct !== undefined
                              ? Boolean(opt.correct)
                              : oIdx === activeSpec.practice_exercise.correct_index

                            let btnStyle = 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'

                            if (quizSubmitted) {
                              if (isThisCorrect) {
                                btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200'
                              } else if (isSelected) {
                                btnStyle = 'bg-error/15 border-error text-error font-medium'
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-primary/10 border-primary text-primary font-bold'
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => !quizSubmitted && setSelectedOption(oIdx)}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{optText}</span>
                                {quizSubmitted && isThisCorrect && (
                                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant italic">No practice quiz for this simulation.</p>
                    )}
                  </div>

                  {/* Quiz Submit & Explanation */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-surface-variant/30">
                    {quizSubmitted ? (
                      <div className="p-3 rounded-xl bg-surface-variant/40 border border-outline-variant/30 text-xs">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <span className={`material-symbols-outlined text-base ${quizScore ? 'text-emerald-600' : 'text-error'}`}>
                            {quizScore ? 'verified' : 'cancel'}
                          </span>
                          <span className={quizScore ? 'text-emerald-600' : 'text-error'}>
                            {quizScore ? 'Correct! Excellent comprehension.' : 'Incorrect answer.'}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {activeSpec.practice_exercise?.explanation}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVerifyQuiz}
                        disabled={selectedOption === null}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-label-md text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                      >
                        Verify Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW: SAVED SIMULATION LIBRARY */}
      {activeView === 'library' && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">bookmarks</span>
              My Saved Simulations Library
            </span>
            <span className="text-xs font-mono text-on-surface-variant">{savedSimulations.length} saved</span>
          </div>

          {savedSimulations.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">bookmark_border</span>
              <p className="text-sm font-medium">Your library is currently empty.</p>
              <p className="text-xs text-on-surface-variant/80 mt-1">
                Generate simulations and click "Save to Library" to preserve them in your workspace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSimulations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadSaved(item)}
                  className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low hover:border-primary/50 hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-sm"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary font-mono">
                        {item.concept_category || item.renderer_type}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className="p-1 text-on-surface-variant/60 hover:text-error hover:bg-error/10 rounded transition-colors"
                        title="Delete from library"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors mt-1">
                      {item.topic}
                    </div>
                    <div className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                      {item.notes || item.spec?.summary || 'Interactive visual simulation'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant pt-2 border-t border-outline-variant/20">
                    <span>Difficulty: <strong className="capitalize">{item.difficulty}</strong></span>
                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      Load Lab <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: LEARNING ACTIVITY HISTORY */}
      {activeView === 'history' && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">history</span>
              Learning Activity Timeline
            </span>
            <span className="text-xs font-mono text-on-surface-variant">{learningHistory.length} events logged</span>
          </div>

          {learningHistory.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">timeline</span>
              <p className="text-sm font-medium">No learning activities recorded yet.</p>
              <p className="text-xs text-on-surface-variant/80 mt-1">
                Interact with simulations, answer practice checkpoints, and complete roadmap tasks to record progress.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {learningHistory.map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[18px]">
                        {act.activity_type === 'quiz_completed'
                          ? 'quiz'
                          : act.activity_type === 'completed_task'
                          ? 'task_alt'
                          : act.activity_type === 'saved'
                          ? 'bookmark'
                          : 'visibility'}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{act.topic}</div>
                      <div className="text-[11px] text-on-surface-variant">
                        Action: <span className="capitalize font-mono font-medium">{act.activity_type.replace('_', ' ')}</span>
                        {act.score > 0 && ` • Score: ${act.score}%`}
                        {act.roadmap_task_title && ` • Task: ${act.roadmap_task_title}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-on-surface-variant whitespace-nowrap">
                    {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
