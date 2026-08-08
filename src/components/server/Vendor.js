import axios from "axios";
import {
  admin_all_vendors,
  admin_approve_vendor,
  admin_reject_vendor,
  admin_toggle_block_vendor,
  admin_allot_vendor_rank,
  admin_revoke_vendor_rank,
  vendor_check_reward,
  vendor_dismiss_reward,
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

export function allotVendorRank(data) {
  return axios.post(baseUrl + admin_allot_vendor_rank, data, getToken());
}

export function revokeVendorRank(data) {
  return axios.post(baseUrl + admin_revoke_vendor_rank, data, getToken());
}

export function checkVendorRankReward(data = {}) {
  return axios.post(baseUrl + vendor_check_reward, data, getToken());
}

export function dismissVendorRewardPopup(data = {}) {
  return axios.post(baseUrl + vendor_dismiss_reward, data, getToken());
}
