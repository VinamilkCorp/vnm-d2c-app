import { reactExtension } from "@shopify/ui-extensions-react/checkout";
import { AddressValidation } from "~src/Components";

const extensionRenderAfter = reactExtension(
  "purchase.checkout.actions.render-before",
  (api) => <AddressValidation />,
);

export default extensionRenderAfter;
