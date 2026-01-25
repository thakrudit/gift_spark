import { BillingInterval, ApiVersion } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
// import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";

// const DB_PATH = `${process.cwd()}/database.sqlite`;

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.April26,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  // sessionStorage: new SQLiteSessionStorage(DB_PATH),
  // sessionStorage: MongoDBSessionStorage.withCredentials(
  //   process.env.DB_HOST,
  //   process.env.DB_DATA,
  //   process.env.DB_USER,
  //   process.env.DB_PASS,
  // ),
   sessionStorage: new MongoDBSessionStorage(process.env.MONGODB_URI),
});

export default shopify;
