import helper from "../config/helper.js";
import Script from "../models/script.js";

export const script = async (req, res) => {
    try {
        const { shop, isEnable } = req.body;

        if (!shop || typeof isEnable !== 'boolean') {
            return helper.error(res, "Missing required fields")
        }
        const data = await Script.findOneAndUpdate(
            { shop: shop },
            {
                isEnable,
            },
            { upsert: true, new: true }
        )
        return helper.success(res, "App status updated successfully", data)
    } catch (err) {
        return helper.error(res, err)
    }
}

export const getScript = async (req, res) => {
    try {
        const { shop } = req.query;

        if (!shop) {
            return helper.error(res, "Shop is missing")
        }
        const data = await Script.findOne({ shop }).select('isEnable')
        if (!data) {
            return helper.error(res, "Data is empty, no status")
        }
        return helper.success(res, "Status getting successfully ", data)
    } catch (err) {
        return helper.error(res, err)
    }
}