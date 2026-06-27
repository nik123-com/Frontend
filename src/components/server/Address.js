import axios from "axios";
import { add_address, all_address, baseUrl } from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}

export function addAddress(data){
    return axios.post(baseUrl + add_address,data,getToken())
}

export function AllAddress(data){
    return axios.post(baseUrl + all_address,data,getToken())
}