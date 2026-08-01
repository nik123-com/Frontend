import axios from "axios";
import {
  baseUrl,
  add_query,
  customer_all_query,
  submit_feedback_query,
  admin_all_query,
  admin_reply_query,
  vendor_add_query,
  vendor_all_query,
  vendor_feedback_query,
} from "../endpoints";

function getToken() {
  const token = sessionStorage.getItem("token");
  const head = {
    Authorization: token,
  };
  return { headers: head };
}

export function addQuery(formData) {
  return axios.post(baseUrl + add_query, formData, getToken());
}

export function getCustomerQueries(data) {
  return axios.post(baseUrl + customer_all_query, data, getToken());
}

export function submitQueryFeedback(data) {
  return axios.post(baseUrl + submit_feedback_query, data, getToken());
}

export function vendorAddQuery(formData) {
  return axios.post(baseUrl + vendor_add_query, formData, getToken());
}

export function vendorGetQueries(data) {
  return axios.post(baseUrl + vendor_all_query, data, getToken());
}

export function vendorSubmitFeedback(data) {
  return axios.post(baseUrl + vendor_feedback_query, data, getToken());
}

export function adminAllQueries(data) {
  return axios.post(baseUrl + admin_all_query, data, getToken());
}

export function adminReplyQuery(formData) {
  return axios.post(baseUrl + admin_reply_query, formData, getToken());
}
