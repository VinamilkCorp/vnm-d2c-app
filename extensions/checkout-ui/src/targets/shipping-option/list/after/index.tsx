import { reactExtension } from "@shopify/ui-extensions-react/checkout";
import { FastDeliveryCheckbox } from "./Components";

export default reactExtension(
  'purchase.checkout.shipping-option-list.render-after',
  (api) => <FastDeliveryCheckbox api={api} />
);
