import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiHelper from "../helper/apiHelper";
import { useAppBridge } from "@shopify/app-bridge-react";
import DEVELOPMENT_CONFIG from "../helper/config";

const ToggleContext = createContext();

export const ToggleProvider = ({ children }) => {
    const [enabled, setEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPopulating, setIsPopulating] = useState(false);

    const shopify = useAppBridge();
    const { shop } = shopify?.config || "";

    const setLoading = (flag) => {
        shopify.loading(flag);
        setIsLoading(flag);
    }

    const setPopulating = (flag) => {
        shopify.loading(flag);
        setIsPopulating(flag);
    };

    async function getScript(shop) {
        setLoading(true);
        let result = await apiHelper.getRequest(`/api/v1/get-script?shop=${shop}`);
        if (result?.code == DEVELOPMENT_CONFIG.statusCode) {
            if (result.body && result.body.isEnable !== undefined) {
                setEnabled(result?.body?.isEnable);
            } else {
                setEnabled(false)
            }
            setLoading(false);
        } else {
            setEnabled(false)
            setLoading(false);
        }
    }

    useEffect(() => {
        getScript(shop);
    }, [shop, enabled])

    // Turn On Or Turn Off
    const handleToggle = useCallback(async (e) => {
        e.preventDefault();
        setPopulating(true)
        const newStatus = !enabled;
        let data = JSON.stringify({
            shop: shop,
            isEnable: newStatus,
        });
        let result = await apiHelper.postRequest("/api/v1/script", data)
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            if (result.body && result.body.isEnable !== undefined) {
                setEnabled(result?.body?.isEnable);
                shopify.toast.show(result?.message);
            } else {
                setEnabled(false)
            }
            setPopulating(false);
        } else {
            shopify.toast.show(result?.message, { isError: true });
            setEnabled(false)
            setPopulating(false);
        }
    }, [enabled]);

    return (
        <ToggleContext.Provider value={{ enabled, handleToggle, isLoading, isPopulating }}>
            {children}
        </ToggleContext.Provider>
    )
}

export const useToggle = () => useContext(ToggleContext);