import { Link } from 'react-router-dom'
import '../styles/visualization.css'

const VIZ_CARDS = [
  {
    to: '/visualizations/energy-over-time',
    title: 'Energy Over Time',
    description: 'Track changes in overall, energy, emotion, and productivity scores across days.',
    accent: '#2563eb',
    icon: '📈',
  },
  {
    to: '/visualizations/completion-time',
    title: 'Task Completion by Time of Day',
    description: 'See which time blocks you tend to complete the most tasks.',
    accent: '#f59e0b',
    icon: '🕐',
  },
]

function VisualizationPage() {
  return (
    <div className="visualization-page">
      <section className="viz-toolbar">
        <div>
          <h1>Visualizations</h1>
          <p>Explore charts and insights about your logs and tasks.</p>
        </div>
      </section>

      <div className="viz-hub-grid">
        {VIZ_CARDS.map((card) => (
          <Link key={card.to} to={card.to} className="viz-hub-card">
            <span className="viz-hub-card-accent" style={{ background: card.accent }} />
            <span className="viz-hub-card-icon">{card.icon}</span>
            <h2 className="viz-hub-card-title">{card.title}</h2>
            <p className="viz-hub-card-desc">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default VisualizationPage
