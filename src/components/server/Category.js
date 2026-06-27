import axios from "axios"
import { add_Category, all_Category, baseUrl, HardDelete, single_Category, softDelete_cate, update_Category } from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}
export function addCategory(data){
    return axios.post(baseUrl + add_Category,data,getToken())
}
export function allCategory(data){
    return axios.post(baseUrl + all_Category,data,getToken())
}
export function updateCategory(data){
    return axios.post(baseUrl + update_Category,data,getToken())
}
export function singleCategory(data){
    return axios.post(baseUrl + single_Category,data,getToken())
}

export function softDelete(data){
    return axios.post(baseUrl + softDelete_cate,data,getToken())
}
export function DeleteOne(data){
    return axios.post(baseUrl + HardDelete,data,getToken())
}

