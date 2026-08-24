import axios from 'axios';
const isProduction = import.meta.env.MODE === 'production';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isProduction ? 'https://mern-portfolio-bl8d.onrender.com/api' : 'http://localhost:5000/api'),
  withCredentials: true,
});
export default API;