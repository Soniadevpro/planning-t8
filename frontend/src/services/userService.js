import api from './api';

class UserService {
  async getAgents() {
    try {
      const response = await api.get('/agents/');
      return response.data;
    } catch (error) {
      throw new Error("Erreur lors du chargement des agents");
    }
  }
}

export default new UserService();
