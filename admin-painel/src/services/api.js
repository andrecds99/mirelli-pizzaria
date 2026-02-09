// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "https://mirelli-api.onrender.com/api", // Ajustar se mudar porta/backend
});

export default api;
