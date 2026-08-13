export const UAE_PHONE_REGEX = /^(\+9715\d-\d{3}-\d{4}|05\d-\d{3}-\d{4})$/;

export const SUPPLIER_PHONE_ERROR_MESSAGE = "Contact number must be in the format +9715*-***-**** or 05*-***-****";

export function isValidSupplierContact(value: string) {
  return UAE_PHONE_REGEX.test(value.trim());
}
