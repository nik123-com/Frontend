import axios from "axios";
import { baseUrl, all_notification, respond_notification, mark_read_notification } from "../endpoints";

function getToken() {
  const token = sessionStorage.getItem("token");
  return { headers: { Authorization: token } };
}

export function fetchNotifications() {
  return axios.post(baseUrl + all_notification, {}, getToken());
}

export function respondInviteApi(data) {
  return axios.post(baseUrl + respond_notification, data, getToken());
}

export function markNotificationsRead() {
  return axios.post(baseUrl + mark_read_notification, {}, getToken());
}
