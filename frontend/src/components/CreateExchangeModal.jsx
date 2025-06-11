import React, { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import api from '../services/api'
import serviceTypesHelper from '../utils/serviceTypesHelper'

const CreateExchangeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    destinataire: '',
    dateDemandeur: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    typeServiceDemandeur: 'matin',
    dateDestinataire: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    typeServiceDestinataire: 'apres_midi',
    commentaire: ''
  })
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAgents()
    }
  }, [isOpen])

  const loadAgents = async () => {
    try {
      const response = await api.get('/users/')
      setAgents(response.data.filter(agent => agent.role !== 'admin'))
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulation de création de demande
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess()
      onClose()
    } catch (error) {
      alert('Erreur lors de la création de la demande')
    } finally {
      setLoading(false)
    }
  }

  const serviceTypes = ['matin', 'apres_midi', 'journee', 'nuit', 'repos']

  if (!isOpen) return null

  return (
    <div className="modal-overlay active">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Nouvelle demande d'échange</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Agent destinataire</label>
              <select
                value={formData.destinataire}
                onChange={(e) => setFormData({...formData, destinataire: e.target.value})}
                className="input"
                required
              >
                <option value="">Sélectionner un agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.first_name} {agent.last_name} ({agent.matricule})
                  </option>
                ))}
              </select>
            </div>

            <div className="exchange-section">
              <h4>Je propose</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={formData.dateDemandeur}
                    onChange={(e) => setFormData({...formData, dateDemandeur: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Service</label>
                  <select
                    value={formData.typeServiceDemandeur}
                    onChange={(e) => setFormData({...formData, typeServiceDemandeur: e.target.value})}
                    className="input"
                    required
                  >
                    {serviceTypes.map(type => {
                      const serviceInfo = serviceTypesHelper.getServiceInfo(type)
                      return (
                        <option key={type} value={type}>
                          {serviceInfo.icon} {serviceInfo.label}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="exchange-section">
              <h4>Je veux</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={formData.dateDestinataire}
                    onChange={(e) => setFormData({...formData, dateDestinataire: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Service</label>
                  <select
                    value={formData.typeServiceDestinataire}
                    onChange={(e) => setFormData({...formData, typeServiceDestinataire: e.target.value})}
                    className="input"
                    required
                  >
                    {serviceTypes.map(type => {
                      const serviceInfo = serviceTypesHelper.getServiceInfo(type)
                      return (
                        <option key={type} value={type}>
                          {serviceInfo.icon} {serviceInfo.label}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Commentaire (optionnel)</label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                className="input"
                rows="3"
                placeholder="Ajoutez un commentaire pour expliquer votre demande..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Création...
                </>
              ) : (
                'Créer la demande'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateExchangeModal