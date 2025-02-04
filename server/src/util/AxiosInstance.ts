import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // Note: Required to send and receive cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
export default api;
