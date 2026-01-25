import mongoose from "mongoose";

const script_schema = new mongoose.Schema({
    shop: {
        type: String,
        required: true
    },
    tagEnable: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true })

const Script = mongoose.model('script', script_schema)

export default Script;