import axiosClient from './axiosClient';

const authApi = {
  login: (data) => {
    return axiosClient.post('/Auth/login', data);
  },
  register: (data) => {
    return axiosClient.post('/Auth/register', data);
  }
};

export default authApi;