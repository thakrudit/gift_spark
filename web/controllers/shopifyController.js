import helper from "../config/helper.js";
import shopify from "../shopify.js";
import FreeGift from "../models/freeGift.js";
import GoalFreeGift from "../models/goalFreeGift.js";

export const createFreeGift = async (req, res) => {
    try {
        const { shop, title, productPayload } = req.body;

        let productOptions = productPayload.options.map(option => ({
            name: option.name,
            values: option.values.map(value => ({ name: value })),
        }));
        // console.log("productOptions", JSON.stringify(productOptions, null, 2));

        const client = new shopify.api.clients.Graphql({
            session: res.locals.shopify.session,
        });

        // STEP 1 : Get location
        const locationResponse = await client.query({
            data: `query {
                locations(first: 5) {
                edges {
                    node {
                    id
                    name
                    address {
                        formatted
                    }
                    }
                }
                }
            }`,
        });
        // console.log("locationResponse ", JSON.stringify(locationResponse, null, 2));

        let location_id = locationResponse.body.data.locations.edges[0]?.node.id
        // console.log("location_id", location_id)

        if (!location_id) {
            return helper.error(res, "locationResponse.errors")
        }

        // STEP 2 : Create Product with options and media 
        const query = `
         mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
            productCreate(input: $input,  media: $media) {
                product {
                    id
                    title
                    vendor
                    descriptionHtml
                    handle
                    tags
                    status
                    productType
                    options {
                        id
                        name
                        values
                        position
                        optionValues {
                            id
                            name
                            hasVariants
                        }
                    }
                    variants(first: 10) {
                        nodes {
                            id
                            title
                            price
                            position
                            inventoryQuantity
                            selectedOptions {
                                name
                                value
                            }
                        }
                    }
                    media(first: 10) {
                        nodes {
                            alt
                            mediaContentType
                            status
                            preview {
                                image {
                                    originalSrc
                                }
                                status
                            }
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }`;

        const variables = {
            input: {
                title: title,
                published: true, // deprecated (2024-07)
                status: "UNLISTED",
                vendor: productPayload.vendor,
                tags: productPayload.tags, // arr []
                productOptions: productOptions,
                category: "gid://shopify/TaxonomyCategory/na",
            },
            media: [
                {
                    originalSource: "https://cdn.shopify.com/s/files/1/0656/9521/9951/files/gift.jpg?v=1731563367",
                    alt: "Gift Image",
                    mediaContentType: "IMAGE"
                }
            ]
        };

        const queryData = {
            query,
            variables,
        };

        const productResponse = await client.query({
            data: queryData
        })
        // console.log("productResponse ", JSON.stringify(productResponse, null, 2));

        const productData = productResponse.body.data.productCreate;

        if (productData?.userErrors?.length > 0) {
            return helper.error(res, productData?.userErrors[0]?.message)
        }
        const product_id = productData?.product?.id;
        // console.log("product_id", product_id)

        function generateVariants(options) {
            const variants = [];

            function combine(currentOptions = [], index = 0) {
                if (index === options.length) {
                    variants.push({
                        optionValues: currentOptions,
                        price: 0.0,
                        inventoryPolicy: "DENY",
                        inventoryQuantities: {
                            availableQuantity: 10, // Make this dynamic
                            locationId: location_id
                        }
                    });
                    return;
                }

                const option = options[index];
                option.optionValues.forEach(optionValue => {
                    combine([...currentOptions, { name: optionValue.name, optionName: option.name }], index + 1);
                });
            }

            combine();
            return variants;
        }

        const variantsArr = generateVariants(productData?.product?.options);
        // console.log("variantsArr ", JSON.stringify(variantsArr, null, 2));

        // STEP 3 : Create Product Variants
        const variantQuery = `mutation productVariantsBulkCreate($productId: ID!,$strategy: ProductVariantsBulkCreateStrategy!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkCreate(productId: $productId,strategy: $strategy, variants: $variants) {
                userErrors {
                    field
                    message
                }
                product {
                    id
                    title
                    vendor
                    descriptionHtml
                    handle
                    tags
                    status
                    productType
                    options {
                        id
                        name
                        values
                        position
                    }
                }
                productVariants {
                    id
                    title
                    price
                    position
                    inventoryQuantity
                    selectedOptions{
                        name 
                        value
                    }
                }
            }
        }`;

        const variantVariables = {
            productId: product_id,
            strategy: "REMOVE_STANDALONE_VARIANT",
            variants: variantsArr
        }

        const variantsQueryData = {
            query: variantQuery,
            variables: variantVariables,
        };

        const productVariantsResponse = await client.query({
            data: variantsQueryData
        })
        // console.log("productVariantsResponse ", JSON.stringify(productVariantsResponse, null, 2));

        const productVariantsBulkCreate = productVariantsResponse.body.data.productVariantsBulkCreate;

        const { product, productVariants, userErrors } = productVariantsBulkCreate;

        if (userErrors?.length > 0) {
            return helper.error(res, userErrors[0]?.message)
        }

        const data = await FreeGift.create({
            id: product.id,
            shop: shop,
            title: product.title,
            vendor: product.vendor,
            descriptionHtml: product.descriptionHtml,
            handle: product.handle,
            tags: product.tags,
            status: product.status.toUpperCase(),
            productType: product.productType,
            locationId: location_id,
            options: product?.options.map(option => ({
                id: option.id,
                name: option.name,
                position: option.position,
                values: option.values
            })),
            variants: productVariants?.map(variant => ({
                id: variant.id,
                title: variant.title,
                price: variant.price,
                position: variant.position,
                inventoryQuantity: 10
            })),
            media: [  // Dynamic Save to DB
                {
                    originalSource: "https://cdn.shopify.com/s/files/1/0656/9521/9951/files/gift.jpg?v=1731563367",
                    alt: 'Gift Image',
                    mediaContentType: 'IMAGE',
                },
            ]
        })
        return helper.success(res, "Free gift created successfully", data)
    } catch (err) {
        return helper.error(res, err)
    }
};

export const getFreeGift = async (req, res) => {
    try {
        const { shop } = req.query;

        if (!shop) {
            return helper.error(res, "Shop is Missing")
        }
        const data = await FreeGift.findOne({ shop }).select('id title media')
        if (!data) {
            return helper.error(res, "Data is empty no gift available")
        }
        return helper.success(res, "Free gift getting successfully", data)
    } catch (err) {
        return helper.error(res, err)
    }
};

export const removeFreeGift = async (req, res) => {
    try {
        const { gId, shop } = req.body;

        const client = new shopify.api.clients.Graphql({
            session: res.locals.shopify.session,
        });

        const query = `mutation {
            productDelete(input: {id: "${gId}"}) {
                deletedProductId
                userErrors {
                    field
                    message
                }
            }
        }`

        const response = await client.query({
            data: query
        })
        const productDelete = response?.body?.data?.productDelete;
        const { deletedProductId, userErrors } = productDelete;

        if (userErrors?.length > 0) {
            return helper.error(res, userErrors[0]?.message);
        }

        // Optional... || product delete webhook
        if (deletedProductId) {
            await FreeGift.findOneAndDelete({ id: deletedProductId })
        }
        // delete GoalFreeGift when product is deleted
        // await GoalFreeGift.findOneAndDelete({ shop })

        return helper.success(res, "Free Gift Removed Successfully", deletedProductId)
    } catch (err) {
        return helper.error(res, err)
    }
};

export const createGoalFreeGift = async (req, res) => {
    try {
        const { shop, title, productId, tergetType, minRequirement, minQuantity, eligibility, allItems, specificItems, message1, message2, } = req.body;

        const specificItemsIds = specificItems?.map(product => product.id);

        if (!shop) {
            return helper.error(res, "Shop is required")
        }
        const chech_shop = await GoalFreeGift.findOne({ shop })
        if (chech_shop) {
            return helper.error(res, "With This Shop Goal Free Gift is Already Available")
        }

        const data = await GoalFreeGift.create({
            shop,
            title,
            productId,
            tergetType,
            minRequirement,
            minQuantity,

            eligibility,
            allItems,
            specificItems: specificItemsIds,

            message1,
            message2,
        })

        return helper.success(res, "Create Free Gift Goal Successfully", data)
    } catch (err) {
        return helper.error(res, err)
    }
};

export const getGoalFreeGift = async (req, res) => {
    try {
        const { shop } = req.query;

        if (!shop) {
            return helper.error(res, "Shop is Missing")
        }
        const data = await GoalFreeGift.findOne({ shop }).populate("productId")
        if (!data) {
            return helper.success(res, "Data is Empty", data)
        }
        return helper.success(res, "Goal free gift getting successfully ", data)
    } catch (err) {
        return helper.error(res, err)
    }
}