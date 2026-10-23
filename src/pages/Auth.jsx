import React, { useState } from 'react'
import { loginUser, registerUser } from '../api/client'

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await loginUser({ email: email.trim(), password })
        if (res && res.user) {
          onAuthSuccess(res.user)
        }
      } else {
        const res = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          confirm_password: confirmPassword,
        })
        if (res && res.user) {
          onAuthSuccess(res.user)
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12 selection:bg-primary/20 selection:text-primary">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-default">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-md">
          <span className="material-symbols-outlined text-[28px]">explore</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md tracking-tight uppercase font-bold text-on-surface leading-none">
            NAVIGATOR
          </span>
          <span className="font-label-sm text-label-sm text-outline tracking-wider font-semibold uppercase mt-0.5">
            CAREER INTELLIGENCE PLATFORM
          </span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-sm border border-surface-variant/40 animate-fade-in">
        {/* Toggle Mode Tabs */}
        <div className="flex rounded-xl bg-surface-container-low p-1 mb-8">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {mode === 'login'
              ? 'Sign in to access your personalized career roadmap and diagnostic metrics.'
              : 'Create an account to baseline your skills and track realistic career progress.'}
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container flex items-start gap-3 text-body-sm animate-fade-in">
            <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                mail
              </span>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                lock
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                  lock_reset
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg font-semibold transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Your Account'}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-8 pt-6 border-t border-surface-variant/30 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Security Footer Note */}
      <div className="mt-8 flex items-center gap-2 text-outline font-label-sm text-label-sm">
        <span className="material-symbols-outlined text-[16px]">shield</span>
        <span>Secure Local SQLite Persistence • Salted PBKDF2 Password Hashing</span>
      </div>
    </div>
  )
}
