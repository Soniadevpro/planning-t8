// src/pages/CollectivePlanning.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, RefreshCw, Users, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const CollectivePlanning = () => {
  const { user } = useAuth();
  const [plannings, setPlannings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Types de services avec couleurs (basés sur votre image RATP)
  const serviceTypes = {
    'R': { label: 'Repos', color: 'bg-gray-200 text-gray-800', textColor: 'text-gray-800' },
    'CCF': { label: 'CCF', color: 'bg-purple-200 text-purple-800', textColor: 'text-purple-800' },
    'TS': { label: 'TS', color: 'bg-red-300 text-red-900', textColor: 'text-red-900' },
    'RT30': { label: 'RT30', color: 'bg-yellow-200 text-yellow-900', textColor: 'text-yellow-900' },
    'RT31': { label: 'RT31', color: 'bg-yellow-200 text-yellow-900', textColor: 'text-yellow-900' },
    'RT34': { label: 'RT34', color: 'bg-yellow-200 text-yellow-900', textColor: 'text-yellow-900' },
    'RT35': { label: 'RT35', color: 'bg-yellow-200 text-yellow-900', textColor: 'text-yellow-900' },
    'RT753': { label: 'RT753', color: 'bg-cyan-300 text-cyan-900', textColor: 'text-cyan-900' },
    '700': { label: '700', color: 'bg-blue-800 text-white', textColor: 'text-white' },
    '730': { label: '730', color: 'bg-red-500 text-white', textColor: 'text-white' },
    '750': { label: '750', color: 'bg-blue-500 text-white', textColor: 'text-white' },
    '661': { label: '661', color: 'bg-gray-600 text-white', textColor: 'text-white' },
    '748': { label: '748', color: 'bg-cyan-400 text-cyan-900', textColor: 'text-cyan-900' },
    // Services avec numéros
    '30': { label: '30', color: 'bg-yellow-300 text-yellow-900', textColor: 'text-yellow-900' },
    '31': { label: '31', color: 'bg-green-300 text-green-900', textColor: 'text-green-900' },
    '34': { label: '34', color: 'bg-orange-300 text-orange-900', textColor: 'text-orange-900' },
    '35': { label: '35', color: 'bg-green-400 text-green-900', textColor: 'text-green-900' },
    '39': { label: '39', color: 'bg-orange-400 text-orange-900', textColor: 'text-orange-900' },
    '40': { label: '40', color: 'bg-green-200 text-green-800', textColor: 'text-green-800' },
    '50': { label: '50', color: 'bg-blue-200 text-blue-800', textColor: 'text-blue-800' },
    '90': { label: '90', color: 'bg-yellow-400 text-yellow-900', textColor: 'text-yellow-900' },
    '140': { label: '140', color: 'bg-blue-300 text-blue-900', textColor: 'text-blue-900' },
    '150': { label: '150', color: 'bg-purple-300 text-purple-900', textColor: 'text-purple-900' },
    'CONDUITE': { label: 'CONDUITE', color: 'bg-gray-400 text-white', textColor: 'text-white' },
  };

  useEffect(() => {
    if (user?.role === 'agent' || user?.role === 'superviseur') {
      loadWeeklyPlanning();
    }
  }, [currentWeek, user]);

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { locale: fr, weekStartsOn: 1 }); // Lundi
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const loadWeeklyPlanning = async () => {
    try {
      setLoading(true);
      const weekDays = getWeekDays();
      const startDate = format(weekDays[0], 'yyyy-MM-dd');
      const endDate = format(weekDays[6], 'yyyy-MM-dd');

      const [planningsRes, agentsRes] = await Promise.all([
        api.get(`/plannings/collectif/?date_debut=${startDate}&date_fin=${endDate}`),
        api.get('/agents/')
      ]);

      setPlannings(planningsRes.data);
      setAgents(agentsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement du planning collectif:', error);
      
      // Données factices pour démonstration
      setAgents([
        { id: 1, full_name: 'Sonia Devpro' },
        { id: 2, full_name: 'Jean Dupont' },
        { id: 3, full_name: 'Paul Martin' },
        { id: 4, full_name: 'Marie Claire' }
      ]);
      
      // Générer des plannings factices
      const fakePlannings = [];
      const services = ['R', '750', 'CCF', '31', '35', '700', 'RT30', 'TS'];
      const weekDays = getWeekDays();
      
      [1, 2, 3, 4].forEach(agentId => {
        weekDays.forEach(day => {
          const randomService = services[Math.floor(Math.random() * services.length)];
          fakePlannings.push({
            agent_id: agentId,
            date: format(day, 'yyyy-MM-dd'),
            type_service: randomService
          });
        });
      });
      
      setPlannings(fakePlannings);
    } finally {
      setLoading(false);
    }
  };

  const getPlanningForAgentAndDay = (agentId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plannings.find(p => p.agent_id === agentId && p.date === dateStr);
  };

  const getServiceStyle = (service) => {
    if (!service) return serviceTypes['R'];
    
    // Chercher d'abord une correspondance exacte
    if (serviceTypes[service]) {
      return serviceTypes[service];
    }
    
    // Si c'est un nombre, chercher une correspondance partielle
    const serviceStr = service.toString();
    for (const [key, value] of Object.entries(serviceTypes)) {
      if (serviceStr.includes(key) || key.includes(serviceStr)) {
        return value;
      }
    }
    
    // Style par défaut
    return { label: service, color: 'bg-gray-100 text-gray-700', textColor: 'text-gray-700' };
  };

  const exportToPDF = () => {
    // TODO: Implémenter l'export PDF
    alert('Export PDF - À implémenter');
  };

  const weekDays = getWeekDays();

  if (!user?.role || (user.role !== 'agent' && user.role !== 'superviseur')) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">Seuls les agents et superviseurs peuvent consulter le planning collectif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* En-tête de la page */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ratp-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-ratp-blue" />
              Planning Collectif T8
            </h1>
            <p className="text-ratp-gray-600 mt-2">
              Vue d'ensemble des plannings de l'équipe
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadWeeklyPlanning}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-ratp-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Exporter PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="flex items-center space-x-2 px-4 py-2 text-ratp-gray-600 hover:text-ratp-gray-800 hover:bg-ratp-gray-50 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Semaine précédente</span>
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-ratp-gray-900">
              Semaine du {format(weekDays[0], 'dd MMMM', { locale: fr })} au {format(weekDays[6], 'dd MMMM yyyy', { locale: fr })}
            </h2>
            <p className="text-sm text-ratp-gray-500 mt-1">
              Semaine {format(currentWeek, 'w', { locale: fr })} de l'année {format(currentWeek, 'yyyy')}
            </p>
          </div>
          
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="flex items-center space-x-2 px-4 py-2 text-ratp-gray-600 hover:text-ratp-gray-800 hover:bg-ratp-gray-50 rounded-md transition-colors"
          >
            <span>Semaine suivante</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tableau du planning */}
      <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ratp-blue mx-auto mb-4"></div>
            <p className="text-ratp-gray-500">Chargement du planning collectif...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* En-tête du tableau */}
              <thead className="bg-ratp-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ratp-gray-700 uppercase tracking-wider border-r border-ratp-gray-300 min-w-32">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Agent
                    </div>
                  </th>
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <th
                        key={day.getTime()}
                        className={`px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider border-r border-ratp-gray-300 min-w-24 ${
                          isToday 
                            ? 'bg-ratp-blue text-white' 
                            : 'text-ratp-gray-700'
                        }`}
                      >
                        <div>{format(day, 'EEEE', { locale: fr })}</div>
                        <div className="text-xs font-normal mt-1">
                          {format(day, 'dd/MM')}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              {/* Corps du tableau */}
              <tbody className="bg-white divide-y divide-ratp-gray-200">
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-ratp-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-ratp-gray-300" />
                      Aucun agent trouvé
                    </td>
                  </tr>
                ) : (
                  agents.map((agent, agentIndex) => (
                    <tr key={agent.id} className={`hover:bg-ratp-gray-50 ${agentIndex % 2 === 0 ? 'bg-white' : 'bg-ratp-gray-25'}`}>
                      {/* Nom de l'agent */}
                      <td className="px-4 py-3 text-sm font-medium text-ratp-gray-900 border-r border-ratp-gray-300 bg-ratp-gray-50">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-ratp-blue flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-white">
                              {agent.full_name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium" title={agent.full_name}>
                              {agent.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Services pour chaque jour */}
                      {weekDays.map((day) => {
                        const planning = getPlanningForAgentAndDay(agent.id, day);
                        const service = planning?.type_service || 'R';
                        const serviceStyle = getServiceStyle(service);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <td
                            key={`${agent.id}-${day.getTime()}`}
                            className={`px-2 py-3 text-center border-r border-ratp-gray-300 ${
                              isToday ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div
                              className={`px-3 py-2 rounded-md text-sm font-semibold min-h-10 flex items-center justify-center cursor-pointer transition-all hover:shadow-md ${serviceStyle.color}`}
                              title={`${agent.full_name} - ${serviceStyle.label} - ${format(day, 'dd/MM/yyyy', { locale: fr })}`}
                            >
                              {service}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-4">
        <h3 className="text-lg font-semibold text-ratp-gray-900 mb-4">Légende des services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(serviceTypes).slice(0, 12).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded ${value.color} flex items-center justify-center text-xs font-bold`}>
                {key.length <= 3 ? key : key.substring(0, 3)}
              </div>
              <span className="text-sm text-ratp-gray-700">{value.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-ratp-gray-500">
          <p>• R = Repos • Services numériques = Lignes de bus • RT = Réserve transport • CCF = Formation</p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-ratp-blue mr-3" />
            <div>
              <p className="text-sm text-ratp-gray-600">Agents actifs</p>
              <p className="text-2xl font-bold text-ratp-gray-900">{agents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-ratp-gray-600">Services programmés</p>
              <p className="text-2xl font-bold text-ratp-gray-900">
                {plannings.filter(p => p.type_service !== 'R').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-ratp-gray-600">Jours de repos</p>
              <p className="text-2xl font-bold text-ratp-gray-900">
                {plannings.filter(p => p.type_service === 'R').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectivePlanning;