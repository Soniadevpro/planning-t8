import React, { useState, useRef } from 'react';

const ProfilePhoto = ({ user, onPhotoChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const getInitials = () => {
    if (!user) return '?';
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (selectedFile && onPhotoChange) {
      onPhotoChange(selectedFile, previewUrl);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="user-photo-container">
        <div className="user-photo">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.first_name || user.username} />
          ) : (
            getInitials()
          )}
        </div>
        <button 
          className="photo-edit-btn" 
          title="Modifier la photo"
          onClick={handleOpenModal}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {showModal && (
        <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Modifier votre photo de profil</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div 
                className="upload-area"
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p className="upload-text">
                  Cliquez ou glissez-déposez une photo ici
                </p>
                <p className="upload-hint">
                  Formats acceptés : JPG, PNG. Taille max : 5 MB
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  style={{ display: 'none' }}
                />
              </div>

              {previewUrl && (
                <div className="preview-container">
                  <img 
                    src={previewUrl} 
                    alt="Aperçu" 
                    className="photo-preview"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCloseModal}>
                Annuler
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSavePhoto}
                disabled={!selectedFile}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePhoto;