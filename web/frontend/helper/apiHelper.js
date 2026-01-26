import DEVELOPMENT_CONFIG from "./config.js";
import axios from "axios";
import { useAppBridge } from "@shopify/app-bridge-react";

export default {
    postRequest: async (url, data) => {
        const shopify = useAppBridge();
        const token = await shopify.idToken();
        let config = {
            method: "post",
            url: DEVELOPMENT_CONFIG.base_url + url,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            data: data,
            withCredentials: true
        };
        const response = axios(config)
            .then(async (response) => {
                if (response.data.code === DEVELOPMENT_CONFIG.statusCode) {
                    return response.data
                }
                else {
                    return response.data
                }
            })
            .catch((error) => {
                return error.response.data
            });
        return response;
    },

    getRequest: async function (url, data) {
        const shopify = useAppBridge();
        const token = await shopify.idToken();
        var config = {
            method: "get",
            url: DEVELOPMENT_CONFIG.base_url + url,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            data: data,
        };
        const response = axios(config)
            .then(async (response) => {
                if (response.data.code === DEVELOPMENT_CONFIG.statusCode) {
                    return response.data
                }
            })
            .catch((error) => {
                return error.response.data
            });
        return response;
    },
}