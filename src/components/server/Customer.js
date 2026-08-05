import axios from "axios";
import {all_Customer, baseUrl, softDelete_Customer, toggle_block_customer} from "../endpoints"


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