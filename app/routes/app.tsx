import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import createApp from "@shopify/app-bridge";
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";
import {  Cart } from "@shopify/app-bridge/actions";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server";
// import { DiscountProvider } from "~/providers/DiscountProvider";
import { useState } from "react";

import viPolarisTranslations from "@shopify/polaris/locales/vi.json";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host: url.searchParams.get("host") || "",
  });
};

export default function App() {
  const { apiKey, host } = useLoaderData<typeof loader>();

  const [config] = useState({ apiKey, host });

  // cart.app.dispatch(Cart.Action.ADD_LINE_ITEM, {
  //   data: lineItemPayload,
  // });

  return (
    <AppBridgeReactProvider config={config}>
      <PolarisAppProvider i18n={viPolarisTranslations}>
        <AppProvider isEmbeddedApp apiKey={apiKey}>
          {/* <DiscountProvider> */}
          <ui-nav-menu>
            <Link to="/app" rel="home">
              Home
            </Link>
            {/* <Link to="/app/additional">Additional page</Link> */}
            <Link to="/app/auto-add-to-cart">Auto add to cart</Link>
          </ui-nav-menu>
          <Outlet />
          {/* </DiscountProvider> */}
        </AppProvider>
      </PolarisAppProvider>
    </AppBridgeReactProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
