import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error'
      throw new Error(message)
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error - please check your connection')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

// Data API
export const dataAPI = {
  uploadCSV: async (file) => {
    const formData = new FormData()
    formData.append('csvFile', file)
    
    const response = await api.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  submitManualData: async (materials) => {
    const response = await api.post('/data/manual', { materials })
    return response.data
  },

  getEmissionFactors: async () => {
    const response = await api.get('/data/emission-factors')
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/data/categories')
    return response.data
  },

  getMaterialsByCategory: async (category) => {
    const response = await api.get(`/data/materials/${category}`)
    return response.data
  },
}

// LCA API
export const lcaAPI = {
  calculateLCA: async (materials, assessmentName, description) => {
    const response = await api.post('/lca/calculate', {
      materials,
      assessment_name: assessmentName,
      description,
    })
    return response.data
  },

  getAssessments: async () => {
    const response = await api.get('/lca/assessments')
    return response.data
  },

  getAssessment: async (id) => {
    const response = await api.get(`/lca/assessments/${id}`)
    return response.data
  },

  deleteAssessment: async (id) => {
    const response = await api.delete(`/lca/assessments/${id}`)
    return response.data
  },
}

// AI API
export const aiAPI = {
  processData: async (materials, options = {}) => {
    const response = await api.post('/ai/process', { materials, options })
    return response.data
  },

  getRecommendations: async (lcaResults, context = {}) => {
    const response = await api.post('/ai/recommendations', {
      lca_results: lcaResults,
      context,
    })
    return response.data
  },

  categorizeMaterials: async (materials) => {
    const response = await api.post('/ai/categorize', { materials })
    return response.data
  },

  checkHealth: async () => {
    const response = await api.get('/ai/health')
    return response.data
  },
}

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api