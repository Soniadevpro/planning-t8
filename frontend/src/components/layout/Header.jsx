import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-ratp-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-ratp-gray-400 hover:text-ratp-gray-500 hover:bg-ratp-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ratp-blue lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <img
                className="h-8 w-auto"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Logo_RATP.svg/1200px-Logo_RATP.svg.png"
                alt="RATP"
              />
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-ratp-gray-900">
                  Planning T8
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-ratp-gray-400 hover:text-ratp-gray-500 hover:bg-ratp-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
            </button>

            <div className="relative flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-ratp-gray-400" />
                <span className="text-sm font-medium text-ratp-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ratp-blue text-white">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-sm text-ratp-gray-500 hover:text-ratp-gray-700 px-3 py-2 rounded-md hover:bg-ratp-gray-100"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;