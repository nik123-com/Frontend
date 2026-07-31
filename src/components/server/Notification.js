import axios from "axios";
import { baseUrl, all_notification, respond_notification, mark_read_notification, stock_notify_api, stock_subscriptions_api, delete_notification_api } from "../endpoints";

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

export function requestStockNotificationApi(productId) {
  return axios.post(baseUrl + stock_notify_api, { productId }, getToken());
}

export function getUserStockNotificationsApi() {
  return axios.post(baseUrl + stock_subscriptions_api, {}, getToken());
}

export function deleteNotificationApi(notificationId) {
  return axios.post(baseUrl + delete_notification_api, { notificationId }, getToken());
}

