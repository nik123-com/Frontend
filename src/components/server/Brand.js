import axios from "axios"
import { add_Brand, all_Brand, baseUrl, customer_Brand, HardDelete_brand, single_brand, softDelete_brand, update_brand } from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}

export function addBrand(data){
    return axios.post(baseUrl + add_Brand,data,getToken())
}
export function allBrand(data){
    return axios.post(baseUrl + all_Brand,data,getToken())
}
export function updateBrand(data){
    return axios.post(baseUrl + update_brand,data,getToken())
}
export function singleBrand(data){
    return axios.post(baseUrl + single_brand,data,getToken())
}
export function softDelete(data){
    return axios.post(baseUrl + softDelete_brand,data,getToken())
}
export function HardDelete(data){
    return axios.post(baseUrl + HardDelete_brand,data,getToken())
}
export function customerBrand(data){
    return axios.post(baseUrl + customer_Brand,data,getToken())
}
