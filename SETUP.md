# AI-Powered Life Cycle Assessment (LCA) Tool - Setup Guide

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git** (for version control)

## Quick Start

### Option 1: Full Development Setup (Recommended)

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install all project dependencies:**
   ```bash
   npm run install-all
   ```

3. **Start all services:**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend at `http://localhost:3000`
   - Backend API at `http://localhost:5000`
   - AI Processor at `http://localhost:5001`

### Option 2: Docker Setup

1. **Build and start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application at `http://localhost:3000`**

## Manual Setup (Individual Services)

### Backend Setup

```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### AI Processor Setup

```bash
cd ai-processor
pip install -r requirements.txt
python app.py
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
AI_PROCESSOR_URL=http://localhost:5001
DATABASE_PATH=./database/lca.db
```

### AI Processor (.env)
```
AI_PORT=5001
DEBUG=False
FLASK_ENV=development
```

## Features

- ✅ CSV file upload and processing
- ✅ Manual data entry interface
- ✅ AI-powered data imputation
- ✅ Material categorization
- ✅ LCA calculations (CO2, Energy, Materials)
- ✅ Interactive visualizations
- ✅ Environmental impact scoring
- ✅ AI-generated recommendations
- ✅ Assessment saving and management
- ✅ Data export functionality

## Usage

1. **Input Data**: Upload a CSV file or manually enter material data
2. **AI Processing**: Enable AI processing for automatic data enhancement
3. **Calculate LCA**: Generate comprehensive environmental impact analysis
4. **View Results**: Explore interactive charts and detailed breakdowns
5. **Get Recommendations**: Review AI-powered optimization suggestions
6. **Save Assessment**: Store results for future reference

## Sample Data

Use the included `sample-data.csv` file to test the application with pre-configured material data.

## API Endpoints

### Data Endpoints
- `POST /api/data/upload` - Upload CSV file
- `POST /api/data/manual` - Submit manual data
- `GET /api/data/emission-factors` - Get emission factors
- `GET /api/data/categories` - Get material categories

### LCA Endpoints
- `POST /api/lca/calculate` - Calculate LCA
- `GET /api/lca/assessments` - Get saved assessments
- `GET /api/lca/assessments/:id` - Get specific assessment
- `DELETE /api/lca/assessments/:id` - Delete assessment

### AI Endpoints
- `POST /api/ai/process` - Process data with AI
- `POST /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/categorize` - Categorize materials
- `GET /api/ai/health` - Check AI service health

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5000, and 5001 are available
2. **Python dependencies**: Make sure all Python packages are installed correctly
3. **Database issues**: Delete `backend/database/lca.db` and run `npm run init-db`
4. **AI service unavailable**: The app will gracefully fall back to basic processing

### Performance Tips

- Use Chrome or Firefox for best performance
- Limit CSV files to under 5MB
- Enable AI processing for better data quality
- Regular cleanup of old assessments improves performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the GitHub repository or contact the development team.