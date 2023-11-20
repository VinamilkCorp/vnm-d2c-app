import { DEFAULT_COUNTRY_CODE } from "~src/configs";
import { replaceOutOfDateAddress } from "./replaceOutOfDateAddress";
import type { ReturnGeocodeAddress, ReturnShopifyAddress } from "./types";

export const initialValues: ReturnGeocodeAddress = {
  ward: "",
  city: "",
  latitude: 0,
  longitude: 0,
  provinceCode: "",
  zip: "",
  street: "",
  streetNumber: "",
  district: "",
  countryCode: "VN",
};

/**
 * The `formatGeocodeAddress` function takes geocode data and formats it into a specific address
 * format.
 * @param {any} geocodeData - The `geocodeData` parameter is an object that contains the geocode data
 * obtained from a geocoding API. It typically includes the following properties:
 * @returns the formatted address data in the format specified by the `formatAddressShopify` function.
 */
export const formatGeocodeAddress = (geocodeData: any) => {
  const {
    address_components = [],
    formatted_address = "",
    geometry = {},
  } = geocodeData;

  const addressComponent: any = address_components?.reverse() || []; // 'address_component' from PlaceApi - Autocomplete

  const formattedAddress: string = replaceOutOfDateAddress(formatted_address); // 'formatted_address' from PlaceApi - Details

  if (!addressComponent?.length) {
    return initialValues;
  }

  if (!formattedAddress || !formattedAddress?.split(", ")?.length) {
    return initialValues;
  }

  const data = {
    ...initialValues,
    // fullAddress: formattedAddress,
    latitude: geometry?.location?.lat,
    longitude: geometry?.location?.lng,
  };

  const formattedAddressSplit = formattedAddress?.split(", ")?.reverse();

  const postalCode =
    addressComponent.find((ele: { types: string[] }) =>
      ele.types.includes("postal_code"),
    )?.long_name || "";

  addressComponent.forEach((_: any, index: number) => {
    const itemLongName = addressComponent[index]?.long_name || ""; // Value of address_component (Place Details)

    const itemFormattedAddress = formattedAddressSplit[index] || ""; // Value of formatted_address (Place Details)

    if (
      addressComponent[index]?.types?.some(
        (ele: string) => ele === "street_number" || ele === "premise",
      )
    ) {
      Object.assign(data, {
        streetNumber: itemLongName || "",
      });
    }

    if (addressComponent[index]?.types?.includes("route")) {
      Object.assign(data, {
        street: itemLongName || "",
      });
    }

    const dataByIndexing = () => {
      if (itemLongName === postalCode) {
        return itemFormattedAddress;
      }

      if (itemFormattedAddress === itemLongName) {
        return itemFormattedAddress;
      }

      if (itemFormattedAddress !== itemLongName) {
        return itemFormattedAddress;
      }

      return itemFormattedAddress;
    };

    switch (index) {
      case 0: // Country - (country - Place Types)
        const country = dataByIndexing();

        Object.assign(data, { country });
        break;

      case 1: // City (administrative_area_level_1 - Place Types)
        const city = postalCode
          ? dataByIndexing().replace(` ${postalCode}`, "")
          : dataByIndexing() || "";

        Object.assign(data, { city });
        break;

      case 2: // District (administrative_area_level_2 - Place Types)
        const district = postalCode
          ? dataByIndexing().replace(` ${postalCode}`, "")
          : dataByIndexing();

        Object.assign(data, { district });

        break;

      case 3: // Ward (administrative_area_level_3 - Place Types)
        const ward = dataByIndexing() || "";

        Object.assign(data, { ward });

        break;

      default:
        break;
    }
  });
  return formatAddressShopify(data);
};

/**
 * The function `formatAddressShopify` takes in an object containing address information and returns a
 * formatted address object compatible with Shopify's address fields.
 * @param {ReturnGeocodeAddress} values - The `values` parameter is an object of type
 * `ReturnGeocodeAddress`. It contains the following properties:
 * @returns The function `formatAddressShopify` returns an object of type `ReturnShopifyAddress`.
 */
export const formatAddressShopify = (
  values: ReturnGeocodeAddress,
): ReturnShopifyAddress => {
  const {
    streetNumber = "",
    street = "",
    district = "",
    ward = "",
    ...rest
  } = values;

  const address1: string = `${ward}, ${street}, ${district}`; // Create Shopify field address1

  const address2: string = streetNumber ? `${streetNumber}` : ""; // Create Shopify field address2

  return {
    address1,
    address2,
    city: rest.city || "",
    countryCode: rest.countryCode || DEFAULT_COUNTRY_CODE,
    latitude: rest.latitude.toString() || "",
    longitude: rest.longitude.toString() || "",
    provinceCode: rest.provinceCode as string,
  };
};
