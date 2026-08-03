import axios from "axios";
import { add_coupon, admin_coupon, all_coupon, delete_coupon, baseUrl } from "../endpoints";

function getToken(){
    const token = sessionStorage.getItem("token");

    const head = {
        Authorization: token
    };
    return {headers :head}
}
export function addCoupon(data){
    return axios.post(baseUrl + add_coupon,data,getToken())
}
export function allCoupon(data){
    return axios.post(baseUrl + all_coupon,data,getToken())
    
}
export function adminCoupon(data){
    return axios.post(baseUrl + admin_coupon,data,getToken())
    
}
export function deleteCoupon(data){
    return axios.post(baseUrl + delete_coupon,data,getToken())
}

