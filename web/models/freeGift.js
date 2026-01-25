import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    id: String,
    name: String,
    position: String,
    values: [String]
}, { _id: false });

const variantSchema = new mongoose.Schema({
    id: String,
    title: String,
    price: String,
    position: String,
    inventoryQuantity: String,
}, { _id: false });

const mediaSchema = new mongoose.Schema({
    originalSource: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        required: false,
    },
    mediaContentType: {
        type: String,
        enum: ['IMAGE', 'VIDEO', 'AUDIO'],
        required: true,
    },
}, { _id: false });

const productSchema = new mongoose.Schema({
    id: { type: String, required: true },
    shop: { type: String, required: true },
    title: { type: String, required: true },
    vendor: { type: String, required: false },
    descriptionHtml: { type: String, default: "" },
    handle: { type: String, required: false },
    tags: [String],
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], required: false },
    productType: { type: String, default: "" },
    locationId: { type: String, required: true },

    options: [optionSchema],
    variants: [variantSchema],
    media: [mediaSchema],
    // product: {
    //     type: mongoose.Schema.Types.Mixed,
    //     required: true,
    // },
}, { timestamps: true });

const FreeGift = mongoose.model('freegift', productSchema);

export default FreeGift;

