import { useRef, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { ApiContext } from "./ApiContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

const ApiProvider = ({ children }) => {
  const token    = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();

    const tokenRef    = useRef(token);
  const dispatchRef = useRef(dispatch);

  useEffect(() => { tokenRef.current    = token;    }, [token]);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);

  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      if (tokenRef.current) {
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
      }
      return config;
    });

    const resId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          dispatchRef.current(logout());
          toast.error("Session expired. Please log in again.");
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, []);

  return (
    <ApiContext.Provider value={{ api }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;