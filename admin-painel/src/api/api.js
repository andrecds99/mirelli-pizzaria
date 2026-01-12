// src/api/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE}/api`
});

// adiciona token automaticamente se existir
api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
