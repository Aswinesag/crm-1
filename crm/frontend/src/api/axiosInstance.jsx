import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://localhost:5002/api",
  //baseURL: "https://crmsmie.smiv.in/api",
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

