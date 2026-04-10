import axiosClient from './axiosClient';

export const invoiceApi = {
    getAllInvoices: (params) => {
        return axiosClient.get('/Invoices', { params });
    },
    getDraftInvoice: (bookingId) => {
        return axiosClient.get(`/Invoices/draft/${bookingId}`);
    },
    confirmPayment: (data) => {
        return axiosClient.post('/Invoices/confirm', data);
    },
    getSummary: () => {
        return axiosClient.get('/Invoices/summary');
    }
};
