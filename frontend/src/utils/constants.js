// URLs de l'API
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISEUR: 'superviseur', 
  AGENT: 'agent',
};

// Labels des rôles
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrateur',
  [USER_ROLES.SUPERVISEUR]: 'Superviseur',
  [USER_ROLES.AGENT]: 'Agent',
};

// Types de service
export const SERVICE_TYPES = {
  MATIN: 'matin',
  APRES_MIDI: 'apres_midi',
  JOURNEE: 'journee',
  NUIT: 'nuit',
  REPOS: 'repos',
  VACANCES: 'vacances',
  JOUR_FERIE_REPOS: 'jour_ferie_repos',
};

// Labels des types de service
export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.MATIN]: 'Service Matin',
  [SERVICE_TYPES.APRES_MIDI]: 'Service Après-midi',
  [SERVICE_TYPES.JOURNEE]: 'Service Journée (8h45-16h30)',
  [SERVICE_TYPES.NUIT]: 'Service Nuit',
  [SERVICE_TYPES.REPOS]: 'Repos',
  [SERVICE_TYPES.VACANCES]: 'Vacances',
  [SERVICE_TYPES.JOUR_FERIE_REPOS]: 'Jour férié repos',
};

// Couleurs des types de service
export const SERVICE_TYPE_COLORS = {
  [SERVICE_TYPES.MATIN]: '#e3f2fd',
  [SERVICE_TYPES.APRES_MIDI]: '#fff3e0',
  [SERVICE_TYPES.JOURNEE]: '#e8f5e8',
  [SERVICE_TYPES.NUIT]: '#f3e5f5',
  [SERVICE_TYPES.REPOS]: '#f5f5f5',
  [SERVICE_TYPES.VACANCES]: '#fff8e1',
  [SERVICE_TYPES.JOUR_FERIE_REPOS]: '#fce4ec',
};

// Statuts des demandes d'échange
export const EXCHANGE_STATUS = {
  EN_ATTENTE: 'en_attente',
  ACCEPTE_AGENT: 'accepte_agent',
  REFUSE_AGENT: 'refuse_agent',
  VALIDE_SUPERVISEUR: 'valide_superviseur',
  REFUSE_SUPERVISEUR: 'refuse_superviseur',
  ANNULE: 'annule',
};

// Labels des statuts d'échange
export const EXCHANGE_STATUS_LABELS = {
  [EXCHANGE_STATUS.EN_ATTENTE]: 'En attente de réponse',
  [EXCHANGE_STATUS.ACCEPTE_AGENT]: 'Accepté par l\'agent',
  [EXCHANGE_STATUS.REFUSE_AGENT]: 'Refusé par l\'agent',
  [EXCHANGE_STATUS.VALIDE_SUPERVISEUR]: 'Validé par le superviseur',
  [EXCHANGE_STATUS.REFUSE_SUPERVISEUR]: 'Refusé par le superviseur',
  [EXCHANGE_STATUS.ANNULE]: 'Annulé',
};

// Couleurs des statuts d'échange
export const EXCHANGE_STATUS_COLORS = {
  [EXCHANGE_STATUS.EN_ATTENTE]: '#ffc107',
  [EXCHANGE_STATUS.ACCEPTE_AGENT]: '#17a2b8',
  [EXCHANGE_STATUS.REFUSE_AGENT]: '#dc3545',
  [EXCHANGE_STATUS.VALIDE_SUPERVISEUR]: '#28a745',
  [EXCHANGE_STATUS.REFUSE_SUPERVISEUR]: '#dc3545',
  [EXCHANGE_STATUS.ANNULE]: '#6c757d',
};

// Navigation
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PLANNING: '/planning',
  EXCHANGES: '/exchanges',
  PROFILE: '/profile',
};

// Messages par défaut
export const MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie !',
  LOGIN_ERROR: 'Erreur de connexion',
  LOGOUT_SUCCESS: 'Déconnexion réussie !',
  SAVE_SUCCESS: 'Sauvegardé avec succès !',
  DELETE_SUCCESS: 'Supprimé avec succès !',
  ERROR_GENERIC: 'Une erreur est survenue',
  LOADING: 'Chargement...',
  NO_DATA: 'Aucune donnée disponible',
};

// Configuration des dates
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Pagination
export const PAGE_SIZE = 10;

// Délais
export const DEBOUNCE_DELAY = 300;
export const AUTO_LOGOUT_DELAY = 30 * 60 * 1000; // 30 minutes