import axiosClient from './axiosClient';

const invoiceApi = {
  getDraftInvoice: (bookingId) => axiosClient.get(`/invoices/draft/${bookingId}`),

  addExtraFee: (bookingId, payload) =>
    axiosClient.post(`/invoices/${bookingId}/extra-fee`, payload),

  finalizeInvoice: (bookingId, payload) =>
    axiosClient.post(`/invoices/${bookingId}/finalize`, payload),
};

export default invoiceApi;