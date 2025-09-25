import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DataInputPage from './pages/DataInputPage'
import ResultsPage from './pages/ResultsPage'
import AssessmentsPage from './pages/AssessmentsPage'
import AboutPage from './pages/AboutPage'
import { LCAProvider } from './context/LCAContext'

function App() {
  return (
    <LCAProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/input" element={<DataInputPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </LCAProvider>
  )
}

export default App