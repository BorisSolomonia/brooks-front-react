// src/services/authService.js
import axios from 'axios';

// const API_URL = 'http://localhost:8081';
const API_URL = 'http://10.2.0.87:8081';

const login = (credentials) => {
  return axios.post(`${API_URL}/user-auth/login/login`, credentials)
    .then(response => {
      console.log('Response from API:', response.data); // Debugging line
      return response.data;
    });
};

const signUp = (userData) => {
  return axios.post(`${API_URL}/user-auth/sign-in/sign`, userData)
    .then(response => response.data);
};

const oauthLogin = (provider) => {
  return axios.get(`${API_URL}/oauth2/authorization/${provider}`);
};

const savePlace = (placeDetails, token) => {
  return axios.post(`${API_URL}/api/places`, placeDetails, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export { login, signUp, oauthLogin, savePlace };
