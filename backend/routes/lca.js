const express = require('express');
const { database } = require('../utils/database');

const router = express.Router();

// Calculate LCA for provided materials
router.post('/calculate', async (req, res) => {
  try {
    const { materials, assessment_name, description } = req.body;

    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ error: 'Materials array is required' });
    }

    // Calculate total impacts
    let totalCO2 = 0;
    let totalEnergy = 0;
    let totalMaterials = 0;
    const materialBreakdown = [];
    const categoryBreakdown = {};
    const warnings = [];

    for (const material of materials) {
      const quantity = parseFloat(material.quantity) || 0;
      const energyConsumption = parseFloat(material.energy_consumption) || 0;
      const transportDistance = parseFloat(material.transport_distance) || 0;

      // Get or estimate emission factors
      let emissionFactor = await database.get(
        'SELECT * FROM emission_factors WHERE LOWER(material_type) = LOWER(?)',
        [material.material_type]
      );

      if (!emissionFactor) {
        // Use default factors for unknown materials
        emissionFactor = {
          co2_factor: 1.0,
          energy_factor: 10.0,
          transport_factor: 0.05,
          category: 'Unknown'
        };
        warnings.push(`Unknown material: ${material.material_type}. Using estimated factors.`);
      }

      // Calculate impacts
      const co2Impact = quantity * emissionFactor.co2_factor;
      const energyImpact = quantity * emissionFactor.energy_factor + energyConsumption;
      const transportImpact = transportDistance * emissionFactor.transport_factor * quantity;

      // Add to totals
      totalCO2 += co2Impact + (transportImpact * 0.1); // Transport contributes to CO2
      totalEnergy += energyImpact;
      totalMaterials += quantity;

      // Material breakdown
      materialBreakdown.push({
        material_type: material.material_type,
        category: emissionFactor.category,
        quantity: quantity,
        unit: material.unit || 'kg',
        co2_impact: co2Impact,
        energy_impact: energyImpact,
        transport_impact: transportImpact,
        total_impact: co2Impact + energyImpact + transportImpact
      });

      // Category breakdown
      if (!categoryBreakdown[emissionFactor.category]) {
        categoryBreakdown[emissionFactor.category] = {
          co2: 0,
          energy: 0,
          materials: 0,
          count: 0
        };
      }
      categoryBreakdown[emissionFactor.category].co2 += co2Impact;
      categoryBreakdown[emissionFactor.category].energy += energyImpact;
      categoryBreakdown[emissionFactor.category].materials += quantity;
      categoryBreakdown[emissionFactor.category].count += 1;
    }

    // Generate recommendations
    const recommendations = generateRecommendations(materialBreakdown, categoryBreakdown);

    // Calculate environmental scores
    const scores = calculateEnvironmentalScores(totalCO2, totalEnergy, totalMaterials);

    // Save assessment if name provided
    let assessmentId = null;
    if (assessment_name) {
      try {
        const result = await database.run(`
          INSERT INTO lca_assessments (name, description, total_co2, total_energy, total_materials)
          VALUES (?, ?, ?, ?, ?)
        `, [assessment_name, description || '', totalCO2, totalEnergy, totalMaterials]);
        
        assessmentId = result.id;

        // Save material details
        for (const material of materialBreakdown) {
          await database.run(`
            INSERT INTO assessment_materials 
            (assessment_id, material_type, quantity, unit, energy_consumption, transport_distance, co2_impact, energy_impact, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            assessmentId,
            material.material_type,
            material.quantity,
            material.unit,
            0, // energy_consumption from original data
            0, // transport_distance from original data
            material.co2_impact,
            material.energy_impact,
            material.category
          ]);
        }
      } catch (dbError) {
        console.error('Error saving assessment:', dbError);
        warnings.push('Assessment calculated but not saved to database.');
      }
    }

    res.json({
      assessment_id: assessmentId,
      summary: {
        total_co2_kg: Math.round(totalCO2 * 100) / 100,
        total_energy_mj: Math.round(totalEnergy * 100) / 100,
        total_materials_kg: Math.round(totalMaterials * 100) / 100,
        material_count: materials.length
      },
      scores,
      material_breakdown: materialBreakdown,
      category_breakdown: Object.keys(categoryBreakdown).map(category => ({
        category,
        ...categoryBreakdown[category],
        percentage: Math.round((categoryBreakdown[category].co2 / totalCO2 * 100) * 100) / 100
      })),
      recommendations,
      warnings
    });

  } catch (error) {
    console.error('LCA calculation error:', error);
    res.status(500).json({ error: 'Error calculating LCA' });
  }
});

// Get saved assessments
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await database.all(`
      SELECT id, name, description, total_co2, total_energy, total_materials, created_at
      FROM lca_assessments 
      ORDER BY created_at DESC
    `);
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Error fetching assessments' });
  }
});

// Get assessment details
router.get('/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await database.get(
      'SELECT * FROM lca_assessments WHERE id = ?',
      [id]
    );

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const materials = await database.all(
      'SELECT * FROM assessment_materials WHERE assessment_id = ?',
      [id]
    );

    res.json({
      ...assessment,
      materials
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Error fetching assessment' });
  }
});

// Delete assessment
router.delete('/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.run('DELETE FROM assessment_materials WHERE assessment_id = ?', [id]);
    await database.run('DELETE FROM lca_assessments WHERE id = ?', [id]);
    
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Error deleting assessment' });
  }
});

// Generate environmental impact recommendations
function generateRecommendations(materialBreakdown, categoryBreakdown) {
  const recommendations = [];

  // Sort materials by impact
  const sortedMaterials = materialBreakdown.sort((a, b) => b.total_impact - a.total_impact);
  const highestImpact = sortedMaterials[0];

  // High impact material recommendations
  if (highestImpact && highestImpact.total_impact > 100) {
    recommendations.push({
      type: 'high_impact',
      priority: 'high',
      title: `Optimize ${highestImpact.material_type} usage`,
      description: `${highestImpact.material_type} contributes ${Math.round(highestImpact.total_impact)} units to total impact. Consider alternatives or reduce quantity.`,
      action: 'material_substitution'
    });
  }

  // Category-based recommendations
  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1].co2 - a[1].co2);
  
  if (sortedCategories.length > 0) {
    const [topCategory, topCategoryData] = sortedCategories[0];
    if (topCategoryData.co2 > 50) {
      recommendations.push({
        type: 'category_optimization',
        priority: 'medium',
        title: `Focus on ${topCategory} materials`,
        description: `${topCategory} category accounts for ${Math.round(topCategoryData.co2)} kg CO2. This category has the highest environmental impact.`,
        action: 'category_review'
      });
    }
  }

  // Energy efficiency recommendations
  const totalEnergy = materialBreakdown.reduce((sum, m) => sum + m.energy_impact, 0);
  if (totalEnergy > 1000) {
    recommendations.push({
      type: 'energy_efficiency',
      priority: 'medium',
      title: 'Improve energy efficiency',
      description: `Total energy consumption is ${Math.round(totalEnergy)} MJ. Consider renewable energy sources or more efficient processes.`,
      action: 'energy_optimization'
    });
  }

  // Transport optimization
  const highTransportMaterials = materialBreakdown.filter(m => m.transport_impact > 10);
  if (highTransportMaterials.length > 0) {
    recommendations.push({
      type: 'transport_optimization',
      priority: 'low',
      title: 'Optimize transportation',
      description: `${highTransportMaterials.length} materials have high transport impact. Consider local sourcing or more efficient logistics.`,
      action: 'transport_optimization'
    });
  }

  // General sustainability recommendations
  recommendations.push({
    type: 'general',
    priority: 'low',
    title: 'Consider circular economy principles',
    description: 'Explore recycling, reuse, and sustainable material alternatives to reduce overall environmental impact.',
    action: 'circular_economy'
  });

  return recommendations;
}

// Calculate environmental scores (0-100 scale)
function calculateEnvironmentalScores(co2, energy, materials) {
  // These thresholds are simplified for demonstration
  const co2Score = Math.max(0, 100 - (co2 / 10)); // Decrease score as CO2 increases
  const energyScore = Math.max(0, 100 - (energy / 100)); // Decrease score as energy increases
  const materialScore = Math.max(0, 100 - (materials / 50)); // Decrease score as material usage increases

  const overallScore = (co2Score + energyScore + materialScore) / 3;

  return {
    overall: Math.round(overallScore),
    co2: Math.round(co2Score),
    energy: Math.round(energyScore),
    materials: Math.round(materialScore),
    grade: getEnvironmentalGrade(overallScore)
  };
}

function getEnvironmentalGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

module.exports = router;