export const SUPPLIER_PHONE_ERROR_MESSAGE = "Contact number must be at least 7 characters.";

export function isValidSupplierContact(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 7;
}
