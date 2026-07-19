import axios from 'axios';

// API base URL - can be overriden in environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // MUST be true so cookies/session ID are sent cross-origin
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
