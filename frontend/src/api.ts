
import axiosStatic from "axios";

const API = axiosStatic.create({
    baseURL: window.location.hostname.match(/laurcons\.ro/) ? "https://pmail.laurcons.ro/api/" : "http://localhost:822/api/",
    withCredentials: true
});

export default API;