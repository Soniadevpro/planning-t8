// frontend/src/utils/serviceTypesHelper.js
import planningService from '../services/planning';

/**
 * Helper pour gérer les types de service de manière centralisée
 * Utilise les données du backend via planningService
 */
class ServiceTypesHelper {
  constructor() {
    this.typesService = planningService.getTypesService();
    this.horairesParType = planningService.getHorairesParType();
  }

  /**
   * Configuration complète des types de service avec styles Tailwind
   */
  getServiceTypesConfig() {
    return {
      matin: {
        label: 'Matin',
        icon: '🌅',
        horaires: this.formatHoraires('matin'),
        tailwindClasses: {
          background: 'bg-blue-500',
          text: 'text-white',
          lightBackground: 'bg-blue-100',
          lightText: 'text-blue-800',
          darkBackground: 'dark:bg-blue-900',
          darkText: 'dark:text-blue-200',
          border: 'border-blue-200',
          darkBorder: 'dark:border-blue-800'
        },
        color: '#3B82F6' // blue-500
      },
      apres_midi: {
        label: 'Après-midi',
        icon: '☀️',
        horaires: this.formatHoraires('apres_midi'),
        tailwindClasses: {
          background: 'bg-orange-500',
          text: 'text-white',
          lightBackground: 'bg-orange-100',
          lightText: 'text-orange-800',
          darkBackground: 'dark:bg-orange-900',
          darkText: 'dark:text-orange-200',
          border: 'border-orange-200',
          darkBorder: 'dark:border-orange-800'
        },
        color: '#F97316' // orange-500
      },
      journee: {
        label: 'Journée',
        icon: '📅',
        horaires: this.formatHoraires('journee'),
        tailwindClasses: {
          background: 'bg-green-500',
          text: 'text-white',
          lightBackground: 'bg-green-100',
          lightText: 'text-green-800',
          darkBackground: 'dark:bg-green-900',
          darkText: 'dark:text-green-200',
          border: 'border-green-200',
          darkBorder: 'dark:border-green-800'
        },
        color: '#22C55E' // green-500
      },
      nuit: {
        label: 'Nuit',
        icon: '🌙',
        horaires: this.formatHoraires('nuit'),
        tailwindClasses: {
          background: 'bg-purple-500',
          text: 'text-white',
          lightBackground: 'bg-purple-100',
          lightText: 'text-purple-800',
          darkBackground: 'dark:bg-purple-900',
          darkText: 'dark:text-purple-200',
          border: 'border-purple-200',
          darkBorder: 'dark:border-purple-800'
        },
        color: '#A855F7' // purple-500
      },
      repos: {
        label: 'Repos',
        icon: '😴',
        horaires: null,
        tailwindClasses: {
          background: 'bg-gray-500',
          text: 'text-white',
          lightBackground: 'bg-gray-100',
          lightText: 'text-gray-800',
          darkBackground: 'dark:bg-gray-700',
          darkText: 'dark:text-gray-200',
          border: 'border-gray-200',
          darkBorder: 'dark:border-gray-600'
        },
        color: '#6B7280' // gray-500
      },
      vacances: {
        label: 'Vacances',
        icon: '🏖️',
        horaires: null,
        tailwindClasses: {
          background: 'bg-yellow-500',
          text: 'text-white',
          lightBackground: 'bg-yellow-100',
          lightText: 'text-yellow-800',
          darkBackground: 'dark:bg-yellow-900',
          darkText: 'dark:text-yellow-200',
          border: 'border-yellow-200',
          darkBorder: 'dark:border-yellow-800'
        },
        color: '#EAB308' // yellow-500
      },
      jour_ferie_repos: {
        label: 'Jour férié',
        icon: '🎉',
        horaires: null,
        tailwindClasses: {
          background: 'bg-red-500',
          text: 'text-white',
          lightBackground: 'bg-red-100',
          lightText: 'text-red-800',
          darkBackground: 'dark:bg-red-900',
          darkText: 'dark:text-red-200',
          border: 'border-red-200',
          darkBorder: 'dark:border-red-800'
        },
        color: '#EF4444' // red-500
      }
    };
  }

  /**
   * Formate les horaires pour un type de service
   */
  formatHoraires(typeService) {
    const horaires = this.horairesParType[typeService];
    if (!horaires || !horaires.debut || !horaires.fin) {
      return null;
    }
    return `${horaires.debut} - ${horaires.fin}`;
  }

  /**
   * Obtient la configuration d'un type de service spécifique
   */
  getServiceInfo(typeService) {
    const config = this.getServiceTypesConfig();
    return config[typeService] || {
      label: typeService,
      icon: '❓',
      horaires: null,
      tailwindClasses: {
        background: 'bg-gray-500',
        text: 'text-white',
        lightBackground: 'bg-gray-100',
        lightText: 'text-gray-800',
        darkBackground: 'dark:bg-gray-700',
        darkText: 'dark:text-gray-200',
        border: 'border-gray-200',
        darkBorder: 'dark:border-gray-600'
      },
      color: '#6B7280'
    };
  }

  /**
   * Génère les classes Tailwind pour un type de service
   */
  getServiceClasses(typeService, variant = 'light') {
    const info = this.getServiceInfo(typeService);
    const classes = info.tailwindClasses;
    
    switch (variant) {
      case 'light':
        return `${classes.lightBackground} ${classes.lightText} ${classes.darkBackground} ${classes.darkText}`;
      case 'solid':
        return `${classes.background} ${classes.text}`;
      case 'border':
        return `border ${classes.border} ${classes.darkBorder}`;
      default:
        return `${classes.lightBackground} ${classes.lightText} ${classes.darkBackground} ${classes.darkText}`;
    }
  }

  /**
   * Obtient tous les types de service depuis le backend
   */
  getAllServiceTypes() {
    return this.typesService;
  }

  /**
   * Vérifie si un type de service est échangeable
   */
  isExchangeable(typeService) {
    return !['repos', 'vacances', 'jour_ferie_repos'].includes(typeService);
  }

  /**
   * Formate l'affichage complet d'un service
   */
  formatServiceDisplay(typeService) {
    const info = this.getServiceInfo(typeService);
    let display = `${info.icon} ${info.label}`;
    if (info.horaires) {
      display += ` (${info.horaires})`;
    }
    return display;
  }

  /**
   * Obtient la couleur hexadécimale d'un type de service
   */
  getServiceColor(typeService) {
    const info = this.getServiceInfo(typeService);
    return info.color;
  }

  /**
   * Filtre les services échangeables
   */
  getExchangeableServiceTypes() {
    return this.typesService.filter(service => 
      this.isExchangeable(service.value)
    );
  }
}

// Instance singleton
export default new ServiceTypesHelper();