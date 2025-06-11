import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ratp-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img
              className="h-16 w-auto"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Logo_RATP.svg/1200px-Logo_RATP.svg.png"
              alt="RATP"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-ratp-gray-900">
            Planning T8 - Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-ratp-gray-600">
            Accédez à votre espace de gestion des plannings
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-ratp-gray-300 placeholder-ratp-gray-500 text-ratp-gray-900 rounded-t-md focus:outline-none focus:ring-ratp-blue focus:border-ratp-blue focus:z-10 sm:text-sm"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-ratp-gray-300 placeholder-ratp-gray-500 text-ratp-gray-900 rounded-b-md focus:outline-none focus:ring-ratp-blue focus:border-ratp-blue focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <ErrorMessage message={error} />

          <div>
            <Button
              type="submit"
              loading={loading}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium"
            >
              Se connecter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;