import axios from "axios";
import {
  admin_all_vendors,
  admin_approve_vendor,
  admin_reject_vendor,
  admin_toggle_block_vendor,
  admin_ai_vendor_activity,
  baseUrl
} from "../endpoints";

function getToken() {
  const token = sessionStorage.getItem("token");
  return { headers: { Authorization: token } };
}

export function allVendor(data = {}) {
  return axios.post(baseUrl + admin_all_vendors, data, getToken());
}

export function approveVendor(data) {
  return axios.post(baseUrl + admin_approve_vendor, data, getToken());
}

export function rejectVendor(data) {
  return axios.post(baseUrl + admin_reject_vendor, data, getToken());
}

export function toggleBlockVendor(data) {
  return axios.post(baseUrl + admin_toggle_block_vendor, data, getToken());
}

export function aiEvaluateVendorActivity(data) {
  return axios.post(baseUrl + admin_ai_vendor_activity, data, getToken());
}
