import axios from "axios";
import { add_Review, all_Review, baseUrl } from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}

export function addreview(data){
    return axios.post(baseUrl + add_Review,data,getToken())
}
export function allreview(data){
    return axios.post(baseUrl + all_Review,data,getToken())
}