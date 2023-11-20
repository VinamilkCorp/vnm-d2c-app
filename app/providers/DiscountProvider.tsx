import { AppProvider } from "@shopify/discount-app-components";
import "@shopify/discount-app-components/build/esm/styles.css";

export function DiscountProvider({ children }) {
  return (
    <AppProvider locale="en-US" ianaTimezone="Asia/Bangkok">
      {children}
    </AppProvider>
  );
}
