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
  props: Props<Target>
) {
  const { api } = props;

  const [addressError, setAddressError] = useState<string>("");

  const [geoCodeData, setGeoCodeData] = useState<any>(null);

  const [addressId, setAddressId] = useState<string>("");

  const shippingAddress = useShippingAddress();

  const applyShippingAddressChange = useApplyShippingAddressChange();

  const canBlockProgress = useExtensionCapability("block_progress");

  const translate = useTranslate();

  useEffect(() => {
    const addressFormatted = shippingAddress?.address1
      ? `${shippingAddress?.address2 || ""} ${shippingAddress?.address1} ${
          shippingAddress?.city
        }`
      : "";

    const sParameter = encodeURIComponent(addressFormatted.trim());

    const queryApi = async () => {
      const appDomain = process.env.SHOPIFY_APP_URL;

      // const appDomain = "https://qpt3bpb4-3000.asse.devtunnels.ms";

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

        if (data?.status !== GeoCodeStatus.OK) {
          setAddressError(translate(`geocode-status-err.${data?.status}`));
        }

        if (data && data?.results) {
          const isPartialMatch = data?.results?.some(
            (ele: any) => ele?.partial_match
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

    if (canBlockProgress && addressFormatted) {
      queryApi();
    }
  }, [translate, shippingAddress, api.sessionToken, canBlockProgress]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress) {
      if (shippingAddress?.countryCode !== "VN") {
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

      if (geoCodeData && geoCodeData?.length) {
        return {
          behavior: "block",
          reason: "Invalid shipping address",
          perform: () => {
            setAddressError(translate("invalid-shipping-address"));
          },
        };
      }
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
      (ele: any) => ele.place_id === addressId
    );

    const formatAddress = Object.assign(
      shippingAddress as MailingAddress,
      formatGeocodeAddress(choiceAddress)
    );

    try {
      await applyShippingAddressChange?.({
        type: "updateShippingAddress",
        address: {
          ...formatAddress,
        },
      });
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

// export default AddressValidation;
