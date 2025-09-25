from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
PORT = int(os.getenv('AI_PORT', 5001))
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Material categorization mapping
MATERIAL_CATEGORIES = {
    'metals': ['steel', 'aluminum', 'copper', 'iron', 'zinc', 'brass', 'bronze'],
    'plastics': ['pet', 'hdpe', 'pvc', 'ldpe', 'pp', 'ps', 'plastic', 'polymer'],
    'construction': ['concrete', 'cement', 'brick', 'stone', 'wood', 'timber', 'lumber'],
    'glass': ['glass', 'silicate'],
    'paper': ['paper', 'cardboard', 'pulp'],
    'textiles': ['cotton', 'polyester', 'wool', 'silk', 'fabric', 'textile'],
    'electronics': ['silicon', 'gold', 'silver', 'lithium', 'semiconductor'],
    'ceramics': ['ceramic', 'porcelain', 'clay']
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Processor',
        'version': '1.0.0',
        'timestamp': pd.Timestamp.now().isoformat()
    })

@app.route('/process', methods=['POST'])
def process_materials():
    """Process materials data with AI-powered imputation and analysis"""
    try:
        data = request.get_json()
        materials = data.get('materials', [])
        options = data.get('options', {})
        
        if not materials:
            return jsonify({'error': 'No materials provided'}), 400
        
        # Convert to DataFrame for processing
        df = pd.DataFrame(materials)
        
        # Process the data
        processed_df = perform_ai_processing(df, options)
        
        # Convert back to list of dictionaries
        processed_materials = processed_df.to_dict('records')
        
        return jsonify({
            'processed_materials': processed_materials,
            'processing_info': {
                'total_records': len(processed_materials),
                'imputed_records': len([m for m in processed_materials if m.get('ai_imputed', False)]),
                'categorized_records': len([m for m in processed_materials if m.get('ai_categorized', False)])
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing materials: {str(e)}")
        return jsonify({'error': 'Processing failed', 'details': str(e)}), 500

@app.route('/recommendations', methods=['POST'])
def generate_recommendations():
    """Generate AI-powered recommendations based on LCA results"""
    try:
        data = request.get_json()
        lca_results = data.get('lca_results', {})
        context = data.get('context', {})
        
        recommendations = generate_ai_recommendations(lca_results, context)
        
        return jsonify({
            'recommendations': recommendations,
            'confidence_score': calculate_recommendation_confidence(lca_results),
            'generated_at': pd.Timestamp.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({'error': 'Recommendation generation failed', 'details': str(e)}), 500

@app.route('/categorize', methods=['POST'])
def categorize_materials():
    """Categorize materials using AI-enhanced matching"""
    try:
        data = request.get_json()
        materials = data.get('materials', [])
        
        categorized = []
        for material in materials:
            material_name = material.get('material_type', '').lower()
            category, confidence = intelligent_categorization(material_name)
            
            categorized.append({
                **material,
                'category': category,
                'confidence': confidence,
                'ai_categorized': confidence < 0.9
            })
        
        return jsonify({
            'categorized_materials': categorized,
            'total_processed': len(categorized)
        })
        
    except Exception as e:
        logger.error(f"Error categorizing materials: {str(e)}")
        return jsonify({'error': 'Categorization failed', 'details': str(e)}), 500

def perform_ai_processing(df, options):
    """Main AI processing function"""
    processed_df = df.copy()
    
    # Add processing flags
    processed_df['ai_imputed'] = False
    processed_df['ai_categorized'] = False
    processed_df['outlier_flag'] = False
    processed_df['confidence_score'] = 1.0
    
    # 1. Missing data detection and imputation
    processed_df = handle_missing_data(processed_df)
    
    # 2. Outlier detection
    processed_df = detect_outliers(processed_df)
    
    # 3. Intelligent categorization
    processed_df = enhance_categorization(processed_df)
    
    # 4. Data validation and quality scoring
    processed_df = calculate_data_quality(processed_df)
    
    return processed_df

def handle_missing_data(df):
    """Handle missing data with intelligent imputation"""
    numeric_columns = ['quantity', 'energy_consumption', 'transport_distance']
    
    for col in numeric_columns:
        if col in df.columns:
            # Identify missing values
            missing_mask = df[col].isna() | (df[col] == 0)
            
            if missing_mask.any():
                # Use median imputation for robustness
                imputer = SimpleImputer(strategy='median')
                
                # If all values are missing, use defaults
                if missing_mask.all():
                    if col == 'quantity':
                        df[col] = 1.0
                    elif col == 'energy_consumption':
                        df[col] = df.apply(lambda row: estimate_energy_consumption(
                            row.get('material_type', '')), axis=1)
                    elif col == 'transport_distance':
                        df[col] = 100.0  # Default 100km
                else:
                    # Use existing values to impute
                    valid_values = df[col][~missing_mask].values.reshape(-1, 1)
                    if len(valid_values) > 0:
                        imputer.fit(valid_values)
                        df.loc[missing_mask, col] = imputer.transform([[0]])[0][0]
                
                # Mark as imputed
                df.loc[missing_mask, 'ai_imputed'] = True
    
    return df

def detect_outliers(df):
    """Detect outliers using statistical methods"""
    numeric_columns = ['quantity', 'energy_consumption', 'transport_distance']
    
    for col in numeric_columns:
        if col in df.columns and len(df[col].dropna()) > 0:
            # Use IQR method for outlier detection
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
            df.loc[outlier_mask, 'outlier_flag'] = True
            df.loc[outlier_mask, 'outlier_reason'] = f'Statistical outlier in {col}'
    
    return df

def enhance_categorization(df):
    """Enhance material categorization with AI"""
    if 'material_type' in df.columns:
        for idx, row in df.iterrows():
            material_name = str(row['material_type']).lower()
            category, confidence = intelligent_categorization(material_name)
            
            df.at[idx, 'category'] = category
            df.at[idx, 'confidence_score'] = confidence
            
            if confidence < 0.9:
                df.at[idx, 'ai_categorized'] = True
    
    return df

def calculate_data_quality(df):
    """Calculate overall data quality score"""
    for idx, row in df.iterrows():
        quality_score = 1.0
        
        # Reduce score for imputed data
        if row.get('ai_imputed', False):
            quality_score -= 0.2
        
        # Reduce score for outliers
        if row.get('outlier_flag', False):
            quality_score -= 0.1
        
        # Reduce score for uncertain categorization
        if row.get('confidence_score', 1.0) < 0.8:
            quality_score -= 0.1
        
        df.at[idx, 'data_quality_score'] = max(0.0, quality_score)
    
    return df

def intelligent_categorization(material_name):
    """Intelligent material categorization with confidence scoring"""
    material_name = material_name.lower().strip()
    
    # Direct matches with high confidence
    for category, keywords in MATERIAL_CATEGORIES.items():
        for keyword in keywords:
            if keyword in material_name:
                confidence = 0.95 if material_name == keyword else 0.85
                return category.title(), confidence
    
    # Fuzzy matching for partial matches
    best_match_score = 0
    best_category = 'Unknown'
    
    for category, keywords in MATERIAL_CATEGORIES.items():
        for keyword in keywords:
            # Simple similarity scoring
            if any(char in material_name for char in keyword):
                score = len(set(keyword) & set(material_name)) / len(set(keyword) | set(material_name))
                if score > best_match_score and score > 0.3:
                    best_match_score = score
                    best_category = category.title()
    
    confidence = best_match_score if best_category != 'Unknown' else 0.1
    return best_category, confidence

def estimate_energy_consumption(material_type):
    """Estimate energy consumption based on material type"""
    energy_factors = {
        'steel': 24.0, 'aluminum': 154.0, 'copper': 42.0,
        'plastic': 76.0, 'pet': 76.0, 'hdpe': 76.7,
        'glass': 15.0, 'concrete': 1.0, 'wood': 2.5,
        'paper': 20.0, 'cotton': 55.0, 'polyester': 125.0
    }
    
    material_lower = material_type.lower()
    for material, factor in energy_factors.items():
        if material in material_lower:
            return factor
    
    return 10.0  # Default estimate

def generate_ai_recommendations(lca_results, context):
    """Generate intelligent recommendations based on LCA results"""
    recommendations = []
    
    if not lca_results.get('summary'):
        return recommendations
    
    summary = lca_results['summary']
    material_breakdown = lca_results.get('material_breakdown', [])
    category_breakdown = lca_results.get('category_breakdown', [])
    
    # Analyze carbon footprint
    co2_impact = summary.get('total_co2_kg', 0)
    if co2_impact > 50:
        urgency = 'high' if co2_impact > 200 else 'medium'
        recommendations.append({
            'type': 'carbon_reduction',
            'priority': urgency,
            'title': 'Carbon Footprint Optimization',
            'description': f'Your assessment shows {co2_impact:.1f} kg CO2 emissions. This is {"significantly " if co2_impact > 200 else ""}above sustainable levels.',
            'impact_score': min(10, co2_impact / 20),
            'actions': generate_carbon_reduction_actions(material_breakdown),
            'estimated_reduction': f'{min(50, int(co2_impact * 0.3))}%'
        })
    
    # Analyze energy consumption
    energy_impact = summary.get('total_energy_mj', 0)
    if energy_impact > 500:
        recommendations.append({
            'type': 'energy_optimization',
            'priority': 'medium',
            'title': 'Energy Efficiency Improvement',
            'description': f'Total energy consumption of {energy_impact:.1f} MJ can be optimized through efficient processes and renewable energy.',
            'impact_score': min(10, energy_impact / 100),
            'actions': [
                'Implement energy-efficient manufacturing processes',
                'Switch to renewable energy sources',
                'Optimize equipment efficiency',
                'Consider energy recovery systems'
            ],
            'estimated_reduction': '20-35%'
        })
    
    # Material-specific recommendations
    if material_breakdown:
        high_impact_materials = sorted(material_breakdown, key=lambda x: x.get('total_impact', 0), reverse=True)[:3]
        
        for material in high_impact_materials:
            if material.get('total_impact', 0) > 20:
                recommendations.append({
                    'type': 'material_substitution',
                    'priority': 'medium',
                    'title': f'Optimize {material.get("material_type", "Material")} Usage',
                    'description': f'{material.get("material_type")} contributes significantly to environmental impact.',
                    'impact_score': min(10, material.get('total_impact', 0) / 10),
                    'actions': generate_material_specific_actions(material),
                    'estimated_reduction': '15-30%'
                })
    
    # Category-based recommendations
    if category_breakdown:
        high_impact_categories = sorted(category_breakdown, key=lambda x: x.get('co2', 0), reverse=True)[:2]
        
        for category in high_impact_categories:
            if category.get('co2', 0) > 30:
                recommendations.append({
                    'type': 'category_optimization',
                    'priority': 'low',
                    'title': f'Focus on {category.get("category")} Category',
                    'description': f'{category.get("category")} materials account for {category.get("percentage", 0):.1f}% of your carbon footprint.',
                    'impact_score': category.get('percentage', 0) / 10,
                    'actions': generate_category_actions(category.get('category', '')),
                    'estimated_reduction': '10-25%'
                })
    
    # Always include circular economy recommendation
    recommendations.append({
        'type': 'circular_economy',
        'priority': 'low',
        'title': 'Implement Circular Economy Principles',
        'description': 'Adopting circular economy strategies can significantly reduce environmental impact across all categories.',
        'impact_score': 6,
        'actions': [
            'Design products for disassembly and recycling',
            'Implement material recovery programs',
            'Use recycled content where possible',
            'Partner with circular economy initiatives'
        ],
        'estimated_reduction': '5-20%'
    })
    
    # Sort by impact score and priority
    priority_order = {'high': 3, 'medium': 2, 'low': 1}
    recommendations.sort(key=lambda x: (priority_order.get(x['priority'], 0), x.get('impact_score', 0)), reverse=True)
    
    return recommendations[:6]  # Return top 6 recommendations

def generate_carbon_reduction_actions(material_breakdown):
    """Generate specific carbon reduction actions based on materials"""
    actions = [
        'Switch to low-carbon material alternatives',
        'Optimize supply chain to reduce transportation emissions',
        'Implement carbon capture or offset programs'
    ]
    
    if material_breakdown:
        high_carbon_materials = [m for m in material_breakdown if m.get('co2_impact', 0) > 10]
        if high_carbon_materials:
            actions.append(f'Focus on reducing usage of high-carbon materials like {", ".join([m.get("material_type", "") for m in high_carbon_materials[:3]])}')
    
    return actions

def generate_material_specific_actions(material):
    """Generate actions specific to a material type"""
    material_type = material.get('material_type', '').lower()
    
    if 'steel' in material_type:
        return [
            'Consider recycled steel alternatives',
            'Explore steel-free design options',
            'Source from electric arc furnace producers',
            'Optimize design to reduce steel quantity'
        ]
    elif 'aluminum' in material_type:
        return [
            'Use recycled aluminum (90% less energy)',
            'Consider alternative lightweight materials',
            'Optimize design for material efficiency',
            'Source from renewable energy producers'
        ]
    elif 'plastic' in material_type:
        return [
            'Switch to bio-based plastics',
            'Use recycled plastic content',
            'Consider biodegradable alternatives',
            'Reduce plastic usage through design optimization'
        ]
    else:
        return [
            'Research sustainable alternatives',
            'Optimize quantity and design',
            'Source from certified sustainable suppliers',
            'Consider recycled or bio-based options'
        ]

def generate_category_actions(category):
    """Generate actions for specific material categories"""
    category_actions = {
        'metals': [
            'Prioritize recycled metal content',
            'Explore lightweight alloy alternatives',
            'Implement metal recovery programs'
        ],
        'plastics': [
            'Transition to bio-based plastics',
            'Increase recycled content usage',
            'Reduce single-use plastic components'
        ],
        'construction': [
            'Use sustainable building materials',
            'Implement modular design principles',
            'Source locally to reduce transport'
        ],
        'textiles': [
            'Choose organic or recycled fibers',
            'Implement textile recycling programs',
            'Reduce material waste through efficient cutting'
        ]
    }
    
    return category_actions.get(category.lower(), [
        'Research sustainable alternatives in this category',
        'Optimize usage and design efficiency',
        'Source from environmentally certified suppliers'
    ])

def calculate_recommendation_confidence(lca_results):
    """Calculate confidence score for recommendations"""
    base_confidence = 0.8
    
    # Increase confidence with more data
    if lca_results.get('material_breakdown'):
        material_count = len(lca_results['material_breakdown'])
        base_confidence += min(0.15, material_count * 0.02)
    
    # Decrease confidence if many estimates were used
    if lca_results.get('warnings'):
        warning_count = len(lca_results['warnings'])
        base_confidence -= min(0.3, warning_count * 0.05)
    
    return round(base_confidence, 2)

if __name__ == '__main__':
    logger.info(f"Starting AI Processor on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)