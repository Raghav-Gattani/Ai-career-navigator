import React, { useState, useEffect } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CareerAnalyzer from './pages/CareerAnalyzer'
import SkillGapRoadmap from './pages/SkillGapRoadmap'
import LearningStudio from './pages/LearningStudio'
import MockInterview from './pages/MockInterview'
import ProgressReports from './pages/ProgressReports'
import Auth from './pages/Auth'
import ErrorBoundary from './components/common/ErrorBoundary'
import {
  checkAuth,
  fetchProfile,
  analyzeCareer,
  updateProfile,
  logoutUser,
  fetchHealth
} from './api/client'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [careerData, setCareerData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [notification, setNotification] = useState(null)
  const [learningStudioInitialParams, setLearningStudioInitialParams] = useState(null)

  const handleNavigate = (tab, params = null) => {
    if (tab === 'learning-studio' && params) {
      setLearningStudioInitialParams(params)
    } else if (tab !== 'learning-studio') {
      setLearningStudioInitialParams(null)
    }
    setActiveTab(tab)
  }

  // Check auth and initial status on startup
  useEffect(() => {
    async function init() {
      setIsAuthChecking(true)
      const health = await fetchHealth()
      setBackendStatus(health.status === 'healthy' ? 'online' : 'offline')

      try {
        const authData = await checkAuth()
        if (authData && authData.user) {
          setCurrentUser(authData.user)
          const profileData = await fetchProfile()
          if (profileData) {
            setCareerData(profileData)
          }
        }
      } catch (err) {
        console.warn('Initial session check:', err.message)
      } finally {
        setIsAuthChecking(false)
      }
    }
    init()
  }, [])

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user)
    showNotification(`Welcome, ${user.name}!`)
    const data = await fetchProfile()
    if (data) {
      setCareerData(data)
    }
    setActiveTab('dashboard')
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    setCareerData(null)
    showNotification('You have been signed out.')
  }

  const handleRefreshProfile = async () => {
    const data = await fetchProfile()
    if (data) {
      setCareerData(data)
    }
  }

  // Handle career analysis submission from CareerAnalyzer or Quick Wizard
  const handleAnalyzeCareer = async (formData) => {
    setIsAnalyzing(true)
    try {
      const res = await analyzeCareer(formData)
      if (res && res.data) {
        await handleRefreshProfile()
        const sourceLabel = res.data.source === 'real_gemini_ai'
          ? 'Analyzed by Google Gemini AI'
          : 'Calibrated by Career Precision Engine'
        showNotification(`${sourceLabel}: Roadmap & competency gaps calculated!`)
        setActiveTab('skill-gap-and-roadmap')
      }
    } catch (err) {
      showNotification('Analysis failed: ' + err.message, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpdateProfile = async (updatePayload) => {
    try {
      const res = await updateProfile(updatePayload)
      if (res && res.success) {
        await handleRefreshProfile()
        showNotification('Profile and career trajectory updated!')
      }
    } catch (err) {
      showNotification('Update failed: ' + err.message, 'error')
    }
  }

  // Loading state while checking session
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-md mb-4 animate-pulse">
          <span className="material-symbols-outlined text-[28px]">explore</span>
        </div>
        <p className="font-label-md text-label-md text-outline">Loading Career Navigator...</p>
      </div>
    )
  }

  // Unauthenticated user -> Auth Screen
  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={handleNavigate}
      currentUser={currentUser}
      careerData={careerData}
      onLogout={handleLogout}
      onUpdateProfile={handleUpdateProfile}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-container-lowest border border-primary/30 shadow-lg text-on-surface text-body-md animate-fade-in">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {notification.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Screen Views */}
      {activeTab === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          careerData={careerData}
          currentUser={currentUser}
          onAnalyze={handleAnalyzeCareer}
        />
      )}
      {activeTab === 'career-analyzer' && (
        <CareerAnalyzer
          onNavigate={handleNavigate}
          onAnalyze={handleAnalyzeCareer}
          isAnalyzing={isAnalyzing}
          careerData={careerData}
          currentUser={currentUser}
        />
      )}
      {activeTab === 'skill-gap-and-roadmap' && (
        <SkillGapRoadmap
          onNavigate={handleNavigate}
          careerData={careerData}
          currentUser={currentUser}
          onRefreshData={handleRefreshProfile}
        />
      )}
      {activeTab === 'learning-studio' && (
        <ErrorBoundary title="Learning Studio Encountered An Issue" onReset={() => handleNavigate('learning-studio')}>
          <LearningStudio
            onNavigate={handleNavigate}
            careerData={careerData}
            showNotification={showNotification}
            navigationParams={learningStudioInitialParams}
          />
        </ErrorBoundary>
      )}
      {activeTab === 'ai-mock-interview' && (
        <MockInterview
          onNavigate={handleNavigate}
          careerData={careerData}
          showNotification={showNotification}
        />
      )}
      {activeTab === 'progress-reports' && (
        <ProgressReports
          onNavigate={handleNavigate}
          careerData={careerData}
          currentUser={currentUser}
        />
      )}
    </Layout>
  )
}
