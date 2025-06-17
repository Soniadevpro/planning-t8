// src/components/supervisor/SupervisorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, RefreshCw, Users, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import exchangesService from '../../services/exchangesService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { showToast } from '../../utils/toast';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [demandesATraiter, setDemandesATraiter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);

  useEffect(() => {
    // Correction : utiliser user?.role === 'superviseur'
    if (user?.role === 'superviseur') {
      loadDemandesATraiter();
    }
  }, [user]);

  const loadDemandesATraiter = async () => {
    try {
      setLoading(true);
      
      // Données factices réalistes pour démonstration
      const fakeData = [
        {
          id: 1,
          demandeur_name: 'Sonia Devpro',
          destinataire_name: 'Jean Dupont',
          date_demandeur: '2025-06-20',
          date_destinataire: '2025-06-22',
          type_service_demandeur: 'Service Matin (750)',
          type_service_destinataire: 'Service Après-midi (700)',
          statut: 'accepte_agent',
          created_at: '2025-06-16T10:30:00Z',
          message_demandeur: 'Besoin d\'échanger pour raisons personnelles'
        },
        {
          id: 2,
          demandeur_name: 'Paul Martin',
          destinataire_name: 'Marie Claire',
          date_demandeur: '2025-06-25',
          date_destinataire: '2025-06-27',
          type_service_demandeur: 'Service Nuit (661)',
          type_service_destinataire: 'Service Matin (31)',
          statut: 'accepte_agent',
          created_at: '2025-06-15T14:15:00Z',
          message_demandeur: 'Échange pour formation médicale'
        }
      ];

      // Tentative d'appel API réel
      try {
        const data = await exchangesService.getDemandesATraiter();
        setDemandesATraiter(data.filter(d => d.statut === 'accepte_agent'));
      } catch (error) {
        console.log('API non disponible, utilisation des données factices');
        setDemandesATraiter(fakeData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('Erreur lors du chargement des demandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (demande, action) => {
    setShowConfirmModal({ demande, action });
  };

  const confirmDecision = async (commentaire) => {
    const { demande, action } = showConfirmModal;
    
    try {
    setProcessingId(demande.id);
    
    const response = await exchangesService.decisionSuperviseur(demande.id, action, commentaire);
    
    // Message plus détaillé
    const message = response.echange_effectue 
      ? `✅ Échange validé ! ${demande.demandeur_name} et ${demande.destinataire_name} ont échangé leurs créneaux.`
      : `❌ Demande ${action === 'valider' ? 'validée' : 'refusée'}`;
    
    showToast(message, action === 'valider' ? 'success' : 'warning');
    
    // Retirer la demande de la liste après traitement
    setDemandesATraiter(prev => prev.filter(d => d.id !== demande.id));
    
  } catch (error) {
    console.error('Erreur lors de la décision:', error);
    showToast(error.message || 'Erreur lors de la décision', 'error');
  } finally {
    setProcessingId(null);
    setShowConfirmModal(null);
  }
  };

  // Vérification du rôle corrigée
  if (!user?.role || user.role !== 'superviseur') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">Cette page est réservée aux superviseurs.</p>
          <p className="text-sm text-gray-500 mt-2">Votre rôle actuel : {user?.role || 'Non défini'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ratp-gray-900 flex items-center">
              <CheckCircle className="h-8 w-8 mr-3 text-ratp-blue" />
              Validation des Échanges
            </h1>
            <p className="text-ratp-gray-600 mt-2">
              Validation des demandes d'échange acceptées par les agents
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-ratp-blue" />
              <span className="text-sm font-medium text-ratp-gray-700">
                {demandesATraiter.length} demande(s) en attente
              </span>
            </div>
            
            <button
              onClick={loadDemandesATraiter}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-ratp-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ratp-blue mb-4"></div>
          <p className="text-ratp-gray-500">Chargement des demandes...</p>
        </div>
      ) : demandesATraiter.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ratp-gray-900 mb-2">
              Aucune demande en attente
            </h2>
            <p className="text-ratp-gray-500">
              Toutes les demandes d'échange ont été traitées
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {demandesATraiter.map((demande) => (
            <div key={demande.id} className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 overflow-hidden">
              {/* En-tête de la carte */}
              <div className="bg-ratp-gray-50 px-6 py-4 border-b border-ratp-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-ratp-blue" />
                    <h3 className="text-lg font-semibold text-ratp-gray-900">
                      Échange : {demande.demandeur_name} ↔ {demande.destinataire_name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      ✓ Accepté par l'agent
                    </span>
                    <span className="text-sm text-ratp-gray-500">
                      ID #{demande.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Corps de la carte */}
              <div className="p-6">
                {/* Détails de l'échange */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Créneau proposé */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <h4 className="text-sm font-semibold text-red-800">Créneau à céder</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-red-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {format(new Date(demande.date_demandeur), 'EEEE d MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="text-red-600 font-medium">
                        {demande.type_service_demandeur}
                      </div>
                      <div className="text-xs text-red-500">
                        Proposé par : <strong>{demande.demandeur_name}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Créneau souhaité */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <h4 className="text-sm font-semibold text-green-800">Créneau souhaité</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-green-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {format(new Date(demande.date_destinataire), 'EEEE d MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="text-green-600 font-medium">
                        {demande.type_service_destinataire}
                      </div>
                      <div className="text-xs text-green-500">
                        Appartenant à : <strong>{demande.destinataire_name}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="bg-ratp-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-ratp-gray-600">
                    <div>
                      <strong>Demande créée le :</strong><br />
                      {format(new Date(demande.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                    {demande.message_demandeur && (
                      <div>
                        <strong>Message :</strong><br />
                        <em>"{demande.message_demandeur}"</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDecision(demande, 'valider')}
                    disabled={processingId === demande.id}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      {processingId === demande.id ? 'Validation en cours...' : 'Valider l\'échange'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleDecision(demande, 'refuser')}
                    disabled={processingId === demande.id}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>
                      {processingId === demande.id ? 'Refus en cours...' : 'Refuser l\'échange'}
                    </span>
                  </button>
                  
                  <button
                    className="flex items-center space-x-2 px-4 py-3 bg-ratp-gray-100 text-ratp-gray-700 rounded-lg hover:bg-ratp-gray-200 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Voir détails</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <ConfirmationModal
          demande={showConfirmModal.demande}
          action={showConfirmModal.action}
          onConfirm={confirmDecision}
          onCancel={() => setShowConfirmModal(null)}
        />
      )}
    </div>
  );
};

// Composant Modal de confirmation
const ConfirmationModal = ({ demande, action, onConfirm, onCancel }) => {
  const [commentaire, setCommentaire] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(commentaire);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-ratp-gray-900 mb-4">
            {action === 'valider' ? 'Valider l\'échange' : 'Refuser l\'échange'}
          </h3>
          
          <div className="mb-4 p-3 bg-ratp-gray-50 rounded-lg">
            <p className="text-sm text-ratp-gray-600">
              <strong>Échange :</strong> {demande.demandeur_name} ↔ {demande.destinataire_name}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-ratp-gray-700 mb-2">
                Commentaire {action === 'refuser' ? '(obligatoire)' : '(optionnel)'}
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="w-full px-3 py-2 border border-ratp-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ratp-blue"
                rows="3"
                placeholder={action === 'valider' ? 'Validation approuvée...' : 'Motif du refus...'}
                required={action === 'refuser'}
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                  action === 'valider' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {action === 'valider' ? 'Confirmer la validation' : 'Confirmer le refus'}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-ratp-gray-200 text-ratp-gray-700 rounded-md hover:bg-ratp-gray-300 font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
