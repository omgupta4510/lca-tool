# AI-Powered Life Cycle Assessment (LCA) Tool

A comprehensive prototype for environmental impact assessment with AI-powered data processing and visualization.

## Features

- **Data Input Interface**: Upload CSV files or manual data entry
- **AI-Powered Processing**: Missing data detection and imputation
- **LCA Calculations**: Carbon footprint, energy consumption, material usage
- **Visualization**: Interactive charts and graphs
- **Recommendations**: AI-driven suggestions for environmental optimization

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite for emission factors
- **Charts**: Chart.js for visualizations
- **AI/ML**: Python integration for data processing

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Project Structure

```
LCA/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── ai-processor/      # Python AI processing module
├── database/          # SQLite database and scripts
├── docs/             # Documentation
└── docker-compose.yml # Container orchestration
```

## Demo Data

The application comes with pre-loaded demo data for quick demonstration of all features.

## License

MIT License