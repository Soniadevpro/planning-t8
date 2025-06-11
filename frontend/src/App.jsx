import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Exchanges from './pages/Exchanges';
import Profile from './pages/Profile';

// Import Tailwind CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="planning" element={<Planning />} />
            <Route path="exchanges" element={<Exchanges />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Routes superviseur/admin - à implémenter */}
            <Route path="supervision" element={<div className="p-6 text-center text-ratp-gray-500">Page Supervision - À implémenter</div>} />
            <Route path="team-planning" element={<div className="p-6 text-center text-ratp-gray-500">Page Planning Équipe - À implémenter</div>} />
            <Route path="statistics" element={<div className="p-6 text-center text-ratp-gray-500">Page Statistiques - À implémenter</div>} />
          </Route>
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;