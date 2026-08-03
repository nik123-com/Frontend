import axios from "axios";
import {
  baseUrl,
  admin_add_announcement,
  admin_all_announcement,
  admin_delete_announcement,
  customer_announcements,
  vendor_announcements,
  ai_announcement_description,
} from "../endpoints";

function getToken() {
  const token = sessionStorage.getItem("token");
  return { headers: { Authorization: token } };
}

export function adminAddAnnouncement(data) {
  return axios.post(baseUrl + admin_add_announcement, data, getToken());
}

export function adminGetAllAnnouncements() {
  return axios.post(baseUrl + admin_all_announcement, {}, getToken());
}

export function adminDeleteAnnouncement(id) {
  return axios.post(baseUrl + admin_delete_announcement, { _id: id }, getToken());
}

export function getCustomerAnnouncements() {
  return axios.post(baseUrl + customer_announcements, { targetAudience: "Customers" }, getToken());
}

export function getVendorAnnouncements() {
  return axios.post(baseUrl + vendor_announcements, { targetAudience: "Vendors" }, getToken());
}

export function generateAIAnnouncementDescription(data) {
  return axios.post(baseUrl + ai_announcement_description, data, getToken());
}
