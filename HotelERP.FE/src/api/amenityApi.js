import axiosClient from './axiosClient';

const amenityApi = {
  getAll: async () => {
    const response = await axiosClient.get('/amenities');
    return response.data || [];
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/amenities/${id}`);
    return response.data || null;
  },

  create: async (payload) => {
    const response = await axiosClient.post('/amenities', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosClient.put(`/amenities/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosClient.delete(`/amenities/${id}`);
    return response.data;
  },
};

export default amenityApi;