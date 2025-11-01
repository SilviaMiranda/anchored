const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Situations API
  async getSituations() {
    return this.request('/situations');
  }

  async getSituation(id) {
    return this.request(`/situations/${id}`);
  }

  async createSituation(situation) {
    return this.request('/situations', {
      method: 'POST',
      body: JSON.stringify(situation),
    });
  }

  async updateSituation(id, situation) {
    return this.request(`/situations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(situation),
    });
  }

  async deleteSituation(id) {
    return this.request(`/situations/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // ===== Adaptive Routines =====
  // Weekly Routines
  async getCurrentRoutine() {
    return this.request('/routines/current');
  }

  async getRoutine(weekStartDate) {
    return this.request(`/routines/${weekStartDate}`);
  }

  async upsertRoutine(weekStartDate, routine) {
    return this.request('/routines', {
      method: 'POST',
      body: JSON.stringify({ weekStartDate, routine }),
    });
  }

  async updateRoutine(id, updates) {
    return this.request(`/routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRoutine(id) {
    return this.request(`/routines/${id}`, { method: 'DELETE' });
  }

  // Templates
  async getTemplates() {
    return this.request('/routines/templates');
  }

  async getTemplate(id) {
    return this.request(`/routines/templates/${id}`);
  }

  async createTemplate(id, template) {
    return this.request('/routines/templates', {
      method: 'POST',
      body: JSON.stringify({ id, template }),
    });
  }

  // Hard Week Planning
  async getUpcomingHardWeeks() {
    return this.request('/routines/upcoming');
  }

  async flagHardWeek(weekStartDate, flag) {
    return this.request('/routines/flag-hard-week', {
      method: 'POST',
      body: JSON.stringify({ weekStartDate, flag }),
    });
  }

  async updateHardWeek(flagId, updates) {
    return this.request(`/routines/hard-week/${flagId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteHardWeek(flagId) {
    return this.request(`/routines/hard-week/${flagId}`, { method: 'DELETE' });
  }

  // Prep Tasks
  async getPrepTasks(weekId) {
    return this.request(`/routines/prep-tasks/${weekId}`);
  }

  async updatePrepTasks(weekId, prepTasks) {
    return this.request(`/routines/prep-tasks/${weekId}`, {
      method: 'PUT',
      body: JSON.stringify({ prepTasks }),
    });
  }
}

const apiService = new ApiService();
export default apiService;
