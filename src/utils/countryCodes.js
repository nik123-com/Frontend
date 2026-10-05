// List of country dial codes with flags and country names
export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "United States / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+7", country: "Russia / Kazakhstan", flag: "🇷🇺" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" }
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
