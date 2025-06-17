import { useState, useEffect } from 'react';
import { Plus, Send, Inbox } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import NewExchangeModal from '../components/exchanges/NewExchangeModal';
import exchangesService from '../services/exchangesService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Exchanges = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recues');
  const [exchanges, setExchanges] = useState({ recues: [], envoyees: [] });
  const [showNewExchangeForm, setShowNewExchangeForm] = useState(false);

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      setError('');

      const [recues, envoyees] = await Promise.all([
        exchangesService.getMesDemandesRecues().catch(() => []),
        exchangesService.getMesDemandesEnvoyees().catch(() => [])
      ]);

      setExchanges({ recues, envoyees });
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (demandeId, action) => {
    try {
      await exchangesService.repondreDemande(demandeId, action);
      await loadExchanges();
    } catch (err) {
      setError(err.message || 'Erreur lors de la réponse');
    }
  };

  const getStatutBadge = (statut) => {
    const config = {
      'en_attente': { variant: 'warning', text: 'En attente' },
      'accepte_agent': { variant: 'info', text: 'Accepté' },
      'refuse_agent': { variant: 'error', text: 'Refusé' },
      'valide_superviseur': { variant: 'success', text: 'Validé' },
      'refuse_superviseur': { variant: 'error', text: 'Refusé par superviseur' },
      'annule': { variant: 'default', text: 'Annulé' }
    };

    const { variant, text } = config[statut] || { variant: 'default', text: statut };
    return <Badge variant={variant}>{text}</Badge>;
  };

  const renderExchangesList = (exchangesList, isReceived = false) => {
    if (exchangesList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-ratp-gray-400 mb-4">
            {isReceived ? <Inbox className="h-12 w-12 mx-auto" /> : <Send className="h-12 w-12 mx-auto" />}
          </div>
          <p className="text-ratp-gray-500">
            {isReceived ? 'Aucune demande reçue' : 'Aucune demande envoyée'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {exchangesList.map((exchange) => (
          <div key={exchange.id} className="bg-white border border-ratp-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-medium text-ratp-gray-900">
                    Échange de créneaux
                  </h3>
                  {getStatutBadge(exchange.statut)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Créneau à échanger</h4>
                    <p className="text-sm text-red-700">
                      {exchange.date_demandeur ? format(new Date(exchange.date_demandeur), 'EEEE d MMMM yyyy', { locale: fr }) : 'Date non définie'}
                    </p>
                    <p className="text-sm text-red-600">
                      {exchange.type_service_demandeur}
                    </p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-green-800 mb-1">Créneau souhaité</h4>
                    <p className="text-sm text-green-700">
                      {exchange.date_destinataire ? format(new Date(exchange.date_destinataire), 'EEEE d MMMM yyyy', { locale: fr }) : 'Date non définie'}
                    </p>
                    <p className="text-sm text-green-600">
                      {exchange.type_service_destinataire}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-ratp-gray-500">
                  <div>
                    {isReceived ? (
                      <span>Demandé par {exchange.demandeur_name}</span>
                    ) : (
                      <span>Demandé à {exchange.destinataire_name}</span>
                    )}
                  </div>
                  <div>
                   {exchange.created_at ? format(new Date(exchange.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr }) : 'Date non définie'}
                  </div>
                </div>
              </div>
            </div>

            {isReceived && exchange.statut === 'en_attente' && (
              <div className="mt-4 flex space-x-3">
                <Button variant="success" size="sm" onClick={() => handleResponse(exchange.id, 'accepter')}>
                  Accepter
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleResponse(exchange.id, 'refuser')}>
                  Refuser
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ratp-gray-900">Échanges de créneaux</h1>
          <p className="text-ratp-gray-600">Gérez vos demandes d'échange avec vos collègues</p>
        </div>

        <Button
          onClick={() => user && setShowNewExchangeForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle demande</span>
        </Button>
      </div>

      <ErrorMessage message={error} />

      {/* Onglets */}
      <div className="border-b border-ratp-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('recues')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recues'
                ? 'border-ratp-blue text-ratp-blue'
                : 'border-transparent text-ratp-gray-500 hover:text-ratp-gray-700 hover:border-ratp-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Inbox className="h-4 w-4" />
              <span>Demandes reçues</span>
              {exchanges.recues.filter(e => e.statut === 'en_attente').length > 0 && (
                <Badge variant="error" size="sm">
                  {exchanges.recues.filter(e => e.statut === 'en_attente').length}
                </Badge>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('envoyees')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'envoyees'
                ? 'border-ratp-blue text-ratp-blue'
                : 'border-transparent text-ratp-gray-500 hover:text-ratp-gray-700 hover:border-ratp-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Demandes envoyées</span>
              {exchanges.envoyees.filter(e => e.statut === 'en_attente').length > 0 && (
                <Badge variant="warning" size="sm">
                  {exchanges.envoyees.filter(e => e.statut === 'en_attente').length}
                </Badge>
              )}
            </div>
          </button>
        </nav>
      </div>

      <div className="min-h-96">
        {activeTab === 'recues' && renderExchangesList(exchanges.recues, true)}
        {activeTab === 'envoyees' && renderExchangesList(exchanges.envoyees, false)}
      </div>

      {showNewExchangeForm && user && (
        <NewExchangeModal
          show={showNewExchangeForm}
          currentUserId={user.id}
          onClose={() => setShowNewExchangeForm(false)}
          onExchangeCreated={loadExchanges}
        />
      )}
    </div>
  );
};

export default Exchanges;

