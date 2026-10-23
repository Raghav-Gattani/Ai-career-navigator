import React, { useState } from 'react'

export default function DNSResolutionRenderer({ spec, onActionLog }) {
  const steps = [
    { id: 1, title: 'Local Cache Check', from: 'Browser', to: 'OS Cache', desc: 'Checks browser DNS cache and /etc/hosts. Cache miss -> query forwarded to Recursive Resolver.' },
    { id: 2, title: 'Recursive Resolver', from: 'OS', to: 'ISP / 8.8.8.8', desc: 'Recursive resolver begins iterative resolution chain on behalf of client.' },
    { id: 3, title: 'Root DNS (.)', from: 'Resolver', to: 'Root Nameserver', desc: 'Root server points resolver to .com Top-Level Domain (TLD) nameservers.' },
    { id: 4, title: 'TLD DNS (.com)', from: 'Resolver', to: 'TLD Nameserver', desc: 'TLD server points resolver to authoritative nameservers for example.com.' },
    { id: 5, title: 'Authoritative DNS', from: 'Resolver', to: 'ns1.example.com', desc: 'Authoritative server answers with A-Record: IP 93.184.216.34 (TTL: 3600s).' },
    { id: 6, title: 'Result Cached & Returned', from: 'Resolver', to: 'Browser', desc: 'Resolver caches A-record and returns IP 93.184.216.34 to browser. TCP handshake begins!' }
  ]

  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          {steps.map(s => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                currentStep === s.id
                  ? 'bg-primary text-white shadow-sm'
                  : currentStep > s.id
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              Step {s.id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-variant disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover disabled:opacity-40"
          >
            Next Step
          </button>
        </div>
      </div>

      {/* Visual Resolution Hierarchy */}
      <div className="p-6 bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 shadow-inner flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
          {[
            { id: 1, name: 'Browser', role: 'Client' },
            { id: 2, name: 'Resolver', role: '8.8.8.8' },
            { id: 3, name: 'Root DNS', role: 'a.root-servers.net' },
            { id: 4, name: 'TLD DNS', role: '.com Servers' },
            { id: 5, name: 'Auth DNS', role: 'ns1.domain.com' },
            { id: 6, name: 'Resolved IP', role: '93.184.216.34' }
          ].map(node => {
            const isReached = currentStep >= node.id
            const isCurrent = currentStep === node.id
            return (
              <div
                key={node.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-primary text-white border-primary shadow-md scale-105'
                    : isReached
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-surface text-on-surface-variant border-outline-variant/40 opacity-60'
                }`}
              >
                <div className="font-bold">{node.name}</div>
                <div className="text-[10px] font-mono mt-0.5 truncate">{node.role}</div>
              </div>
            )
          })}
        </div>

        <div className="p-4 bg-surface-variant/40 rounded-xl border border-outline-variant/30 text-xs">
          <div className="font-bold text-on-surface">{steps[currentStep - 1].title}</div>
          <div className="text-on-surface-variant mt-1">{steps[currentStep - 1].desc}</div>
        </div>
      </div>
    </div>
  )
}
