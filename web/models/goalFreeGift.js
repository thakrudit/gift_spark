import mongoose from "mongoose";

const goalFreeGiftSchema = new mongoose.Schema({
    shop: {
        type: String,
        required: true
    },
    title: { type: String },
    productId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'freeproduct' }],
    tergetType: { type: String },
    minRequirement: { type: Number },
    minQuantity: { type: Number },

    eligibility: { type: String },
    allItems: { type: Boolean },
    specificItems: { type: [String] },

    message1: { type: String },
    message2: { type: String },
    tagEnable: {
        type: Boolean,
        default: true,
        required: true
    },

}, { timestamps: true })

const GoalFreeGift = mongoose.model('goalfreegift', goalFreeGiftSchema)

export default GoalFreeGift;