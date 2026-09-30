import axios from "axios";
import {
  baseUrl,
  bargain_start,
  bargain_offer,
  bargain_accept,
  bargain_check_deal,
  vendor_bargain_history,
  bargain_delete
} from "../endpoints";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: token } : {};
};

// Start a negotiation session for a product
export const startBargainSession = ({ productId, quantity = 1 }) => {
  const userId = sessionStorage.getItem("userId");
  return axios.post(
    `${baseUrl}${bargain_start}`,
    { productId, quantity, userId },
    { headers: getAuthHeaders() }
  );
};

// Submit customer's offer in the negotiation
export const submitBargainOffer = ({ sessionId, offeredPrice, customerMessage = "" }) => {
  const userId = sessionStorage.getItem("userId");
  return axios.post(
    `${baseUrl}${bargain_offer}`,
    { sessionId, offeredPrice, customerMessage, userId },
    { headers: getAuthHeaders() }
  );
};

// Accept the AI counter-offer
export const acceptBargainCounterOffer = ({ sessionId }) => {
  const userId = sessionStorage.getItem("userId");
  return axios.post(
    `${baseUrl}${bargain_accept}`,
    { sessionId, userId },
    { headers: getAuthHeaders() }
  );
};

// Check if customer has an active, unpurchased negotiated deal for product
export const checkActiveBargainDeal = ({ productId }) => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) return Promise.resolve({ data: { success: true, hasActiveDeal: false } });
  return axios.post(
    `${baseUrl}${bargain_check_deal}`,
    { productId, userId },
    { headers: getAuthHeaders() }
  );
};

// Vendor fetch bargaining history
export const getVendorBargainHistory = () => {
  return axios.post(
    `${baseUrl}${vendor_bargain_history}`,
    {},
    { headers: getAuthHeaders() }
  );
};

// Permanently delete a bargaining negotiation record
export const deleteBargainRecord = (negotiationId) => {
  return axios.post(
    `${baseUrl}${bargain_delete}`,
    { negotiationId },
    { headers: getAuthHeaders() }
  );
};

