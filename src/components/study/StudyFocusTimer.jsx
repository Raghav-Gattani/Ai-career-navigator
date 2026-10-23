import { useState, useEffect, useRef } from 'react'
import { recordLearningActivity } from '../../api/client'

// Pleasant Web Audio synthetic notification chime (no external MP3 asset needed)
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15) // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch (e) {
    // AudioContext blocked or unsupported, fail silently
  }
}

export default function StudyFocusTimer({ currentTopic = 'Deep Technical Sprint', onSessionComplete = null, compact = false }) {
  const [mode, setMode] = useState('focus') // 'focus' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60
  const progressPercent = Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100))

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      playChime()
      if (mode === 'focus') {
        setCompletedSessions((s) => s + 1)
        // Record focus session to backend for study streak & activity stats
        recordLearningActivity({
          topic: currentTopic || 'Deep Focus Sprint',
          activity_type: 'focus_session',
          difficulty: 'intermediate',
          score: 100,
          details: { duration_minutes: 25, completed: true }
        }).catch(() => {})
        if (onSessionComplete) onSessionComplete({ topic: currentTopic, durationMinutes: 25 })
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, currentTopic, onSessionComplete])

  const toggle = () => {
    setIsActive(!isActive)
  }

  const reset = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }

  const switchMode = (m) => {
    setMode(m)
    setIsActive(false)
    setTimeLeft(m === 'focus' ? 25 * 60 : 5 * 60)
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')

  // SVG circular ring parameters
  const size = compact ? 88 : 130
  const strokeWidth = compact ? 6 : 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] px-3 py-2 rounded-2xl shadow-sm">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${mode === 'focus' ? 'text-[#00685f]' : 'text-emerald-500'}`}
            />
          </svg>
          <span className="absolute text-sm font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
            {mins}:{secs}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">timer</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {mode === 'focus' ? 'Focus Block' : 'Short Break'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
            {currentTopic}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <button
              onClick={toggle}
              className={`p-1 rounded-lg text-white text-xs flex items-center justify-center ${
                isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#00685f] hover:bg-[#005049]'
              }`}
              title={isActive ? 'Pause' : 'Start'}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isActive ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={reset}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#00685f]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">timer</span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">StudyMate Focus Block</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Pomodoro Interval Engine</p>
          </div>
        </div>
        {completedSessions > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {completedSessions} {completedSessions === 1 ? 'block' : 'blocks'} done
          </span>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="inline-flex p-1 bg-slate-100 dark:bg-[#202524] rounded-xl mb-6">
        <button
          onClick={() => switchMode('focus')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            mode === 'focus'
              ? 'bg-[#00685f] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          25m Focus Sprint
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            mode === 'break'
              ? 'bg-[#4a635f] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          5m Quick Break
        </button>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center mb-6" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${
              mode === 'focus' ? 'text-[#00685f]' : 'text-emerald-500'
            }`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
            {mins}:{secs}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {isActive ? 'In Session' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Target Subject / Topic Indicator */}
      <div className="w-full bg-slate-50 dark:bg-[#202524] border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-xl mb-6 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685f] block">
          Current Objective
        </span>
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
          {currentTopic || 'Architecture & Code Deep Dive'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all transform active:scale-95 ${
            isActive
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              : 'bg-[#00685f] hover:bg-[#005049] shadow-[#00685f]/20'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isActive ? 'pause' : 'play_arrow'}
          </span>
          {isActive ? 'Pause Sprint' : 'Start Focus'}
        </button>
        <button
          onClick={reset}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Reset timer"
        >
          <span className="material-symbols-outlined text-lg">restart_alt</span>
        </button>
      </div>
    </div>
  )
}
