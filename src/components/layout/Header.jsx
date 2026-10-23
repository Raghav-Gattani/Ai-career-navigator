import React, { useState, useEffect, useRef } from 'react'
import { NAV_ITEMS } from '../../constants/navigation'

export default function Header({
  activeTab,
  onSelectTab,
  currentUser,
  careerData,
  onOpenModal
}) {
  const currentNav = NAV_ITEMS.find((item) => item.id === activeTab)
  const currentTitle = currentNav ? currentNav.pageTitle : 'Overview'

  const profile = careerData?.profile
  const targetRole = profile?.target_role || 'Career Not Selected'
  const targetCompany = profile?.target_company ? `@ ${profile.target_company}` : ''
  const displayName = profile?.candidate_name || currentUser?.name || 'Candidate'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'CA'

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Session Authenticated',
      text: `Signed in as ${currentUser?.email}. Local SQLite persistence active.`,
      time: 'Just now',
      unread: true,
    },
    {
      id: 2,
      title: 'Calibration Engine',
      text: 'Dynamic skill requirement map configured across 7 career paths.',
      time: '5m ago',
      unread: false,
    },
  ])

  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setShowSearchDropdown(true)
      } else if (e.key === 'Escape') {
        setShowSearchDropdown(false)
        setShowNotifications(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const searchableItems = [
    { label: 'Dashboard Overview', category: 'Screen', id: 'dashboard', icon: 'dashboard' },
    { label: 'Career Analyzer & Skill Fit', category: 'Screen', id: 'career-analyzer', icon: 'analytics' },
    { label: 'Skill Gap & Execution Roadmap', category: 'Screen', id: 'skill-gap-and-roadmap', icon: 'alt_route' },
    { label: 'Learning Studio & Practice Labs', category: 'Screen', id: 'learning-studio', icon: 'school' },
    { label: 'AI Mock Interview Simulation', category: 'Screen', id: 'ai-mock-interview', icon: 'record_voice_over' },
    { label: 'Performance & Progress Reports', category: 'Screen', id: 'progress-reports', icon: 'query_stats' },
    { label: 'Frontend Developer Path', category: 'Career', id: 'career-analyzer', icon: 'devices' },
    { label: 'Backend Developer Path', category: 'Career', id: 'career-analyzer', icon: 'dns' },
    { label: 'Full-Stack Developer Path', category: 'Career', id: 'career-analyzer', icon: 'layers' },
    { label: 'AI/ML Engineer Path', category: 'Career', id: 'career-analyzer', icon: 'psychology' },
    { label: 'Cybersecurity Analyst Path', category: 'Career', id: 'career-analyzer', icon: 'shield' },
    { label: 'Data Analyst Path', category: 'Career', id: 'career-analyzer', icon: 'bar_chart' },
    { label: 'DevOps Engineer Path', category: 'Career', id: 'career-analyzer', icon: 'settings_suggest' },
  ]

  const filteredItems = searchableItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl z-40 flex items-center justify-between px-margin-desktop shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-variant/40">
      {/* Left: Breadcrumbs & Target Chip */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="hover:text-on-surface transition-colors cursor-pointer text-left"
          >
            Platform
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">{currentTitle}</span>
        </div>
        <div
          onClick={() => onOpenModal?.('edit-profile')}
          className="hidden xl:flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-xs cursor-pointer hover:bg-secondary-container/80 transition-colors"
          title="Click to edit target career"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">flag</span>
          <span className="font-label-sm text-label-sm font-medium">
            Target: {targetRole} {targetCompany}
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications, Contrast, Avatar */}
      <div className="flex items-center gap-space-md">
        {/* Search Bar with ⌘K */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchDropdown(true)
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-64 lg:w-72 pl-9 pr-12 py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-outline-variant/50"
            placeholder="Search skills, target roles, roadmap..."
            type="text"
          />
          <div className="absolute right-2.5 px-1.5 py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-sm text-[10px] tracking-wide pointer-events-none">
            ⌘K
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowSearchDropdown(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-surface-container-lowest border border-surface-variant/40 shadow-xl py-2 z-40 max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                  Quick Jump ({filteredItems.length})
                </div>
                {filteredItems.length === 0 ? (
                  <div className="p-4 text-center text-body-sm text-outline">
                    No matching destinations found.
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id)
                        setShowSearchDropdown(false)
                        setSearchQuery('')
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          {item.icon}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface truncate font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-on-surface-variant">
                        {item.category}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer relative"
            type="button"
            title="Notifications"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface-container-lowest"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container-lowest border border-surface-variant/40 shadow-xl py-3 z-40 animate-fade-in">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-surface-variant/20">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Platform Activity</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-surface-container-low max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface">{n.title}</span>
                        <span className="text-[10px] text-outline">{n.time}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 text-[12px]">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={() => onOpenModal?.('settings')}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          type="button"
          title="Telemetry & Settings"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">contrast</span>
        </button>

        {/* User Avatar */}
        <button
          onClick={() => onOpenModal?.('profile')}
          type="button"
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all font-bold text-[12px]"
          title={`${displayName} — View Profile`}
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
