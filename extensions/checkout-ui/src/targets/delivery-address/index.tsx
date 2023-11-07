import { reactExtension } from "@shopify/ui-extensions-react/checkout";
import { AddressValidation } from "~src/Components";

const enum DeliveryAddressTargets {
  RenderBefore = "purchase.checkout.delivery-address.render-before",
  RenderAfter = "purchase.checkout.delivery-address.render-after",
}

const extensionRenderAfter = reactExtension(
  DeliveryAddressTargets.RenderAfter,
  (api) => <AddressValidation api={api} />
);

const DeliveryAddressExtensions = {
  extensionRenderAfter,
};

export default DeliveryAddressExtensions;
