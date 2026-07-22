import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.jsx'
import store from './redux/Store.js'
import { Provider } from 'react-redux'
import { toast } from 'react-toastify';

// Global Toast Filter Interceptor
const isBlocked = (message) => {
  if (!message) return false;
  
  // Bypass filter for auth-related pages (login, registration, forgot/reset password)
  const path = window.location.pathname.toLowerCase();
  if (
    path.includes("login") ||
    path.includes("register") ||
    path.includes("signup") ||
    path.includes("customerreg") ||
    path.includes("forgot") ||
    path.includes("reset")
  ) {
    return false;
  }
  
  const msgStr = String(message).toLowerCase();
  const blockList = [
    "token",
    "address",
    "fetch",
    "load",
    "something went wrong",
    "server is not running",
    "went wrong"
  ];
  return blockList.some(term => msgStr.includes(term));
};

const originalError = toast.error;
const originalWarn = toast.warn;
const originalWarning = toast.warning;
const originalInfo = toast.info;

toast.error = (message, options) => {
  if (isBlocked(message)) {
    console.warn("Blocked toast.error:", message);
    return null;
  }
  return originalError(message, options);
};

toast.warn = (message, options) => {
  if (isBlocked(message)) {
    console.warn("Blocked toast.warn:", message);
    return null;
  }
  return originalWarn(message, options);
};

toast.warning = (message, options) => {
  if (isBlocked(message)) {
    console.warn("Blocked toast.warning:", message);
    return null;
  }
  return originalWarning(message, options);
};

toast.info = (message, options) => {
  if (isBlocked(message)) {
    console.warn("Blocked toast.info:", message);
    return null;
  }
  return originalInfo(message, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Provider store={store}> */}
    <App />
    {/* </Provider>, */}
  </StrictMode>
)
