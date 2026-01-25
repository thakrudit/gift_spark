import helper from "../config/helper";
import Script from "../models/script";

export const script = async (req, res) => {
    try {
        const { shop, tagEnable } = req.body;

        if (!shop || typeof tagEnable !== 'boolean') {
            return helper.error(res, "Missing required fields")
        }
        const data = await Script.findOneAndUpdate(
            { shop: shop },
            {
                tagEnable,
            },
            { upsert: true, new: true }
        )
        return helper.success(res, "Status updated successfully ", data)
    } catch (err) {
        return helper.error(res, err)
    }
}