import { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Badge from '../components/common/Badge';
import planningService from '../services/planningService';
import exchangesService from '../services/exchangesService';
import { format, startOfWeek, endOfWeek, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    prochainService: null,
    planningsSemaine: [],
    demandesEnAttente: 0,
    demandesRecues: 0,
    statistiques: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const today = new Date();
      const startWeek = startOfWeek(today, { locale: fr });
      const endWeek = endOfWeek(today, { locale: fr });

      // Récupérer les plannings de la semaine
      const plannings = await planningService.getPlannings({
        date_debut: format(startWeek, 'yyyy-MM-dd'),
        date_fin: format(endWeek, 'yyyy-MM-dd')
      });

      // Filtrer les plannings selon le rôle
      const filteredPlannings = planningService.filterPlanningsByUser(
        plannings, 
        user.id, 
        user.role
      );

      // Trouver le prochain service
      const prochainService = filteredPlannings
        .filter(p => new Date(p.date) >= today && p.type_service !== 'repos')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      // Récupérer les demandes en attente (pour agents)
      let demandesEnAttente = 0;
      let demandesRecues = 0;

      if (user.role === 'agent') {
        try {
          const envoyees = await exchangesService.getMesDemandesEnvoyees();
          const recues = await exchangesService.getMesDemandesRecues();
          
          demandesEnAttente = envoyees.filter(d => d.statut === 'en_attente').length;
          demandesRecues = recues.filter(d => d.statut === 'en_attente').length;
        } catch (err) {
          console.warn('Erreur lors du chargement des demandes:', err);
        }
      }

      setDashboardData({
        prochainService,
        planningsSemaine: filteredPlannings,
        demandesEnAttente,
        demandesRecues,
        statistiques: null
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeColor = (type) => {
    const colors = {
      matin: 'bg-yellow-100 text-yellow-800',
      apres_midi: 'bg-blue-100 text-blue-800',
      journee: 'bg-green-100 text-green-800',
      nuit: 'bg-purple-100 text-purple-800',
      repos: 'bg-gray-100 text-gray-800',
      vacances: 'bg-orange-100 text-orange-800',
      jour_ferie_repos: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getServiceTypeLabel = (type) => {
    const types = planningService.getTypesService();
    const typeObj = types.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Aujourd\'hui';
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ratp-gray-900">
          Bonjour {user.first_name} !
        </h1>
        <p className="text-ratp-gray-600">
          Voici votre tableau de bord pour la gestion de vos plannings
        </p>
      </div>

      <ErrorMessage message={error} />

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Prochain service */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-ratp-blue" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-ratp-gray-500 truncate">
                    Prochain service
                  </dt>
                  <dd className="text-lg font-medium text-ratp-gray-900">
                    {dashboardData.prochainService ? (
                      <div>
                        <div>{formatDate(dashboardData.prochainService.date)}</div>
                        <Badge 
                          className={`mt-1 ${getServiceTypeColor(dashboardData.prochainService.type_service)}`}
                        >
                          {getServiceTypeLabel(dashboardData.prochainService.type_service)}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-ratp-gray-500">Aucun service prévu</span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Services cette semaine */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-ratp-green" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-ratp-gray-500 truncate">
                    Services cette semaine
                  </dt>
                  <dd className="text-lg font-medium text-ratp-gray-900">
                    {dashboardData.planningsSemaine.filter(p => p.type_service !== 'repos').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Demandes envoyées (Agents) */}
        {user.role === 'agent' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-ratp-gray-500 truncate">
                      Demandes en attente
                    </dt>
                    <dd className="text-lg font-medium text-ratp-gray-900">
                      {dashboardData.demandesEnAttente}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demandes reçues (Agents) */}
        {user.role === 'agent' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-ratp-gray-500 truncate">
                      Demandes reçues
                    </dt>
                    <dd className="text-lg font-medium text-ratp-gray-900">
                      {dashboardData.demandesRecues}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Planning de la semaine */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-ratp-gray-900 mb-4">
            Planning de la semaine
          </h3>
          
          {dashboardData.planningsSemaine.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.planningsSemaine
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((planning) => (
                  <div 
                    key={planning.id} 
                    className="flex items-center justify-between p-3 bg-ratp-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-ratp-gray-900">
                        {formatDate(planning.date)}
                      </div>
                      <Badge className={getServiceTypeColor(planning.type_service)}>
                        {getServiceTypeLabel(planning.type_service)}
                      </Badge>
                    </div>
                    
                    {planning.heure_debut && planning.heure_fin && (
                      <div className="text-sm text-ratp-gray-500">
                        {planning.heure_debut} - {planning.heure_fin}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-ratp-gray-500 text-center py-4">
              Aucun planning pour cette semaine
            </p>
          )}
        </div>
      </div>

      {/* Messages de bienvenue selon le rôle */}
      <div className="bg-ratp-blue rounded-lg p-6 text-white">
        <h4 className="text-lg font-semibold mb-2">
          {user.role === 'agent' && 'Espace Agent'}
          {user.role === 'superviseur' && 'Espace Superviseur'}
          {user.role === 'admin' && 'Espace Administrateur'}
        </h4>
        <p className="text-ratp-blue-light">
          {user.role === 'agent' && 'Consultez vos plannings, demandez des échanges de créneaux et gérez votre emploi du temps.'}
          {user.role === 'superviseur' && 'Validez les demandes d\'échanges et supervisez les plannings de votre équipe.'}
          {user.role === 'admin' && 'Administrez l\'application, gérez les utilisateurs et consultez les statistiques.'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;