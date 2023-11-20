import { useEffect, useState } from "react";
import {
  useBuyerJourneyIntercept,
  Button,
  useApplyShippingAddressChange,
  BlockStack,
  ChoiceList,
  Choice,
  Text,
  Grid,
  useExtensionCapability,
  useShippingAddress,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import { formatGeocodeAddress } from "~src/utils";
import type {
  CheckoutApi,
  ExtensionTargets,
  MailingAddress,
  RenderExtensionTarget,
  StandardApi,
} from "@shopify/ui-extensions/checkout";
import { GeoCodeStatus } from "~src/configs";

type Props<Target extends keyof ExtensionTargets> = {
  api: StandardApi<Target> & CheckoutApi;
};

export default function AddressValidation<Target extends RenderExtensionTarget>(
  props: Props<Target>,
) {
  const { api } = props;

  const [addressFormatted, setAddressFormatted] = useState<string>("");

  const [addressError, setAddressError] = useState<string>("");

  const [geoCodeData, setGeoCodeData] = useState<any>(null);

  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  const [addressId, setAddressId] = useState<string>("");

  const shippingAddress = useShippingAddress();

  const applyShippingAddressChange = useApplyShippingAddressChange();

  const canBlockProgress = useExtensionCapability("block_progress");

  const translate = useTranslate();

  const appDomain =
    process.env.NODE_ENV === "development"
      ? new URL(api.extension.scriptUrl)?.origin
      : process.env.SHOPIFY_APP_URL;

  useEffect(() => {
    const addressFormatted = shippingAddress?.address1
      ? `${
          shippingAddress?.address2 || ""
        } ${shippingAddress?.address1} ${shippingAddress?.city}`
      : "";

    setAddressFormatted(addressFormatted);
  }, [shippingAddress]);

  useEffect(() => {
    const sParameter = encodeURIComponent(addressFormatted.trim());

    const queryApi = async () => {
      setShouldFetch(false);

      try {
        const token = await api.sessionToken.get();

        const res = await fetch(
          `${appDomain}/api/geocode?address=${sParameter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await res.json();

        if (data?.status !== GeoCodeStatus.OK) {
          setAddressError(translate(`geocode-status-err.${data?.status}`));
        }

        if (data && data?.results) {
          const isPartialMatch = data?.results?.some(
            (ele: any) => ele?.partial_match,
          );

          if (isPartialMatch) {
            setGeoCodeData(data?.results);
            setAddressError(translate("geocode-not-match-address"));
          } else {
            setGeoCodeData([]);
            setAddressError("");
          }
        } else {
          setGeoCodeData([]);
          setAddressError("");
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    if (canBlockProgress && addressFormatted && shouldFetch) {
      queryApi();
    }
  }, [
    translate,
    api.sessionToken,
    appDomain,
    addressFormatted,
    canBlockProgress,
    shouldFetch,
  ]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress) {
      setShouldFetch(canBlockProgress);

      if (api?.shippingAddress?.current?.countryCode !== "VN") {
        return {
          behavior: "block",
          reason: "Invalid shipping country",
          errors: [
            {
              message: translate("only-delivery-vietnam"),
              target: "$.cart.deliveryGroups[0].deliveryAddress.countryCode",
            },
          ],
        };
      }

      if (geoCodeData?.length) {
        return {
          behavior: "block",
          reason: "Invalid shipping address",
          perform: () => {
            setAddressError(translate("invalid-shipping-address"));
          },
        };
      }

      return {
        behavior: "allow",
        perform: () => {
          setAddressError("");
        },
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        setAddressError("");
      },
    };
  });

  const addressChoiceRender = () => {
    return geoCodeData?.map((item: any) => {
      return (
        <Choice key={item.place_id} id={item.place_id}>
          {item.formatted_address}
        </Choice>
      );
    });
  };

  const handleOnSubmitChoseAddress = async () => {
    const choiceAddress = geoCodeData.find(
      (ele: any) => ele.place_id === addressId,
    );

    const addressApply = formatGeocodeAddress(choiceAddress);

    // const formatAddress = Object.assign(shippingAddress as MailingAddress, {
    //   ...addressApply,
    // formatted: [
    //   shippingAddress?.phone,
    //   shippingAddress?.firstName,
    //   shippingAddress?.lastName,
    //   addressApply?.address2,
    //   addressApply?.address1,
    //   addressApply?.city,
    // ],
    // });

    const newAddress = {
      // ...formatAddress,
      address1: addressApply?.address1,
      address2: addressApply?.address2,
      city: addressApply?.city,
      countryCode: addressApply?.countryCode || "VN",
      // latitude: addressApply?.latitude,
      // longitude: addressApply?.longitude,
      provinceCode: addressApply?.provinceCode,
    };

    try {
      const result = await applyShippingAddressChange?.({
        type: "updateShippingAddress",
        address: newAddress,
      });

      console.log("applyShippingAddressChange", result);

      if (result?.type === "success") {
        setGeoCodeData([]);
        setAddressError("");
        setAddressFormatted("");
      }

      console.log("shippingAddress", shippingAddress);
    } catch (error) {
      console.error(error);
    }
  };

  if (!addressError) return <></>;

  return (
    <BlockStack padding="tight" border="base" borderRadius="base">
      <Text appearance="critical">{addressError}</Text>
      <ChoiceList
        name="choice"
        value="first"
        onChange={(value: string) => setAddressId(value)}
      >
        <BlockStack>{addressChoiceRender()}</BlockStack>
      </ChoiceList>

      <Grid spacing={["base", "none"]} columns={["50%", "50%"]}>
        <Button
          kind="plain"
          accessibilityRole="button"
          onPress={() => setAddressError("")}
        >
          {translate("continue-payment")}
        </Button>

        <Button
          accessibilityRole="button"
          disabled={!addressId}
          onPress={handleOnSubmitChoseAddress}
        >
          {translate("confirm-new-shipping-address")}
        </Button>
      </Grid>
    </BlockStack>
  );
}
