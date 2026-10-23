import React from 'react'
import { NAV_ITEMS } from '../../constants/navigation'

export default function Sidebar({
  activeTab,
  onSelectTab,
  currentUser,
  careerData,
  onOpenModal
}) {
  const profile = careerData?.profile
  const displayName = profile?.candidate_name || currentUser?.name || 'Candidate'
  const displayRole = profile?.target_role || 'General Track'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'CA'

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.06)] select-none">
      <div className="flex flex-col">
        {/* Brand / Logo */}
        <div className="h-16 px-space-lg flex items-center justify-between border-b border-surface-variant/10">
          <div
            className="flex items-center gap-space-sm cursor-pointer"
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-inverse-on-surface uppercase font-bold leading-none">
                NAVIGATOR
              </span>
              <span className="font-label-sm text-label-sm text-outline-variant leading-tight mt-0.5">
                INTELLIGENCE
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-inverse-primary text-[10px] font-bold tracking-wider">
            PRO
          </span>
        </div>

        {/* Workspace Navigation */}
        <div className="px-space-md py-space-sm">
          <p className="px-space-sm mb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline-variant font-semibold">
            Workspace
          </p>
          <nav className="space-y-1.5 flex flex-col" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-outline-variant hover:bg-surface-variant/20 hover:text-inverse-on-surface font-normal'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-body-md text-body-md truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Utility & User Profile */}
      <div className="flex flex-col gap-space-sm p-space-md bg-inverse-surface/80 border-t border-surface-variant/10">
        <nav className="space-y-0.5 flex flex-col mb-space-xs" aria-label="Auxiliary Navigation">
          <button
            type="button"
            onClick={() => onOpenModal?.('help')}
            className="flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg text-outline-variant hover:bg-surface-variant/20 hover:text-inverse-on-surface transition-all text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span className="font-body-sm text-body-sm">Help &amp; Support</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenModal?.('settings')}
            className="flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg text-outline-variant hover:bg-surface-variant/20 hover:text-inverse-on-surface transition-all text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span className="font-body-sm text-body-sm">Settings</span>
          </button>
        </nav>

        {/* User Profile Card */}
        <div
          onClick={() => onOpenModal?.('profile')}
          className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-highest/10 hover:bg-surface-container-highest/20 transition-colors cursor-pointer group"
          title="Click to view candidate profile"
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[13px]">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-fixed ring-2 ring-inverse-surface"></span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-inverse-on-surface font-semibold truncate group-hover:text-inverse-primary transition-colors">
              {displayName}
            </span>
            <span className="font-body-sm text-body-sm text-outline-variant truncate">
              {displayRole}
            </span>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[18px] group-hover:text-inverse-on-surface transition-colors">
            unfold_more
          </span>
        </div>
      </div>
    </aside>
  )
}
