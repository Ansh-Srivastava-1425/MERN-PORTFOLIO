import axios from 'axios';
const isProduction = import.meta.env.MODE === 'production';
let baseURL = import.meta.env.VITE_API_URL || (isProduction ? 'https://mern-portfolio-bl8d.onrender.com/api' : 'http://localhost:5000/api');

if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = `${baseURL.replace(/\/$/, '')}/api`;
}

const API = axios.create({
  baseURL,
  withCredentials: true,
});
export default API;