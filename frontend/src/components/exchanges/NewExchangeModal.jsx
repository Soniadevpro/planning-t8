// NewExchangeModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // CHANGEMENT : import api au lieu d'axios
import { showToast } from '../../utils/toast'
const NewExchangeModal = ({ show, onClose, currentUserId, onExchangeCreated }) => {
  const [agents, setAgents] = useState([]);
  const [planningDemandeur, setPlanningDemandeur] = useState('');
  const [planningDestinataire, setPlanningDestinataire] = useState('');
  const [destinataire, setDestinataire] = useState('');
  const [messageDemandeur, setMessageDemandeur] = useState('');
  const [plannings, setPlannings] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      fetchAgents();
      fetchPlannings(currentUserId);
    }
  }, [show]);

  useEffect(() => {
    if (destinataire) {
      fetchPlannings(destinataire);
    }
  }, [destinataire]);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents/'); // CHANGEMENT : api.get au lieu d'axios.get + pas de /api/ car c'est dans baseURL
      if (Array.isArray(res.data)) {
        setAgents(res.data);
      } else {
        console.error("La réponse de /api/agents/ n'est pas un tableau :", res.data);
        setError("Erreur : réponse inattendue du serveur.");
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des agents', err);
      setError('Impossible de charger les agents.');
    }
  };

  const fetchPlannings = async (agentId) => {
    try {
      const res = await api.get(`/plannings/?agent=${agentId}`); // CHANGEMENT : api.get au lieu d'axios.get + pas de /api/
      setPlannings(prev => ({
        ...prev,
        [agentId]: res.data
      }));
    } catch (err) {
      console.error('Erreur lors de la récupération des plannings', err);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    planning_demandeur: planningDemandeur,
    planning_destinataire: planningDestinataire,
    message_demandeur: messageDemandeur,
    destinataire: destinataire,
  };

  try {
    const res = await api.post('/echanges/', data);
    
    // Toast de succès
    showToast('Demande d\'échange créée avec succès !', 'success');
    
    onExchangeCreated(res.data);
    onClose();
  } catch (err) {
    console.error("Erreur lors de la création de la demande d\'échange", err.response?.data || err.message);
    
    // Toast d'erreur
    showToast('Erreur lors de la création de la demande d\'échange', 'error');
    setError('Erreur lors de la création de la demande d\'échange');
  }
};

  // Rest of your component remains exactly the same...
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Nouvelle demande d'échange</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Destinataire</label>
            <select
              value={destinataire}
              onChange={(e) => {
                setDestinataire(e.target.value);
                setPlanningDestinataire('');
              }}
              className="w-full border p-2"
            >
              <option value="">Sélectionner un agent</option>
              {Array.isArray(agents) && agents
                .filter(agent => agent.id !== currentUserId)
                .map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name || `${agent.first_name} ${agent.last_name}`}
                  </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Votre planning</label>
            <select
              value={planningDemandeur}
              onChange={(e) => setPlanningDemandeur(e.target.value)}
              className="w-full border p-2"
            >
              <option value="">Choisir un créneau</option>
              {(plannings[currentUserId] || []).map(p => (
                <option key={p.id} value={p.id}>
                  {p.date} - {p.type_service}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Planning du destinataire</label>
            <select
              value={planningDestinataire}
              onChange={(e) => setPlanningDestinataire(e.target.value)}
              className="w-full border p-2"
            >
              <option value="">Choisir un créneau</option>
              {(plannings[destinataire] || []).map(p => (
                <option key={p.id} value={p.id}>
                  {p.date} - {p.type_service}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Message</label>
            <textarea
              value={messageDemandeur}
              onChange={(e) => setMessageDemandeur(e.target.value)}
              className="w-full border p-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-400 text-white rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExchangeModal;






