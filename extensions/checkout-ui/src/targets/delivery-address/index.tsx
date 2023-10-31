import { reactExtension } from "@shopify/ui-extensions-react/checkout";
import { AddressValidation } from "~src/Components";

const enum DeliveryAddressTargets {
  RenderBefore = "purchase.checkout.delivery-address.render-before",
  RenderAfter = "purchase.checkout.delivery-address.render-after",
}

// const extensionRenderAfter = extension(
//   DeliveryAddressTargets.RenderAfter,
//   (root, api) => {
//     console.log("root", root);
//     console.log("api", api);

//     const inlineStack = root.createComponent(
//       InlineStack,
//       {
//         spacing: "base",
//       },
//       [
//         root.createComponent(View, { border: "base", padding: "base" }, "View"),
//         root.createComponent(View, { border: "base", padding: "base" }, "View"),
//         root.createComponent(View, { border: "base", padding: "base" }, "View"),
//         root.createComponent(View, { border: "base", padding: "base" }, "View"),
//       ]
//     );

//     root.replaceChildren(inlineStack);

//     // root.appendChild(inlineStack);
//   }
// );

// extension(DeliveryAddressTargets.RenderBefore, (root, api) => {
//   renderApp(root, api);

//   api.shippingAddress.subscribe(() => renderApp(root, api));
// });

// function renderApp(root, api) {
//   const { countryCode } = api.shippingAddress.current;
//   console.log("countryCode", countryCode);
//   console.log("api", api);
//   console.log("api.ui", api.ui.overlay);
//   // In case of a re-render, remove previous children.
//   for (const child of root.children) {
//     root.removeChild(child);
//   }
//   if (countryCode !== "CA") {
//     const banner = root.createComponent(
//       Banner,
//       {},
//       "Sorry, we can only ship to Viet Nam at this time"
//     );
//     root.appendChild(banner);
//   }
// }

const extensionRenderAfter = reactExtension(
  DeliveryAddressTargets.RenderAfter,
  (api) => <AddressValidation api={api} />
);

const DeliveryAddressExtensions = {
  extensionRenderAfter,
};

export default DeliveryAddressExtensions;
