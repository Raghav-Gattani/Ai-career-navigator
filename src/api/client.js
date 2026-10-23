const API_BASE = 'http://localhost:8000/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Sends HttpOnly session cookie
  }

  const res = await fetch(url, config)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const errorMsg = data?.detail || data?.message || `Request failed (${res.status})`
    const error = new Error(errorMsg)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export async function fetchHealth() {
  try {
    return await request('/health')
  } catch (err) {
    return {
      status: 'offline',
      error: err.message,
      gemini_configured: false,
      supported_careers: [
        'Frontend Developer',
        'Backend Developer',
        'Full-Stack Developer',
        'AI/ML Engineer',
        'Cybersecurity Analyst',
        'Data Analyst',
        'DevOps Engineer'
      ]
    }
  }
}

// ==================== Auth Endpoints ====================

export async function registerUser({ name, email, password, confirm_password }) {
  return await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirm_password })
  })
}

export async function loginUser({ email, password }) {
  return await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function logoutUser() {
  try {
    return await request('/auth/logout', { method: 'POST' })
  } catch {
    return { success: true }
  }
}

export async function checkAuth() {
  try {
    return await request('/auth/me')
  } catch (err) {
    if (err.status === 401) return null
    throw err
  }
}

// ==================== Profile & Career Endpoints ====================

export async function fetchProfile() {
  return await request('/profile')
}

export async function updateProfile(payload) {
  return await request('/profile/update', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function analyzeCareer(payload) {
  return await request('/analyze-career', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function toggleTask(phaseNumber, taskIndex) {
  return await request('/roadmap/task/toggle', {
    method: 'POST',
    body: JSON.stringify({ phase_number: phaseNumber, task_index: taskIndex })
  })
}

export async function evaluateInterview(payload) {
  return await request('/evaluate-interview', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// ==================== Learning Studio Endpoints ====================

export async function generateSimulation({ topic, difficulty = 'intermediate', career_context = null }) {
  return await request('/learning-studio/generate', {
    method: 'POST',
    body: JSON.stringify({ topic, difficulty, career_context })
  })
}

export async function saveSimulation(payload) {
  return await request('/learning-studio/save', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function fetchSavedSimulations() {
  return await request('/learning-studio/saved')
}

export async function deleteSavedSimulation(id) {
  return await request(`/learning-studio/saved/${id}`, {
    method: 'DELETE'
  })
}

export async function recordLearningActivity(payload) {
  return await request('/learning-studio/activity', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function fetchLearningHistory(limit = 20) {
  return await request(`/learning-studio/history?limit=${limit}`)
}

export async function fetchSuggestedTopics(career = '') {
  const query = career ? `?career=${encodeURIComponent(career)}` : ''
  return await request(`/learning-studio/suggested-topics${query}`)
}

export async function completeRoadmapTask({ task_title, phase_number = null, topic = null }) {
  return await request('/learning-studio/complete-task', {
    method: 'POST',
    body: JSON.stringify({ task_title, phase_number, topic })
  })
}
