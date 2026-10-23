import React, { useState, useMemo } from 'react'

export default function NeuralNetworkRenderer({ spec, onActionLog }) {
  // Inputs
  const [x1, setX1] = useState(0.8)
  const [x2, setX2] = useState(-0.5)

  // Weights Input -> Hidden
  const [w11, setW11] = useState(0.6)
  const [w12, setW12] = useState(-0.4)
  const [w13, setW13] = useState(0.9)
  const [w21, setW21] = useState(-0.7)
  const [w22, setW22] = useState(0.5)
  const [w23, setW23] = useState(0.3)

  // Weights Hidden -> Output
  const [v1, setV1] = useState(0.7)
  const [v2, setV2] = useState(-0.5)
  const [v3, setV3] = useState(0.8)

  // Activation choice
  const [hiddenActivation, setHiddenActivation] = useState('relu') // 'relu' | 'sigmoid'

  // Forward Pass Calculation
  const mathResults = useMemo(() => {
    // Hidden pre-activations
    const z_h1 = (x1 * w11) + (x2 * w21)
    const z_h2 = (x1 * w12) + (x2 * w22)
    const z_h3 = (x1 * w13) + (x2 * w23)

    // Hidden activations
    const applyAct = (z) => {
      if (hiddenActivation === 'relu') return Math.max(0, z)
      return 1 / (1 + Math.exp(-z)) // sigmoid
    }

    const a_h1 = applyAct(z_h1)
    const a_h2 = applyAct(z_h2)
    const a_h3 = applyAct(z_h3)

    // Output pre-activation
    const z_out = (a_h1 * v1) + (a_h2 * v2) + (a_h3 * v3)

    // Output Sigmoid
    const y_hat = 1 / (1 + Math.exp(-z_out))

    return {
      z_h1, z_h2, z_h3,
      a_h1, a_h2, a_h3,
      z_out,
      y_hat: Math.min(1, Math.max(0, y_hat))
    }
  }, [x1, x2, w11, w12, w13, w21, w22, w23, v1, v2, v3, hiddenActivation])

  const [selectedNeuron, setSelectedNeuron] = useState('h1')

  return (
    <div className="flex flex-col gap-5">
      {/* Interactive Controls & Activation Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-on-surface">Hidden Activation:</span>
          {['relu', 'sigmoid'].map(act => (
            <button
              key={act}
              onClick={() => {
                setHiddenActivation(act)
                if (onActionLog) onActionLog({ action: 'change_activation', activation: act })
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                hiddenActivation === act
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              {act}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-on-surface-variant">Prediction Probability:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-sm">
            {(mathResults.y_hat * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* SVG Neural Diagram */}
      <div className="relative w-full h-[320px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 overflow-hidden shadow-inner flex items-center justify-center p-4">
        {/* Wire Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#263331_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <svg className="w-full h-full" viewBox="0 0 640 280">
          <defs>
            <filter id="neuronShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Synapses: Input -> Hidden */}
          {[
            { x1: 100, y1: 85, x2: 320, y2: 60, w: w11 },
            { x1: 100, y1: 85, x2: 320, y2: 140, w: w12 },
            { x1: 100, y1: 85, x2: 320, y2: 220, w: w13 },
            { x1: 100, y1: 195, x2: 320, y2: 60, w: w21 },
            { x1: 100, y1: 195, x2: 320, y2: 140, w: w22 },
            { x1: 100, y1: 195, x2: 320, y2: 220, w: w23 },
          ].map((syn, idx) => {
            const isPos = syn.w >= 0
            const strokeWidth = Math.max(1, Math.min(5, Math.abs(syn.w) * 4))
            return (
              <line
                key={`syn-in-${idx}`}
                x1={syn.x1}
                y1={syn.y1}
                x2={syn.x2}
                y2={syn.y2}
                stroke={isPos ? '#00685f' : '#dc2626'}
                strokeWidth={strokeWidth}
                strokeOpacity="0.65"
              />
            )
          })}

          {/* Synapses: Hidden -> Output */}
          {[
            { x1: 320, y1: 60, x2: 540, y2: 140, w: v1 },
            { x1: 320, y1: 140, x2: 540, y2: 140, w: v2 },
            { x1: 320, y1: 220, x2: 540, y2: 140, w: v3 },
          ].map((syn, idx) => {
            const isPos = syn.w >= 0
            const strokeWidth = Math.max(1, Math.min(5, Math.abs(syn.w) * 4))
            return (
              <line
                key={`syn-out-${idx}`}
                x1={syn.x1}
                y1={syn.y1}
                x2={syn.x2}
                y2={syn.y2}
                stroke={isPos ? '#00685f' : '#dc2626'}
                strokeWidth={strokeWidth}
                strokeOpacity="0.65"
              />
            )
          })}

          {/* Input Layer Neurons */}
          {[
            { id: 'x1', label: 'x₁', val: x1, cx: 100, cy: 85 },
            { id: 'x2', label: 'x₂', val: x2, cx: 100, cy: 195 },
          ].map(node => (
            <g key={node.id} className="cursor-pointer" onClick={() => setSelectedNeuron(node.id)}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="22"
                fill="#f1f5f9"
                stroke="#0284c7"
                strokeWidth="2.5"
                filter="url(#neuronShadow)"
              />
              <text x={node.cx} y={node.cy - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0369a1 font-mono">
                {node.label}
              </text>
              <text x={node.cx} y={node.cy + 11} textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155 font-mono">
                {node.val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Hidden Layer Neurons */}
          {[
            { id: 'h1', label: 'h₁', act: mathResults.a_h1, cx: 320, cy: 60 },
            { id: 'h2', label: 'h₂', act: mathResults.a_h2, cx: 320, cy: 140 },
            { id: 'h3', label: 'h₃', act: mathResults.a_h3, cx: 320, cy: 220 },
          ].map(node => (
            <g key={node.id} className="cursor-pointer" onClick={() => setSelectedNeuron(node.id)}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="23"
                fill={selectedNeuron === node.id ? '#e0f2fe' : '#ffffff'}
                stroke="#00685f"
                strokeWidth="2.5"
                filter="url(#neuronShadow)"
              />
              <text x={node.cx} y={node.cy - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#00685f" fontFamily="monospace">
                {node.label}
              </text>
              <text x={node.cx} y={node.cy + 11} textAnchor="middle" fontSize="10" fontWeight="600" fill="#475569" fontFamily="monospace">
                {node.act.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Output Layer Neuron */}
          <g className="cursor-pointer" onClick={() => setSelectedNeuron('out')}>
            <circle
              cx="540"
              cy="140"
              r="26"
              fill={selectedNeuron === 'out' ? '#dcfce7' : '#ffffff'}
              stroke="#10b981"
              strokeWidth="3"
              filter="url(#neuronShadow)"
            />
            <text x="540" y="136" textAnchor="middle" fontSize="12" fontWeight="700" fill="#047857" fontFamily="monospace">
              ŷ
            </text>
            <text x="540" y="151" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">
              {mathResults.y_hat.toFixed(2)}
            </text>
          </g>

          {/* Layer Headers */}
          <text x="100" y="25" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b" textTransform="uppercase">Input (2)</text>
          <text x="320" y="25" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b" textTransform="uppercase">Hidden (3)</text>
          <text x="540" y="25" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b" textTransform="uppercase">Output (1)</text>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-4 flex items-center gap-3 bg-white/90 dark:bg-surface-dark/90 px-3 py-1 rounded-lg border border-outline-variant/30 text-[10px] backdrop-blur-sm font-mono">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-primary rounded" />
            <span>Positive Weight (Excitation)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-600 rounded" />
            <span>Negative Weight (Inhibition)</span>
          </div>
        </div>
      </div>

      {/* Real-time Math Breakdown & Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interactive Input Sliders */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/30 flex flex-col gap-3">
          <div className="text-xs font-bold text-on-surface flex items-center justify-between">
            <span>Input Feature Sliders</span>
            <span className="text-[11px] font-mono text-on-surface-variant font-normal">Range: -2.0 to +2.0</span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-on-surface-variant">Feature x₁ (Skill match signal):</span>
                <span className="font-bold text-primary">{x1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={x1}
                onChange={(e) => setX1(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-on-surface-variant">Feature x₂ (Experience signal):</span>
                <span className="font-bold text-primary">{x2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={x2}
                onChange={(e) => setX2(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Formula Card */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/30 flex flex-col gap-2 font-mono text-xs">
          <div className="font-sans font-bold text-on-surface flex items-center justify-between">
            <span>Forward Math for Neuron [h₁]</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">
              {hiddenActivation}
            </span>
          </div>

          <div className="p-2.5 bg-surface-variant/40 rounded-xl space-y-1.5 text-on-surface-variant leading-relaxed">
            <div>
              <span className="text-slate-500 font-bold">1. Dot Product:</span> z = (x₁ · w₁₁) + (x₂ · w₂₁)
            </div>
            <div className="text-on-surface font-semibold pl-2">
              z = ({x1.toFixed(2)} · {w11.toFixed(2)}) + ({x2.toFixed(2)} · {w21.toFixed(2)}) = <span className="text-primary">{mathResults.z_h1.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">2. Activation:</span> a = {hiddenActivation === 'relu' ? 'max(0, z)' : '1 / (1 + e^-z)'}
            </div>
            <div className="text-on-surface font-semibold pl-2">
              a = <span className="text-emerald-600 font-bold">{mathResults.a_h1.toFixed(3)}</span>
            </div>
          </div>

          <div className="text-[11px] text-on-surface-variant font-sans pt-1">
            Output prediction: <strong className="text-on-surface font-mono">ŷ = σ(∑ vᵢ · aᵢ) = {mathResults.y_hat.toFixed(3)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
