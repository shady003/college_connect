import axios from "axios";

export const newRequest = axios.create({
  baseURL: "http://localhost:3000/api/",
  withCredentials: true,
});

// Add request interceptor to include admin token
newRequest.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken && config.url?.includes("admin")) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
