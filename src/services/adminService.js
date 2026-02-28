import api from './api';

const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Participants
  getParticipants: async (params = {}) => {
    const response = await api.get('/admin/participants', { params });
    console.log(response.data);
    return response.data;
  },

  exportParticipants: async () => {
    const response = await api.get('/admin/participants/export', { responseType: 'blob' });
    return response.data;
  },

  getParticipantDetail: async (id) => {
    const response = await api.get(`/admin/participants/${id}`);
    return response.data;
  },

  updateParticipant: async (id, data) => {
    const response = await api.patch(`/admin/participants/${id}`, data);
    return response.data;
  },

  deactivateParticipant: async (id) => {
    const response = await api.patch(`/admin/participants/${id}/deactivate`);
    return response.data;
  },

  // Volunteers
  getVolunteers: async (params = {}) => {
    const response = await api.get('/admin/users', { 
      params: { ...params, role: 'volunteer' } 
    });
    return response.data;
  },

  getVolunteerDetail: async (id) => {
    // Note: If there's a specific admin/volunteer detail endpoint, use it here.
    // Based on Swagger, we might use the general users endpoint if specific doesn't exist.
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateVolunteer: async (id, data) => {
    const response = await api.patch(`/admin/volunteers/${id}`, data);
    return response.data;
  },

  addVolunteerHours: async (id, hours) => {
    const response = await api.patch(`/admin/volunteer/add-hours/${id}`, { hours });
    return response.data;
  },

  // Sponsors
  getSponsors: async (params = {}) => {
    const response = await api.get('/admin/sponsors', { params });
    return response.data;
  },

  getSponsorDetail: async (id) => {
    const response = await api.get(`/admin/sponsors/${id}`);
    return response.data;
  },

  updateSponsor: async (id, data) => {
    const response = await api.patch(`/admin/sponsors/${id}`, data);
    return response.data;
  },

  // Community Partners
  getPartners: async (params = {}) => {
    const response = await api.get('/admin/community-partners', { params });
    return response.data;
  },

  getPartnerDetail: async (id) => {
    const response = await api.get(`/admin/community-partners/${id}`);
    return response.data;
  },

  updatePartnerStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/partners/${id}/status`, { status });
    return response.data;
  },

  // Events
  getEvents: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data;
  },

  getEventDetail: async (id) => {
    const response = await api.get(`/admin/events/${id}`);
    return response.data;
  },

  createEvent: async (data) => {
    const response = await api.post('/admin/events', data);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await api.patch(`/admin/events/${id}`, data);
    return response.data;
  },

  // Donations
  getDonations: async (params = {}) => {
    const response = await api.get('/admin/in-kind-donations', { params });
    return response.data;
  },

  exportDonations: async () => {
    const response = await api.get('/admin/in-kind-donations/export', { responseType: 'blob' });
    return response.data;
  },

  getDonationDetail: async (id) => {
    const response = await api.get(`/admin/in-kind-donations/${id}`);
    return response.data;
  },

  updateDonationStatus: async (id, data) => {
    const response = await api.patch(`/admin/in-kind-donations/${id}/status`, data);
    return response.data;
  },

  // Finances
  getFinancials: async () => {
    const response = await api.get('/admin/finances');
    return response.data;
  },

  // Global Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.patch('/admin/settings', data);
    return response.data;
  },

  updateAgreement: async (data) => {
    const response = await api.post('/admin/settings/agreement', data);
    return response.data;
  },

  // Admin Profile
  getAdminProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },

  updateAdminProfile: async (data) => {
    const response = await api.patch('/admin/profile', data);
    return response.data;
  },

  updateAdminPassword: async (data) => {
    const response = await api.patch('/admin/profile/password', data);
    return response.data;
  },
};

export default adminService;
