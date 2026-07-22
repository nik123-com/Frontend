import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { HashLoader } from "react-spinners";

const LoadingContext = createContext({
  loading: false,
  setLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let requestCount = 0;

    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Skip chatbot requests to avoid full-screen spinner while user is typing in chat
        if (config.url && config.url.includes("/api/aiCall")) {
          return config;
        }
        requestCount++;
        setLoading(true);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        if (response.config && response.config.url && response.config.url.includes("/api/aiCall")) {
          return response;
        }
        requestCount--;
        if (requestCount <= 0) {
          requestCount = 0;
          setLoading(false);
        }
        return response;
      },
      (error) => {
        if (error.config && error.config.url && error.config.url.includes("/api/aiCall")) {
          return Promise.reject(error);
        }
        requestCount--;
        if (requestCount <= 0) {
          requestCount = 0;
          setLoading(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {loading && (
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <HashLoader size={60} color={"#81c408"} />
        </div>
      )}
    </LoadingContext.Provider>
  );
};
