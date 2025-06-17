import { useEffect, useState } from 'react';
import { Check, X, ClipboardList } from 'lucide-react';
import exchangesService from '../../services/exchangesService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Badge from '../common/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SuperviseurExchangeList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const data = await exchangesService.getDemandesATraiter();
      setDemandes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, action) => {
    try {
      await exchangesService.decisionSuperviseur(id, action);
      await fetchDemandes(); // rafraîchir après action
    } catch (err) {
      setError(err.message);
    }
  };

  const getBadge = (statut) => {
    const config = {
      accepte_agent: { variant: 'info', text: 'Accepté par l’agent' },
      valide_superviseur: { variant: 'success', text: 'Validé' },
      refuse_superviseur: { variant: 'error', text: 'Refusé' }
    };

    const { variant, text } = config[statut] || { variant: 'default', text: statut };
    return <Badge variant={variant}>{text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <ClipboardList className="w-6 h-6 text-ratp-blue" />
        <h2 className="text-xl font-semibold text-ratp-gray-800">Demandes à traiter</h2>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : demandes.length === 0 ? (
        <p className="text-ratp-gray-500 text-center">Aucune demande à traiter</p>
      ) : (
        <div className="space-y-4">
          {demandes.map((demande) => (
            <div key={demande.id} className="bg-white shadow p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Demande #{demande.id}</h3>
                {getBadge(demande.statut)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-ratp-gray-700">
                <div>
                  <strong>Demandeur :</strong> {demande.demandeur_details?.first_name} {demande.demandeur_details?.last_name}
                </div>
                <div>
                  <strong>Destinataire :</strong> {demande.destinataire_details?.first_name} {demande.destinataire_details?.last_name}
                </div>
                <div>
                  <strong>Créneau à échanger :</strong><br />
                  {format(new Date(demande.planning_demandeur_details.date), 'd MMMM yyyy', { locale: fr })} <br />
                  {demande.planning_demandeur_details.type_service} ({demande.planning_demandeur_details.heure_debut} - {demande.planning_demandeur_details.heure_fin})
                </div>
                <div>
                  <strong>Créneau souhaité :</strong><br />
                  {format(new Date(demande.planning_destinataire_details.date), 'd MMMM yyyy', { locale: fr })} <br />
                  {demande.planning_destinataire_details.type_service} ({demande.planning_destinataire_details.heure_debut} - {demande.planning_destinataire_details.heure_fin})
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleDecision(demande.id, 'valider')}
                >
                  <Check className="w-4 h-4 mr-1" /> Valider
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDecision(demande.id, 'refuser')}
                >
                  <X className="w-4 h-4 mr-1" /> Refuser
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperviseurExchangeList;
