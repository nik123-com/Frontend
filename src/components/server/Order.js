import axios from "axios";
import { add_order, all_order, customer_cancel_order, baseUrl, admin_add_order, admin_all_order, admin_single_order, admin_update_order } from "../endpoints";

function getToken(){
    const token = sessionStorage.getItem("token");
    const head = {
        Authorization: token,
    };
    return {headers: head}
}

export function addOrder(data){
    return axios.post(baseUrl + add_order, data, getToken())
}

export function allOrder(data){
    return axios.post(baseUrl + all_order, data, getToken())
}

export function cancelOrder(data){
    return axios.post(baseUrl + customer_cancel_order, data, getToken())
}

export function adminAddOrder(data){
    return axios.post(baseUrl + admin_add_order, data, getToken())
}

export function adminAllOrders(data){
    return axios.post(baseUrl + admin_all_order, data, getToken())
}

export function adminSingleOrder(data){
    return axios.post(baseUrl + admin_single_order, data, getToken())
}

export function adminUpdateOrder(data){
    return axios.post(baseUrl + admin_update_order, data, getToken())
}

