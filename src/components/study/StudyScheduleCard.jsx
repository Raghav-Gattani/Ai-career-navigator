import { useState } from 'react'
import { toggleTask } from '../../api/client'

export default function StudyScheduleCard({ phases = [], onTaskToggle = null, onLaunchLab = null }) {
  const [updatingTaskId, setUpdatingTaskId] = useState(null)

  // Extract pending tasks from active phases
  const pendingTasks = []
  phases.forEach((phase) => {
    const tasks = Array.isArray(phase.tasks) ? phase.tasks : []
    tasks.forEach((task, idx) => {
      if (!task.done) {
        pendingTasks.push({
          phaseNumber: phase.phase_number,
          phaseTitle: phase.phase_title,
          taskIndex: idx,
          title: task.title,
          done: false
        })
      }
    })
  })

  const topTasks = pendingTasks.slice(0, 4)

  const handleToggle = async (phaseNum, taskIdx) => {
    setUpdatingTaskId(`${phaseNum}-${taskIdx}`)
    try {
      if (onTaskToggle) {
        await onTaskToggle(phaseNum, taskIdx)
      } else {
        await toggleTask(phaseNum, taskIdx)
      }
    } catch (err) {
      console.error('Failed to toggle task:', err)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  return (
    <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">checklist</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Roadmap Tasks</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {pendingTasks.length} pending milestone{pendingTasks.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      {topTasks.length === 0 ? (
        <div className="py-6 text-center">
          <span className="material-symbols-outlined text-3xl text-emerald-500 mb-1">
            check_circle
          </span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">All caught up!</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            No pending tasks in current sprint. Generate or update your roadmap.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {topTasks.map((t) => {
            const isUpdating = updatingTaskId === `${t.phaseNumber}-${t.taskIndex}`
            return (
              <div
                key={`${t.phaseNumber}-${t.taskIndex}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-[#202524] border border-slate-100 dark:border-slate-800/80 hover:border-[#00685f]/30 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => handleToggle(t.phaseNumber, t.taskIndex)}
                    disabled={isUpdating}
                    className="text-slate-400 hover:text-[#00685f] transition-colors focus:outline-none flex-shrink-0"
                    title="Mark task completed"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isUpdating ? 'hourglass_top' : 'radio_button_unchecked'}
                    </span>
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {t.phaseTitle}
                    </p>
                  </div>
                </div>

                {onLaunchLab && (
                  <button
                    onClick={() => onLaunchLab(t.title)}
                    className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#00685f] dark:text-[#4a9e95] bg-[#00685f]/10 dark:bg-[#00685f]/20 hover:bg-[#00685f] hover:text-white dark:hover:bg-[#00685f] dark:hover:text-white px-2.5 py-1 rounded-lg transition-colors"
                    title="Open in Learning Studio"
                  >
                    <span>Lab</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
