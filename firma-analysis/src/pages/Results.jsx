import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ResultsChart from '../components/ResultsChart'

function Results({ signatureData, analysisResults }) {
  const navigate = useNavigate()
  const [isPremium, setIsPremium] = useState(false) // TODO: Get from auth context
  const [showShareMenu, setShowShareMenu] = useState(false)

  // If no data, redirect to home
  if (!analysisResults) {
    navigate('/')
    return null
  }

  const { characteristics, profile, archetype } = analysisResults

  // Free tier characteristics
  const freeCharacteristics = ['size', 'slant', 'pressure', 'legibility', 'speed']

  // Premium characteristics (15 additional)
  const premiumCharacteristics = Object.keys(characteristics).filter(
    key => !freeCharacteristics.includes(key)
  )

  const handleShare = async () => {
    const shareData = {
      title: 'My Signature Analysis Results',
      text: `I just analyzed my signature! My archetype is ${archetype.type} ${archetype.icon}`,
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n\nAnalyze your signature at: ${window.location.origin}`
        )
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }

    setShowShareMenu(false)
  }

  const handleNewAnalysis = () => {
    navigate('/')
  }

  const handleUpgradeToPremium = () => {
    // TODO: Navigate to premium page or show paywall modal
    alert('Premium upgrade coming soon! 🚀')
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleNewAnalysis}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">New Analysis</span>
          </button>

          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Your Results
          </h1>

          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="text-slate-400 hover:text-slate-200 transition-colors relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Share Results
                </button>
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Signature Preview */}
        <section className="text-center">
          <div className="inline-block bg-white rounded-xl p-4 shadow-xl border-2 border-slate-600">
            <img
              src={signatureData}
              alt="Your signature"
              className="max-w-full h-auto max-h-32"
            />
          </div>
        </section>

        {/* Archetype Card */}
        <section className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 border border-indigo-700/50 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">{archetype.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{archetype.type}</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
              {archetype.description}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {archetype.traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-200 text-sm font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Overall Score */}
        <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Overall Confidence Score</h3>
              <p className="text-sm text-slate-400 mt-1">{profile.summary}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {profile.overallScore}
              </div>
              <div className="text-sm text-slate-400">out of 100</div>
            </div>
          </div>
        </section>

        {/* Radar Chart */}
        <ResultsChart characteristics={characteristics} isPremium={isPremium} />

        {/* Top Strengths */}
        <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            Your Top Strengths
          </h3>
          <div className="space-y-3">
            {profile.strengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg px-4 py-2">
                  <p className="text-slate-200 font-medium">{strength}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Characteristics Breakdown - FREE */}
        <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-slate-200 mb-6">
            Personality Characteristics
          </h3>
          <div className="space-y-4">
            {freeCharacteristics.map(key => {
              const char = characteristics[key]
              return (
                <div key={key} className="border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-slate-200 capitalize">
                      {char.category}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-400">{char.level}</span>
                      <span className="text-xl font-bold text-indigo-400">{char.score}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${char.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-300">{char.interpretation}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Premium Teaser */}
        {!isPremium && (
          <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-3xl">👑</span>
                    Unlock Premium Features
                  </h3>
                  <p className="text-slate-300">
                    Discover 15 additional personality characteristics
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white line-through opacity-60">
                    $99
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    $9.99
                  </div>
                  <div className="text-xs text-slate-400">per month</div>
                </div>
              </div>

              {/* Premium Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl mb-2">📄</div>
                  <h4 className="font-semibold text-white mb-1">Professional Report</h4>
                  <p className="text-xs text-slate-300">15-page PDF with 20 characteristics</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl mb-2">💕</div>
                  <h4 className="font-semibold text-white mb-1">Couple Compatibility</h4>
                  <p className="text-xs text-slate-300">Compare with your partner's signature</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-semibold text-white mb-1">AI Signature Generator</h4>
                  <p className="text-xs text-slate-300">Create your perfect signature with AI</p>
                </div>
              </div>

              {/* Locked Premium Characteristics Preview */}
              <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  🔒 Locked Premium Characteristics ({premiumCharacteristics.length} more)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {premiumCharacteristics.slice(0, 9).map(key => (
                    <div
                      key={key}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-400 flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="blur-sm select-none">{characteristics[key].category}</span>
                    </div>
                  ))}
                  {premiumCharacteristics.length > 9 && (
                    <div className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-400 flex items-center justify-center">
                      +{premiumCharacteristics.length - 9} more
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleUpgradeToPremium}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <span className="flex items-center justify-center gap-2 text-lg">
                  ✨ Try 7 Days Free, Then $9.99/month
                </span>
              </button>

              <p className="text-center text-xs text-slate-400 mt-3">
                Cancel anytime • No commitment
              </p>
            </div>
          </section>
        )}

        {/* Areas for Growth */}
        <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            Areas for Growth
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            These areas present opportunities for personal development
          </p>
          <div className="space-y-3">
            {profile.areasForGrowth.map((area, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-lg px-4 py-2">
                  <p className="text-slate-200 font-medium">{area}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex gap-4">
          <button
            onClick={handleNewAnalysis}
            className="flex-1 py-4 px-6 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors"
          >
            Analyze New Signature
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Share Results 🚀
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>For entertainment and self-discovery purposes only. Not a professional psychological analysis.</p>
        <p className="mt-2">© 2026 FIRMAS - Signature Personality Analysis</p>
      </footer>
    </div>
  )
}

export default Results
