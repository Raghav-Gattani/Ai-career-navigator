import React, { useState, useEffect, useRef } from 'react'

const INITIAL_ARRAY = [45, 18, 62, 33, 85, 24, 70, 12, 55, 39]

export default function SortingRenderer({ spec, onActionLog }) {
  const [array, setArray] = useState(INITIAL_ARRAY)
  const [algorithm, setAlgorithm] = useState('bubble') // 'bubble' | 'selection'
  const [activeIndices, setActiveIndices] = useState([])
  const [sortedIndices, setSortedIndices] = useState([])
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [statusText, setStatusText] = useState('Click "Start Sorting" or "Step" to run')

  // We can pre-generate steps or execute incrementally
  const animationRef = useRef(null)

  const handleRandomize = () => {
    setIsPlaying(false)
    const newArr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 80) + 15)
    setArray(newArr)
    setActiveIndices([])
    setSortedIndices([])
    setComparisons(0)
    setSwaps(0)
    setStatusText('Randomized new array')
  }

  const handleReset = () => {
    setIsPlaying(false)
    setArray(INITIAL_ARRAY)
    setActiveIndices([])
    setSortedIndices([])
    setComparisons(0)
    setSwaps(0)
    setStatusText('Reset to initial array')
  }

  // Bubble sort step
  const doBubbleStep = () => {
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!sortedIndices.includes(j + 1) && arr[j] > arr[j + 1]) {
          setActiveIndices([j, j + 1])
          setComparisons(c => c + 1)
          setSwaps(s => s + 1)
          const temp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = temp
          setArray(arr)
          setStatusText(`Swapped indices ${j} (${temp}) and ${j+1} (${arr[j]}) because ${temp} > ${arr[j]}`)
          return false
        }
      }
    }

    // Done
    setActiveIndices([])
    setSortedIndices(Array.from({ length: n }, (_, i) => i))
    setIsPlaying(false)
    setStatusText('Array is fully sorted!')
    if (onActionLog) {
      onActionLog({ action: 'sort_completed', algorithm, comparisons, swaps })
    }
    return true
  }

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      const isDone = doBubbleStep()
      if (isDone) {
        setIsPlaying(false)
        clearInterval(timer)
      }
    }, 350)
    return () => clearInterval(timer)
  }, [isPlaying, array, sortedIndices])

  return (
    <div className="flex flex-col gap-5">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          {['bubble', 'selection'].map(algo => (
            <button
              key={algo}
              onClick={() => {
                setAlgorithm(algo)
                handleReset()
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase font-mono transition-all ${
                algorithm === algo
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              {algo} Sort
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">{isPlaying ? 'pause' : 'play_arrow'}</span>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => doBubbleStep()}
            disabled={isPlaying}
            className="px-3.5 py-1.5 bg-surface text-on-surface border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface-variant disabled:opacity-40 transition-colors"
          >
            Step
          </button>
          <button
            onClick={handleRandomize}
            className="px-3.5 py-1.5 bg-surface text-on-surface border border-outline-variant rounded-xl text-xs font-medium hover:bg-surface-variant transition-colors"
          >
            Randomize
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-lg transition-colors"
            title="Reset"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="relative w-full h-[280px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 p-6 flex items-end justify-center gap-3 overflow-hidden shadow-inner">
        {array.map((val, idx) => {
          const isActive = activeIndices.includes(idx)
          const isSorted = sortedIndices.includes(idx)

          let barBg = 'bg-primary'
          if (isActive) barBg = 'bg-amber-500 ring-2 ring-amber-300'
          else if (isSorted) barBg = 'bg-emerald-500'

          return (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[48px]">
              <span className="text-[11px] font-mono font-bold text-on-surface">{val}</span>
              <div
                style={{ height: `${val * 2.2}px` }}
                className={`w-full rounded-t-xl transition-all duration-300 ${barBg}`}
              />
              <span className="text-[10px] font-mono text-on-surface-variant">[{idx}]</span>
            </div>
          )
        })}
      </div>

      {/* Metrics & Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase">Comparisons</div>
          <div className="text-xl font-bold font-mono text-on-surface mt-0.5">{comparisons}</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase">Swaps</div>
          <div className="text-xl font-bold font-mono text-primary mt-0.5">{swaps}</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase">Time Complexity</div>
          <div className="text-xl font-bold font-mono text-on-surface mt-0.5">O(n²)</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase">Space Complexity</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">O(1) In-Place</div>
        </div>
      </div>

      <div className="p-3 bg-surface-variant/40 rounded-xl border border-outline-variant/30 text-xs font-mono text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">info</span>
        <span>{statusText}</span>
      </div>
    </div>
  )
}
