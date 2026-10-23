import { useState } from 'react'

export default function ResumeEditor({
  resumeData,
  onChange,
  onRegenerateSection,
  regeneratingSection = null
}) {
  const [activeAccordion, setActiveAccordion] = useState('summary')
  const [instructions, setInstructions] = useState({})

  const updatePersonalInfo = (field, value) => {
    onChange({
      ...resumeData,
      personal_info: {
        ...(resumeData.personal_info || {}),
        [field]: value
      }
    })
  }

  const updateSummary = (value) => {
    onChange({
      ...resumeData,
      summary: value
    })
  }

  const updateSkillsCategory = (catKey, valueList) => {
    onChange({
      ...resumeData,
      technical_skills: {
        ...(resumeData.technical_skills || {}),
        [catKey]: valueList
      }
    })
  }

  const handleAddSkillTag = (catKey, tag) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    const current = resumeData.technical_skills?.[catKey] || []
    if (!current.includes(trimmed)) {
      updateSkillsCategory(catKey, [...current, trimmed])
    }
  }

  const handleRemoveSkillTag = (catKey, index) => {
    const current = resumeData.technical_skills?.[catKey] || []
    updateSkillsCategory(catKey, current.filter((_, i) => i !== index))
  }

  // Projects handlers
  const handleUpdateProject = (index, field, value) => {
    const projs = [...(resumeData.projects || [])]
    projs[index] = { ...projs[index], [field]: value }
    onChange({ ...resumeData, projects: projs })
  }

  const handleAddProject = () => {
    const projs = [...(resumeData.projects || [])]
    projs.push({
      title: 'New Technical Project',
      technologies: ['React', 'FastAPI'],
      date: new Date().getFullYear().toString(),
      bullets: ['Architected and deployed responsive full-stack system with automated test coverage.']
    })
    onChange({ ...resumeData, projects: projs })
  }

  const handleRemoveProject = (index) => {
    const projs = (resumeData.projects || []).filter((_, i) => i !== index)
    onChange({ ...resumeData, projects: projs })
  }

  const handleAddProjectBullet = (projIndex) => {
    const projs = [...(resumeData.projects || [])]
    const bullets = [...(projs[projIndex].bullets || [])]
    bullets.push('Engineered modular component architecture improving responsiveness and performance.')
    projs[projIndex].bullets = bullets
    onChange({ ...resumeData, projects: projs })
  }

  const handleUpdateProjectBullet = (projIndex, bulletIndex, value) => {
    const projs = [...(resumeData.projects || [])]
    const bullets = [...(projs[projIndex].bullets || [])]
    bullets[bulletIndex] = value
    projs[projIndex].bullets = bullets
    onChange({ ...resumeData, projects: projs })
  }

  const handleRemoveProjectBullet = (projIndex, bulletIndex) => {
    const projs = [...(resumeData.projects || [])]
    const bullets = (projs[projIndex].bullets || []).filter((_, i) => i !== bulletIndex)
    projs[projIndex].bullets = bullets
    onChange({ ...resumeData, projects: projs })
  }

  // Experience handlers
  const handleAddExperience = () => {
    const exp = [...(resumeData.experience || [])]
    exp.push({
      role: 'Software Engineering Intern',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      dates: '2025 - 2026',
      bullets: ['Contributed to production codebases and participated in agile sprints.']
    })
    onChange({
      ...resumeData,
      experience: exp,
      section_visibility: {
        ...(resumeData.section_visibility || {}),
        experience: true
      }
    })
  }

  const handleRemoveExperience = (index) => {
    const exp = (resumeData.experience || []).filter((_, i) => i !== index)
    onChange({ ...resumeData, experience: exp })
  }

  const handleUpdateExperience = (index, field, value) => {
    const exp = [...(resumeData.experience || [])]
    exp[index] = { ...exp[index], [field]: value }
    onChange({ ...resumeData, experience: exp })
  }

  const handleAddExpBullet = (expIndex) => {
    const exp = [...(resumeData.experience || [])]
    const bullets = [...(exp[expIndex].bullets || [])]
    bullets.push('Improved pipeline stability and reduced regression bugs.')
    exp[expIndex].bullets = bullets
    onChange({ ...resumeData, experience: exp })
  }

  const handleUpdateExpBullet = (expIndex, bulletIndex, value) => {
    const exp = [...(resumeData.experience || [])]
    const bullets = [...(exp[expIndex].bullets || [])]
    bullets[bulletIndex] = value
    exp[expIndex].bullets = bullets
    onChange({ ...resumeData, experience: exp })
  }

  const handleRemoveExpBullet = (expIndex, bulletIndex) => {
    const exp = [...(resumeData.experience || [])]
    const bullets = (exp[expIndex].bullets || []).filter((_, i) => i !== bulletIndex)
    exp[expIndex].bullets = bullets
    onChange({ ...resumeData, experience: exp })
  }

  // Education handlers
  const handleUpdateEducation = (index, field, value) => {
    const edu = [...(resumeData.education || [])]
    edu[index] = { ...edu[index], [field]: value }
    onChange({ ...resumeData, education: edu })
  }

  const handleAddEducation = () => {
    const edu = [...(resumeData.education || [])]
    edu.push({
      degree: 'B.S. in Computer Science',
      institution: 'University / Technical College',
      year: new Date().getFullYear().toString(),
      details: 'Relevant Coursework: Data Structures, Algorithms, Web Development, Databases'
    })
    onChange({ ...resumeData, education: edu })
  }

  const handleRemoveEducation = (index) => {
    const edu = (resumeData.education || []).filter((_, i) => i !== index)
    onChange({ ...resumeData, education: edu })
  }

  // Certifications handlers
  const handleAddCertification = () => {
    const certs = [...(resumeData.certifications || [])]
    certs.push({
      name: 'Full Stack Web Engineering Certificate',
      issuer: 'AI Career Navigator',
      date: new Date().getFullYear().toString()
    })
    onChange({ ...resumeData, certifications: certs })
  }

  const handleRemoveCertification = (index) => {
    const certs = (resumeData.certifications || []).filter((_, i) => i !== index)
    onChange({ ...resumeData, certifications: certs })
  }

  const handleUpdateCertification = (index, field, value) => {
    const certs = [...(resumeData.certifications || [])]
    certs[index] = { ...certs[index], [field]: value }
    onChange({ ...resumeData, certifications: certs })
  }

  // Visibility toggle
  const toggleVisibility = (secKey) => {
    const current = resumeData.section_visibility || {}
    onChange({
      ...resumeData,
      section_visibility: {
        ...current,
        [secKey]: current[secKey] === false ? true : false
      }
    })
  }

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id)
  }

  const pInfo = resumeData.personal_info || {}
  const skills = resumeData.technical_skills || {}
  const visibility = resumeData.section_visibility || {}

  return (
    <div className="space-y-4">
      {/* 1. Personal Information */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('personal')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f]">person</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Personal Info</h4>
              <p className="text-[11px] text-slate-500">Name, Email, Links, Location</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400">
            {activeAccordion === 'personal' ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {activeAccordion === 'personal' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={pInfo.name || ''}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                value={pInfo.email || ''}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={pInfo.phone || ''}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Location</label>
              <input
                type="text"
                value={pInfo.location || ''}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                placeholder="San Francisco, CA / Remote"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">GitHub URL</label>
              <input
                type="text"
                value={pInfo.github || ''}
                onChange={(e) => updatePersonalInfo('github', e.target.value)}
                placeholder="github.com/username"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={pInfo.linkedin || ''}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Portfolio / Personal Site</label>
              <input
                type="text"
                value={pInfo.portfolio || ''}
                onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                placeholder="alexmorgan.dev"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Professional Summary */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors">
          <button
            onClick={() => toggleAccordion('summary')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <span className="material-symbols-outlined text-[#00685f]">description</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Professional Summary</h4>
              <p className="text-[11px] text-slate-500">Concise executive opening pitch</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerateSection('summary', instructions['summary'] || '')}
              disabled={regeneratingSection === 'summary'}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#00685f] hover:bg-[#00685f]/10 px-2 py-1 rounded-lg border border-[#00685f]/30 transition"
              title="Regenerate Summary with AI"
            >
              <span className={`material-symbols-outlined text-[14px] ${regeneratingSection === 'summary' ? 'animate-spin' : ''}`}>
                {regeneratingSection === 'summary' ? 'sync' : 'auto_awesome'}
              </span>
              <span>{regeneratingSection === 'summary' ? 'Polishing...' : 'AI Enhance'}</span>
            </button>
            <button
              onClick={() => toggleAccordion('summary')}
              className="text-slate-400 p-1"
            >
              <span className="material-symbols-outlined text-slate-400">
                {activeAccordion === 'summary' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {activeAccordion === 'summary' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-3">
            <textarea
              rows={4}
              value={resumeData.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Results-driven developer specialized in building performant web applications..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00685f] leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional AI prompt: e.g. Emphasize backend scalability"
                value={instructions['summary'] || ''}
                onChange={(e) => setInstructions({ ...instructions, summary: e.target.value })}
                className="flex-1 text-[11px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202524] text-slate-700 dark:text-slate-300"
              />
              <button
                onClick={() => onRegenerateSection('summary', instructions['summary'] || '')}
                disabled={regeneratingSection === 'summary'}
                className="text-[11px] font-semibold bg-[#00685f] hover:bg-[#005049] text-white px-3 py-1.5 rounded-lg transition"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Technical Skills */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors">
          <button
            onClick={() => toggleAccordion('skills')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <span className="material-symbols-outlined text-[#00685f]">code</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Technical Skills</h4>
              <p className="text-[11px] text-slate-500">Categorized ATS keywords</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerateSection('technical_skills', instructions['skills'] || '')}
              disabled={regeneratingSection === 'technical_skills'}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#00685f] hover:bg-[#00685f]/10 px-2 py-1 rounded-lg border border-[#00685f]/30 transition"
            >
              <span className={`material-symbols-outlined text-[14px] ${regeneratingSection === 'technical_skills' ? 'animate-spin' : ''}`}>
                {regeneratingSection === 'technical_skills' ? 'sync' : 'auto_awesome'}
              </span>
              <span>{regeneratingSection === 'technical_skills' ? 'Polishing...' : 'AI Categorize'}</span>
            </button>
            <button onClick={() => toggleAccordion('skills')} className="text-slate-400 p-1">
              <span className="material-symbols-outlined">
                {activeAccordion === 'skills' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {activeAccordion === 'skills' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 mt-3">
            {[
              { key: 'languages', label: 'Languages', placeholder: 'e.g. TypeScript, Python, SQL' },
              { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'e.g. React, Vite, FastAPI, Tailwind CSS' },
              { key: 'developer_tools', label: 'Developer Tools', placeholder: 'e.g. Git, Docker, SQLite, Postman' },
              { key: 'core_competencies', label: 'Core Competencies', placeholder: 'e.g. REST APIs, System Design, CI/CD' }
            ].map((cat) => {
              const tags = skills[cat.key] || []
              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {cat.label}
                    </label>
                    <span className="text-[10px] text-slate-400">{tags.length} skills</span>
                  </div>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-[#202524] rounded-xl border border-slate-200 dark:border-slate-700 min-h-[38px]">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#2a302f] border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 shadow-2xs"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveSkillTag(cat.key, idx)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+ Add and hit Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkillTag(cat.key, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="text-xs bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 px-1 py-0.5 min-w-[120px] flex-1"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Technical Projects */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors">
          <button
            onClick={() => toggleAccordion('projects')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <span className="material-symbols-outlined text-[#00685f]">folder_open</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Technical Projects</h4>
              <p className="text-[11px] text-slate-500">Verified portfolio and sprint builds</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerateSection('projects', instructions['projects'] || '')}
              disabled={regeneratingSection === 'projects'}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#00685f] hover:bg-[#00685f]/10 px-2 py-1 rounded-lg border border-[#00685f]/30 transition"
            >
              <span className={`material-symbols-outlined text-[14px] ${regeneratingSection === 'projects' ? 'animate-spin' : ''}`}>
                {regeneratingSection === 'projects' ? 'sync' : 'auto_awesome'}
              </span>
              <span>{regeneratingSection === 'projects' ? 'Polishing...' : 'AI Action Verbs'}</span>
            </button>
            <button onClick={() => toggleAccordion('projects')} className="text-slate-400 p-1">
              <span className="material-symbols-outlined">
                {activeAccordion === 'projects' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {activeAccordion === 'projects' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 mt-3">
            {(resumeData.projects || []).map((proj, pIdx) => (
              <div
                key={pIdx}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#202524]/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={proj.title || ''}
                    onChange={(e) => handleUpdateProject(pIdx, 'title', e.target.value)}
                    placeholder="Project Name"
                    className="font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white flex-1"
                  />
                  <input
                    type="text"
                    value={proj.date || ''}
                    onChange={(e) => handleUpdateProject(pIdx, 'date', e.target.value)}
                    placeholder="e.g. 2026"
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white w-20 text-center"
                  />
                  <button
                    onClick={() => handleRemoveProject(pIdx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Delete project"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Technologies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(proj.technologies || []).join(', ')}
                    onChange={(e) =>
                      handleUpdateProject(
                        pIdx,
                        'technologies',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="React, FastAPI, SQLite, Tailwind"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Impact Bullets</span>
                    <button
                      onClick={() => handleAddProjectBullet(pIdx)}
                      className="text-[11px] font-semibold text-[#00685f] hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">add</span> Add Bullet
                    </button>
                  </div>
                  {(proj.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => handleUpdateProjectBullet(pIdx, bIdx, e.target.value)}
                        className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-800 dark:text-slate-200 leading-relaxed"
                      />
                      <button
                        onClick={() => handleRemoveProjectBullet(pIdx, bIdx)}
                        className="text-slate-400 hover:text-red-500 mt-2 p-1"
                        title="Remove bullet"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleAddProject}
              className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#00685f] rounded-xl text-xs font-semibold text-[#00685f] hover:bg-[#00685f]/5 transition flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">add_circle</span> Add Technical Project
            </button>
          </div>
        )}
      </div>

      {/* 5. Work Experience (Collapsible & Toggleable) */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors">
          <button
            onClick={() => toggleAccordion('experience')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <span className="material-symbols-outlined text-[#00685f]">business_center</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Professional Experience</h4>
              <p className="text-[11px] text-slate-500">Past internships, contracts, or roles</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer mr-2">
              <input
                type="checkbox"
                checked={visibility.experience !== false}
                onChange={() => toggleVisibility('experience')}
                className="rounded accent-[#00685f]"
              />
              <span>Include in Resume</span>
            </label>
            <button onClick={() => toggleAccordion('experience')} className="text-slate-400 p-1">
              <span className="material-symbols-outlined">
                {activeAccordion === 'experience' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {activeAccordion === 'experience' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 mt-3">
            {(resumeData.experience || []).map((exp, eIdx) => (
              <div
                key={eIdx}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#202524]/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.role || ''}
                    onChange={(e) => handleUpdateExperience(eIdx, 'role', e.target.value)}
                    placeholder="Role Title (e.g. Frontend Engineer)"
                    className="font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => handleUpdateExperience(eIdx, 'company', e.target.value)}
                    placeholder="Company Name"
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={exp.dates || ''}
                    onChange={(e) => handleUpdateExperience(eIdx, 'dates', e.target.value)}
                    placeholder="Dates (e.g. 2024 - Present)"
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => handleUpdateExperience(eIdx, 'location', e.target.value)}
                      placeholder="Location (e.g. San Francisco / Remote)"
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleRemoveExperience(eIdx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Delete experience"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accomplishments</span>
                    <button
                      onClick={() => handleAddExpBullet(eIdx)}
                      className="text-[11px] font-semibold text-[#00685f] hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">add</span> Add Bullet
                    </button>
                  </div>
                  {(exp.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => handleUpdateExpBullet(eIdx, bIdx, e.target.value)}
                        className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-800 dark:text-slate-200 leading-relaxed"
                      />
                      <button
                        onClick={() => handleRemoveExpBullet(eIdx, bIdx)}
                        className="text-slate-400 hover:text-red-500 mt-2 p-1"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleAddExperience}
              className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#00685f] rounded-xl text-xs font-semibold text-[#00685f] hover:bg-[#00685f]/5 transition flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">add_circle</span> Add Experience Entry
            </button>
          </div>
        )}
      </div>

      {/* 6. Education */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('education')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f]">school</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Education</h4>
              <p className="text-[11px] text-slate-500">Degrees, academic background, coursework</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400">
            {activeAccordion === 'education' ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {activeAccordion === 'education' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-3">
            {(resumeData.education || []).map((edu, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#202524] border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                    placeholder="Degree / Program"
                    className="font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white flex-1"
                  />
                  <input
                    type="text"
                    value={edu.year || ''}
                    onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                    placeholder="Year"
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white w-20 text-center"
                  />
                  <button
                    onClick={() => handleRemoveEducation(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={edu.institution || ''}
                  onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                  placeholder="Institution / University Name"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-800 dark:text-slate-200"
                />
                <input
                  type="text"
                  value={edu.details || ''}
                  onChange={(e) => handleUpdateEducation(idx, 'details', e.target.value)}
                  placeholder="Relevant Coursework, Honors, or Capstone"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-700 dark:text-slate-300"
                />
              </div>
            ))}
            <button
              onClick={handleAddEducation}
              className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#00685f] rounded-xl text-xs font-semibold text-[#00685f] hover:bg-[#00685f]/5 transition flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">add_circle</span> Add Education
            </button>
          </div>
        )}
      </div>

      {/* 7. Certifications & Badges */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e0e3e1] dark:border-[#3f4946] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('certifications')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-[#202524] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f]">workspace_premium</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Certifications & Milestones</h4>
              <p className="text-[11px] text-slate-500">Verified credentials and certificates</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400">
            {activeAccordion === 'certifications' ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {activeAccordion === 'certifications' && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-3">
            {(resumeData.certifications || []).map((cert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#202524] border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => handleUpdateCertification(idx, 'name', e.target.value)}
                    placeholder="Certificate Title"
                    className="font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white flex-1"
                  />
                  <input
                    type="text"
                    value={cert.date || ''}
                    onChange={(e) => handleUpdateCertification(idx, 'date', e.target.value)}
                    placeholder="Year"
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-900 dark:text-white w-20 text-center"
                  />
                  <button
                    onClick={() => handleRemoveCertification(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={cert.issuer || ''}
                  onChange={(e) => handleUpdateCertification(idx, 'issuer', e.target.value)}
                  placeholder="Issuing Organization"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#191c1b] text-slate-800 dark:text-slate-200"
                />
              </div>
            ))}
            <button
              onClick={handleAddCertification}
              className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#00685f] rounded-xl text-xs font-semibold text-[#00685f] hover:bg-[#00685f]/5 transition flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">add_circle</span> Add Certification
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
