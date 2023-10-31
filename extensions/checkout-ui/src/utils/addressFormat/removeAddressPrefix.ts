
/**
 * The function removes common prefixes used for address in Vietnam and cleans up the resulting
 * string.
 * @param {string} address - The `address` parameter is a string that represents the name of a
 * address.
 * @returns The function `removeAddressPrefix` returns a modified version of the `province` string
 * with any prefix (such as 'Thành phố', 'TP', etc.) removed, and any special characters replaced with
 * spaces.
 */
export const removeAddressPrefix = (address: string) => {
  if (!address || typeof address !== "string") return ''

  const prefix = ['Thành phố', 'Thành Phố', 'thành phố', 'TP', 'tp', 'tx', 'tt'];

  const isValid = prefix.some((ele) => address.includes(ele));

  if (!isValid) {
    return address;
  }

  let newText = '';

  newText = prefix
    .map((item) => address.includes(item) && address.replace(item, ''))
    .filter(Boolean)
    .toString();

  newText = newText.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' ',
  );

  newText = newText.replace(/ + /g, ' ');

  newText = newText.trim();

  return newText.replace(/\s/g, ' ');
};
