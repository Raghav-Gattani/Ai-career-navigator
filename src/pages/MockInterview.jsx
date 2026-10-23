import React, { useState } from 'react'
import { evaluateInterview } from '../api/client'

const CAREER_SCENARIOS = {
  'Frontend Developer': {
    title: 'High-Performance Real-Time Frontend Architecture',
    subtitle: 'Virtualization, Micro-Frontends & State Hydration Under High Event Rates',
    scenarioPrompt: 'Design a high-performance web dashboard handling 10,000 real-time WebSocket price updates per second. How do you prevent UI main-thread jank, structure state management, and optimize DOM reflows?',
    hints: [
      'Discuss requestAnimationFrame batching and virtualized windowing (e.g., TanStack Virtual).',
      'Explain separation of high-frequency data stores from the React render tree.',
      'Detail Web Worker offloading for JSON parsing and heavy calculations.'
    ]
  },
  'Backend Developer': {
    title: 'High-Throughput Distributed Payment Processing Pipeline',
    subtitle: 'Idempotency, Two-Phase Commits & Strict P99 < 15ms Latency SLAs',
    scenarioPrompt: 'Design a fault-tolerant payment settlement engine that processes 200,000 concurrent transactions per second across multi-region data stores with strict exactly-once payment semantics.',
    hints: [
      'Detail distributed locking and idempotency key persistence with atomic Lua scripts.',
      'Explain database partitioning, write-ahead logs, and asynchronous outbox patterns.',
      'Discuss bounded latency SLAs and backpressure under network partitions.'
    ]
  },
  'Full-Stack Developer': {
    title: 'Real-Time Collaborative Multi-Tenant Document Platform',
    subtitle: 'Conflict-Free Replicated Data Types (CRDTs), Offline Sync & Microservices',
    scenarioPrompt: 'Design the full-stack architecture for a collaborative document editor with offline synchronization, concurrent multi-user editing, and row-level tenant security.',
    hints: [
      'Explain CRDT or Operational Transformation (OT) state synchronization over WebSockets.',
      'Detail optimistic client mutations and conflict resolution on reconnect.',
      'Describe multi-tenant database partitioning and security token propagation.'
    ]
  },
  'AI/ML Engineer': {
    title: 'Low-Latency Multi-Tenant Vector Retrieval Engine',
    subtitle: 'HNSW Graph Indexing, KV Cache Paging & High-Concurrency Payment Workloads',
    scenarioPrompt: 'Design an enterprise vector search service capable of querying 500 million embeddings with sub-10ms P99 latency while supporting live document insertions and multi-tenant isolation.',
    hints: [
      'Explain HNSW indexing parameters (M, efConstruction, efSearch) tradeoffs.',
      'Detail Product Quantization (PQ8) memory compression sub-routines.',
      'Discuss multi-tenant index sharding and GPU offloading techniques.'
    ]
  },
  'Cybersecurity Analyst': {
    title: 'Zero-Trust Enterprise Network Architecture & Threat Mitigation',
    subtitle: 'mTLS Identity, SIEM Event Correlation & Active Incident Containment',
    scenarioPrompt: 'Design an enterprise zero-trust security architecture protecting hundreds of microservices. How do you enforce perimeter-less authentication, detect lateral movement, and automate threat containment?',
    hints: [
      'Detail mutual TLS (mTLS) certificate rotation and SPIFFE/SPIRE workload identity.',
      'Explain centralized SIEM aggregation with anomaly correlation rules.',
      'Describe automated quarantine workflows upon credential compromise.'
    ]
  },
  'Data Analyst': {
    title: 'Real-Time User Retention Analysis & A/B Experimentation',
    subtitle: 'Statistical Significance, Data Warehousing & Executive Dashboards',
    scenarioPrompt: 'Design an end-to-end analytics pipeline that ingests billions of clickstream events to evaluate A/B test experiments, detect statistical novelty effects, and compute churn retention curves.',
    hints: [
      'Detail partitioning and clustering strategies in Snowflake or BigQuery.',
      'Explain statistical hypothesis testing (t-test / Mann-Whitney) power calculations.',
      'Describe automated pipeline orchestration and anomaly alerting.'
    ]
  },
  'DevOps Engineer': {
    title: 'High-Availability Multi-Region Kubernetes Architecture',
    subtitle: 'Automated Failover, Infrastructure as Code & Service Mesh Telemetry',
    scenarioPrompt: 'Design an automated multi-region Kubernetes infrastructure capable of sustaining a total AWS region outage with zero user downtime and automated DNS failovers.',
    hints: [
      'Detail Terraform modular infrastructure and GitOps deployment with ArgoCD.',
      'Explain multi-region database replication and read/write splitting.',
      'Describe Prometheus metric autoscaling and synthetic health probes.'
    ]
  }
}

export default function MockInterview({ onNavigate, careerData, showNotification }) {
  const profile = careerData?.profile
  const targetRole = profile?.target_role || 'Frontend Developer'
  const scenarioConfig = CAREER_SCENARIOS[targetRole] || CAREER_SCENARIOS['Frontend Developer']

  const [hintsOpen, setHintsOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState(careerData?.interview || null)

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0

  const handleEvaluate = async () => {
    if (wordCount < 10) {
      showNotification?.('Please write a more detailed answer (at least 10 words) to evaluate.', 'error')
      return
    }

    setIsEvaluating(true)
    try {
      const res = await evaluateInterview({
        scenario_title: scenarioConfig.title,
        candidate_answer: answer
      })
      if (res && res.evaluation) {
        setEvaluation(res.evaluation)
        const source = res.evaluation.source === 'real_gemini_ai'
          ? 'Evaluated by Google Gemini AI'
          : 'Evaluated by Architecture Calibration Engine'
        showNotification?.(`${source}: Score ${res.evaluation.overall_score}/100!`)
      }
    } catch (err) {
      showNotification?.('Evaluation failed: ' + err.message, 'error')
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Session Context Bar */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-variant/40 flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">terminal</span>
          </div>
          <div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                {targetRole} Systems Defense
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                @{profile?.target_company || 'Benchmark'}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>Live Simulation Active</span>
              </div>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {scenarioConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm self-start xl:self-center">
          <button
            type="button"
            onClick={() => onNavigate?.('skill-gap-and-roadmap')}
            className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md font-medium cursor-pointer"
          >
            Roadmap
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (7 cols): Scenario Prompt & Candidate Answer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Prompt Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-variant/40">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-1">
              Architecture Scenario
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mb-3">
              {scenarioConfig.title}
            </h2>
            <div className="p-4 rounded-xl bg-surface-container-low text-body-md text-on-surface leading-relaxed">
              {scenarioConfig.scenarioPrompt}
            </div>

            {/* Collapsible Hints */}
            <div className="mt-4 pt-4 border-t border-surface-variant/30">
              <button
                type="button"
                onClick={() => setHintsOpen(!hintsOpen)}
                className="flex items-center justify-between w-full text-left font-label-md text-label-md text-on-surface font-medium cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  <span>Architectural Focus Areas &amp; Rubric Hints</span>
                </span>
                <span className="material-symbols-outlined text-[18px] text-outline">
                  {hintsOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {hintsOpen && (
                <ul className="mt-3 space-y-1.5 pl-6 list-disc text-body-sm text-on-surface-variant animate-fade-in">
                  {scenarioConfig.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Answer Textarea Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-variant/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Your Architectural Solution
              </span>
              <span className="font-label-sm text-label-sm text-outline">
                {wordCount} words
              </span>
            </div>

            <textarea
              rows="9"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Structure your answer with component boundaries, concurrency considerations, latency tradeoffs, data models, and failure recovery modes..."
              className="w-full p-4 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface font-mono text-[13px] leading-relaxed outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            ></textarea>

            <div className="flex items-center justify-between pt-2">
              <span className="text-body-sm text-outline">
                Graded objectively on technical correctness and tradeoffs
              </span>
              <button
                type="button"
                disabled={isEvaluating || wordCount < 5}
                onClick={handleEvaluate}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Analyzing Defense...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Evaluation</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Real-Time AI Score & Rubric Critique */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-variant/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant/20">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Evaluation Rubric
              </h3>
              {evaluation && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">
                  {evaluation.source === 'real_gemini_ai' ? 'Gemini AI Verified' : 'Engine Calibration'}
                </span>
              )}
            </div>

            {evaluation ? (
              <div className="space-y-4 animate-fade-in">
                {/* Score Ring */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-[22px]">
                    {evaluation.overall_score}
                  </div>
                  <div>
                    <span className="font-semibold text-on-surface block text-[15px]">
                      Measured Defense Score
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      Calibrated against {targetRole} bar
                    </span>
                  </div>
                </div>

                {/* Granular Vectors */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span>Distributed Correctness</span>
                    <span className="font-semibold">{evaluation.distributed_score}%</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${evaluation.distributed_score}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-[12px] pt-1">
                    <span>Latency &amp; P99 SLAs</span>
                    <span className="font-semibold">{evaluation.latency_score}%</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${evaluation.latency_score}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-[12px] pt-1">
                    <span>Multi-Tenancy &amp; Isolation</span>
                    <span className="font-semibold">{evaluation.tenancy_score}%</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${evaluation.tenancy_score}%` }}></div>
                  </div>
                </div>

                {/* Strengths */}
                {evaluation.strengths?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                    <span className="font-label-sm text-label-sm font-semibold text-primary block">
                      Demonstrated Strengths
                    </span>
                    <ul className="text-[12px] space-y-1 list-disc pl-4 text-on-surface">
                      {evaluation.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Blindspots */}
                {evaluation.blindspots?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed space-y-1">
                    <span className="font-label-sm text-label-sm font-semibold text-tertiary block">
                      Target Blindspots
                    </span>
                    <ul className="text-[12px] space-y-1 list-disc pl-4 text-on-surface">
                      {evaluation.blindspots.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Executive Summary */}
                <p className="text-[12px] text-on-surface-variant italic p-3 rounded-lg bg-surface-container-low">
                  “{evaluation.critique_summary}”
                </p>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[40px] text-outline mb-2">
                  psychology
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Awaiting Response
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Write your architectural design solution and submit to receive objective scoring and rubric feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
