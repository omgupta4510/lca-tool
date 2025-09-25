import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { 
  Save, 
  Download, 
  ArrowLeft, 
  TrendingUp, 
  Zap, 
  Recycle, 
  AlertTriangle,
  CheckCircle,
  Brain,
  FileText,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLCA } from '../context/LCAContext'
import { lcaAPI, aiAPI } from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ResultsPage = () => {
  const navigate = useNavigate()
  const { materials, results, setResults, recommendations, setRecommendations, loading, setLoading } = useLCA()
  const [assessmentName, setAssessmentName] = useState('')
  const [assessmentDescription, setAssessmentDescription] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (materials.length === 0) {
      navigate('/input')
      return
    }

    if (!results) {
      calculateLCA()
    }
  }, [materials, results])

  const calculateLCA = async () => {
    setLoading(true)
    try {
      // Calculate LCA
      const lcaResults = await lcaAPI.calculateLCA(materials)
      setResults(lcaResults)

      // Get AI recommendations
      try {
        const aiRecs = await aiAPI.getRecommendations(lcaResults)
        setRecommendations(aiRecs.recommendations)
      } catch (error) {
        console.warn('AI recommendations failed:', error)
        // Use fallback recommendations from LCA results
        if (lcaResults.recommendations) {
          setRecommendations(lcaResults.recommendations)
        }
      }

      toast.success('LCA calculation completed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to calculate LCA')
      navigate('/input')
    } finally {
      setLoading(false)
    }
  }

  const saveAssessment = async () => {
    if (!assessmentName.trim()) {
      toast.error('Please enter an assessment name')
      return
    }

    setLoading(true)
    try {
      await lcaAPI.calculateLCA(materials, assessmentName, assessmentDescription)
      toast.success('Assessment saved successfully!')
      setShowSaveForm(false)
      setAssessmentName('')
      setAssessmentDescription('')
    } catch (error) {
      toast.error(error.message || 'Failed to save assessment')
    } finally {
      setLoading(false)
    }
  }

  const exportResults = () => {
    if (!results) return

    const data = {
      assessment_name: assessmentName || 'LCA Assessment',
      created_at: new Date().toISOString(),
      summary: results.summary,
      materials: results.material_breakdown,
      categories: results.category_breakdown,
      recommendations: recommendations,
      scores: results.scores
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lca-assessment-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Results exported successfully!')
  }

  if (loading || !results) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-secondary-600">Calculating environmental impact...</p>
        </div>
      </div>
    )
  }

  // Chart configurations
  const barChartData = {
    labels: results.material_breakdown?.map(m => m.material_type) || [],
    datasets: [
      {
        label: 'CO2 Impact (kg)',
        data: results.material_breakdown?.map(m => m.co2_impact) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Energy Impact (MJ)',
        data: results.material_breakdown?.map(m => m.energy_impact) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const pieChartData = {
    labels: results.category_breakdown?.map(c => c.category) || [],
    datasets: [
      {
        data: results.category_breakdown?.map(c => c.co2) || [],
        backgroundColor: [
          '#22c55e',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16',
          '#f97316',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Environmental Impact Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'CO2 Impact by Category',
      },
    },
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'bg-green-100 text-green-800'
    if (['B', 'C'].includes(grade)) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Link to="/input" className="btn btn-outline mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Input
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
              LCA Results
            </h1>
            <p className="text-lg text-secondary-600">
              Environmental impact analysis for {materials.length} materials
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowSaveForm(true)}
              className="btn btn-primary"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </button>
            <button
              onClick={exportResults}
              className="btn btn-outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Save Assessment Modal */}
        {showSaveForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Save Assessment</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Assessment Name *</label>
                  <input
                    type="text"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                    className="input"
                    placeholder="Enter assessment name"
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={assessmentDescription}
                    onChange={(e) => setAssessmentDescription(e.target.value)}
                    className="input min-h-20"
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveAssessment}
                  className="btn btn-primary flex-1"
                  disabled={loading || !assessmentName.trim()}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="border-b border-secondary-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'charts', label: 'Charts', icon: FileText },
              { id: 'recommendations', label: 'Recommendations', icon: Brain },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {results.summary.total_co2_kg} kg
                </div>
                <div className="text-secondary-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  CO2 Emissions
                </div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {results.summary.total_energy_mj} MJ
                </div>
                <div className="text-secondary-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-1" />
                  Energy Consumption
                </div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {results.summary.total_materials_kg} kg
                </div>
                <div className="text-secondary-600 flex items-center justify-center">
                  <Recycle className="h-4 w-4 mr-1" />
                  Total Materials
                </div>
              </div>
              
              <div className="card text-center">
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(results.scores?.overall || 0)}`}>
                  {results.scores?.overall || 0}/100
                </div>
                <div className="text-secondary-600 flex items-center justify-center">
                  <Target className="h-4 w-4 mr-1" />
                  Environmental Score
                </div>
              </div>
            </div>

            {/* Environmental Grade */}
            {results.scores && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                  Environmental Performance
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getGradeColor(results.scores.grade)}`}>
                      Grade: {results.scores.grade}
                    </div>
                    <p className="text-sm text-secondary-600 mt-2">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.scores.co2)}`}>
                      {results.scores.co2}
                    </div>
                    <p className="text-sm text-secondary-600">Carbon Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.scores.energy)}`}>
                      {results.scores.energy}
                    </div>
                    <p className="text-sm text-secondary-600">Energy Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.scores.materials)}`}>
                      {results.scores.materials}
                    </div>
                    <p className="text-sm text-secondary-600">Materials Score</p>
                  </div>
                </div>
              </div>
            )}

            {/* Material Breakdown */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Material Impact Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">CO2 (kg)</th>
                      <th className="px-4 py-2 text-right">Energy (MJ)</th>
                      <th className="px-4 py-2 text-right">Total Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.material_breakdown?.map((material, index) => (
                      <tr key={index} className="border-b border-secondary-100">
                        <td className="px-4 py-2 font-medium">{material.material_type}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                            {material.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">{material.quantity} {material.unit}</td>
                        <td className="px-4 py-2 text-right">{material.co2_impact.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">{material.energy_impact.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {material.total_impact.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Warnings */}
            {results.warnings && results.warnings.length > 0 && (
              <div className="card border-yellow-200 bg-yellow-50">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-800">Warnings & Notes</h3>
                </div>
                <ul className="space-y-1">
                  {results.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Impact by Material</h3>
                <Bar data={barChartData} options={chartOptions} />
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">CO2 by Category</h3>
                <Pie data={pieChartData} options={pieOptions} />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.category_breakdown?.map((category, index) => (
                  <div key={index} className="p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-semibold text-secondary-900 mb-2">{category.category}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>CO2 Impact:</span>
                        <span className="font-medium">{category.co2.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy:</span>
                        <span className="font-medium">{category.energy.toFixed(2)} MJ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Materials:</span>
                        <span className="font-medium">{category.materials.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share:</span>
                        <span className="font-medium text-primary-600">{category.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 text-primary-600 mr-2" />
                      <h3 className="text-lg font-semibold text-secondary-900">{rec.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                      {rec.estimated_reduction && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          -{rec.estimated_reduction} impact
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-secondary-600 mb-4">{rec.description}</p>
                  
                  {rec.actions && rec.actions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start text-sm text-secondary-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {rec.impact_score && (
                    <div className="mt-4 pt-4 border-t border-secondary-200">
                      <div className="flex items-center text-sm text-secondary-600">
                        <span className="mr-2">Potential Impact:</span>
                        <div className="flex-1 bg-secondary-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, rec.impact_score * 10)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{rec.impact_score}/10</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="card text-center py-12">
                <Brain className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Recommendations Available</h3>
                <p className="text-secondary-600">
                  AI recommendations could not be generated at this time. Try recalculating or check your connection.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ResultsPage