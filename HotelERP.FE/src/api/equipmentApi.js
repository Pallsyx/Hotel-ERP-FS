import axiosClient from './axiosClient';

export const equipmentApi = {
  getEquipments: (params) => axiosClient.get('/Equipments', { params }),

  createEquipment: (data) => axiosClient.post('/Equipments', data),

  updateEquipment: (id, data) => axiosClient.put(`/Equipments/${id}`, data),

  deleteEquipment: (id) => axiosClient.delete(`/Equipments/${id}`),

  importExcel: (formData) => axiosClient.post('/Equipments/import-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  exportExcel: (params) => axiosClient.get('/Equipments/export-excel', {
    responseType: 'blob',
    params
  }),
};
