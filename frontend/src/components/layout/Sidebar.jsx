import {
  Calendar,
  RefreshCw,
  Users,
  BarChart3,
  User,
  X,
  Home,
  CheckSquare,
  CheckCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, isAdmin, isSuperviseur } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Mon Planning', href: '/planning', icon: Calendar, current: location.pathname === '/planning' },
    { name: 'Échanges', href: '/exchanges', icon: RefreshCw, current: location.pathname === '/exchanges' },
  ];

  // Ajouter les liens superviseur/admin
if (isSuperviseur() || isAdmin()) {
  navigation.push(
    { name: 'Demandes à traiter', href: '/supervision', icon: CheckSquare, current: location.pathname === '/supervision' },
    { name: 'Planning Équipe', href: '/team-planning', icon: Users, current: location.pathname === '/team-planning' },
    { name: 'Planning Collectif', href: '/collective-planning', icon: Calendar, current: location.pathname === '/collective-planning' } // ← NOUVEAU LIEN
  );
}

  // Lien spécifique superviseur pour validation des échanges
  if (isSuperviseur()) {
    navigation.push(
      { name: 'Validation échanges', href: '/supervisor/exchanges', icon: CheckCircle, current: location.pathname === '/supervisor/exchanges' }
    );
  }

  if (isAdmin()) {
    navigation.push(
      { name: 'Statistiques', href: '/statistics', icon: BarChart3, current: location.pathname === '/statistics' }
    );
  }

  navigation.push(
    { name: 'Profil', href: '/profile', icon: User, current: location.pathname === '/profile' }
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} user={user} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto bg-white border-r border-ratp-gray-200">
              <SidebarContent navigation={navigation} user={user} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ navigation, user }) => (
  <>
    <div className="flex items-center flex-shrink-0 px-4">
      <img
        className="h-8 w-auto"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Logo_RATP.svg/1200px-Logo_RATP.svg.png"
        alt="RATP"
      />
      <div className="ml-3">
        <p className="text-sm font-medium text-ratp-gray-700">T8 Planning</p>
        <p className="text-xs text-ratp-gray-500">Gestion des plannings</p>
      </div>
    </div>

    {/* Navigation principale */}
    <nav className="mt-8 flex-1 px-2 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`${
              item.current
                ? 'bg-ratp-blue text-white'
                : 'text-ratp-gray-600 hover:bg-ratp-gray-50 hover:text-ratp-gray-900'
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            <Icon
              className={`${
                item.current ? 'text-white' : 'text-ratp-gray-400 group-hover:text-ratp-gray-500'
              } mr-3 flex-shrink-0 h-5 w-5`}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>

   

    {/* Informations utilisateur en bas */}
    <div className="flex-shrink-0 flex border-t border-ratp-gray-200 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-ratp-blue flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-ratp-gray-700">
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user?.username || 'Utilisateur'
            }
          </p>
          <p className="text-xs font-medium text-ratp-gray-500 capitalize">
            {user?.role || 'Agent'}
          </p>
        </div>
      </div>
    </div>
  </>
);

export default Sidebar;