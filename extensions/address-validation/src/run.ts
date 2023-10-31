// @ts-check

import type { RunInput } from "../generated/api";
import { AddressErrorTargets } from "./constants";

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

// The configured entrypoint for the 'purchase.validation.run' extension target
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

type AddressError = {
  localizedMessage: string | any;
  target: AddressErrorTargets;
};

export function run(input: RunInput) {
  const errors: Array<AddressError> = [];

  const {
    cart: { deliveryGroups },
  } = input;

  if (!deliveryGroups?.length && !deliveryGroups[0]?.deliveryAddress) {
    return { errors };
  }

  const deliveryAddress = deliveryGroups[0]?.deliveryAddress;

  if ((deliveryAddress?.address1 as string)?.length > 10) {
    const addressError = {
      localizedMessage: AddressErrorTargets.Address1,
      target: AddressErrorTargets.Address1,
    };

    errors.push(addressError);
  }

  return { errors };
}
