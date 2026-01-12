// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api", // Ajustar se mudar porta/backend
});

export default api;
