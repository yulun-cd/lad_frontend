import { Link } from 'react-router-dom'
import '../styles/error-page.css'

function NotFoundPage() {
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="error-link">
          Go back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
