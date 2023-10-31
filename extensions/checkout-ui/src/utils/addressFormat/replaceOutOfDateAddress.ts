/**
 * The function replaces an out-of-date district in an address with a new district.
 * @param {string} address - The `address` parameter is a string that represents a physical address.
 * @returns The function `replaceOutOfDateAddress` returns a new address string with the out-of-date
 * district replaced by the new master district. If the address does not contain any out-of-date
 * district, the original address is returned.
 */
export const OUT_OF_DATE_MASTER_DISTRICT = ['Quận 2', 'Quận 9'];

export const NEW_MASTER_DISTRICT = 'Thủ Đức';


export const replaceOutOfDateAddress = (address: string) => {
  if (!address || typeof address !== "string") return ''

  const isOutOfDateDistrict = OUT_OF_DATE_MASTER_DISTRICT.find((ele: string) => {
    return address.includes(ele)
  });

  if (!isOutOfDateDistrict) {
    return address
  }

  const newAddress = address.replace(isOutOfDateDistrict, NEW_MASTER_DISTRICT)

  return newAddress;
}
