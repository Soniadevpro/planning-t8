import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Components
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Exchanges from './pages/Exchanges';
import Profile from './pages/Profile';
import SupervisorDashboard from './components/supervisor/SupervisorDashboard.jsx';
import CollectivePlanning from './pages/CollectivePlanning.jsx';

// Import Tailwind CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Routes protégées avec Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="planning" element={<Planning />} />
            <Route path="exchanges" element={<Exchanges />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Routes superviseur/admin */}
            <Route path="supervision" element={
              <div className="p-6 text-center text-ratp-gray-500">
                Page Supervision - À implémenter
              </div>
            } />
            <Route path="team-planning" element={
              <div className="p-6 text-center text-ratp-gray-500">
                Page Planning Équipe - À implémenter
              </div>
            } />
            <Route path="statistics" element={
              <div className="p-6 text-center text-ratp-gray-500">
                Page Statistiques - À implémenter
              </div>
            } />
            
            {/* ✅ Planning Collectif DÉPLACÉ ICI (avec layout) */}
            <Route path="collective-planning" element={<CollectivePlanning />} />
            
            {/* Route superviseur pour validation des échanges */}
            <Route path="supervisor/exchanges" element={<SupervisorDashboard />} />
          </Route>
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;