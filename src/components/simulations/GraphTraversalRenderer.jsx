import React, { useState } from 'react'

const GRAPH_NODES = [
  { id: 'A', x: 80, y: 120 },
  { id: 'B', x: 200, y: 50 },
  { id: 'C', x: 200, y: 190 },
  { id: 'D', x: 340, y: 50 },
  { id: 'E', x: 340, y: 190 },
  { id: 'F', x: 460, y: 120 },
]

const GRAPH_EDGES = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'C', to: 'E' },
  { from: 'D', to: 'F' },
  { from: 'E', to: 'F' },
]

const BFS_ORDER = ['A', 'B', 'C', 'D', 'E', 'F']
const DFS_ORDER = ['A', 'B', 'D', 'F', 'E', 'C']

export default function GraphTraversalRenderer({ spec, onActionLog }) {
  const [traversalType, setTraversalType] = useState('BFS') // 'BFS' | 'DFS'
  const [stepIndex, setStepIndex] = useState(0)

  const order = traversalType === 'BFS' ? BFS_ORDER : DFS_ORDER
  const visited = order.slice(0, stepIndex + 1)
  const currentNode = order[stepIndex]

  const handleNext = () => {
    if (stepIndex < order.length - 1) {
      setStepIndex(stepIndex + 1)
    }
  }

  const handleReset = () => {
    setStepIndex(0)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          {['BFS', 'DFS'].map(type => (
            <button
              key={type}
              onClick={() => {
                setTraversalType(type)
                setStepIndex(0)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                traversalType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              {type} ({type === 'BFS' ? 'Queue' : 'Stack'})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
            className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-variant disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={stepIndex === order.length - 1}
            className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover disabled:opacity-40"
          >
            Next Step
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Graph SVG Canvas */}
      <div className="relative w-full h-[260px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 p-4 flex items-center justify-center shadow-inner">
        <svg className="w-full h-full" viewBox="0 0 540 240">
          {/* Edges */}
          {GRAPH_EDGES.map((e, idx) => {
            const n1 = GRAPH_NODES.find(n => n.id === e.from)
            const n2 = GRAPH_NODES.find(n => n.id === e.to)
            const isTraversed = visited.includes(e.from) && visited.includes(e.to)
            return (
              <line
                key={idx}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isTraversed ? '#00685f' : '#cbd5e1'}
                strokeWidth={isTraversed ? 3 : 1.5}
              />
            )
          })}

          {/* Nodes */}
          {GRAPH_NODES.map(node => {
            const isVisited = visited.includes(node.id)
            const isCurrent = currentNode === node.id

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={isCurrent ? '#10b981' : isVisited ? '#e0f2fe' : '#ffffff'}
                  stroke={isCurrent ? '#059669' : isVisited ? '#00685f' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontWeight="bold"
                  fontSize="13"
                  fill={isCurrent ? '#ffffff' : '#1e293b'}
                  fontFamily="monospace"
                >
                  {node.id}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Traversal Order & Structure */}
      <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 text-xs font-mono flex items-center justify-between">
        <div>
          Visited Sequence: <strong className="text-primary">{visited.join(' → ')}</strong>
        </div>
        <div className="text-on-surface-variant">
          Structure: <strong>{traversalType === 'BFS' ? 'FIFO Queue' : 'LIFO Stack'}</strong>
        </div>
      </div>
    </div>
  )
}
