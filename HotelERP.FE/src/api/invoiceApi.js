import axiosClient from './axiosClient';

const invoiceApi = {
  getEligibleBookingDetails: (bookingId) =>
    axiosClient.get(`/invoices/bookings/${bookingId}/eligible-details`),

  createDraftInvoice: (payload) =>
    axiosClient.post('/invoices/draft', payload),

  getInvoiceDetail: (invoiceId) =>
    axiosClient.get(`/invoices/${invoiceId}`),

  addExtraFee: (invoiceId, payload) =>
    axiosClient.post(`/invoices/${invoiceId}/extra-fee`, payload),

  finalizeInvoice: (invoiceId, payload) =>
    axiosClient.post(`/invoices/${invoiceId}/finalize`, payload),
};

export default invoiceApi;