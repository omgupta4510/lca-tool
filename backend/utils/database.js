const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../database/lca.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class DatabaseWrapper {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      this.db = new Database(DB_PATH);
      this.db.pragma('journal_mode = WAL');
      console.log('Connected to SQLite database');
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);
      return { id: result.lastInsertRowid, changes: result.changes };
    } catch (error) {
      console.error('Database run error:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(params);
    } catch (error) {
      console.error('Database get error:', error);
      throw error;
    }
  }

  async all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(params);
    } catch (error) {
      console.error('Database all error:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }
}

const database = new DatabaseWrapper();

async function initializeDatabase() {
  await database.connect();

  // Create tables
  await database.run(`
    CREATE TABLE IF NOT EXISTS emission_factors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_type VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      co2_factor REAL NOT NULL,
      energy_factor REAL NOT NULL,
      transport_factor REAL NOT NULL,
      unit VARCHAR(20) NOT NULL,
      source VARCHAR(200),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS lca_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      total_co2 REAL,
      total_energy REAL,
      total_materials REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS assessment_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER NOT NULL,
      material_type VARCHAR(100) NOT NULL,
      quantity REAL NOT NULL,
      unit VARCHAR(20) NOT NULL,
      energy_consumption REAL,
      transport_distance REAL,
      co2_impact REAL,
      energy_impact REAL,
      category VARCHAR(50),
      FOREIGN KEY (assessment_id) REFERENCES lca_assessments (id)
    )
  `);

  // Insert default emission factors
  await insertDefaultEmissionFactors();
}

async function insertDefaultEmissionFactors() {
  const defaultFactors = [
    // Metals
    { material_type: 'Steel', category: 'Metals', co2_factor: 1.85, energy_factor: 24.0, transport_factor: 0.1, unit: 'kg', source: 'Industry Average' },
    { material_type: 'Aluminum', category: 'Metals', co2_factor: 8.24, energy_factor: 154.0, transport_factor: 0.1, unit: 'kg', source: 'Industry Average' },
    { material_type: 'Copper', category: 'Metals', co2_factor: 2.95, energy_factor: 42.0, transport_factor: 0.1, unit: 'kg', source: 'Industry Average' },
    
    // Plastics
    { material_type: 'PET Plastic', category: 'Plastics', co2_factor: 2.25, energy_factor: 76.0, transport_factor: 0.05, unit: 'kg', source: 'PlasticsEurope' },
    { material_type: 'HDPE', category: 'Plastics', co2_factor: 1.95, energy_factor: 76.7, transport_factor: 0.05, unit: 'kg', source: 'PlasticsEurope' },
    { material_type: 'PVC', category: 'Plastics', co2_factor: 2.41, energy_factor: 57.5, transport_factor: 0.05, unit: 'kg', source: 'PlasticsEurope' },
    
    // Construction Materials
    { material_type: 'Concrete', category: 'Construction', co2_factor: 0.13, energy_factor: 1.0, transport_factor: 0.02, unit: 'kg', source: 'Cement Association' },
    { material_type: 'Brick', category: 'Construction', co2_factor: 0.24, energy_factor: 3.0, transport_factor: 0.03, unit: 'kg', source: 'Building Research' },
    { material_type: 'Wood', category: 'Construction', co2_factor: -0.9, energy_factor: 2.5, transport_factor: 0.04, unit: 'kg', source: 'Forest Products' },
    
    // Glass & Ceramics
    { material_type: 'Glass', category: 'Glass', co2_factor: 0.85, energy_factor: 15.0, transport_factor: 0.08, unit: 'kg', source: 'Glass Manufacturing' },
    { material_type: 'Ceramic', category: 'Ceramics', co2_factor: 0.64, energy_factor: 12.0, transport_factor: 0.06, unit: 'kg', source: 'Ceramic Industry' },
    
    // Textiles
    { material_type: 'Cotton', category: 'Textiles', co2_factor: 5.89, energy_factor: 55.0, transport_factor: 0.03, unit: 'kg', source: 'Textile Exchange' },
    { material_type: 'Polyester', category: 'Textiles', co2_factor: 9.52, energy_factor: 125.0, transport_factor: 0.03, unit: 'kg', source: 'Textile Exchange' },
    
    // Electronics
    { material_type: 'Silicon', category: 'Electronics', co2_factor: 1.3, energy_factor: 230.0, transport_factor: 0.1, unit: 'kg', source: 'Semiconductor Industry' },
    { material_type: 'Gold', category: 'Electronics', co2_factor: 12800.0, energy_factor: 240000.0, transport_factor: 0.2, unit: 'kg', source: 'Mining Industry' },
    
    // Paper
    { material_type: 'Paper', category: 'Paper', co2_factor: 0.93, energy_factor: 20.0, transport_factor: 0.04, unit: 'kg', source: 'Paper Industry' },
    { material_type: 'Cardboard', category: 'Paper', co2_factor: 0.7, energy_factor: 15.0, transport_factor: 0.04, unit: 'kg', source: 'Paper Industry' }
  ];

  for (const factor of defaultFactors) {
    const existing = await database.get(
      'SELECT id FROM emission_factors WHERE material_type = ? AND category = ?',
      [factor.material_type, factor.category]
    );

    if (!existing) {
      await database.run(`
        INSERT INTO emission_factors 
        (material_type, category, co2_factor, energy_factor, transport_factor, unit, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        factor.material_type,
        factor.category,
        factor.co2_factor,
        factor.energy_factor,
        factor.transport_factor,
        factor.unit,
        factor.source
      ]);
    }
  }
}

module.exports = {
  database,
  initializeDatabase
};