import api from './api';

class PlanningService {
  // Récupérer tous les plannings avec filtres
  async getPlannings(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.agent) params.append('agent', filters.agent);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (filters.type_service) params.append('type_service', filters.type_service);
      
      const response = await api.get(`/plannings/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des plannings');
    }
  }

  // Récupérer mes plannings (garde la méthode pour compatibilité future)
  async getMesPlannings(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      
      const response = await api.get(`/mes-plannings/?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Fallback : récupérer tous les plannings si l'endpoint ne marche pas
      console.warn('Endpoint /mes-plannings/ non disponible, utilisation de /plannings/');
      return await this.getPlannings(filters);
    }
  }

  // Récupérer un planning par ID
  async getPlanning(id) {
    try {
      const response = await api.get(`/plannings/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du planning');
    }
  }

  // Créer un nouveau planning
  async createPlanning(planningData) {
    try {
      const response = await api.post('/plannings/', planningData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.non_field_errors?.[0] ||
        'Erreur lors de la création du planning'
      );
    }
  }

  // Mettre à jour un planning
  async updatePlanning(id, planningData) {
    try {
      const response = await api.put(`/plannings/${id}/`, planningData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du planning');
    }
  }

  // Supprimer un planning
  async deletePlanning(id) {
    try {
      await api.delete(`/plannings/${id}/`);
      return true;
    } catch (error) {
      throw new Error('Erreur lors de la suppression du planning');
    }
  }

  // Récupérer le calendrier mensuel
  async getCalendrier(annee, mois) {
    try {
      const params = new URLSearchParams();
      if (annee) params.append('annee', annee);
      if (mois) params.append('mois', mois);
      
      const response = await api.get(`/planning/calendrier/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du calendrier');
    }
  }

  // Récupérer les statistiques
  async getStatistiques(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      
      const response = await api.get(`/planning/statistiques/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  // Récupérer les types de service disponibles
  getTypesService() {
    return [
      { value: 'matin', label: 'Service Matin' },
      { value: 'apres_midi', label: 'Service Après-midi' },
      { value: 'journee', label: 'Service Journée (8h45-16h30)' },
      { value: 'nuit', label: 'Service Nuit' },
      { value: 'repos', label: 'Repos' },
      { value: 'vacances', label: 'Vacances' },
      { value: 'jour_ferie_repos', label: 'Jour férié repos' },
    ];
  }

  // Récupérer les horaires par type de service
  getHorairesParType() {
    return {
      matin: { debut: '05:00', fin: '13:00' },
      apres_midi: { debut: '13:00', fin: '21:00' },
      journee: { debut: '08:45', fin: '16:30' },
      nuit: { debut: '21:00', fin: '05:00' },
      repos: { debut: null, fin: null },
      vacances: { debut: null, fin: null },
      jour_ferie_repos: { debut: null, fin: null },
    };
  }

  // Filtrer les plannings par utilisateur (côté client)
  filterPlanningsByUser(plannings, userId, userRole) {
    if (userRole === 'agent') {
      return plannings.filter(planning => planning.agent === userId);
    }
    // Admin et superviseur voient tout
    return plannings;
  }
}

export default new PlanningService();