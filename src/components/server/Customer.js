import axios from "axios";
import {
  all_Customer,
  baseUrl,
  softDelete_Customer,
  toggle_block_customer,
  admin_allot_customer_rank,
  admin_revoke_customer_rank,
  customer_check_reward,
  customer_dismiss_reward,
  customer_profile,
  customer_update_profile
} from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");
    const head = {
      Authorization: token,
    };
    return {headers:head};
}

export function allCustomer(data){
    return axios.post(baseUrl + all_Customer,data,getToken());
}
export function softDelete(data){
    return axios.post ( baseUrl + softDelete_Customer ,data,getToken());
}
export function toggleBlockCustomer(data){
    return axios.post ( baseUrl + toggle_block_customer ,data,getToken());
}
export function allotCustomerRank(data){
    return axios.post ( baseUrl + admin_allot_customer_rank ,data,getToken());
}
export function revokeCustomerRank(data){
    return axios.post ( baseUrl + admin_revoke_customer_rank ,data,getToken());
}
export function checkRankReward(data = {}){
    return axios.post ( baseUrl + customer_check_reward ,data,getToken());
}
export function dismissRewardPopup(data = {}){
    return axios.post ( baseUrl + customer_dismiss_reward ,data,getToken());
}
export function getCustomerProfile(data = {}) {
    return axios.post(baseUrl + customer_profile, data, getToken());
}
export function updateCustomerProfile(data) {
    return axios.post(baseUrl + customer_update_profile, data, getToken());
}