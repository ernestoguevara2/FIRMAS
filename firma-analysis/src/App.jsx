import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Results from './pages/Results'

function App() {
  const [signatureData, setSignatureData] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)

  return (
    <BrowserRouter>
      <div className="min-h-screen min-h-dvh bg-slate-900 text-white">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                setSignatureData={setSignatureData}
                setAnalysisResults={setAnalysisResults}
              />
            }
          />
          <Route
            path="/results"
            element={
              <Results
                signatureData={signatureData}
                analysisResults={analysisResults}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
