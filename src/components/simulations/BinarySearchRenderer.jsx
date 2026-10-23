import React, { useState, useMemo } from 'react'

const DEFAULT_ARRAY = [12, 18, 24, 33, 45, 55, 62, 70, 85, 94]

export default function BinarySearchRenderer({ spec, onActionLog }) {
  const array = useMemo(() => {
    return spec?.initial_data?.sorted_array || DEFAULT_ARRAY
  }, [spec])

  const [targetInput, setTargetInput] = useState('45')
  const [target, setTarget] = useState(45)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(DEFAULT_ARRAY.length - 1)
  const [mid, setMid] = useState(Math.floor((0 + DEFAULT_ARRAY.length - 1) / 2))
  const [searchState, setSearchState] = useState('idle') // 'idle' | 'searching' | 'found' | 'not_found'
  const [stepsCount, setStepsCount] = useState(0)
  const [stepExplanation, setStepExplanation] = useState('Enter a target number and click "Start Search" to trace the divide-and-conquer search window.')

  const maxComparisons = useMemo(() => {
    return Math.floor(Math.log2(array.length)) + 1
  }, [array])

  const handleStartSearch = (val) => {
    const t = Number(val !== undefined ? val : targetInput)
    if (isNaN(t)) return

    const initialLow = 0
    const initialHigh = array.length - 1
    const initialMid = Math.floor((initialLow + initialHigh) / 2)

    setTarget(t)
    setLow(initialLow)
    setHigh(initialHigh)
    setMid(initialMid)
    setStepsCount(1)

    const midVal = array[initialMid]
    if (midVal === t) {
      setSearchState('found')
      setStepExplanation(`Step 1: Computed mid = floor((0 + ${initialHigh}) / 2) = ${initialMid}. arr[${initialMid}] == ${t}. FOUND immediately on first comparison! O(1) best case.`)
    } else if (t < midVal) {
      setSearchState('searching')
      setStepExplanation(`Step 1: Computed mid = ${initialMid} (value ${midVal}). Target ${t} < ${midVal}, so search space narrows to left subarray: high will become ${initialMid - 1}.`)
    } else {
      setSearchState('searching')
      setStepExplanation(`Step 1: Computed mid = ${initialMid} (value ${midVal}). Target ${t} > ${midVal}, so search space narrows to right subarray: low will become ${initialMid + 1}.`)
    }

    if (onActionLog) {
      onActionLog({ action: 'binary_search_start', target: t, arrayLength: array.length })
    }
  }

  const handleNextStep = () => {
    if (searchState !== 'searching') return

    const midVal = array[mid]
    let newLow = low
    let newHigh = high

    if (target < midVal) {
      newHigh = mid - 1
    } else {
      newLow = mid + 1
    }

    if (newLow > newHigh) {
      setSearchState('not_found')
      setLow(newLow)
      setHigh(newHigh)
      setStepExplanation(`Search completed: low (${newLow}) > high (${newHigh}). Target ${target} does not exist in the sorted array.`)
      return
    }

    const newMid = Math.floor((newLow + newHigh) / 2)
    const newMidVal = array[newMid]
    const nextStep = stepsCount + 1

    setLow(newLow)
    setHigh(newHigh)
    setMid(newMid)
    setStepsCount(nextStep)

    if (newMidVal === target) {
      setSearchState('found')
      setStepExplanation(`Step ${nextStep}: Computed mid = ${newMid}. arr[${newMid}] = ${newMidVal} == target ${target}. TARGET FOUND in ${nextStep} comparison(s)!`)
    } else if (target < newMidVal) {
      setStepExplanation(`Step ${nextStep}: Evaluated mid index ${newMid} (value ${newMidVal}). Target ${target} < ${newMidVal} → Narrow search to left half.`)
    } else {
      setStepExplanation(`Step ${nextStep}: Evaluated mid index ${newMid} (value ${newMidVal}). Target ${target} > ${newMidVal} → Narrow search to right half.`)
    }

    if (onActionLog) {
      onActionLog({ action: 'binary_search_step', step: nextStep, low: newLow, mid: newMid, high: newHigh })
    }
  }

  const handleReset = () => {
    setLow(0)
    setHigh(array.length - 1)
    setMid(Math.floor((0 + array.length - 1) / 2))
    setSearchState('idle')
    setStepsCount(0)
    setStepExplanation('Simulation reset. Ready for target search.')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            placeholder="Target (e.g. 45)"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartSearch()}
            className="w-40 px-3.5 py-2 text-xs bg-white dark:bg-surface-dark border border-outline-variant rounded-xl font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={() => handleStartSearch()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            <span>Start Search</span>
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={searchState !== 'searching'}
            className="px-3.5 py-2 bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-xl text-xs font-semibold hover:bg-secondary-container/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            <span>Next Step</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-xl transition-colors"
            title="Reset simulation"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">Try Preset:</span>
          {[18, 45, 70, 99].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setTargetInput(String(val))
                handleStartSearch(val)
              }}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-surface border border-outline-variant/40 hover:border-primary text-on-surface hover:text-primary transition-colors"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Array Canvas & Pointer Visualizer */}
      <div className="relative w-full min-h-[260px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 p-6 flex flex-col items-center justify-center overflow-x-auto shadow-inner">
        {/* Wire Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#263331_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4 w-full">
          {/* Pointers Row */}
          <div className="flex items-center gap-2 min-w-max">
            {array.map((_, idx) => {
              const isLow = searchState !== 'idle' && idx === low
              const isHigh = searchState !== 'idle' && idx === high
              const isMid = searchState !== 'idle' && idx === mid

              return (
                <div key={`ptr-${idx}`} className="w-14 text-center h-7 flex flex-col items-center justify-end">
                  {isMid && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white shadow-sm animate-bounce">
                      MID
                    </span>
                  )}
                  {!isMid && isLow && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500 text-white shadow-sm">
                      LOW
                    </span>
                  )}
                  {!isMid && isHigh && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500 text-white shadow-sm">
                      HIGH
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Array Elements Row */}
          <div className="flex items-center gap-2 min-w-max">
            {array.map((val, idx) => {
              const isEliminated = searchState !== 'idle' && (idx < low || idx > high)
              const isMid = searchState !== 'idle' && idx === mid
              const isFound = searchState === 'found' && idx === mid

              let boxStyle = 'bg-surface border-outline-variant/50 text-on-surface'
              if (isFound) {
                boxStyle = 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-md font-extrabold ring-4 ring-emerald-300/40'
              } else if (isMid) {
                boxStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold dark:bg-emerald-950 dark:text-emerald-200'
              } else if (isEliminated) {
                boxStyle = 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 border-dashed border-slate-300 opacity-40'
              }

              return (
                <div
                  key={`val-${idx}`}
                  className={`w-14 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono transition-all duration-300 ${boxStyle}`}
                >
                  <span className="text-base font-bold">{val}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">[{idx}]</span>
                </div>
              )
            })}
          </div>

          {/* Search Interval Info */}
          <div className="flex items-center gap-4 text-xs font-mono pt-2 text-on-surface-variant">
            <span>Search Window: <strong className="text-on-surface">[{Math.max(0, low)} .. {Math.min(array.length - 1, high)}]</strong></span>
            <span>Window Size: <strong className="text-primary">{searchState === 'not_found' ? 0 : Math.max(0, high - low + 1)}</strong></span>
            <span>Target: <strong className="text-emerald-600">{target}</strong></span>
          </div>
        </div>
      </div>

      {/* Step Explanation Banner */}
      <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 transition-colors ${
        searchState === 'found'
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
          : searchState === 'not_found'
          ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
          : 'bg-surface-variant/40 border-outline-variant/30 text-on-surface'
      }`}>
        <span className="material-symbols-outlined text-base mt-0.5 text-primary">
          {searchState === 'found' ? 'check_circle' : searchState === 'not_found' ? 'help_outline' : 'info'}
        </span>
        <div className="flex-1 leading-relaxed">
          {stepExplanation}
        </div>
      </div>

      {/* Invariants & Complexity Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Search State</div>
          <div className="text-base font-bold font-mono text-on-surface mt-1 capitalize">{searchState}</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Comparisons Made</div>
          <div className="text-base font-bold font-mono text-primary mt-1">{stepsCount} / {maxComparisons} max</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Time Complexity</div>
          <div className="text-base font-bold font-mono text-on-surface mt-1">O(log n)</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Space Complexity</div>
          <div className="text-base font-bold font-mono text-emerald-600 mt-1">O(1) Iterative</div>
        </div>
      </div>
    </div>
  )
}
