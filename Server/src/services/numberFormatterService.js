import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function numberFormatterService(phoneNumber, countryCode) {
  try {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
    return parsedNumber ? parsedNumber.format("E.164") : null;
  } catch (error) {
    console.error("Error parsing or formatting phone number:", error);
    return null;
  }
}

