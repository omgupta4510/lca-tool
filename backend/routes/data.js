const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const { database } = require('../utils/database');

const router = express.Router();

// Upload and process CSV data
router.post('/upload', (req, res) => {
  req.upload.single('csvFile')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Normalize column names (case-insensitive)
          const normalizedData = {};
          Object.keys(data).forEach(key => {
            const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
            normalizedData[normalizedKey] = data[key];
          });

          // Map expected columns
          const material = {
            material_type: normalizedData.material_type || normalizedData.material || normalizedData.name,
            quantity: parseFloat(normalizedData.quantity || normalizedData.amount || 0),
            unit: normalizedData.unit || normalizedData.units || 'kg',
            energy_consumption: parseFloat(normalizedData.energy_consumption || normalizedData.energy || 0),
            transport_distance: parseFloat(normalizedData.transport_distance || normalizedData.distance || 0)
          };

          if (material.material_type) {
            results.push(material);
          }
        })
        .on('end', async () => {
          // Clean up uploaded file
          fs.unlinkSync(filePath);

          if (results.length === 0) {
            return res.status(400).json({ 
              error: 'No valid data found in CSV. Please ensure columns include: material_type, quantity, unit, energy_consumption, transport_distance' 
            });
          }

          // Validate and enrich data
          const enrichedData = await enrichMaterialData(results);
          
          res.json({
            message: 'CSV processed successfully',
            data: enrichedData,
            total_records: enrichedData.length
          });
        })
        .on('error', (error) => {
          // Clean up uploaded file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ error: 'Error processing CSV file' });
        });

    } catch (error) {
      console.error('CSV processing error:', error);
      res.status(500).json({ error: 'Error processing CSV file' });
    }
  });
});

// Manual data entry
router.post('/manual', async (req, res) => {
  try {
    const { materials } = req.body;
    
    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ error: 'Materials array is required' });
    }

    // Validate required fields
    const validatedMaterials = materials.map(material => {
      if (!material.material_type || !material.quantity) {
        throw new Error('Material type and quantity are required');
      }

      return {
        material_type: material.material_type.trim(),
        quantity: parseFloat(material.quantity),
        unit: material.unit || 'kg',
        energy_consumption: parseFloat(material.energy_consumption || 0),
        transport_distance: parseFloat(material.transport_distance || 0)
      };
    });

    // Enrich data with emission factors
    const enrichedData = await enrichMaterialData(validatedMaterials);
    
    res.json({
      message: 'Data processed successfully',
      data: enrichedData,
      total_records: enrichedData.length
    });

  } catch (error) {
    console.error('Manual data processing error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get emission factors
router.get('/emission-factors', async (req, res) => {
  try {
    const factors = await database.all('SELECT * FROM emission_factors ORDER BY category, material_type');
    res.json(factors);
  } catch (error) {
    console.error('Error fetching emission factors:', error);
    res.status(500).json({ error: 'Error fetching emission factors' });
  }
});

// Get material categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await database.all('SELECT DISTINCT category FROM emission_factors ORDER BY category');
    res.json(categories.map(row => row.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Get materials by category
router.get('/materials/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const materials = await database.all(
      'SELECT material_type, co2_factor, energy_factor, transport_factor, unit FROM emission_factors WHERE category = ? ORDER BY material_type',
      [category]
    );
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Error fetching materials' });
  }
});

// Helper function to enrich material data with emission factors
async function enrichMaterialData(materials) {
  const enrichedData = [];

  for (const material of materials) {
    try {
      // Find emission factor for this material
      let emissionFactor = await database.get(
        'SELECT * FROM emission_factors WHERE LOWER(material_type) = LOWER(?)',
        [material.material_type]
      );

      // If not found, try to find by partial match
      if (!emissionFactor) {
        emissionFactor = await database.get(`
          SELECT * FROM emission_factors 
          WHERE LOWER(material_type) LIKE LOWER(?) 
          ORDER BY material_type LIMIT 1
        `, [`%${material.material_type}%`]);
      }

      // If still not found, use default values and mark as estimated
      if (!emissionFactor) {
        emissionFactor = {
          co2_factor: 1.0, // Default CO2 factor
          energy_factor: 10.0, // Default energy factor
          transport_factor: 0.05, // Default transport factor
          category: 'Unknown',
          unit: 'kg'
        };
        material.estimated = true;
        material.warning = `No emission factor found for "${material.material_type}". Using estimated values.`;
      }

      // Calculate impacts
      const enrichedMaterial = {
        ...material,
        category: emissionFactor.category,
        emission_factor: {
          co2_factor: emissionFactor.co2_factor,
          energy_factor: emissionFactor.energy_factor,
          transport_factor: emissionFactor.transport_factor
        },
        calculated_impacts: {
          co2_impact: material.quantity * emissionFactor.co2_factor,
          energy_impact: material.quantity * emissionFactor.energy_factor + (material.energy_consumption || 0),
          transport_impact: (material.transport_distance || 0) * emissionFactor.transport_factor * material.quantity
        }
      };

      enrichedData.push(enrichedMaterial);
    } catch (error) {
      console.error(`Error processing material ${material.material_type}:`, error);
      // Add material with error flag
      enrichedData.push({
        ...material,
        error: true,
        warning: `Error processing "${material.material_type}"`
      });
    }
  }

  return enrichedData;
}

module.exports = router;