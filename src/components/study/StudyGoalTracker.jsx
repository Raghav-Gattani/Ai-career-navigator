import { useState, useEffect } from 'react'
import { fetchStudyStats } from '../../api/client'

export default function StudyGoalTracker({ refreshKey = 0 }) {
  const [stats, setStats] = useState({
    current_streak: 0,
    activities_today: 0,
    daily_goal: 3,
    total_sessions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadStats() {
      try {
        const res = await fetchStudyStats()
        if (isMounted && res?.stats) {
          setStats(res.stats)
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadStats()
    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const { current_streak, activities_today, daily_goal, total_sessions } = stats
  const goalPercent = Math.min(100, Math.round((activities_today / (daily_goal || 3)) * 100))
  const isGoalReached = activities_today >= daily_goal

  return (
    <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">local_fire_department</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Streak & Goals</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">StudyMate Continuous Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-[16px] text-orange-600 animate-pulse">local_fire_department</span>
          <span className="text-xs font-black text-orange-700 dark:text-orange-400">
            {current_streak} {current_streak === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      {/* Daily Target Progress */}
      <div className="bg-slate-50 dark:bg-[#202524] rounded-xl p-3 border border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">flag</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Daily Milestones</span>
          </div>
          <span className="text-xs font-bold text-[#00685f]">
            {activities_today} / {daily_goal} Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isGoalReached ? 'bg-emerald-500' : 'bg-[#00685f]'
            }`}
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isGoalReached
              ? '🎉 Daily study target unlocked!'
              : `${Math.max(0, daily_goal - activities_today)} more sprint${daily_goal - activities_today === 1 ? '' : 's'} to hit daily goal`}
          </span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {goalPercent}%
          </span>
        </div>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-slate-50/70 dark:bg-[#202524]/70 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5">
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {total_sessions}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Labs & Sessions</p>
        </div>
        <div className="bg-slate-50/70 dark:bg-[#202524]/70 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5">
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {activities_today > 0 ? 'Active' : 'Pending'}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Today's Status</p>
        </div>
      </div>
    </div>
  )
}
