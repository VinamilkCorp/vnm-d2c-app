import {
  Checkbox,
  useApplyAttributeChange,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import type {
  ExtensionTargets,
  StandardApi,
  CheckoutApi,
} from "@shopify/ui-extensions/checkout";
import { useState } from "react";

type Props<Target extends keyof ExtensionTargets> = {
  api: StandardApi<Target> & CheckoutApi;
};

function FastDeliveryCheckbox<Target extends keyof ExtensionTargets>(
  props: Props<Target>,
) {
  const { api } = props;

  const address = api.shippingAddress?.current;

  const applyAttributeChange = useApplyAttributeChange();

  const translate = useTranslate();

  const [checked, setChecked] = useState<boolean>(false);

  const onCheckboxChange = async (isChecked: boolean) => {
    setChecked(isChecked);

    await applyAttributeChange({
      type: "updateAttribute",
      key: "fastDelivery",
      value: isChecked ? "yes" : "no",
    });
  };

  if (
    address?.provinceCode &&
    ["HCM", "HN"].includes(address?.provinceCode as string)
  ) {
    return (
      <Checkbox checked={checked} onChange={onCheckboxChange}>
        {translate("fast-delivery-2hrs")}
      </Checkbox>
    );
  }
}

export default FastDeliveryCheckbox;
