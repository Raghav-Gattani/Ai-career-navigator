import React, { useState } from 'react'

export default function StackQueueRenderer({ spec, onActionLog }) {
  const [mode, setMode] = useState('stack') // 'stack' | 'queue'
  const [items, setItems] = useState(['Task #1', 'Task #2', 'Task #3'])
  const [inputVal, setInputVal] = useState('')
  const [recentAction, setRecentAction] = useState('Initialized with 3 elements')

  const handlePushEnqueue = () => {
    const val = inputVal.trim() || `Task #${items.length + 1}`
    if (items.length >= 7) {
      setRecentAction('Capacity limit reached (Max 7 elements to keep visual clear)')
      return
    }

    if (mode === 'stack') {
      // Push onto top of stack
      setItems([...items, val])
      setRecentAction(`Pushed "${val}" to TOP of Stack (LIFO: Last-In First-Out)`)
    } else {
      // Enqueue to back of queue
      setItems([...items, val])
      setRecentAction(`Enqueued "${val}" to BACK of Queue (FIFO: First-In First-Out)`)
    }
    setInputVal('')

    if (onActionLog) {
      onActionLog({ action: mode === 'stack' ? 'push' : 'enqueue', value: val, count: items.length + 1 })
    }
  }

  const handlePopDequeue = () => {
    if (items.length === 0) {
      setRecentAction(`Underflow: Cannot pop from empty ${mode}!`)
      return
    }

    if (mode === 'stack') {
      const popped = items[items.length - 1]
      const remaining = items.slice(0, -1)
      setItems(remaining)
      setRecentAction(`Popped "${popped}" from TOP of Stack`)
    } else {
      const dequeued = items[0]
      const remaining = items.slice(1)
      setItems(remaining)
      setRecentAction(`Dequeued "${dequeued}" from FRONT of Queue`)
    }

    if (onActionLog) {
      onActionLog({ action: mode === 'stack' ? 'pop' : 'dequeue', remainingCount: items.length - 1 })
    }
  }

  const handleClear = () => {
    setItems([])
    setRecentAction(`Cleared all elements`)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Mode Switcher & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('stack')
              setRecentAction('Switched to Stack Mode (LIFO)')
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'stack'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-sm">layers</span>
            Stack (LIFO)
          </button>
          <button
            onClick={() => {
              setMode('queue')
              setRecentAction('Switched to Queue Mode (FIFO)')
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'queue'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_stream</span>
            Queue (FIFO)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={mode === 'stack' ? 'Item to Push...' : 'Item to Enqueue...'}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePushEnqueue()}
            className="w-44 px-3 py-1.5 text-xs bg-white dark:bg-surface-dark border border-outline-variant rounded-xl font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handlePushEnqueue}
            className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {mode === 'stack' ? 'Push (Top)' : 'Enqueue (Back)'}
          </button>
          <button
            onClick={handlePopDequeue}
            className="px-3.5 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
            {mode === 'stack' ? 'Pop (Top)' : 'Dequeue (Front)'}
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-lg transition-colors"
            title="Clear all"
          >
            <span className="material-symbols-outlined text-base">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Visual Container Stage */}
      <div className="relative w-full min-h-[300px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 p-6 flex flex-col items-center justify-center overflow-hidden shadow-inner">
        {mode === 'stack' ? (
          /* Stack: Vertical Tube */
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono font-bold text-primary mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">vertical_align_bottom</span>
              TOP OF STACK (Push / Pop entry)
            </div>

            <div className="w-64 min-h-[200px] p-2 border-x-4 border-b-4 border-primary/50 bg-surface-variant/20 rounded-b-2xl flex flex-col-reverse gap-2 shadow-sm">
              {items.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-on-surface-variant/60 font-mono italic">
                  [Stack is Empty]
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`py-2.5 px-4 rounded-xl border text-center font-mono text-xs font-bold transition-all shadow-sm ${
                      idx === items.length - 1
                        ? 'bg-primary text-white border-primary shadow'
                        : 'bg-white dark:bg-surface-dark text-on-surface border-outline-variant/50'
                    }`}
                  >
                    {item} {idx === items.length - 1 && <span className="text-[10px] ml-1 bg-white/20 px-1 rounded">TOP</span>}
                  </div>
                ))
              )}
            </div>

            <div className="text-[11px] font-mono text-on-surface-variant/70 mt-2">
              CLOSED BOTTOM (Base)
            </div>
          </div>
        ) : (
          /* Queue: Horizontal Pipe */
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-between w-full max-w-xl text-xs font-mono mb-2">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">output</span>
                FRONT (Dequeue output)
              </span>
              <span className="text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">input</span>
                BACK (Enqueue input)
              </span>
            </div>

            <div className="w-full max-w-xl min-h-[90px] border-y-4 border-primary/50 bg-surface-variant/20 rounded-xl p-3 flex items-center gap-3 overflow-x-auto shadow-sm">
              {items.length === 0 ? (
                <div className="w-full text-center text-xs text-on-surface-variant/60 font-mono italic">
                  [Queue is Empty]
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 py-3 px-4 rounded-xl border text-center font-mono text-xs font-bold transition-all shadow-sm ${
                      idx === 0
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : idx === items.length - 1
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-surface-dark text-on-surface border-outline-variant/50'
                    }`}
                  >
                    <div>{item}</div>
                    <div className="text-[9px] mt-0.5 opacity-80 uppercase tracking-wider">
                      {idx === 0 ? 'Front' : idx === items.length - 1 ? 'Back' : `Pos ${idx}`}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-[11px] font-mono text-on-surface-variant/70 mt-2">
              Direction of flow: Left to Right (First in line leaves first)
            </div>
          </div>
        )}
      </div>

      {/* Real-time Status Banner */}
      <div className="p-3 bg-surface-variant/50 rounded-xl border border-outline-variant/30 text-xs font-mono text-on-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">history</span>
          <span>{recentAction}</span>
        </div>
        <span className="text-on-surface-variant">Size: <strong>{items.length}</strong> / 7</span>
      </div>
    </div>
  )
}
