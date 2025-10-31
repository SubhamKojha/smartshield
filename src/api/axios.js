import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Vite will proxy this to http://localhost:5000
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
