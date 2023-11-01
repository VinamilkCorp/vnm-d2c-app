import { useCallback, useState } from "react";
import {
  useBuyerJourneyIntercept,
  Button,
  useShippingAddress,
  useApplyShippingAddressChange,
  BlockStack,
  ChoiceList,
  Choice,
  Text,
} from "@shopify/ui-extensions-react/checkout";
import { formatGeocodeAddress } from "~src/utils";
import type {
  CheckoutApi,
  ExtensionTargets,
  MailingAddress,
  RenderExtensionTarget,
  StandardApi,
} from "@shopify/ui-extensions/checkout";

type Props<Target extends keyof ExtensionTargets> = {
  api: StandardApi<Target> & CheckoutApi;
};

export default function AddressValidation<Target extends RenderExtensionTarget>(
  props: Props<Target>
) {
  const { api } = props;

  console.log('props', props);

  const [showError, setShowError] = useState<boolean>(false);

  const [geoCodeData, setGeoCodeData] = useState<any>(null);

  const [addressId, setAddressId] = useState<string>("");

  const applyShippingAddressChange = useApplyShippingAddressChange();

  const shippingAddress = useShippingAddress();

  const addressFormatted = `${shippingAddress?.address2 || ""} ${
    shippingAddress?.address1
  } ${shippingAddress?.city}`;

  const sParameter = encodeURIComponent(addressFormatted.trim());

  const queryApi = useCallback(async () => {
    const appDomain = process.env.SHOPIFY_APP_URL;

    try {
      const token = await api.sessionToken.get();

      const res = await fetch(
        `${appDomain}/api/geocode?address=${sParameter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (data && data?.results?.length > 1) {
        setGeoCodeData(data?.results);
        setShowError(true);
      }

      return data;
    } catch (error) {
      console.log("error", error);
    }
  }, [sParameter, api.sessionToken]);

  // Use the `buyerJourney` intercept to conditionally block checkout progress
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress) {
      queryApi();
    }

    if (canBlockProgress && !geoCodeData) {
      return {
        behavior: "allow",
      };
    }

    if (canBlockProgress && shippingAddress?.countryCode !== "VN") {
      return {
        behavior: "block",
        reason: "Invalid shipping country",
        errors: [
          {
            message: "Sorry, we can only ship to Canada",
            target: "$.cart.deliveryGroups[0].deliveryAddress.countryCode",
          },
          {
            message: "Please use a different address.",
          },
        ],
      };
    }

    return canBlockProgress && geoCodeData && geoCodeData?.length > 1
      ? {
          behavior: "block",
          reason: "Invalid shipping address",
          perform: () => {
            setShowError(true);
          },
        }
      : {
          behavior: "allow",
          perform: () => {
            setShowError(false);
          },
        };
  });

  const addressChoiceRender = () => {
    return geoCodeData?.map((item: any) => {
      if (item?.address_components?.length <= 4) return <></>;

      return (
        <Choice key={item.place_id} id={item.place_id}>
          {item.formatted_address}
        </Choice>
      );
    });
  };

  const handleOnSubmitChoseAddress = async () => {
    const choiceAddress = geoCodeData.find(
      (ele: any) => ele.place_id === addressId
    );

    const formatAddress = Object.assign(
      shippingAddress as MailingAddress,
      formatGeocodeAddress(choiceAddress)
    );

    try {
      const result = await applyShippingAddressChange?.({
        type: "updateShippingAddress",
        address: {
          ...formatAddress,
        },
      });

      console.log("result", result);

      if (result?.type === "success") {
        setGeoCodeData([]);
        setShowError(false);
      }

      setGeoCodeData([]);
    } catch (error) {
      console.log("error", error);
    }
  };

  if (!showError) return <></>;

  return (
    <BlockStack padding="tight" border="base" borderRadius="base">
      <Text appearance="critical">
        {
          "Chúng tôi không tìm được địa chỉ của bạn, bạn có thể chọn địa chỉ thay thế hoặc chỉnh sửa thông tin vị trí của bạn"
        }
      </Text>
      <ChoiceList
        name="choice"
        value="first"
        onChange={(value: string) => setAddressId(value)}
      >
        <BlockStack>{addressChoiceRender()}</BlockStack>
      </ChoiceList>

      <Button
        accessibilityRole="button"
        disabled={!addressId}
        onPress={handleOnSubmitChoseAddress}
      >
        Xác nhận địa chỉ mới
      </Button>
    </BlockStack>
  );
}

// export default AddressValidation;
