import React, { useState } from 'react'

export default function DOMTreeRenderer({ spec, onActionLog }) {
  const [selectedTag, setSelectedTag] = useState('button#cta')
  const [bubblingPath, setBubblingPath] = useState([])
  const [eventPhase, setEventPhase] = useState('')

  const handleSimulateBubble = () => {
    const path = ['button#cta', 'article.card', 'main.content', 'body', 'html', 'document']
    setBubblingPath([])
    setEventPhase('Capturing Phase → Target Phase')

    // Animate upward propagation
    path.forEach((tag, idx) => {
      setTimeout(() => {
        setBubblingPath(prev => [...prev, tag])
        if (idx === path.length - 1) {
          setEventPhase('Bubbling complete: Event reached window/document root')
        } else {
          setEventPhase(`Bubbling Phase: Event propagated to <${tag}>`)
        }
      }, (idx + 1) * 350)
    })

    if (onActionLog) {
      onActionLog({ action: 'dom_event_bubbling', target: 'button#cta', pathLength: path.length })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateBubble}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">touch_app</span>
            Simulate Click & Event Bubbling
          </button>
        </div>

        <div className="text-xs font-mono text-on-surface-variant">
          Active Node: <span className="text-primary font-bold">{selectedTag}</span>
        </div>
      </div>

      {/* DOM Hierarchy Tree */}
      <div className="p-6 bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 font-mono text-xs shadow-inner">
        <div className="space-y-2">
          {/* Document Root */}
          <div className={`p-2 rounded-xl border transition-all ${bubblingPath.includes('document') ? 'bg-amber-100 border-amber-300 dark:bg-amber-950 font-bold' : 'bg-surface border-outline-variant/30'}`}>
            &lt;document&gt;
            {/* HTML */}
            <div className={`ml-4 mt-2 p-2 rounded-xl border transition-all ${bubblingPath.includes('html') ? 'bg-amber-100 border-amber-300 dark:bg-amber-950 font-bold' : 'bg-surface-variant/20 border-outline-variant/30'}`}>
              &lt;html lang="en"&gt;
              {/* BODY */}
              <div className={`ml-4 mt-2 p-2 rounded-xl border transition-all ${bubblingPath.includes('body') ? 'bg-amber-100 border-amber-300 dark:bg-amber-950 font-bold' : 'bg-surface border-outline-variant/30'}`}>
                &lt;body&gt;
                {/* MAIN */}
                <div className={`ml-4 mt-2 p-2 rounded-xl border transition-all ${bubblingPath.includes('main.content') ? 'bg-amber-100 border-amber-300 dark:bg-amber-950 font-bold' : 'bg-surface-variant/20 border-outline-variant/30'}`}>
                  &lt;main class="content"&gt;
                  {/* ARTICLE */}
                  <div className={`ml-4 mt-2 p-2 rounded-xl border transition-all ${bubblingPath.includes('article.card') ? 'bg-amber-100 border-amber-300 dark:bg-amber-950 font-bold' : 'bg-surface border-outline-variant/30'}`}>
                    &lt;article class="card"&gt;
                    {/* BUTTON */}
                    <div className={`ml-4 mt-2 p-2.5 rounded-xl border flex items-center justify-between transition-all ${bubblingPath.includes('button#cta') ? 'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold' : 'bg-primary/10 border-primary/30 text-primary'}`}>
                      <span>&lt;button id="cta" onclick="handleClick(e)"&gt;Target Button&lt;/button&gt;</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary text-white uppercase font-sans">Event Target</span>
                    </div>
                    &lt;/article&gt;
                  </div>
                  &lt;/main&gt;
                </div>
                &lt;/body&gt;
              </div>
              &lt;/html&gt;
            </div>
          </div>
        </div>
      </div>

      {/* Bubbling Status Banner */}
      {eventPhase && (
        <div className="p-3 bg-surface-variant/50 rounded-xl border border-outline-variant/30 text-xs font-mono text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">wifi_channel</span>
          <span>{eventPhase}</span>
        </div>
      )}
    </div>
  )
}
