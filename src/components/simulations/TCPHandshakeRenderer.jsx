import React, { useState } from 'react'

export default function TCPHandshakeRenderer({ spec, onActionLog }) {
  const steps = [
    {
      id: 1,
      sender: 'client',
      receiver: 'server',
      flag: 'SYN',
      seq: 1000,
      ack: 0,
      clientState: 'SYN_SENT',
      serverState: 'LISTEN',
      summary: 'Client sends SYN packet with Initial Sequence Number (ISN = 1000) to initiate connection.',
      color: '#00685f',
      explanation: 'Step 1: The client chooses a random initial sequence number (ISN=1000) and sends a TCP segment with the SYN control flag set. Port state changes from CLOSED to SYN_SENT.'
    },
    {
      id: 2,
      sender: 'server',
      receiver: 'client',
      flag: 'SYN-ACK',
      seq: 5000,
      ack: 1001,
      clientState: 'SYN_SENT',
      serverState: 'SYN_RECEIVED',
      summary: 'Server acknowledges client SYN (ACK = 1001) and sends its own SYN (ISN = 5000).',
      color: '#0284c7',
      explanation: 'Step 2: The server responds with SYN + ACK flags. It acknowledges client ISN with ACK=1001 (seq + 1) and specifies its own server ISN=5000. Server moves to SYN_RECEIVED state.'
    },
    {
      id: 3,
      sender: 'client',
      receiver: 'server',
      flag: 'ACK',
      seq: 1001,
      ack: 5001,
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED',
      summary: 'Client acknowledges server SYN (ACK = 5001). Connection is fully ESTABLISHED for duplex data transfer.',
      color: '#10b981',
      explanation: 'Step 3: The client replies with ACK flag set, confirming receipt of server ISN (ACK = 5000 + 1 = 5001). Both endpoints enter ESTABLISHED state. Data payload can now flow bidirectionally.'
    },
    {
      id: 4,
      sender: 'client',
      receiver: 'server',
      flag: 'PSH-ACK (HTTP GET /)',
      seq: 1001,
      ack: 5001,
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED',
      summary: 'Connection active: HTTP GET request payload delivered with payload bytes.',
      color: '#8b5cf6',
      explanation: 'Step 4: Full duplex data stream in progress. Sequence numbers now increment by the exact count of payload bytes transferred.'
    }
  ]

  const [currentStep, setCurrentStep] = useState(1)
  const [packetLossMode, setPacketLossMode] = useState(false)
  const [retransmitted, setRetransmitted] = useState(false)

  const activeStep = steps[currentStep - 1]

  const handleNext = () => {
    if (packetLossMode && currentStep === 2 && !retransmitted) {
      setRetransmitted(true)
      return
    }
    setRetransmitted(false)
    if (currentStep < steps.length) {
      const next = currentStep + 1
      setCurrentStep(next)
      if (onActionLog) {
        onActionLog({ action: 'tcp_step', step: next, details: steps[next - 1] })
      }
    }
  }

  const handlePrev = () => {
    setRetransmitted(false)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setPacketLossMode(false)
    setRetransmitted(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Handshake Stepper Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          {steps.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setCurrentStep(st.id)
                setRetransmitted(false)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentStep === st.id
                  ? 'bg-primary text-white shadow-sm'
                  : currentStep > st.id
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              <span>Step {st.id}:</span>
              <span className="font-mono font-bold">{st.flag}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPacketLossMode(!packetLossMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              packetLossMode
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-surface border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            {packetLossMode ? 'Packet Loss: ON' : 'Simulate Loss'}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-lg transition-colors"
            title="Reset simulation"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Packet Exchange Stage */}
      <div className="relative w-full min-h-[300px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Wire Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#263331_1px,transparent_1px),linear-gradient(to_bottom,#263331_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top Node Headers */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Client Node */}
          <div className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-outline-variant/50 shadow-sm w-56">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">laptop_mac</span>
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">Client Endpoint</div>
              <div className="text-[11px] font-mono text-on-surface-variant">192.168.1.42:54892</div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary">
                {activeStep.clientState}
              </div>
            </div>
          </div>

          {/* Network Channel Header */}
          <div className="text-center">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Bidirectional TCP Socket
            </span>
            <div className="text-[11px] text-on-surface-variant/70 font-mono">Full Duplex • Reliable Transmission</div>
          </div>

          {/* Server Node */}
          <div className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-outline-variant/50 shadow-sm w-56 justify-end text-right">
            <div>
              <div className="text-xs font-bold text-on-surface">Server Endpoint</div>
              <div className="text-[11px] font-mono text-on-surface-variant">93.184.216.34:443</div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {activeStep.serverState}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">dns</span>
            </div>
          </div>
        </div>

        {/* Dynamic Flight Packet */}
        <div className="relative z-10 my-8 py-4">
          <div className="relative flex items-center justify-center">
            {/* The Wire Line */}
            <div className="absolute inset-x-8 h-1 bg-outline-variant/50 rounded-full" />

            {/* Flying Packet Card */}
            <div
              className={`relative z-20 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border shadow-lg transition-all duration-500 transform ${
                retransmitted
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : 'bg-white dark:bg-surface-dark border-primary/40 text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">
                  {activeStep.sender === 'client' ? 'trending_flat' : 'keyboard_backspace'}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                  [{activeStep.flag}]
                </span>
                <span className="text-xs font-bold text-on-surface">
                  {activeStep.sender.toUpperCase()} → {activeStep.receiver.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono pt-1 text-on-surface-variant">
                <span>Seq: <strong className="text-on-surface">{activeStep.seq}</strong></span>
                <span>Ack: <strong className="text-on-surface">{activeStep.ack}</strong></span>
                <span>Len: 0</span>
              </div>

              {retransmitted && (
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  SYN-ACK Packet Dropped! Client Retransmission Timer (RTO) firing...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Explanation & Controls */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-outline-variant/30">
          <div className="max-w-xl text-xs text-on-surface-variant">
            <span className="font-semibold text-on-surface">{activeStep.summary}</span>
            <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{activeStep.explanation}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length && !retransmitted}
              className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <span>{currentStep === steps.length ? 'Completed' : 'Next Packet'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Protocol Math & Flag Inspection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Sequence Invariant</div>
          <div className="font-mono text-sm font-semibold text-primary mt-1">ACK = Seq + 1</div>
          <div className="text-xs text-on-surface-variant mt-1 leading-snug">
            SYN consumes 1 sequence number phantom byte so that ACK can acknowledge receipt without transferring payload.
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Client State</div>
          <div className="font-mono text-sm font-semibold text-on-surface mt-1">{activeStep.clientState}</div>
          <div className="text-xs text-on-surface-variant mt-1 leading-snug">
            {activeStep.clientState === 'ESTABLISHED' ? 'Socket open for read/write calls.' : 'Waiting for server handshake acknowledgment.'}
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Server State</div>
          <div className="font-mono text-sm font-semibold text-emerald-600 mt-1">{activeStep.serverState}</div>
          <div className="text-xs text-on-surface-variant mt-1 leading-snug">
            {activeStep.serverState === 'ESTABLISHED' ? 'SYN flood protection passed; socket ready.' : 'Pending final ACK from client.'}
          </div>
        </div>
      </div>
    </div>
  )
}
