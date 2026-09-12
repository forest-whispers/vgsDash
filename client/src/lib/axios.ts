import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let accessToken: string | null = localStorage.getItem("accessToken");

export const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (token) {
        localStorage.setItem("accessToken", token);
    } else {
        localStorage.removeItem("accessToken");
    }
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default api;