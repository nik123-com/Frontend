import axios from "axios";
import {
  all_Customer, baseUrl, softDelete_Customer, toggle_block_customer,
  admin_update_customer_rank, admin_ai_rank_customer, admin_ai_rank_all,
  admin_approve_ai_evaluation, customer_rank_rewards, vendor_customer_ranks
} from "../endpoints"

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}

export function allCustomer(data){
    return axios.post(baseUrl + all_Customer,data,getToken())
}
export function softDelete(data){
    return axios.post ( baseUrl + softDelete_Customer ,data,getToken())
}
export function toggleBlockCustomer(data){
    return axios.post ( baseUrl + toggle_block_customer ,data,getToken())
}
export function updateCustomerRank(data){
    return axios.post ( baseUrl + admin_update_customer_rank ,data,getToken())
}
export function aiRankCustomer(data){
    return axios.post ( baseUrl + admin_ai_rank_customer ,data,getToken())
}
export function aiRankAllCustomers(){
    return axios.post ( baseUrl + admin_ai_rank_all ,{},getToken())
}
export function approveAiEvaluation(data){
    return axios.post ( baseUrl + admin_approve_ai_evaluation ,data,getToken())
}
export function getCustomerRankRewards(){
    return axios.post ( baseUrl + customer_rank_rewards ,{},getToken())
}
export function getVendorCustomerRanks(){
    return axios.post ( baseUrl + vendor_customer_ranks ,{},getToken())
}