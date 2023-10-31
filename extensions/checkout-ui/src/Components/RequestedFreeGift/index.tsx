import {
  Checkbox,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";

export default function RequestedFreeGift() {

  console.log('RequestedFreeGift,');

  const applyAttributeChange = useApplyAttributeChange();

  // 2. Render a UI
  return (
    <Checkbox onChange={onCheckboxChange}>
      I would like to receive a free gift with my order
    </Checkbox>
  );

  // 3. Call API methods to modify the checkout
  async function onCheckboxChange(isChecked) {
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}
