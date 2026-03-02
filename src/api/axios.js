import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // Creamos una instancia de Axios con la URL base del backend para no tener que escribirla entera en cada llamado
    withCredentials: true // Incluimo las cookies (token)
});

export default instance;