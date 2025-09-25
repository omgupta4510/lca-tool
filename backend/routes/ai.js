const express = require('express');
const axios = require('axios');

const router = express.Router();

const AI_PROCESSOR_URL = process.env.AI_PROCESSOR_URL || 'http://localhost:5001';

// AI-powered data processing and imputation
router.post('/process', async (req, res) => {
  try {
    const { materials, options = {} } = req.body;

    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ error: 'Materials array is required' });
    }

    // Basic AI processing - detect missing data and impute values
    const processedData = await processDataWithAI(materials, options);

    res.json({
      message: 'Data processed successfully',
      original_count: materials.length,
      processed_count: processedData.length,
      data: processedData,
      processing_summary: {
        missing_data_detected: processedData.filter(m => m.ai_imputed).length,
        categories_assigned: processedData.filter(m => m.ai_categorized).length,
        outliers_detected: processedData.filter(m => m.outlier_flag).length
      }
    });

  } catch (error) {
    console.error('AI processing error:', error);
    
    // Fallback to basic processing if AI service is unavailable
    const basicProcessedData = basicDataProcessing(req.body.materials || []);
    
    res.json({
      message: 'Data processed with basic methods (AI service unavailable)',
      data: basicProcessedData,
      fallback: true
    });
  }
});

// Get AI recommendations for optimization
router.post('/recommendations', async (req, res) => {
  try {
    const { lca_results, context = {} } = req.body;

    if (!lca_results) {
      return res.status(400).json({ error: 'LCA results are required' });
    }

    // Generate AI-powered recommendations
    const recommendations = await generateAIRecommendations(lca_results, context);

    res.json({
      recommendations,
      confidence_score: 0.85, // Simulated confidence
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    
    // Fallback to rule-based recommendations
    const basicRecommendations = generateBasicRecommendations(req.body.lca_results || {});
    
    res.json({
      recommendations: basicRecommendations,
      fallback: true,
      confidence_score: 0.60
    });
  }
});

// Material categorization with AI
router.post('/categorize', async (req, res) => {
  try {
    const { materials } = req.body;

    if (!Array.isArray(materials)) {
      return res.status(400).json({ error: 'Materials array is required' });
    }

    const categorizedMaterials = await categorizeMaterials(materials);

    res.json({
      message: 'Materials categorized successfully',
      data: categorizedMaterials
    });

  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ error: 'Error categorizing materials' });
  }
});

// Health check for AI processor
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_PROCESSOR_URL}/health`, { timeout: 5000 });
    res.json({
      ai_processor_status: 'available',
      ai_processor_response: response.data
    });
  } catch (error) {
    res.json({
      ai_processor_status: 'unavailable',
      fallback_processing: 'active',
      error: error.message
    });
  }
});

// AI-powered data processing function
async function processDataWithAI(materials, options) {
  try {
    // Try to use external AI processor
    const response = await axios.post(`${AI_PROCESSOR_URL}/process`, {
      materials,
      options
    }, { timeout: 10000 });

    return response.data.processed_materials;
  } catch (error) {
    console.log('AI processor unavailable, using fallback processing');
    return basicDataProcessing(materials);
  }
}

// Fallback basic data processing
function basicDataProcessing(materials) {
  return materials.map(material => {
    const processed = { ...material };
    
    // Detect and flag missing data
    const missingFields = [];
    if (!material.quantity || material.quantity === 0) missingFields.push('quantity');
    if (!material.energy_consumption) missingFields.push('energy_consumption');
    if (!material.transport_distance) missingFields.push('transport_distance');

    // Basic imputation using statistical methods
    if (missingFields.includes('quantity')) {
      processed.quantity = 1.0; // Default quantity
      processed.ai_imputed = true;
      processed.imputation_note = 'Quantity imputed with default value';
    }

    if (missingFields.includes('energy_consumption')) {
      processed.energy_consumption = estimateEnergyConsumption(material.material_type);
      processed.ai_imputed = true;
      processed.imputation_note = (processed.imputation_note || '') + ' Energy consumption estimated';
    }

    if (missingFields.includes('transport_distance')) {
      processed.transport_distance = 100; // Default 100km
      processed.ai_imputed = true;
      processed.imputation_note = (processed.imputation_note || '') + ' Transport distance estimated';
    }

    // Basic categorization
    processed.category = categorizeMaterial(material.material_type);
    if (processed.category === 'Unknown') {
      processed.ai_categorized = true;
    }

    // Outlier detection (simple statistical approach)
    if (material.quantity && material.quantity > 10000) {
      processed.outlier_flag = true;
      processed.outlier_reason = 'Unusually high quantity detected';
    }

    return processed;
  });
}

// Estimate energy consumption based on material type
function estimateEnergyConsumption(materialType) {
  const energyEstimates = {
    'steel': 24.0,
    'aluminum': 154.0,
    'plastic': 76.0,
    'glass': 15.0,
    'concrete': 1.0,
    'wood': 2.5,
    'paper': 20.0
  };

  const lowerMaterial = materialType.toLowerCase();
  for (const [key, value] of Object.entries(energyEstimates)) {
    if (lowerMaterial.includes(key)) {
      return value;
    }
  }

  return 10.0; // Default estimate
}

// Basic material categorization
function categorizeMaterial(materialType) {
  const lowerMaterial = materialType.toLowerCase();
  
  if (lowerMaterial.includes('steel') || lowerMaterial.includes('aluminum') || 
      lowerMaterial.includes('copper') || lowerMaterial.includes('iron')) {
    return 'Metals';
  }
  
  if (lowerMaterial.includes('plastic') || lowerMaterial.includes('polymer') ||
      lowerMaterial.includes('pet') || lowerMaterial.includes('hdpe')) {
    return 'Plastics';
  }
  
  if (lowerMaterial.includes('concrete') || lowerMaterial.includes('cement') ||
      lowerMaterial.includes('brick') || lowerMaterial.includes('stone')) {
    return 'Construction';
  }
  
  if (lowerMaterial.includes('glass')) {
    return 'Glass';
  }
  
  if (lowerMaterial.includes('wood') || lowerMaterial.includes('timber')) {
    return 'Construction';
  }
  
  if (lowerMaterial.includes('paper') || lowerMaterial.includes('cardboard')) {
    return 'Paper';
  }
  
  if (lowerMaterial.includes('cotton') || lowerMaterial.includes('polyester') ||
      lowerMaterial.includes('fabric')) {
    return 'Textiles';
  }

  return 'Unknown';
}

// Generate AI-powered recommendations
async function generateAIRecommendations(lcaResults, context) {
  try {
    const response = await axios.post(`${AI_PROCESSOR_URL}/recommendations`, {
      lca_results: lcaResults,
      context
    }, { timeout: 10000 });

    return response.data.recommendations;
  } catch (error) {
    console.log('AI recommendations unavailable, using rule-based approach');
    return generateBasicRecommendations(lcaResults);
  }
}

// Basic rule-based recommendations
function generateBasicRecommendations(lcaResults) {
  const recommendations = [];
  
  if (!lcaResults.summary) return recommendations;

  const { total_co2_kg, total_energy_mj, material_breakdown } = lcaResults;

  // High CO2 recommendations
  if (total_co2_kg > 100) {
    recommendations.push({
      type: 'carbon_reduction',
      priority: 'high',
      title: 'High Carbon Footprint Detected',
      description: `Your assessment shows ${total_co2_kg.toFixed(1)} kg CO2 emissions. Consider low-carbon alternatives.`,
      actions: [
        'Switch to renewable energy sources',
        'Use recycled materials where possible',
        'Optimize transportation routes'
      ],
      potential_reduction: '20-40%'
    });
  }

  // High energy recommendations
  if (total_energy_mj > 1000) {
    recommendations.push({
      type: 'energy_efficiency',
      priority: 'medium',
      title: 'Energy Optimization Opportunity',
      description: `Total energy consumption is ${total_energy_mj.toFixed(1)} MJ. Energy efficiency improvements possible.`,
      actions: [
        'Implement energy-efficient processes',
        'Consider solar or wind power',
        'Upgrade to efficient equipment'
      ],
      potential_reduction: '15-30%'
    });
  }

  // Material-specific recommendations
  if (material_breakdown && material_breakdown.length > 0) {
    const highestImpactMaterial = material_breakdown.reduce((prev, current) => 
      (prev.total_impact > current.total_impact) ? prev : current
    );

    recommendations.push({
      type: 'material_substitution',
      priority: 'medium',
      title: `Optimize ${highestImpactMaterial.material_type} Usage`,
      description: `${highestImpactMaterial.material_type} has the highest environmental impact in your assessment.`,
      actions: [
        'Research sustainable alternatives',
        'Reduce quantity if possible',
        'Source from eco-certified suppliers'
      ],
      potential_reduction: '10-25%'
    });
  }

  // Always include general sustainability recommendation
  recommendations.push({
    type: 'general_sustainability',
    priority: 'low',
    title: 'Circular Economy Principles',
    description: 'Implement circular economy strategies to minimize waste and maximize resource efficiency.',
    actions: [
      'Design for recyclability',
      'Implement take-back programs',
      'Use bio-based materials when possible'
    ],
    potential_reduction: '5-15%'
  });

  return recommendations;
}

// Categorize materials using basic rules
async function categorizeMaterials(materials) {
  return materials.map(material => ({
    ...material,
    category: categorizeMaterial(material.material_type || material.name || ''),
    confidence: 0.7 // Basic confidence score
  }));
}

module.exports = router;