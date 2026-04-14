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

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
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

  approveParticipant: async (id, isApproved) => {
    const response = await api.patch(`/admin/participants/${id}/approve`, { isApproved });
    return response.data;
  },

  approveDetailedIntake: async (id) => {
    const response = await api.patch(`/admin/participants/${id}/approve-detailed`);
    return response.data;
  },
  
  revokeDetailedIntake: async (id) => {
    const response = await api.patch(`/admin/participants/${id}/revoke-detailed`);
    return response.data;
  },

  // Volunteers
  getVolunteers: async (params = {}) => {
    const response = await api.get('/admin/volunteers', { params });
    return response.data;
  },

  getVolunteerDetail: async (id) => {
    const response = await api.get(`/admin/volunteers/${id}`);
    return response.data;
  },

  updateVolunteer: async (id, data) => {
    const response = await api.patch(`/admin/volunteers/${id}`, data);
    return response.data;
  },

  addVolunteerHours: async (id, data) => {
    const response = await api.patch(`/admin/volunteer/add-hours/${id}`, data);
    return response.data;
  },

  approveVolunteerHours: async (logId, status) => {
    const response = await api.patch(`/admin/volunteer/approve-hours/${logId}`, { status });
    return response.data;
  },

  approveVolunteer: async (id, isApproved) => {
    const response = await api.patch(`/admin/volunteers/${id}/approve`, { isApproved });
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

  deleteSponsor: async (id) => {
    const response = await api.delete(`/admin/sponsors/${id}`);
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
    const response = await api.patch(`/admin/partners/${id}/status`, { status });
    return response.data;
  },

  updatePartner: async (id, formData) => {
    const response = await api.patch(`/admin/community-partners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePartner: async (id) => {
    const response = await api.delete(`/admin/community-partners/${id}`);
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

  deleteEvent: async (id) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },

  updateEventStatus: async (id, status, rejectionReason = '') => {
    const response = await api.patch(`/admin/opportunities/${id}/status`, { status, rejectionReason });
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

  createManualDonation: async (data) => {
    const response = await api.post('/admin/in-kind-donations', data);
    return response.data;
  },

  deleteDonation: async (id) => {
    const response = await api.delete(`/admin/in-kind-donations/${id}`);
    return response.data;
  },

  getPartnerPickups: async (params = {}) => {
    const response = await api.get('/admin/partner-pickups', { params });
    return response.data;
  },

  // Monetary Donations
  getMonetaryDonations: async (params = {}) => {
    const response = await api.get('/admin/donations/monetary', { params });
    return response.data;
  },

  getMonetaryDonationDetail: async (id) => {
    const response = await api.get(`/admin/donations/monetary/${id}`);
    return response.data;
  },

  approveMonetaryDonation: async (id, data = {}) => {
    const response = await api.patch(`/admin/donations/monetary/${id}/approve`, data);
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


  updateAgreement: async (formData) => {
    const response = await api.post('/admin/settings/agreement', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAgreementHistory: async (params = {}) => {
    const response = await api.get('/admin/settings/agreement/history', { params });
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

  // Badges
  getBadges: async (params = {}) => {
    const response = await api.get('/admin/badges', { params });
    return response.data;
  },

  getBadge: async (id) => {
    const response = await api.get(`/admin/badges/${id}`);
    return response.data;
  },

  createBadge: async (formData) => {
    const response = await api.post('/admin/badges', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBadge: async (id, formData) => {
    const response = await api.patch(`/admin/badges/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBadge: async (id) => {
    const response = await api.delete(`/admin/badges/${id}`);
    return response.data;
  },
};

export default adminService;
