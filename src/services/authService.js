// src/services/authService.js
import axios from 'axios';

// const API_URL = 'http://localhost:8081';
const API_URL = 'https://www.brooks-dusura.uk';
const API_URL_PLACES = 'https://www.brooks-dusura.uk';

const login = (credentials) => {
  return axios.post(`${API_URL}/user-auth/login/login`, credentials)
    .then(response => {
      console.log('Response from API:', response.data); // Debugging line
      return response.data;
    });
};

const signUp = (userData) => {
  console.log('Attempting sign-up with:', userData); // Debugging line
  return axios.post(`${API_URL}/user-auth/sign-in/sign`, userData)
    .then(response => {
      console.log('Sign-up response:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Sign-up error:', error.response ? error.response.data : error.message); // Debugging line
      throw error;
    });
};


const oauthLogin = (provider) => {
  return axios.get(`${API_URL}/oauth2/authorization/${provider}`);
};

const savePlace = (placeDetails, token) => {
  return axios.post(`${API_URL_PLACES}/api/places`, placeDetails, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export { login, signUp, oauthLogin, savePlace };
