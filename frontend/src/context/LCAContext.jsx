import React, { createContext, useContext, useReducer } from 'react'

const LCAContext = createContext()

const initialState = {
  materials: [],
  results: null,
  loading: false,
  error: null,
  assessments: [],
  currentAssessment: null,
  recommendations: []
}

function lcaReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_MATERIALS':
      return { ...state, materials: action.payload, error: null }
    
    case 'ADD_MATERIAL':
      return { ...state, materials: [...state.materials, action.payload] }
    
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map((material, index) =>
          index === action.payload.index ? action.payload.material : material
        )
      }
    
    case 'REMOVE_MATERIAL':
      return {
        ...state,
        materials: state.materials.filter((_, index) => index !== action.payload)
      }
    
    case 'CLEAR_MATERIALS':
      return { ...state, materials: [] }
    
    case 'SET_RESULTS':
      return { ...state, results: action.payload, loading: false, error: null }
    
    case 'SET_ASSESSMENTS':
      return { ...state, assessments: action.payload }
    
    case 'SET_CURRENT_ASSESSMENT':
      return { ...state, currentAssessment: action.payload }
    
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload }
    
    case 'CLEAR_RESULTS':
      return { ...state, results: null, recommendations: [] }
    
    default:
      return state
  }
}

export function LCAProvider({ children }) {
  const [state, dispatch] = useReducer(lcaReducer, initialState)

  const value = {
    ...state,
    dispatch,
    
    // Helper functions
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    setMaterials: (materials) => dispatch({ type: 'SET_MATERIALS', payload: materials }),
    addMaterial: (material) => dispatch({ type: 'ADD_MATERIAL', payload: material }),
    updateMaterial: (index, material) => dispatch({ type: 'UPDATE_MATERIAL', payload: { index, material } }),
    removeMaterial: (index) => dispatch({ type: 'REMOVE_MATERIAL', payload: index }),
    clearMaterials: () => dispatch({ type: 'CLEAR_MATERIALS' }),
    setResults: (results) => dispatch({ type: 'SET_RESULTS', payload: results }),
    setAssessments: (assessments) => dispatch({ type: 'SET_ASSESSMENTS', payload: assessments }),
    setCurrentAssessment: (assessment) => dispatch({ type: 'SET_CURRENT_ASSESSMENT', payload: assessment }),
    setRecommendations: (recommendations) => dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations }),
    clearResults: () => dispatch({ type: 'CLEAR_RESULTS' })
  }

  return (
    <LCAContext.Provider value={value}>
      {children}
    </LCAContext.Provider>
  )
}

export function useLCA() {
  const context = useContext(LCAContext)
  if (!context) {
    throw new Error('useLCA must be used within an LCAProvider')
  }
  return context
}