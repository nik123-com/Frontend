import axios from "axios";
import {
  baseUrl,
  change_password,
  login_api,
  register_Api,
  send_otp_api,
  verify_otp_api,
  verify_reset_otp_api,
} from "../endpoints";

export function login(data) {
  return axios.post(baseUrl + login_api, data);
}

export function register(data) {
  return axios.post(baseUrl + register_Api, data);
}

export function changePassword(data) {
  return axios.post(baseUrl + change_password, data);
}

export function sendOtp(data) {
  return axios.post(baseUrl + send_otp_api, data);
}

export function verifyOtp(data) {
  return axios.post(baseUrl + verify_otp_api, data);
}

export function verifyResetOtp(data) {
  return axios.post(baseUrl + verify_reset_otp_api, data);
}
