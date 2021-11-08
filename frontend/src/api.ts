
import axiosStatic from "axios";

const API = axiosStatic.create({
    baseURL: "https://pmail.laurcons.ro/api/",
    withCredentials: true
});

export default API;
