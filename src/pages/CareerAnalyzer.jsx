import React, { useState, useEffect } from 'react'

const CAREER_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Data Analyst',
  'DevOps Engineer'
]

const CAREER_SUGGESTED_SKILLS = {
  'Frontend Developer': [
    'HTML5 / CSS3 / Modern Layouts',
    'JavaScript (ES2024+)',
    'TypeScript',
    'React / Next.js Frameworks',
    'State Management (Zustand / Redux)',
    'Responsive Design & Accessibility (WCAG)',
    'Web Performance & Core Web Vitals',
    'Frontend Testing (Jest / Playwright)',
    'Build Tools (Vite / Webpack)'
  ],
  'Backend Developer': [
    'Python / Go / Java',
    'RESTful APIs & gRPC Architecture',
    'Relational Databases (PostgreSQL / SQLite)',
    'Caching & In-Memory Stores (Redis)',
    'Database Indexing & Query Tuning',
    'Asynchronous Queues (Kafka / RabbitMQ)',
    'Authentication & Security (OAuth2 / JWT)',
    'Docker & Microservices',
    'Distributed Logging & Telemetry'
  ],
  'Full-Stack Developer': [
    'React / Next.js / TypeScript',
    'Node.js / Python / Backend API Design',
    'Relational & NoSQL Database Design',
    'State Management & Server State Sync',
    'Authentication & Session Architecture',
    'CI/CD Pipelines & Cloud Deployment',
    'End-to-End Testing (Playwright / Cypress)',
    'API Security & OWASP Standards'
  ],
  'AI/ML Engineer': [
    'Python & Scientific Computing',
    'PyTorch / Deep Learning Frameworks',
    'Vector Databases & HNSW Indexing',
    'LLM Serving & PagedAttention (vLLM / TensorRT)',
    'Retrieval-Augmented Generation (RAG) Architecture',
    'Model Evaluation & Rubric Frameworks (Ragas)',
    'GPU Acceleration & CUDA / NCCL Tuning',
    'Distributed Training & Microservices'
  ],
  'Cybersecurity Analyst': [
    'Network Security & TCP/IP Protocols',
    'SIEM & Security Log Monitoring (Splunk / ELK)',
    'Threat Modeling & Incident Response',
    'Vulnerability Assessment & Pen Testing',
    'Cryptography, TLS & PKI',
    'OWASP Top 10 Web Application Security',
    'Identity & Access Management (IAM / Zero Trust)',
    'Cloud Security Posture (AWS / Azure)'
  ],
  'Data Analyst': [
    'Advanced SQL (Window Functions, CTEs)',
    'Python Data Manipulation (Pandas, Polars)',
    'Data Visualization (Tableau, PowerBI, D3)',
    'Statistical Modeling & A/B Testing',
    'Data Warehousing (BigQuery, Snowflake)',
    'ETL Pipeline Automation',
    'Business Metrics & KPI Modeling',
    'Data Quality Governance & Cleansing'
  ],
  'DevOps Engineer': [
    'Linux OS Internals & Bash Scripting',
    'Docker & Container Runtimes',
    'Kubernetes Orchestration & Helm',
    'Infrastructure as Code (Terraform)',
    'CI/CD Pipelines (GitHub Actions / GitLab CI)',
    'Cloud Infrastructure (AWS / GCP)',
    'Observability & Metrics (Prometheus / Grafana)',
    'Networking & Service Mesh (Envoy / Istio)'
  ]
}

export default function CareerAnalyzer({
  onNavigate,
  onAnalyze,
  isAnalyzing,
  careerData,
  currentUser
}) {
  const profile = careerData?.profile
  const analysis = careerData?.analysis

  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Frontend Developer')
  const [targetCompany, setTargetCompany] = useState(profile?.target_company || 'Tech Leader')
  const [level, setLevel] = useState(profile?.experience_level || 'Junior')
  const [velocity, setVelocity] = useState(profile?.velocity_hrs || 10)
  const [repoUrl, setRepoUrl] = useState(profile?.github_repo || '')
  const [education, setEducation] = useState(profile?.education || '')
  
  // User skills list: array of { name: string, level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }
  const [skillsList, setSkillsList] = useState([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate')
  const [isScanning, setIsScanning] = useState(false)
  const [showRubricModal, setShowRubricModal] = useState(false)

  // Initialize skills from profile if available
  useEffect(() => {
    if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
      setSkillsList(
        profile.skills.map((s) => (typeof s === 'string' ? { name: s, level: 'intermediate' } : s))
      )
    }
  }, [profile])

  const handleAddSkill = (e) => {
    e?.preventDefault()
    if (!newSkillName.trim()) return
    const exists = skillsList.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    )
    if (!exists) {
      setSkillsList((prev) => [...prev, { name: newSkillName.trim(), level: newSkillLevel }])
    }
    setNewSkillName('')
  }

  const handleQuickAddSuggested = (skillName) => {
    const exists = skillsList.some((s) => s.name.toLowerCase() === skillName.toLowerCase())
    if (!exists) {
      setSkillsList((prev) => [...prev, { name: skillName, level: 'intermediate' }])
    }
  }

  const handleRemoveSkill = (skillName) => {
    setSkillsList((prev) => prev.filter((s) => s.name !== skillName))
  }

  const handleSkillLevelChange = (skillName, newLevel) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, level: newLevel } : s))
    )
  }

  const handleSimulateScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
    }, 1200)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onAnalyze?.({
      target_role: targetRole,
      target_company: targetCompany,
      experience_level: level,
      domain: 'general',
      skills: skillsList,
      github_repo: repoUrl,
      education,
      velocity_hrs: Number(velocity)
    })
  }

  const suggestedSkills = CAREER_SUGGESTED_SKILLS[targetRole] || []
  const readiness = analysis?.readiness_score ?? 0

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Rubric Modal */}
      {showRubricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">grading</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {targetRole} Benchmark Rubric
                </h3>
              </div>
              <button
                onClick={() => setShowRubricModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <p>
                Evaluation is calibrated against standard industry competency models for <strong>{targetRole}</strong> at <strong>{level}</strong> level.
              </p>
              <div className="space-y-2 mt-2">
                {suggestedSkills.map((s, idx) => {
                  const hasIt = skillsList.find((u) => u.name.toLowerCase() === s.toLowerCase())
                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <span className="font-medium text-on-surface">{s}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        hasIt ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
                      }`}>
                        {hasIt ? `Current: ${hasIt.level}` : 'Gap • Not Added'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRubricModal(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md cursor-pointer hover:bg-primary-container"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Headline & Telemetry Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-2">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-space-xs mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Dynamic Calibration Engine
            </span>
            <span className="text-outline text-label-sm">•</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {targetRole}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Career Baseline Analyzer
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
            Configure your target career, self-reported skills, and proficiencies to calculate an objective readiness score and personalized roadmap.
          </p>
        </div>

        {/* Metric Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-variant/40 shadow-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${readiness > 0 ? 'bg-primary' : 'bg-outline'}`}></span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              {readiness}% Estimated Readiness
            </span>
          </div>
          <button
            onClick={() => setShowRubricModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-xs transition-all font-label-md text-label-md font-medium border border-surface-variant/40 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">rule</span>
            <span>View Rubric Criteria</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Assessment Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Inputs & Form */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-surface-variant/40 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Career Dropdown */}
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-2">
                1. Select Target Career Path
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {CAREER_OPTIONS.map((career) => (
                  <button
                    key={career}
                    type="button"
                    onClick={() => setTargetRole(career)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      targetRole === career
                        ? 'border-primary bg-primary/10 text-on-surface font-semibold shadow-xs ring-1 ring-primary'
                        : 'border-surface-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="text-[13px]">{career}</span>
                    <span className="text-[11px] text-outline mt-1">
                      {CAREER_SUGGESTED_SKILLS[career]?.length || 8} Core Benchmarks
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Company & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                  Target Company / Tier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Vercel, Shopify"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary focus:bg-surface-container-lowest"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                  Target Seniority Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary focus:bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Junior">Junior (0 - 2 Years)</option>
                  <option value="Mid-Level">Mid-Level (3 - 5 Years)</option>
                  <option value="Senior">Senior (5 - 8 Years)</option>
                  <option value="Staff / Principal">Staff / Principal (8+ Years)</option>
                </select>
              </div>
            </div>

            {/* Current Self-Reported Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-label-md text-label-md font-semibold text-on-surface">
                  2. Your Current Skills &amp; Proficiencies ({skillsList.length})
                </label>
                <span className="text-[11px] text-outline">
                  Self-reported (Estimated)
                </span>
              </div>

              {/* Add Skill Input Form */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a skill (e.g. React, SQL, Docker, Python)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary focus:bg-surface-container-lowest"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary cursor-pointer"
                >
                  <option value="beginner">Beginner (25%)</option>
                  <option value="intermediate">Intermediate (50%)</option>
                  <option value="advanced">Advanced (75%)</option>
                  <option value="expert">Expert (90%)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Added Skills Chips */}
              <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-surface-container-low border border-surface-variant/20 mb-4">
                {skillsList.length === 0 ? (
                  <span className="text-outline text-body-sm italic">
                    No skills entered yet. Add skills or click suggestions below to start your evaluation.
                  </span>
                ) : (
                  skillsList.map((skill) => (
                    <div
                      key={skill.name}
                      className="inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-lg bg-surface-container-lowest border border-surface-variant/40 text-on-surface text-body-sm shadow-xs"
                    >
                      <span className="font-medium">{skill.name}</span>
                      <select
                        value={skill.level}
                        onChange={(e) => handleSkillLevelChange(skill.name, e.target.value)}
                        className="text-[11px] font-semibold bg-primary/10 text-primary rounded px-1.5 py-0.5 border-none outline-none cursor-pointer"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Interm.</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="p-0.5 text-outline hover:text-error transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Suggested Skills for Target Career */}
              <div>
                <span className="font-label-sm text-label-sm text-outline block mb-1.5">
                  Core skills expected for {targetRole}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((s) => {
                    const isAdded = skillsList.some((u) => u.name.toLowerCase() === s.toLowerCase())
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleQuickAddSuggested(s)}
                        disabled={isAdded}
                        className={`text-[12px] px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          isAdded
                            ? 'bg-primary/10 text-primary font-medium opacity-60 cursor-default'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-surface-variant/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isAdded ? 'check' : 'add'}
                        </span>
                        <span>{s}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Optional Repository & Study Velocity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                  GitHub Codebase (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm font-mono text-[12px] outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isScanning || !repoUrl}
                    className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isScanning ? 'sync' : 'search'}
                    </span>
                    <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface">
                    Study Velocity
                  </label>
                  <span className="text-[12px] font-bold text-primary">{velocity} hrs / week</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-surface-variant/30 flex items-center justify-between">
              <span className="text-body-sm text-outline">
                Saves to your local SQLite profile
              </span>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg font-semibold transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Calculating Diagnostics...</span>
                  </>
                ) : (
                  <>
                    <span>Run Career Analysis</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (4 cols): Real-Time Diagnostics Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-surface-variant/40 space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Live Evaluation Preview
            </h3>

            {/* Readiness Ring */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-variant"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-700"
                    strokeDasharray={`${readiness}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-[14px] text-on-surface">
                  {readiness}%
                </span>
              </div>
              <div>
                <span className="font-semibold text-on-surface block text-[13px]">
                  Estimated Readiness
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  {skillsList.length === 0
                    ? 'No skills added yet'
                    : `${skillsList.length} self-reported skills`}
                </span>
              </div>
            </div>

            {/* Real Pro Insight */}
            <div className="p-4 rounded-xl bg-surface-container-low text-body-sm text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary block mb-1">
                Calibration Summary
              </span>
              <p className="text-[12px]">
                {analysis?.pro_insight ||
                  `Select your target role and add your current skills above to calculate your competency gaps against ${targetRole} standards.`}
              </p>
            </div>

            {/* Source Label */}
            <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-surface-variant/20">
              <span>Calibration Standard</span>
              <span className="font-medium text-on-surface">
                {analysis?.source === 'real_gemini_ai' ? 'Google Gemini 2.5 AI' : 'Career Engine v2.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
