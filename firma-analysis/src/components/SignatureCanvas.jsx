import { useRef, useEffect, useState } from 'react'
import SignaturePad from 'signature_pad'

function SignatureCanvas({ onComplete }) {
  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const ratio = Math.max(window.devicePixelRatio || 1, 1)

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      canvas.getContext('2d').scale(ratio, ratio)

      if (signaturePadRef.current) {
        signaturePadRef.current.clear()
      }
    }

    resizeCanvas()

    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgb(248, 250, 252)',
      penColor: 'rgb(15, 23, 42)',
      minWidth: 1,
      maxWidth: 3,
    })

    signaturePadRef.current.addEventListener('endStroke', () => {
      setIsEmpty(signaturePadRef.current.isEmpty())
    })

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (signaturePadRef.current) {
        signaturePadRef.current.off()
      }
    }
  }, [])

  const handleClear = () => {
    signaturePadRef.current?.clear()
    setIsEmpty(true)
  }

  const handleAnalyze = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL('image/png')
      onComplete(dataUrl)
    }
  }

  return (
    <div className="w-full">
      {/* Canvas Container */}
      <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-slate-600">
        <canvas
          ref={canvasRef}
          className="w-full h-64 touch-none cursor-crosshair"
          style={{ backgroundColor: '#f8fafc' }}
        />

        {/* Hint overlay when empty */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-lg">Sign here</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleClear}
          className="flex-1 py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleAnalyze}
          disabled={isEmpty}
          className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
        >
          Analyze
        </button>
      </div>
    </div>
  )
}

export default SignatureCanvas
