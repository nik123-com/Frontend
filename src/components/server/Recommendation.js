import axios from "axios";
import {
  baseUrl,
  recommendations_all,
  recommendations_detail,
  recommendations_explain,
  behavior_track_event,
  behavior_profile,
  recommendations_metrics,
  cart_smart_optimization,
  Stellar_contextual_query,
  vendor_inventory_intelligence,
  vendor_product_forecast,
  admin_recommendations_analytics
} from "../endpoints";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: token } : {};
};

// 1. Fetch Explainable Recommendations
export const getRecommendations = (data = {}) => {
  return axios.post(`${baseUrl}${recommendations_all}`, data, {
    headers: getAuthHeaders()
  });
};

// 2. Fetch Product Detail Complementary Recommendations
export const getProductDetailRecommendations = (data = {}) => {
  return axios.post(`${baseUrl}${recommendations_detail}`, data, {
    headers: getAuthHeaders()
  });
};

// 3. Fetch Product Recommendation Explanation
export const getExplanation = (data = {}) => {
  return axios.post(`${baseUrl}${recommendations_explain}`, data, {
    headers: getAuthHeaders()
  });
};

// 4. Track Behavior Event
export const trackBehaviorEvent = ({
  eventType,
  productId = null,
  categoryId = null,
  brandId = null,
  metadata = {}
}) => {
  const userId = sessionStorage.getItem("userId");
  let sessionId = sessionStorage.getItem("Stellar_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("Stellar_session_id", sessionId);
  }

  return axios.post(`${baseUrl}${behavior_track_event}`, {
    userId,
    sessionId,
    eventType,
    productId,
    categoryId,
    brandId,
    metadata
  }).catch((err) => {
    // Non-blocking telemetry
    console.debug("Telemetry event error:", err);
  });
};

// 5. Track Recommendation Metric (Impression, Click, Conversion)
export const trackRecommendationMetric = ({
  action,
  recommendationType = "for_you",
  productId = null,
  metadata = {}
}) => {
  const userId = sessionStorage.getItem("userId");
  const sessionId = sessionStorage.getItem("Stellar_session_id") || "";
  return axios.post(`${baseUrl}${recommendations_metrics}`, {
    userId,
    sessionId,
    action,
    recommendationType,
    productId,
    metadata
  }).catch((err) => {
    console.debug("Metric error:", err);
  });
};

// 6. Get User Profile Preferences
export const getUserProfile = (userId) => {
  return axios.post(`${baseUrl}${behavior_profile}`, { userId }, {
    headers: getAuthHeaders()
  });
};

// 7. Smart Cart & Coupon Optimization
export const getSmartCartOptimization = (data = {}) => {
  return axios.post(`${baseUrl}${cart_smart_optimization}`, data, {
    headers: getAuthHeaders()
  });
};

// 8. Context-Aware Stellar AI Shopping Query
export const askContextualStellar = (data = {}) => {
  return axios.post(`${baseUrl}${Stellar_contextual_query}`, data);
};

// 9. Vendor Predictive Stock-Out Intelligence
export const getVendorStockIntelligence = () => {
  return axios.post(`${baseUrl}${vendor_inventory_intelligence}`, {}, {
    headers: getAuthHeaders()
  });
};

// 10. Vendor Product Stock Forecast
export const getVendorProductForecast = (productId) => {
  return axios.post(`${baseUrl}${vendor_product_forecast}`, { productId }, {
    headers: getAuthHeaders()
  });
};

// 11. Admin Recommendation Analytics
export const getAdminRecommendationAnalytics = () => {
  return axios.post(`${baseUrl}${admin_recommendations_analytics}`, {}, {
    headers: getAuthHeaders()
  });
};
