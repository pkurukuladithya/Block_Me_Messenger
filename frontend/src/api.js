import axios from "axios";

const rawBase =
  process.env.REACT_APP_API_BASE?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "development" ? "/api" : "/api");

const api = axios.create({
  baseURL: rawBase,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
