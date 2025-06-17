import api from './api';

class ExchangesService {
  // Récupérer toutes les demandes d'échange
  async getEchanges(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.statut) params.append('statut', filters.statut);
      
      const response = await api.get(`/echanges/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des échanges');
    }
  }

  // Récupérer une demande d'échange par ID
  async getEchange(id) {
    try {
      const response = await api.get(`/echanges/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'échange');
    }
  }

  // Créer une nouvelle demande d'échange
  async createEchange(echangeData) {
    try {
      const response = await api.post('/echanges/', echangeData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.planning_demandeur?.[0] ||
        error.response?.data?.planning_destinataire?.[0] ||
        'Erreur lors de la création de la demande d\'échange'
      );
    }
  }

  // Récupérer mes demandes envoyées
  async getMesDemandesEnvoyees() {
    try {
      const response = await api.get('/mes-demandes/envoyees/');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des demandes envoyées');
    }
  }

  // Récupérer mes demandes reçues
  async getMesDemandesRecues() {
    try {
      const response = await api.get('/mes-demandes/recues/');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des demandes reçues');
    }
  }

  // Répondre à une demande (accepter/refuser) - pour les agents
  async repondreDemande(demandeId, action, commentaire = '') {
    try {
      const response = await api.post(`/echanges/${demandeId}/repondre/`, {
        action,
        commentaire,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Erreur lors de la réponse à la demande'
      );
    }
  }

  // Décision superviseur (valider/refuser)
 async decisionSuperviseur(demandeId, action, commentaire = '') {
  try {
    const response = await api.post(`/echanges/${demandeId}/decision/`, {
      action,
      commentaire,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      'Erreur lors de la décision du superviseur'
    );
  }
}

  // Récupérer les demandes à traiter (selon le rôle)
  async getDemandesATraiter() {
    try {
      const response = await api.get('/demandes-a-traiter/');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des demandes à traiter');
    }
  }

  // Récupérer les statistiques des échanges
  async getStatistiques(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      
      const response = await api.get(`/echanges/statistiques/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  // Récupérer les statuts disponibles
  getStatuts() {
    return [
      { value: 'en_attente', label: 'En attente de réponse', color: '#ffc107' },
      { value: 'accepte_agent', label: 'Accepté par l\'agent', color: '#17a2b8' },
      { value: 'refuse_agent', label: 'Refusé par l\'agent', color: '#dc3545' },
      { value: 'valide_superviseur', label: 'Validé par le superviseur', color: '#28a745' },
      { value: 'refuse_superviseur', label: 'Refusé par le superviseur', color: '#dc3545' },
      { value: 'annule', label: 'Annulé', color: '#6c757d' },
    ];
  }

  // Obtenir la couleur d'un statut
  getStatutColor(statut) {
    const statuts = this.getStatuts();
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj?.color || '#6c757d';
  }

  // Obtenir le libellé d'un statut
  getStatutLabel(statut) {
    const statuts = this.getStatuts();
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj?.label || statut;
  }

  // Vérifier si une demande peut être acceptée par un agent
  peutEtreAccepteeParAgent(demande) {
    return demande.statut === 'en_attente';
  }

  // Vérifier si une demande peut être validée par un superviseur
  peutEtreValideeParSuperviseur(demande) {
    return demande.statut === 'accepte_agent';
  }
}

export default new ExchangesService();