import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function ResultsChart({ characteristics, isPremium = false }) {
  // Determine which characteristics to show
  const freeCharacteristics = ['size', 'slant', 'pressure', 'legibility', 'speed']

  const characteristicsToShow = isPremium
    ? Object.keys(characteristics)
    : freeCharacteristics

  // Prepare data for radar chart
  const labels = characteristicsToShow.map(key =>
    characteristics[key].category || key
  )

  const scores = characteristicsToShow.map(key =>
    characteristics[key].score
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Your Personality Profile',
        data: scores,
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo with transparency
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          color: '#94a3b8', // Slate-400
          backdropColor: 'transparent',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)', // Slate-400 with transparency
          circular: true
        },
        angleLines: {
          color: 'rgba(148, 163, 184, 0.2)'
        },
        pointLabels: {
          color: '#e2e8f0', // Slate-200
          font: {
            size: isPremium ? 11 : 12,
            weight: '500'
          },
          padding: 10
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate-900
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.r}/100`
          }
        }
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">
          Personality Radar Chart
        </h3>
        <div className="relative aspect-square max-h-96">
          <Radar data={data} options={options} />
        </div>
        {!isPremium && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Free version shows 5 basic characteristics
            </p>
            <p className="text-xs text-indigo-400 mt-1">
              ✨ Upgrade to Premium for 20 characteristics
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsChart
