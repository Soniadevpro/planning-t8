import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import "../styles/layout.css"
const Layout = ({ children }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-subway"></i>
            <span>Planning T8</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-item"
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => navigate('/planning')}
            className="nav-item"
          >
            <i className="far fa-calendar-alt"></i>
            <span>Planning</span>
          </button>
          
          <button
            onClick={() => navigate('/exchanges')}
            className="nav-item"
          >
            <i className="fas fa-exchange-alt"></i>
            <span>Échanges</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="nav-item"
          >
            <i className="far fa-user-circle"></i>
            <span>Profil</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user.first_name || user.username} />
              ) : (
                <span>{(user?.first_name || user?.username)?.charAt(0)}</span>
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.first_name || user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          
          <div className="sidebar-actions">
            <ThemeToggle />
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  )
}

export default Layout