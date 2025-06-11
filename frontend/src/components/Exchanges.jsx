import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import CreateExchangeModal from './CreateExchangeModal'
import exchangesService from '../services/exchanges'
import serviceTypesHelper from '../utils/serviceTypesHelper'
import "../styles/exchanges.css"
const Exchanges = () => {
  const { user, isAdmin, isSuperviseur } = useAuth()
  
  // États du composant
  const [activeTab, setActiveTab] = useState('received')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Données des échanges
  const [demandesRecues, setDemandesRecues] = useState([])
  const [demandesEnvoyees, setDemandesEnvoyees] = useState([])
  const [demandesATraiter, setDemandesATraiter] = useState([])
  
  // Modal de création
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Charger les demandes selon le rôle et l'onglet
  const loadDemandes = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Charger selon le rôle
      if (isAdmin() || isSuperviseur()) {
        const demandesATraiterData = await exchangesService.getDemandesATraiter()
        setDemandesATraiter(demandesATraiterData)
      }
      
      // Pour tous : demandes reçues et envoyées
      const [recues, envoyees] = await Promise.all([
        exchangesService.getMesDemandesRecues(),
        exchangesService.getMesDemandesEnvoyees()
      ])
      
      setDemandesRecues(recues)
      setDemandesEnvoyees(envoyees)
      
    } catch (err) {
      setError('Erreur lors du chargement des demandes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Charger les données au montage
  useEffect(() => {
    loadDemandes()
  }, [])

  // Répondre à une demande (accepter/refuser)
  const handleRepondre = async (demandeId, action, commentaire = '') => {
    try {
      await exchangesService.repondreDemande(demandeId, action, commentaire)
      await loadDemandes() // Recharger les données
    } catch (err) {
      alert(`Erreur : ${err.message}`)
    }
  }

  // Décision superviseur
  const handleDecisionSuperviseur = async (demandeId, action, commentaire = '') => {
    try {
      await exchangesService.decisionSuperviseur(demandeId, action, commentaire)
      await loadDemandes() // Recharger les données
    } catch (err) {
      alert(`Erreur : ${err.message}`)
    }
  }

  // Formater une date
  const formatDate = (dateStr) => {
    return format(parseISO(dateStr), 'EEEE d MMMM', { locale: fr })
  }

  // Obtenir les informations d'un service
  const getServiceInfo = (typeService) => {
    return serviceTypesHelper.getServiceInfo(typeService)
  }

  // Obtenir les données à afficher selon l'onglet
  const getCurrentData = () => {
    switch (activeTab) {
      case 'received':
        return demandesRecues
      case 'sent':
        return demandesEnvoyees
      case 'supervisor':
        return demandesATraiter
      default:
        return []
    }
  }

  const currentData = getCurrentData()

  // Composant carte de demande moderne
  const DemandeCard = ({ demande }) => {
    const isDemandeur = demande.demandeur === user.id
    const isDestinataire = demande.destinataire === user.id
    const isSuperviseurCard = isAdmin() || isSuperviseur()
    
    const serviceDemandeur = getServiceInfo(demande.type_service_demandeur)
    const serviceDestinataire = getServiceInfo(demande.type_service_destinataire)
    
    const statutColor = exchangesService.getStatutColor(demande.statut)
    const statutLabel = exchangesService.getStatutLabel(demande.statut)

    return (
      <div className="exchange-card">
        {/* En-tête avec statut */}
        <div className="exchange-header">
          <div className="exchange-user">
            <div className="user-avatar">
              <span>
                {isDemandeur ? demande.destinataire_name?.charAt(0) : demande.demandeur_name?.charAt(0)}
              </span>
            </div>
            <div>
              <h3>
                {isDemandeur ? demande.destinataire_name : demande.demandeur_name}
              </h3>
              <p>
                {format(parseISO(demande.created_at), 'dd/MM/yyyy à HH:mm')}
              </p>
            </div>
          </div>
          
          <span 
            className="status-badge"
            style={{ backgroundColor: `${statutColor}15`, color: statutColor }}
          >
            {statutLabel}
          </span>
        </div>

        {/* Contenu de l'échange */}
        <div className="exchange-content">
          <div className="exchange-details">
            {/* Créneau proposé */}
            <div className="exchange-slot">
              <div className="slot-label">
                {isDemandeur ? 'Je propose' : 'Propose'}
              </div>
              <div className="slot-date">
                {formatDate(demande.date_demandeur)}
              </div>
              <div className="slot-service">
                <span className="service-icon">{serviceDemandeur.icon}</span>
                <span className="service-name">{serviceDemandeur.label}</span>
                {serviceDemandeur.horaires && (
                  <span className="service-hours">{serviceDemandeur.horaires}</span>
                )}
              </div>
            </div>

            {/* Flèche d'échange */}
            <div className="exchange-arrow">
              <i className="fas fa-exchange-alt"></i>
            </div>

            {/* Créneau souhaité */}
            <div className="exchange-slot">
              <div className="slot-label">
                {isDemandeur ? 'Je veux' : 'Veut'}
              </div>
              <div className="slot-date">
                {formatDate(demande.date_destinataire)}
              </div>
              <div className="slot-service">
                <span className="service-icon">{serviceDestinataire.icon}</span>
                <span className="service-name">{serviceDestinataire.label}</span>
                {serviceDestinataire.horaires && (
                  <span className="service-hours">{serviceDestinataire.horaires}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="exchange-actions">
            {/* Actions pour le destinataire */}
            {isDestinataire && demande.peut_etre_accepte_par_agent && (
              <>
                <button
                  onClick={() => handleRepondre(demande.id, 'refuse')}
                  className="btn btn-danger"
                >
                  Refuser
                </button>
                <button
                  onClick={() => handleRepondre(demande.id, 'accept')}
                  className="btn btn-success"
                >
                  Accepter
                </button>
              </>
            )}

            {/* Actions pour le superviseur */}
            {isSuperviseurCard && demande.peut_etre_valide_par_superviseur && (
              <>
                <button
                  onClick={() => handleDecisionSuperviseur(demande.id, 'refuse')}
                  className="btn btn-danger"
                >
                  Refuser
                </button>
                <button
                  onClick={() => handleDecisionSuperviseur(demande.id, 'validate')}
                  className="btn btn-success"
                >
                  Valider
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="exchanges-container">
      <div className="exchanges-content">
        {/* En-tête avec onglets */}
        <div className="exchanges-header">
          <div className="tabs">
            <button 
              onClick={() => setActiveTab('received')}
              className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            >
              Reçues ({demandesRecues.length})
            </button>
            
            <button 
              onClick={() => setActiveTab('sent')}
              className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            >
              Envoyées ({demandesEnvoyees.length})
            </button>

            {(isAdmin() || isSuperviseur()) && (
              <button 
                onClick={() => setActiveTab('supervisor')}
                className={`tab ${activeTab === 'supervisor' ? 'active' : ''}`}
              >
                À valider ({demandesATraiter.length})
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            Nouvelle demande
          </button>
        </div>

        {/* Contenu principal */}
        <div className="exchanges-main">
          {loading ? (
            <div className="loading-center">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <div>Une erreur est survenue</div>
              <div>{error}</div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <h3>Aucune demande</h3>
              <p>
                {activeTab === 'received' && "Vous n'avez pas reçu de demandes d'échange."}
                {activeTab === 'sent' && "Vous n'avez pas encore envoyé de demandes."}
                {activeTab === 'supervisor' && "Aucune demande en attente de validation."}
              </p>
              {activeTab !== 'supervisor' && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Créer une demande
                </button>
              )}
            </div>
          ) : (
            <div className="exchanges-list">
              {currentData.map(demande => (
                <DemandeCard key={demande.id} demande={demande} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création */}
      <CreateExchangeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadDemandes}
      />
    </div>
  )
}

export default Exchanges