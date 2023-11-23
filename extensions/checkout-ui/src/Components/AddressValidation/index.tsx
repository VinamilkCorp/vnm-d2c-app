import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useBuyerJourneyIntercept,
  Button,
  useApplyShippingAddressChange,
  BlockStack,
  ChoiceList,
  Choice,
  Text,
  Grid,
  useShippingAddress,
  useTranslate,
  useSessionToken,
  useExtension,
} from "@shopify/ui-extensions-react/checkout";
import { formatGeocodeAddress } from "~src/utils";
import { GeoCodeStatus } from "~src/configs";
import type { ReturnShopifyAddress } from "~src/utils/addressFormat/types";

const AddressValidation = () => {
  const translate = useTranslate();

  const applyShippingAddressChange = useApplyShippingAddressChange();

  const extension = useExtension();

  const sessionToken = useSessionToken();

  const [addressError, setAddressError] = useState<string>("");

  const [geoCodeData, setGeoCodeData] = useState<any>(null);

  const [shouldFetch, setShouldFetch] = useState<boolean>(true);

  const [addressId, setAddressId] = useState<string>("");

  const [isAllowProgress, setIsAllowProgress] = useState<boolean>(false);

  const shippingAddress = useShippingAddress();

  const appDomain =
    process.env.NODE_ENV === "development"
      ? new URL(extension.scriptUrl)?.origin
      : process.env.SHOPIFY_APP_URL;

  const handleResetProgress = () => {
    setGeoCodeData([]);
    setAddressError("");
    setShouldFetch(false);
  };

  const handelAllowProgress = useCallback(() => {
    handleResetProgress();

    setIsAllowProgress(true);
  }, []);

  const addressFormatted = useMemo(() => {
    const address = [
      shippingAddress?.address2 || "",
      shippingAddress?.address1 || "",
      shippingAddress?.city || "",
    ];

    return address.filter(Boolean)?.toString();
  }, [shippingAddress]);

  const handleAddressData = useCallback(
    (data: any) => {
      if (data?.status !== GeoCodeStatus.OK) {
        setAddressError(translate(`geocode-status-err.${data?.status}`));
      }

      if (data && data?.results) {
        const isPartialMatch = data?.results?.some(
          (ele: any) => ele?.partial_match,
        );

        if (data?.results?.length > 1 || isPartialMatch) {
          setGeoCodeData(data?.results);
          setAddressError(translate("geocode-not-match-address"));
        } else {
          handelAllowProgress();
        }
      } else {
        handelAllowProgress();
      }
    },
    [handelAllowProgress, translate],
  );

  const handleFetchAddress = useCallback(async () => {
    if (!addressFormatted) return;

    try {
      const sParameter = encodeURIComponent(addressFormatted.trim());

      setShouldFetch(false);

      const token = await sessionToken.get();

      const res = await fetch(
        `${appDomain}/api/geocode?address=${sParameter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
        },
      );
      const data = await res.json();

      handleAddressData(data);
    } catch (error) {
      console.log("error", error);
    }
  }, [addressFormatted, sessionToken, appDomain, handleAddressData]);

  useEffect(() => {
    setShouldFetch(true);

    setIsAllowProgress(false);
  }, [addressFormatted]);

  useEffect(() => {
    if (!isAllowProgress && shouldFetch) {
      handleFetchAddress();
    }
  }, [handleFetchAddress, isAllowProgress, shouldFetch]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
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

    if (isAllowProgress) {
      return {
        behavior: "allow",
        perform: handleResetProgress,
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
      perform: handelAllowProgress,
    };
  });

  const addressSuggestRender = () => {
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

    const addressApply = formatGeocodeAddress(
      choiceAddress,
    ) as ReturnShopifyAddress;

    const newAddress = {
      // ...formatAddress,
      address1: addressApply?.address1,
      city: addressApply?.city,
    };

    try {
      const result = await applyShippingAddressChange?.({
        type: "updateShippingAddress",
        address: newAddress,
      });

      if (result?.type === "success") {
        handelAllowProgress();
      }
    } catch (error) {
      console.error(error);
      handelAllowProgress();
    }
  };

  if (isAllowProgress) return <></>;

  return (
    <BlockStack padding="tight" border="base" borderRadius="base">
      <Text appearance="critical">{addressError}</Text>
      <ChoiceList
        name="choice"
        value="first"
        onChange={(value: string) => setAddressId(value)}
      >
        <BlockStack>{addressSuggestRender()}</BlockStack>
      </ChoiceList>

      <Grid spacing={["base", "none"]} columns={["50%", "50%"]}>
        <Button
          kind="plain"
          accessibilityRole="button"
          onPress={handelAllowProgress}
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
};

export default AddressValidation;
