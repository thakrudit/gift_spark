import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema({
    shop: {
        type: String,
        required: true
    },
    isEnable: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true })

const Script = mongoose.model('script', scriptSchema)

export default Script;