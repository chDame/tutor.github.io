import { useNavigate } from 'react-router-dom'
import { TOPICS } from '../topics'
import { useAuth } from '../AuthContext'

export default function TopicsScreen() {
  const navigate = useNavigate()
  const { username } = useAuth()

  return (
    <div>
      <h1>Hi {username}!</h1>
      <p>Pick a subject to start practicing.</p>
      <div className="topic-grid">
        {TOPICS.map((topic) => (
          <button
            key={topic.slug}
            className={`topic-card ${topic.available ? 'enabled' : 'disabled'}`}
            disabled={!topic.available}
            onClick={() => navigate(`/path/${topic.slug}`)}
          >
            <span className="topic-emoji">{topic.emoji}</span>
            <span>{topic.title}</span>
            {!topic.available && <span className="topic-soon">Coming soon</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
