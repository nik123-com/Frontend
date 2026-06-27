import axios from "axios";
import {add_Product, all_Category, all_Product, baseUrl, filterproduct, filterbrand, HardDelete_product, single_Product, softDelete_product, update_Product} from "../endpoints"

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}
export function addProduct(data){
    return axios.post(baseUrl + add_Product,data,getToken())
}
export function allProduct(data){
    return axios.post(baseUrl + all_Product,data,getToken())
}

export function softDelete(data){
    return axios.post(baseUrl + softDelete_product,data,getToken())
}
export function DeleteOne(data){
    return axios.post(baseUrl + HardDelete_product,data,getToken())
}
export function update(data){
    return axios.post(baseUrl + update_Product,data,getToken())
}
export function single(data){
    return axios.post(baseUrl + single_Product,data,getToken())
}
export function getproductbycat(data){
    return axios.post(baseUrl + filterproduct,data,getToken())
}
export function getproductbybrand(data){
    return axios.post(baseUrl + filterbrand,data,getToken())
}
