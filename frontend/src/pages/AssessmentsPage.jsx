import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Zap, 
  Recycle,
  FileText,
  Search,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLCA } from '../context/LCAContext'
import { lcaAPI } from '../services/api'

const AssessmentsPage = () => {
  const { assessments, setAssessments, setCurrentAssessment, loading, setLoading } = useLCA()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    setLoading(true)
    try {
      const data = await lcaAPI.getAssessments()
      setAssessments(data)
    } catch (error) {
      toast.error('Failed to load assessments')
      console.error('Load assessments error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAssessment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      await lcaAPI.deleteAssessment(id)
      setAssessments(assessments.filter(a => a.id !== id))
      toast.success('Assessment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete assessment')
      console.error('Delete assessment error:', error)
    }
  }

  const viewAssessment = async (id) => {
    try {
      const assessment = await lcaAPI.getAssessment(id)
      setCurrentAssessment(assessment)
      // You could navigate to a detailed view here
      toast.success('Assessment loaded')
    } catch (error) {
      toast.error('Failed to load assessment details')
      console.error('View assessment error:', error)
    }
  }

  // Filter and sort assessments
  const filteredAssessments = assessments
    .filter(assessment => 
      assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.description && assessment.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'co2':
          aValue = a.total_co2
          bValue = b.total_co2
          break
        case 'energy':
          aValue = a.total_energy
          bValue = b.total_energy
          break
        case 'materials':
          aValue = a.total_materials
          bValue = b.total_materials
          break
        default: // date
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && assessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-secondary-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
              Saved Assessments
            </h1>
            <p className="text-lg text-secondary-600">
              View and manage your LCA assessments
            </p>
          </div>
          
          <Link to="/input" className="btn btn-primary mt-4 md:mt-0">
            <FileText className="h-4 w-4 mr-2" />
            New Assessment
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="co2">Sort by CO2</option>
                <option value="energy">Sort by Energy</option>
                <option value="materials">Sort by Materials</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn btn-outline"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <Filter className="h-4 w-4" />
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        {filteredAssessments.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {assessments.length === 0 ? 'No Assessments Yet' : 'No Matching Assessments'}
            </h3>
            <p className="text-secondary-600 mb-6">
              {assessments.length === 0 
                ? 'Create your first LCA assessment to get started.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {assessments.length === 0 && (
              <Link to="/input" className="btn btn-primary">
                Create First Assessment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-secondary-900">
                        {assessment.name}
                      </h3>
                      <div className="flex items-center text-sm text-secondary-500 ml-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(assessment.created_at)}
                      </div>
                    </div>
                    
                    {assessment.description && (
                      <p className="text-secondary-600 mb-3">{assessment.description}</p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-secondary-600">CO2:</span>
                        <span className="font-medium ml-1">{assessment.total_co2?.toFixed(1) || 0} kg</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-secondary-600">Energy:</span>
                        <span className="font-medium ml-1">{assessment.total_energy?.toFixed(1) || 0} MJ</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Recycle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-secondary-600">Materials:</span>
                        <span className="font-medium ml-1">{assessment.total_materials?.toFixed(1) || 0} kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 lg:ml-4">
                    <button
                      onClick={() => viewAssessment(assessment.id)}
                      className="btn btn-outline flex-1 lg:flex-none"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>
                    
                    <button
                      onClick={() => deleteAssessment(assessment.id, assessment.name)}
                      className="btn bg-red-100 text-red-600 hover:bg-red-200 flex-1 lg:flex-none"
                      title="Delete Assessment"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {assessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card mt-8"
          >
            <h3 className="text-lg font-semibold mb-4">Assessment Summary</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {assessments.length}
                </div>
                <div className="text-sm text-secondary-600">Total Assessments</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {assessments.reduce((sum, a) => sum + (a.total_co2 || 0), 0).toFixed(1)}
                </div>
                <div className="text-sm text-secondary-600">Total CO2 (kg)</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {assessments.reduce((sum, a) => sum + (a.total_energy || 0), 0).toFixed(1)}
                </div>
                <div className="text-sm text-secondary-600">Total Energy (MJ)</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {assessments.reduce((sum, a) => sum + (a.total_materials || 0), 0).toFixed(1)}
                </div>
                <div className="text-sm text-secondary-600">Total Materials (kg)</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default AssessmentsPage