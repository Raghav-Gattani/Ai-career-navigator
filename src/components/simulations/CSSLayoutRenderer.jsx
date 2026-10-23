import React, { useState } from 'react'

export default function CSSLayoutRenderer({ spec, onActionLog }) {
  const [direction, setDirection] = useState('row') // 'row' | 'column' | 'row-reverse'
  const [justify, setJustify] = useState('space-between') // 'flex-start' | 'center' | 'space-between' | 'space-around'
  const [align, setAlign] = useState('center') // 'stretch' | 'center' | 'flex-start' | 'flex-end'
  const [gap, setGap] = useState(16) // px
  const [itemCount, setItemCount] = useState(4)

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30 text-xs">
        <div>
          <label className="font-bold text-on-surface block mb-1.5 font-mono">flex-direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-surface-dark border border-outline-variant rounded-xl font-mono text-on-surface"
          >
            <option value="row">row</option>
            <option value="column">column</option>
            <option value="row-reverse">row-reverse</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-on-surface block mb-1.5 font-mono">justify-content</label>
          <select
            value={justify}
            onChange={(e) => setJustify(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-surface-dark border border-outline-variant rounded-xl font-mono text-on-surface"
          >
            <option value="flex-start">flex-start</option>
            <option value="center">center</option>
            <option value="space-between">space-between</option>
            <option value="space-around">space-around</option>
            <option value="flex-end">flex-end</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-on-surface block mb-1.5 font-mono">align-items</label>
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-surface-dark border border-outline-variant rounded-xl font-mono text-on-surface"
          >
            <option value="center">center</option>
            <option value="flex-start">flex-start</option>
            <option value="flex-end">flex-end</option>
            <option value="stretch">stretch</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-on-surface block mb-1.5 font-mono">gap ({gap}px)</label>
          <input
            type="range"
            min="0"
            max="40"
            step="4"
            value={gap}
            onChange={(e) => setGap(parseInt(e.target.value))}
            className="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* Live Canvas */}
      <div className="relative w-full min-h-[260px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 p-6 overflow-hidden shadow-inner flex items-center justify-center">
        <div
          style={{
            display: 'flex',
            flexDirection: direction,
            justifyContent: justify,
            alignItems: align,
            gap: `${gap}px`,
            width: '100%',
            minHeight: '200px'
          }}
          className="border-2 border-dashed border-primary/40 rounded-xl p-4 bg-surface-variant/20 transition-all duration-300"
        >
          {Array.from({ length: itemCount }).map((_, idx) => (
            <div
              key={idx}
              className="px-5 py-4 rounded-xl bg-primary text-white font-mono text-xs font-bold shadow transition-all duration-300 flex items-center justify-center"
            >
              Item #{idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Generated CSS Snippet */}
      <div className="p-3 bg-[#1e293b] text-slate-200 rounded-xl font-mono text-xs shadow-inner">
        <span className="text-sky-400 font-bold">.container</span> &#123;<br />
        &nbsp;&nbsp;<span className="text-slate-400">display:</span> <span className="text-amber-300">flex</span>;<br />
        &nbsp;&nbsp;<span className="text-slate-400">flex-direction:</span> <span className="text-amber-300">{direction}</span>;<br />
        &nbsp;&nbsp;<span className="text-slate-400">justify-content:</span> <span className="text-amber-300">{justify}</span>;<br />
        &nbsp;&nbsp;<span className="text-slate-400">align-items:</span> <span className="text-amber-300">{align}</span>;<br />
        &nbsp;&nbsp;<span className="text-slate-400">gap:</span> <span className="text-emerald-300">{gap}px</span>;<br />
        &#125;
      </div>
    </div>
  )
}
