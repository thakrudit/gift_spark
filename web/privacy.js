import { DeliveryMethod } from "@shopify/shopify-api";
import FreeGift from "./models/freeGift";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  PRODUCTS_DELETE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      let productId = `gid://shopify/Product/${payload.id}`
      const deletedProduct = await FreeGift.findOneAndDelete({ id: productId })
      // delete GoalFreeGift when product is deleted
      // await GoalFreeGift.findOneAndDelete({ shop })
    }
  },
  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);

      const variantPayload = payload?.variants?.map(value => ({
        id: value.admin_graphql_api_id,
        title: value.title,
        price: value.price,
        position: value.position,
        inventoryQuantity: value.inventory_quantity,
      }))

      const optionsPayload = payload?.options?.map(value => ({
        id: `gid://shopify/ProductOption/${value.id}`,
        name: value.name,
        position: value.position,
        values: value.values,
      }))

      const mediaPayload = payload?.media?.map(value => ({
        originalSource: value.preview_image.src,
        alt: value.alt,
        mediaContentType: value.media_content_type,
      }))

      const existingProduct = await FreeGift.findOneAndUpdate(
        { id: payload.admin_graphql_api_id },
        {
          title: payload.title,
          vendor: payload.vendor,
          descriptionHtml: payload.descriptionHtml,
          handle: payload.handle,
          tags: payload.tags,
          status: payload.status.toUpperCase(),
          productType: payload.productType,
          variants: variantPayload,
          options: optionsPayload,
          media: mediaPayload,
        },
        { upsert: true, new: true }
      )
    }
  }
};
