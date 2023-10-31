import type { RenderExtensionTarget } from "@shopify/ui-extensions/checkout";
import type { ReactNode } from "react";

export * from "./delivery-address";
export * from "./delivery-address";

export type TargetConfigsType = {
  target: RenderExtensionTarget;
  component: ReactNode;
};

const TargetConfigsDefined: Array<TargetConfigsType> = [
  {
    target: "purchase.checkout.actions.render-before",
    component: <></>,
  },
  {
    target: "purchase.checkout.shipping-option-list.render-before",
    component: <></>,
  },
  {
    target: "purchase.checkout.shipping-option-list.render-after",
    component: <></>,
  },
];

export default TargetConfigsDefined;
