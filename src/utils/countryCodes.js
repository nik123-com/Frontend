// List of country dial codes with flags and country names
export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", iso: "IN" },
  { code: "+1", country: "United States / Canada", flag: "🇺🇸", iso: "US" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", iso: "GB" },
  { code: "+971", country: "UAE", flag: "🇦🇪", iso: "AE" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", iso: "SA" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", iso: "SG" },
  { code: "+61", country: "Australia", flag: "🇦🇺", iso: "AU" },
  { code: "+974", country: "Qatar", flag: "🇶🇦", iso: "QA" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼", iso: "KW" },
  { code: "+968", country: "Oman", flag: "🇴🇲", iso: "OM" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭", iso: "BH" },
  { code: "+49", country: "Germany", flag: "🇩🇪", iso: "DE" },
  { code: "+33", country: "France", flag: "🇫🇷", iso: "FR" },
  { code: "+39", country: "Italy", flag: "🇮🇹", iso: "IT" },
  { code: "+34", country: "Spain", flag: "🇪🇸", iso: "ES" },
  { code: "+81", country: "Japan", flag: "🇯🇵", iso: "JP" },
  { code: "+86", country: "China", flag: "🇨🇳", iso: "CN" },
  { code: "+82", country: "South Korea", flag: "🇰🇷", iso: "KR" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", iso: "MY" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", iso: "ID" },
  { code: "+63", country: "Philippines", flag: "🇵🇭", iso: "PH" },
  { code: "+66", country: "Thailand", flag: "🇹🇭", iso: "TH" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳", iso: "VN" },
  { code: "+977", country: "Nepal", flag: "🇳🇵", iso: "NP" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", iso: "BD" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", iso: "LK" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", iso: "PK" },
  { code: "+7", country: "Russia / Kazakhstan", flag: "🇷🇺", iso: "RU" },
  { code: "+27", country: "South Africa", flag: "🇿🇦", iso: "ZA" },
  { code: "+55", country: "Brazil", flag: "🇧🇷", iso: "BR" },
  { code: "+52", country: "Mexico", flag: "🇲🇽", iso: "MX" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿", iso: "NZ" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭", iso: "CH" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱", iso: "NL" },
  { code: "+46", country: "Sweden", flag: "🇸🇪", iso: "SE" },
  { code: "+47", country: "Norway", flag: "🇳🇴", iso: "NO" },
  { code: "+48", country: "Poland", flag: "🇵🇱", iso: "PL" },
  { code: "+90", country: "Turkey", flag: "🇹🇷", iso: "TR" }
];

/**
 * Filter phone number input: allows only digits and restricts strictly to maximum 10 digits.
 */
export function sanitizePhoneNumber(value) {
  if (!value) return "";
  return String(value).replace(/\D/g, "").slice(0, 10);
}

/**
 * Parse an existing contact string (e.g. "+91-9779843211", "+91 9779843211", "+919779843211", or "9779843211")
 * into its countryCode and 10-digit phoneNumber components.
 */
export function splitContact(rawContact) {
  if (!rawContact || typeof rawContact !== "string") {
    return { countryCode: "+91", phoneNumber: "" };
  }

  const trimmed = rawContact.trim();
  if (!trimmed) {
    return { countryCode: "+91", phoneNumber: "" };
  }

  // Case 1: Contains hyphen or space separator e.g. "+91-9779843211" or "+91 9779843211"
  if (trimmed.includes("-") || trimmed.includes(" ")) {
    const parts = trimmed.split(/[- ]+/);
    if (parts.length >= 2) {
      let code = parts[0].startsWith("+") ? parts[0] : `+${parts[0]}`;
      // Verify if code exists or is valid dial code format
      const matched = COUNTRY_CODES.find((c) => c.code === code);
      const countryCode = matched ? matched.code : (code.startsWith("+") ? code : "+91");
      const phoneNumber = sanitizePhoneNumber(parts.slice(1).join(""));
      return { countryCode, phoneNumber };
    }
  }

  // Case 2: Starts with + but no separator, e.g. "+919779843211"
  if (trimmed.startsWith("+")) {
    // Sort known codes by length descending so longer codes match first (e.g. +971 before +9)
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const item of sortedCodes) {
      if (trimmed.startsWith(item.code)) {
        const remaining = trimmed.substring(item.code.length);
        const phoneNumber = sanitizePhoneNumber(remaining);
        return { countryCode: item.code, phoneNumber };
      }
    }
  }

  // Case 3: Raw digits only e.g. "9779843211"
  return {
    countryCode: "+91",
    phoneNumber: sanitizePhoneNumber(trimmed)
  };
}

/**
 * Format countryCode and phoneNumber into standard format: "+91-9779843211"
 */
export function formatContact(countryCode, phoneNumber) {
  const code = (countryCode || "+91").trim();
  const phone = sanitizePhoneNumber(phoneNumber);
  if (!phone) return "";
  return `${code}-${phone}`;
}

/**
 * Validate phone number digits:
 * - Must be digits only
 * - Must not exceed 10 digits
 * - Must be exactly 10 digits
 */
export function validatePhoneNumber(phoneNumber, isRequired = true) {
  if (!phoneNumber || !phoneNumber.trim()) {
    if (isRequired) {
      return { isValid: false, error: "Contact / Mobile number is required." };
    }
    return { isValid: true, error: "" };
  }

  const digits = sanitizePhoneNumber(phoneNumber);

  if (digits.length === 0) {
    return { isValid: false, error: "Contact number must contain digits only." };
  }

  if (digits.length < 10) {
    return { isValid: false, error: `Contact number must be exactly 10 digits (currently ${digits.length}).` };
  }

  if (digits.length > 10) {
    return { isValid: false, error: "Contact number should not exceed 10 digits." };
  }

  return { isValid: true, error: "" };
}
