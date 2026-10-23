import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const SUPPORTED_CAREERS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Data Analyst',
  'DevOps Engineer'
]

export default function Layout({
  activeTab,
  onSelectTab,
  currentUser,
  careerData,
  onLogout,
  onUpdateProfile,
  children
}) {
  const [activeModal, setActiveModal] = useState(null) // 'help' | 'settings' | 'profile' | 'edit-profile'

  const profile = careerData?.profile
  const analysis = careerData?.analysis
  const readiness = analysis?.readiness_score ?? profile?.readiness_score ?? 0
  const targetRole = profile?.target_role || 'Career Not Selected'

  // Edit Profile Form State
  const [editName, setEditName] = useState(profile?.candidate_name || currentUser?.name || '')
  const [editRole, setEditRole] = useState(profile?.target_role || 'Frontend Developer')
  const [editCompany, setEditCompany] = useState(profile?.target_company || 'Tech Leader')
  const [editLevel, setEditLevel] = useState(profile?.experience_level || 'Junior')
  const [editVelocity, setEditVelocity] = useState(profile?.velocity_hrs || 10)
  const [editRepo, setEditRepo] = useState(profile?.github_repo || '')
  const [editEducation, setEditEducation] = useState(profile?.education || '')

  const handleSaveProfile = (e) => {
    e.preventDefault()
    onUpdateProfile?.({
      candidate_name: editName,
      target_role: editRole,
      target_company: editCompany,
      experience_level: editLevel,
      velocity_hrs: Number(editVelocity),
      github_repo: editRepo,
      education: editEducation
    })
    setActiveModal(null)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">help</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Platform Help &amp; Reference Guide
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-4 font-body-sm text-body-sm text-on-surface-variant max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-semibold text-on-surface mb-1">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex justify-between">
                    <span>Quick Spotlight Search</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-variant font-mono">⌘K / Ctrl+K</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex justify-between">
                    <span>Dismiss Overlays</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-variant font-mono">Esc</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-on-surface mb-1">7 Supported Career Paths</h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {SUPPORTED_CAREERS.map((c) => (
                    <div key={c} className="p-2 rounded bg-surface-container-low flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span className="font-medium text-on-surface">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-on-surface mb-1">How Readiness is Calculated</h4>
                <p className="text-[12px]">
                  Readiness scores represent the fulfillment percentage of your self-reported skills against documented industry benchmarks. Completing roadmap phases, quizzes, and mock interview simulations improves your measured readiness rating.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md cursor-pointer hover:bg-primary-container"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">settings</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  System Settings &amp; Telemetry
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Authenticated User</div>
                  <div className="text-[12px]">{currentUser?.email}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/15 text-primary">
                  SESSION ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Backend API Gateway</div>
                  <div className="text-[12px]">FastAPI on port 8000 with HttpOnly Cookies</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/15 text-primary">
                  ONLINE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Database Engine</div>
                  <div className="text-[12px]">SQLite 3 (Isolated User Storage)</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container-high text-on-surface-variant">
                  SYNCHRONIZED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Target Career Path</div>
                  <div className="text-[12px]">{targetRole}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveModal('edit-profile'); }}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Change Career →
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => { setActiveModal(null); onLogout?.(); }}
                className="px-4 py-2 rounded-lg text-error hover:bg-error-container/20 font-label-md font-semibold cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md cursor-pointer hover:bg-primary-container"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Dossier Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">account_circle</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Candidate Profile Dossier
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-4 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[18px]">
                    {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AC'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface text-label-lg">{currentUser?.name}</h4>
                    <p className="text-[12px]">{currentUser?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('edit-profile')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-variant/40 text-primary font-label-sm font-semibold hover:bg-surface-container cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="text-outline block">Target Career</span>
                  <span className="font-semibold text-on-surface">{targetRole}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="text-outline block">Experience Level</span>
                  <span className="font-semibold text-on-surface">{profile?.experience_level || 'Junior'}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="text-outline block">Readiness Rating</span>
                  <span className="font-semibold text-primary">{readiness}% Calculated</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="text-outline block">Weekly Velocity</span>
                  <span className="font-semibold text-on-surface">{profile?.velocity_hrs || 10}h / week</span>
                </div>
              </div>

              {profile?.github_repo && (
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px]">code</span>
                    <span className="font-mono truncate">{profile.github_repo}</span>
                  </div>
                  <span className="text-primary font-semibold flex-shrink-0">Linked</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => { setActiveModal(null); onLogout?.(); }}
                className="px-4 py-2 rounded-lg text-error hover:bg-error-container/20 font-label-md font-semibold cursor-pointer"
              >
                Sign Out
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); onSelectTab('career-analyzer'); }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container cursor-pointer"
                >
                  Skill Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {activeModal === 'edit-profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Edit Career Trajectory
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                  Target Career
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary cursor-pointer"
                >
                  {SUPPORTED_CAREERS.map((career) => (
                    <option key={career} value={career}>{career}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                    Experience Level
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Junior">Junior (0-2 Yrs)</option>
                    <option value="Mid-Level">Mid-Level (3-5 Yrs)</option>
                    <option value="Senior">Senior (5-8 Yrs)</option>
                    <option value="Staff / Principal">Staff / Principal (8+ Yrs)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                    Study Hours / Wk
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editVelocity}
                    onChange={(e) => setEditVelocity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                  Target Company / Benchmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Vercel, Shopify"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                  GitHub Repository (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={editRepo}
                  onChange={(e) => setEditRepo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant/40 text-on-surface text-body-sm outline-none focus:border-primary font-mono text-[12px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container cursor-pointer font-semibold shadow-sm"
                >
                  Save &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        currentUser={currentUser}
        careerData={careerData}
        onOpenModal={setActiveModal}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col flex-1 min-h-screen w-full">
        {/* Fixed Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          currentUser={currentUser}
          careerData={careerData}
          onOpenModal={setActiveModal}
        />

        {/* Content View Container */}
        <main className="w-full pt-16 bg-background flex-1 px-6 sm:px-8 lg:px-margin-desktop py-space-xl transition-all">
          <div className="max-w-[1680px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
