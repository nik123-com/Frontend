import axios from "axios";
import { all_wishlist,add_wishlist, baseUrl, add_items, delete_wishlist, asscess_wishlist, add_friend, View_wishlist, send_message } from "../endpoints";

function getToken(){
 const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token,
    };

    return {headers:head}
}

export function addwishList(data){
    return axios.post(baseUrl + add_wishlist,data,getToken())
}

export function allwishList(data){
    return axios.post(baseUrl + all_wishlist,data,getToken())
}
export function addItem(data){
    return axios.post(baseUrl + add_items,data,getToken())
}
export function DeleteWishList(data){
    return axios.post(baseUrl + delete_wishlist,data,getToken())
}
export function toggleWishlistAccess(data){
    return axios.post(baseUrl + asscess_wishlist ,data,getToken())
}
export function viewproduct(data){
    return axios.post(baseUrl + View_wishlist ,data,getToken())
}
export function inviteFriend(data){
    return axios.post(baseUrl + add_friend ,data,getToken())
}
export function sendMessageApi(data){
    return axios.post(baseUrl + send_message, data, getToken())
}