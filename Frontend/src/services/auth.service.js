import apiClient from "./apiClient.js";

export function loginApi(data){
    return apiClient.post("/login", data);
}

export function signupAPi(data){
    return apiClient.post("/signup", data);
}