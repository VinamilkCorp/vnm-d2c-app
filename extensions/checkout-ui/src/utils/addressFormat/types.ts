import type { CountryCode } from "@shopify/ui-extensions/checkout";

export type ReturnShopifyAddress = {
  address1: string;
  address2: string;
  city: string;
  company?: string;
  countryCode: CountryCode;
  latitude: string;
  longitude: string;
  provinceCode: string;
};

export type ReturnGeocodeAddress = {
  street: string;
  streetNumber: string | number;
  ward: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  provinceCode?: string;
  countryCode: CountryCode;
  zip: string;
};
