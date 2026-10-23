export default function ResumePreview({ resumeData, template = 'modern' }) {
  if (!resumeData) {
    return (
      <div className="bg-white dark:bg-[#191c1b] rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
        No resume data loaded.
      </div>
    )
  }

  const pInfo = resumeData.personal_info || {}
  const skills = resumeData.technical_skills || {}
  const projects = resumeData.projects || []
  const experience = resumeData.experience || []
  const education = resumeData.education || []
  const certs = resumeData.certifications || []
  const visibility = resumeData.section_visibility || {}

  // Contact items for header
  const contactParts = [
    pInfo.email,
    pInfo.phone,
    pInfo.location,
    pInfo.github,
    pInfo.linkedin,
    pInfo.portfolio
  ].filter(Boolean)

  // 1. CLASSIC ATS TEMPLATE
  if (template === 'classic') {
    return (
      <div className="bg-white text-black p-8 sm:p-12 font-serif text-[13px] leading-relaxed shadow-lg max-w-[800px] mx-auto min-h-[1050px] border border-slate-200">
        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b border-black">
          <h1 className="text-2xl font-bold tracking-wider uppercase mb-1">{pInfo.name || 'Candidate Name'}</h1>
          {resumeData.target_role && (
            <div className="text-xs font-semibold tracking-widest uppercase text-slate-700 mb-2">
              {resumeData.target_role}
            </div>
          )}
          <div className="text-[11px] text-slate-700 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
            {contactParts.map((item, idx) => (
              <span key={idx}>
                {item}
                {idx < contactParts.length - 1 && <span className="mx-1">•</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        {visibility.summary !== false && resumeData.summary && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">
              Professional Summary
            </h2>
            <p className="text-justify text-[12px]">{resumeData.summary}</p>
          </div>
        )}

        {/* Technical Skills */}
        {visibility.skills !== false && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">
              Technical Skills
            </h2>
            <div className="space-y-1 text-[12px]">
              {skills.languages?.length > 0 && (
                <div>
                  <span className="font-bold">Languages: </span>
                  {skills.languages.join(', ')}
                </div>
              )}
              {skills.frameworks?.length > 0 && (
                <div>
                  <span className="font-bold">Frameworks & Libraries: </span>
                  {skills.frameworks.join(', ')}
                </div>
              )}
              {skills.developer_tools?.length > 0 && (
                <div>
                  <span className="font-bold">Developer Tools: </span>
                  {skills.developer_tools.join(', ')}
                </div>
              )}
              {skills.core_competencies?.length > 0 && (
                <div>
                  <span className="font-bold">Core Competencies: </span>
                  {skills.core_competencies.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {visibility.projects !== false && projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">
              Key Technical Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold text-[12px]">
                    <div>
                      <span>{proj.title}</span>
                      {proj.technologies?.length > 0 && (
                        <span className="font-normal italic text-slate-700 ml-1.5">
                          | {proj.technologies.join(', ')}
                        </span>
                      )}
                    </div>
                    {proj.date && <span className="text-[11px] font-normal">{proj.date}</span>}
                  </div>
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[12px]">
                    {(proj.bullets || []).map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {visibility.experience !== false && experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline text-[12px]">
                    <div>
                      <span className="font-bold">{exp.role}</span>
                      {exp.company && <span className="italic ml-1">at {exp.company}</span>}
                      {exp.location && <span className="text-slate-600 ml-1">({exp.location})</span>}
                    </div>
                    {exp.dates && <span className="text-[11px]">{exp.dates}</span>}
                  </div>
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[12px]">
                    {(exp.bullets || []).map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {visibility.education !== false && education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">
              Education
            </h2>
            <div className="space-y-1.5">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-[12px]">
                  <div>
                    <span className="font-bold">{edu.degree}</span>
                    {edu.institution && <span className="ml-1">— {edu.institution}</span>}
                    {edu.details && <div className="text-[11px] text-slate-700 italic">{edu.details}</div>}
                  </div>
                  {edu.year && <span className="text-[11px]">{edu.year}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {visibility.certifications !== false && certs.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">
              Certifications & Milestones
            </h2>
            <div className="space-y-1">
              {certs.map((c, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-[12px]">
                  <div>
                    <span className="font-bold">{c.name}</span>
                    {c.issuer && <span className="ml-1 text-slate-700">— {c.issuer}</span>}
                  </div>
                  {c.date && <span className="text-[11px]">{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 2. MINIMALIST TEMPLATE
  if (template === 'minimal') {
    return (
      <div className="bg-white text-slate-800 p-8 sm:p-12 font-sans text-[13px] leading-relaxed shadow-lg max-w-[800px] mx-auto min-h-[1050px] border border-slate-200">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-1">{pInfo.name || 'Candidate Name'}</h1>
          {resumeData.target_role && (
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
              {resumeData.target_role}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {contactParts.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[1px] bg-slate-200 mb-6" />

        {/* Summary */}
        {visibility.summary !== false && resumeData.summary && (
          <div className="mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Summary</h2>
            <p className="text-slate-700 text-xs leading-relaxed">{resumeData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {visibility.skills !== false && (
          <div className="mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Technical Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {skills.languages?.length > 0 && (
                <div>
                  <span className="font-medium text-slate-900">Languages: </span>
                  <span className="text-slate-600">{skills.languages.join(', ')}</span>
                </div>
              )}
              {skills.frameworks?.length > 0 && (
                <div>
                  <span className="font-medium text-slate-900">Frameworks: </span>
                  <span className="text-slate-600">{skills.frameworks.join(', ')}</span>
                </div>
              )}
              {skills.developer_tools?.length > 0 && (
                <div>
                  <span className="font-medium text-slate-900">Tools: </span>
                  <span className="text-slate-600">{skills.developer_tools.join(', ')}</span>
                </div>
              )}
              {skills.core_competencies?.length > 0 && (
                <div>
                  <span className="font-medium text-slate-900">Competencies: </span>
                  <span className="text-slate-600">{skills.core_competencies.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {visibility.projects !== false && projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Key Projects</h2>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-slate-900 text-xs">{proj.title}</span>
                    {proj.date && <span className="text-[10px] text-slate-400">{proj.date}</span>}
                  </div>
                  {proj.technologies?.length > 0 && (
                    <div className="text-[11px] text-slate-500 mb-1.5">
                      {proj.technologies.join(' · ')}
                    </div>
                  )}
                  <ul className="space-y-1 text-xs text-slate-600">
                    {(proj.bullets || []).map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1 text-[10px]">—</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {visibility.experience !== false && experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900 text-xs">
                      {exp.role} · <span className="font-normal text-slate-600">{exp.company}</span>
                    </span>
                    {exp.dates && <span className="text-[10px] text-slate-400">{exp.dates}</span>}
                  </div>
                  <ul className="mt-1 space-y-1 text-xs text-slate-600">
                    {(exp.bullets || []).map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1 text-[10px]">—</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibility.education !== false && education.length > 0 && (
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Education</h2>
              {education.map((edu, idx) => (
                <div key={idx} className="mb-1 text-xs">
                  <div className="font-medium text-slate-900">{edu.degree}</div>
                  <div className="text-slate-500 text-[11px]">{edu.institution} {edu.year ? `(${edu.year})` : ''}</div>
                </div>
              ))}
            </div>
          )}
          {visibility.certifications !== false && certs.length > 0 && (
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Certifications</h2>
              {certs.map((c, idx) => (
                <div key={idx} className="mb-1 text-xs">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  <div className="text-slate-500 text-[11px]">{c.issuer} {c.date ? `(${c.date})` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 3. MODERN TECH TEMPLATE (Default)
  return (
    <div className="bg-white text-slate-800 p-8 sm:p-12 font-sans text-[13px] leading-relaxed shadow-lg max-w-[800px] mx-auto min-h-[1050px] border border-slate-200">
      {/* Header with Google Stitch Accent */}
      <div className="border-b-2 border-[#00685f] pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {pInfo.name || 'Candidate Name'}
            </h1>
            <div className="text-xs font-bold text-[#00685f] tracking-wide uppercase mt-0.5">
              {resumeData.target_role || 'Software Engineer'}
            </div>
          </div>
          <div className="text-[11px] text-slate-600 sm:text-right flex flex-wrap sm:flex-col gap-1 sm:gap-0">
            {pInfo.email && <span>{pInfo.email}</span>}
            {pInfo.phone && <span>{pInfo.phone}</span>}
            {pInfo.location && <span>{pInfo.location}</span>}
          </div>
        </div>

        {/* Links row */}
        {(pInfo.github || pInfo.linkedin || pInfo.portfolio) && (
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {pInfo.github && (
              <span className="inline-flex items-center gap-1 font-mono text-slate-700">
                <span>⌥</span> {pInfo.github}
              </span>
            )}
            {pInfo.linkedin && (
              <span className="inline-flex items-center gap-1 font-mono text-slate-700">
                <span>in</span> {pInfo.linkedin}
              </span>
            )}
            {pInfo.portfolio && (
              <span className="inline-flex items-center gap-1 font-mono text-[#00685f]">
                <span>🌐</span> {pInfo.portfolio}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {visibility.summary !== false && resumeData.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#00685f] flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-3 bg-[#00685f] rounded-xs" />
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {resumeData.summary}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {visibility.skills !== false && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#00685f] flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-3 bg-[#00685f] rounded-xs" />
            Technical Skills
          </h2>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            {skills.languages?.length > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-800 min-w-[100px] text-[11px] uppercase tracking-wider">Languages:</span>
                <span className="text-slate-700">{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks?.length > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-800 min-w-[100px] text-[11px] uppercase tracking-wider">Frameworks:</span>
                <span className="text-slate-700">{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills.developer_tools?.length > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-800 min-w-[100px] text-[11px] uppercase tracking-wider">Tools:</span>
                <span className="text-slate-700">{skills.developer_tools.join(', ')}</span>
              </div>
            )}
            {skills.core_competencies?.length > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-800 min-w-[100px] text-[11px] uppercase tracking-wider">Core:</span>
                <span className="text-slate-700">{skills.core_competencies.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Projects */}
      {visibility.projects !== false && projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#00685f] flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-3 bg-[#00685f] rounded-xs" />
            Technical Projects & Systems
          </h2>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{proj.title}</span>
                    {proj.technologies?.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00685f]/10 text-[#00685f]">
                        {proj.technologies.slice(0, 4).join(', ')}
                      </span>
                    )}
                  </div>
                  {proj.date && <span className="text-[11px] text-slate-500 font-medium">{proj.date}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700">
                  {(proj.bullets || []).map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {visibility.experience !== false && experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#00685f] flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-3 bg-[#00685f] rounded-xs" />
            Professional Experience
          </h2>
          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{exp.role}</span>
                    {exp.company && <span className="text-slate-600 font-medium ml-1">· {exp.company}</span>}
                    {exp.location && <span className="text-slate-400 text-[11px] ml-1">({exp.location})</span>}
                  </div>
                  {exp.dates && <span className="text-[11px] text-slate-500 font-medium">{exp.dates}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700">
                  {(exp.bullets || []).map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certifications Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibility.education !== false && education.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#00685f] flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-3 bg-[#00685f] rounded-xs" />
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600 text-[11px]">{edu.institution} {edu.year ? `(${edu.year})` : ''}</div>
                  {edu.details && <div className="text-slate-500 text-[10px] italic mt-0.5">{edu.details}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibility.certifications !== false && certs.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#00685f] flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-3 bg-[#00685f] rounded-xs" />
              Certifications & Badges
            </h2>
            <div className="space-y-2">
              {certs.map((c, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-slate-600 text-[11px]">{c.issuer} {c.date ? `(${c.date})` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
