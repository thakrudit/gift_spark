import helper from "../config/helper";
import FreeGift from "../models/freeGift";

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
         mutation CreateProductWithOptions($input: ProductInput!, $media: [CreateMediaInput!]) {
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
                            availableQuantity: 10, //Make this dynamic
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
                position: option.position.toString(),
                values: option.values
            })),
            variants: productVariants?.map(variant => ({
                id: variant.id,
                title: variant.title,
                price: variant.price,
                position: variant.position.toString(),
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
}