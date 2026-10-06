import React from "react";
import { COUNTRY_CODES } from "../../utils/countryCodes";

export default function PhoneInputLayout({
  label = "Contact / Mobile Number",
  countryCode = "+91",
  phoneDigits = "",
  phoneError = "",
  onCountryCodeChange,
  onPhoneChange,
  placeholder = "9779843211",
  required = false,
  disabled = false,
  className = "mb-4",
}) {
  const currentDigits = phoneDigits || "";

  return (
    <div className={className}>
      {/* Top Label & Counter Row */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <span className="text-muted small" style={{ fontSize: "12px", letterSpacing: "0.2px" }}>
          {currentDigits.length}/10 digits
        </span>
      </div>

      {/* Input Field Container */}
      <div
        className="d-flex align-items-center bg-white border rounded-3 overflow-hidden shadow-xs"
        style={{
          borderColor: phoneError ? "#dc3545" : "#e2e8f0",
          borderRadius: "12px",
          minHeight: "48px",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Left Country Code Dropdown */}
        <div
          className="d-flex align-items-center bg-light px-3 py-2 border-end"
          style={{
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
            position: "relative",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          <i
            className="fa-solid fa-phone text-secondary me-2"
            style={{ fontSize: "13px", opacity: 0.8 }}
          ></i>
          <select
            className="form-select border-0 bg-transparent fw-semibold text-dark shadow-none p-0 pe-4"
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "13px",
              width: "auto",
              backgroundImage: "none",
              display: "inline-block",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
            value={countryCode}
            onChange={onCountryCodeChange}
            disabled={disabled}
            aria-label="Country Dial Code"
          >
            {COUNTRY_CODES.map((item) => (
              <option key={`${item.code}-${item.country}`} value={item.code}>
                {item.iso || "IN"} {item.code} ({item.country})
              </option>
            ))}
          </select>
          <i
            className="fa-solid fa-chevron-down text-muted"
            style={{
              fontSize: "10px",
              position: "absolute",
              right: "12px",
              pointerEvents: "none",
            }}
          ></i>
        </div>

        {/* Right Phone Digits Input */}
        <input
          type="tel"
          className="form-control border-0 bg-transparent py-2 px-3 shadow-none text-dark fw-normal"
          style={{
            fontSize: "15px",
            letterSpacing: "0.5px",
          }}
          placeholder={placeholder}
          value={currentDigits}
          onChange={onPhoneChange}
          maxLength={10}
          disabled={disabled}
          autoComplete="tel"
        />
      </div>

      {/* Error Message */}
      {phoneError && (
        <small
          className="text-danger d-block mt-1 fw-semibold"
          style={{ fontSize: "12px" }}
        >
          <i className="fa-solid fa-circle-exclamation me-1"></i>
          {phoneError}
        </small>
      )}

      {/* Stored Format Helper */}
      <small className="text-muted d-block mt-1 ps-1" style={{ fontSize: "12px" }}>
        Stored format:{" "}
        <span className="text-secondary fw-semibold">
          {currentDigits ? `${countryCode}-${currentDigits}` : `${countryCode}-9779843211`}
        </span>{" "}
        (Maximum 10 digits)
      </small>
    </div>
  );
}
