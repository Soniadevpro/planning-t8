import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/messaging.css';

const Messaging = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Données simulées pour les conversations
  const conversations = [
    {
      id: 1,
      name: "Jean Dupont",
      lastMessage: "D'accord pour l'échange de service",
      timestamp: "10:30",
      unread: true
    },
    {
      id: 2,
      name: "Marie Martin",
      lastMessage: "Je confirme ma disponibilité",
      timestamp: "09:15",
      unread: false
    }
  ];

  // Données simulées pour les messages
  const messages = [
    {
      id: 1,
      sender: "Jean Dupont",
      content: "Bonjour, es-tu disponible pour un échange le 15 mai ?",
      timestamp: "10:25",
      type: "received"
    },
    {
      id: 2,
      sender: user?.username,
      content: "Oui, ça me convient parfaitement !",
      timestamp: "10:28",
      type: "sent"
    },
    {
      id: 3,
      sender: "Jean Dupont",
      content: "D'accord pour l'échange de service",
      timestamp: "10:30",
      type: "received"
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Logique d'envoi de message à implémenter
    console.log('Message à envoyer:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="messaging-container">
      {/* Header */}
      <header className="messaging-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="far fa-comments"></i>
              <span>Messagerie</span>
            </h1>
            <p>Communiquez avec vos collègues</p>
          </div>
          
          <nav className="header-nav">
            <button 
              className="nav-btn"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            <button 
              className="nav-btn"
              onClick={() => navigate('/planning')}
            >
              <i className="far fa-calendar-alt"></i>
              Planning
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          </nav>
        </div>
      </header>

      <div className="messaging-layout">
        {/* Liste des conversations */}
        <div className="conversations-list">
          <div className="conversations-header">
            <h2 className="conversations-title">Conversations</h2>
            <button className="new-message-btn">
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <div className="conversations-search">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher une conversation..."
            />
          </div>

          <div className="conversations-items">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv.id)}
              >
                <div className="conversation-avatar">
                  {conv.name.charAt(0)}
                </div>
                <div className="conversation-content">
                  <div className="conversation-name">{conv.name}</div>
                  <div className="conversation-preview">{conv.lastMessage}</div>
                </div>
                <div className="conversation-meta">
                  {conv.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-status"></div>
                <h3 className="chat-title">
                  {conversations.find(c => c.id === selectedConversation)?.name}
                </h3>
              </div>

              <div className="chat-messages">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.type}`}>
                    {message.content}
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                ))}
              </div>

              <form className="chat-input" onSubmit={handleSendMessage}>
                <textarea
                  className="message-input"
                  placeholder="Écrivez votre message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  rows="1"
                ></textarea>
                <button type="submit" className="send-btn">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--ratp-text-light)',
              fontSize: '1.1rem'
            }}>
              Sélectionnez une conversation pour commencer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;