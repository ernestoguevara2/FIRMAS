import { useNavigate } from 'react-router-dom'
import SignatureCanvas from '../components/SignatureCanvas'
import { analyzeSignature } from '../utils/signatureAnalyzer'

function Home({ setSignatureData, setAnalysisResults }) {
  const navigate = useNavigate()

  const handleSignatureComplete = (signatureDataUrl) => {
    setSignatureData(signatureDataUrl)
    const results = analyzeSignature(signatureDataUrl)
    setAnalysisResults(results)
    navigate('/results')
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      {/* Header */}
      <header className="p-4 text-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-indigo-400">Firma Analysis</h1>
        <p className="text-sm text-slate-400 mt-1">
          Discover your personality through your signature
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold text-slate-200">
              Draw your signature
            </h2>
            <p className="text-sm text-slate-400">
              Sign naturally, as you would on a document
            </p>
          </div>

          <SignatureCanvas onComplete={handleSignatureComplete} />
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>For entertainment purposes only. Not a professional analysis.</p>
      </footer>
    </div>
  )
}

export default Home
