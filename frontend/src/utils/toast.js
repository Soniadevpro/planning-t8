// src/utils/toast.js
let toastContainer = null;

export const showToast = (message, type = 'info', duration = 3000) => {
  // Créer le container si il n'existe pas
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }

  // Créer le toast
  const toast = document.createElement('div');
  toast.className = `
    max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto 
    ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out
    ${type === 'success' ? 'border-l-4 border-green-400' : ''}
    ${type === 'error' ? 'border-l-4 border-red-400' : ''}
    ${type === 'warning' ? 'border-l-4 border-yellow-400' : ''}
    ${type === 'info' ? 'border-l-4 border-blue-400' : ''}
  `;

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="${iconColors[type]} text-xl font-bold">${icons[type]}</span>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="toast-close bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
            <span class="sr-only">Fermer</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Ajouter l'événement de fermeture
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    removeToast(toast);
  });

  toastContainer.appendChild(toast);

  // Auto-remove après la durée spécifiée
  setTimeout(() => {
    removeToast(toast);
  }, duration);
};

const removeToast = (toast) => {
  toast.style.transform = 'translateX(full)';
  toast.style.opacity = '0';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
};