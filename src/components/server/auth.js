import axios from "axios";
import { all_Customer, baseUrl, change_password, login_api, register_Api } from "../endpoints";


export function login(data){
    return axios.post(baseUrl + login_api ,data)
}
export function register(data){
    return axios.post(baseUrl + register_Api,data)
}
export function changePassword(data){
    return axios.post(baseUrl + change_password,data)
}
