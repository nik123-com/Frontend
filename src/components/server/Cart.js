import axios from "axios";
import { add_cart, all_cart, baseUrl, decrement_cart, HardDelete_cart, increment_cart } from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}
export function addCart(data){
    return axios.post(baseUrl + add_cart ,data,getToken())
}
export function allCart(data){
    return axios.post(baseUrl + all_cart ,data,getToken())
}
export function increment(data){
    return axios.post(baseUrl + increment_cart ,data,getToken())
}
export function decrement(data){
    return axios.post(baseUrl + decrement_cart ,data,getToken())
}
export function HardDelete(data){
    return axios.post(baseUrl + HardDelete_cart ,data,getToken())
}