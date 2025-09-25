import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, Plus, X, FileText, Brain, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useLCA } from '../context/LCAContext'
import { dataAPI, aiAPI, lcaAPI } from '../services/api'

const DataInputPage = () => {
  const navigate = useNavigate()
  const { materials: contextMaterials, setMaterials, addMaterial, updateMaterial, removeMaterial, clearMaterials, setLoading, loading, setResults } = useLCA()
  
  // Ensure materials is always an array
  const materials = contextMaterials || []
  
  const [inputMethod, setInputMethod] = useState('manual') // 'csv' or 'manual'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [processingOptions, setProcessingOptions] = useState({
    enableAI: true,
    imputeMethod: 'smart',
    validateData: true
  })

  // CSV Upload handling
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    setLoading(true)

    try {
      const result = await dataAPI.uploadCSV(file)
      if (result?.data && Array.isArray(result.data)) {
        setMaterials(result.data)
        toast.success(`Processed ${result.total_records || result.data.length} materials from CSV`)
      } else {
        throw new Error('Invalid data format received from server')
      }
      
      if (result.warnings && Array.isArray(result.warnings) && result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.error(warning, { icon: '⚠️' }))
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process CSV file')
      console.error('CSV upload error:', error)
    } finally {
      setLoading(false)
    }
  }, [setMaterials, setLoading])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  // Manual data entry
  const addNewMaterial = () => {
    const newMaterial = {
      material_type: '',
      quantity: 0,
      unit: 'kg',
      energy_consumption: 0,
      transport_distance: 0
    }
    addMaterial(newMaterial)
  }

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterial = { ...materials[index], [field]: value }
    updateMaterial(index, updatedMaterial)
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => 
      !(error.index === index && error.field === field)
    ))
  }

  // Validation
  const validateMaterials = () => {
    const errors = []
    
    materials.forEach((material, index) => {
      if (!material.material_type?.trim()) {
        errors.push({ index, field: 'material_type', message: 'Material type is required' })
      }
      if (!material.quantity || material.quantity <= 0) {
        errors.push({ index, field: 'quantity', message: 'Quantity must be greater than 0' })
      }
      if (material.energy_consumption < 0) {
        errors.push({ index, field: 'energy_consumption', message: 'Energy consumption cannot be negative' })
      }
      if (material.transport_distance < 0) {
        errors.push({ index, field: 'transport_distance', message: 'Transport distance cannot be negative' })
      }
    })
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // AI Processing
  const processWithAI = async () => {
    if (materials.length === 0) {
      toast.error('Please add some materials first')
      return
    }

    setLoading(true)
    try {
      const result = await aiAPI.processData(materials, processingOptions)
      if (result?.data) {
        setMaterials(result.data)
      }
      
      // Safe access to processing summary
      const processingSummary = result?.processing_summary || {}
      const missingDataCount = processingSummary.missing_data_detected || 0
      const outliersCount = processingSummary.outliers_detected || 0
      
      toast.success(`AI processing complete! ${missingDataCount} fields imputed`)
      
      if (outliersCount > 0) {
        toast.error(`${outliersCount} potential outliers detected`, { icon: '⚠️' })
      }
    } catch (error) {
      console.warn('AI processing failed, using fallback:', error)
      toast.error('AI processing unavailable, proceeding with basic validation', { icon: '⚠️' })
      
      // Basic validation as fallback
      if (!validateMaterials()) {
        toast.error('Please fix validation errors before proceeding')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  // Proceed to LCA calculation
  const proceedToCalculation = async () => {
    if (materials.length === 0) {
      toast.error('Please add materials before proceeding')
      return
    }

    if (!validateMaterials()) {
      toast.error('Please fix validation errors before proceeding')
      return
    }

    setLoading(true)
    try {
      // Process with AI if enabled
      if (processingOptions.enableAI) {
        await processWithAI()
      }

      // Calculate LCA
      toast.loading('Calculating LCA...', { id: 'lca-calc' })
      const response = await lcaAPI.calculateLCA(
        materials,
        `Assessment ${new Date().toLocaleString()}`,
        'Generated from data input'
      )
      
      setResults(response)
      toast.success('LCA calculation completed!', { id: 'lca-calc' })
      navigate('/results')
    } catch (error) {
      console.error('LCA calculation error:', error)
      toast.error(`Calculation failed: ${error.message}`, { id: 'lca-calc' })
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (index, field) => {
    return validationErrors.find(error => error.index === index && error.field === field)
  }

  // Load demo data
  const loadDemoData = () => {
    const demoMaterials = [
      {
        material_type: 'Steel',
        quantity: 100,
        unit: 'kg',
        energy_consumption: 50,
        transport_distance: 200
      },
      {
        material_type: 'Aluminum',
        quantity: 25,
        unit: 'kg',
        energy_consumption: 150,
        transport_distance: 500
      },
      {
        material_type: 'PET Plastic',
        quantity: 15,
        unit: 'kg',
        energy_consumption: 30,
        transport_distance: 100
      },
      {
        material_type: 'Concrete',
        quantity: 500,
        unit: 'kg',
        energy_consumption: 10,
        transport_distance: 50
      }
    ]
    
    setMaterials(demoMaterials)
    toast.success('Demo data loaded successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Input Your Data
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Upload a CSV file or manually enter your material data for environmental impact analysis.
          </p>
        </div>

        {/* Input Method Selection */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => setInputMethod('csv')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                inputMethod === 'csv'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <Upload className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Upload CSV</div>
              <div className="text-sm text-secondary-600">Import from spreadsheet</div>
            </button>
            
            <button
              onClick={() => setInputMethod('manual')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                inputMethod === 'manual'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <Plus className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Manual Entry</div>
              <div className="text-sm text-secondary-600">Enter data manually</div>
            </button>
          </div>

          {/* Demo Data Button */}
          <div className="text-center mb-6">
            <button
              onClick={loadDemoData}
              className="btn btn-outline"
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Load Demo Data
            </button>
          </div>
        </div>

        {/* CSV Upload */}
        {inputMethod === 'csv' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="card mb-8"
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
              {isDragActive ? (
                <p className="text-lg text-primary-600">Drop the CSV file here...</p>
              ) : (
                <div>
                  <p className="text-lg text-secondary-600 mb-2">
                    Drag & drop a CSV file here, or click to select
                  </p>
                  <p className="text-sm text-secondary-500">
                    CSV should include columns: material_type, quantity, unit, energy_consumption, transport_distance
                  </p>
                </div>
              )}
            </div>
            
            {uploadedFile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  File uploaded: {uploadedFile.name}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Manual Entry */}
        {inputMethod === 'manual' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="card mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Material Data</h3>
              <div className="flex gap-2">
                <button
                  onClick={addNewMaterial}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </button>
                {materials.length > 0 && (
                  <button
                    onClick={clearMaterials}
                    className="btn btn-outline text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-12 text-secondary-500">
                <Plus className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p>No materials added yet. Click "Add Material" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((material, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-secondary-50 rounded-lg"
                  >
                    <div>
                      <label className="label">Material Type *</label>
                      <input
                        type="text"
                        value={material.material_type}
                        onChange={(e) => handleMaterialChange(index, 'material_type', e.target.value)}
                        className={`input ${getFieldError(index, 'material_type') ? 'border-red-500' : ''}`}
                        placeholder="e.g., Steel, Aluminum"
                      />
                      {getFieldError(index, 'material_type') && (
                        <p className="text-sm text-red-600 mt-1">
                          {getFieldError(index, 'material_type').message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Quantity *</label>
                      <input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`input ${getFieldError(index, 'quantity') ? 'border-red-500' : ''}`}
                        min="0"
                        step="0.01"
                      />
                      {getFieldError(index, 'quantity') && (
                        <p className="text-sm text-red-600 mt-1">
                          {getFieldError(index, 'quantity').message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Unit</label>
                      <select
                        value={material.unit}
                        onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                        className="input"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="ton">ton</option>
                        <option value="lb">lb</option>
                        <option value="m3">m³</option>
                        <option value="L">L</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Energy (MJ)</label>
                      <input
                        type="number"
                        value={material.energy_consumption}
                        onChange={(e) => handleMaterialChange(index, 'energy_consumption', parseFloat(e.target.value) || 0)}
                        className={`input ${getFieldError(index, 'energy_consumption') ? 'border-red-500' : ''}`}
                        min="0"
                        step="0.1"
                      />
                      {getFieldError(index, 'energy_consumption') && (
                        <p className="text-sm text-red-600 mt-1">
                          {getFieldError(index, 'energy_consumption').message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Transport (km)</label>
                      <input
                        type="number"
                        value={material.transport_distance}
                        onChange={(e) => handleMaterialChange(index, 'transport_distance', parseFloat(e.target.value) || 0)}
                        className={`input ${getFieldError(index, 'transport_distance') ? 'border-red-500' : ''}`}
                        min="0"
                        step="1"
                      />
                      {getFieldError(index, 'transport_distance') && (
                        <p className="text-sm text-red-600 mt-1">
                          {getFieldError(index, 'transport_distance').message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => removeMaterial(index)}
                        className="btn bg-red-100 text-red-600 hover:bg-red-200 w-full"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* AI Processing Options */}
        {materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card mb-8"
          >
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary-600" />
              AI Processing Options
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={processingOptions.enableAI}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, enableAI: e.target.checked }))}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Enable AI Processing</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={processingOptions.validateData}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, validateData: e.target.checked }))}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Data Validation</span>
              </label>

              <div>
                <label className="label text-sm">Imputation Method</label>
                <select
                  value={processingOptions.imputeMethod}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, imputeMethod: e.target.value }))}
                  className="input text-sm"
                  disabled={!processingOptions.enableAI}
                >
                  <option value="smart">Smart AI Imputation</option>
                  <option value="mean">Mean Values</option>
                  <option value="median">Median Values</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card mb-8 border-red-200 bg-red-50"
          >
            <div className="flex items-center mb-3">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Validation Errors</h3>
            </div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">
                  Material {error.index + 1} - {error.field}: {error.message}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Action Buttons */}
        {materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={proceedToCalculation}
              className="btn btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Calculate LCA
                  <Brain className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            {processingOptions.enableAI && (
              <button
                onClick={processWithAI}
                className="btn btn-outline"
                disabled={loading}
              >
                <Brain className="h-4 w-4 mr-2" />
                Process with AI Only
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default DataInputPage