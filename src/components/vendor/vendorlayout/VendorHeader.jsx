import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTimeGreeting, getSalutation } from "../../../utils/greetingUtils";

export default function VendorHeader({ vendor }) {
  const navigate = useNavigate();
  const [timeGreeting, setTimeGreeting] = useState(() => getTimeGreeting());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeGreeting(getTimeGreeting());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    toast.info("Logged out successfully");
    navigate("/");
  };

  const salutation = getSalutation(vendor?.gender || sessionStorage.getItem("gender") || "");
  const ownerGreeting = `${timeGreeting.greeting}, ${salutation ? salutation + " " : ""}${vendor?.ownerName || "Vendor"}`;

  return (
    <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm flex-wrap gap-2">
      <div className="d-flex align-items-center gap-3">
        <h4 className="fw-bold text-dark mb-0">Vendor Portal</h4>
        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
          <i className="fa-solid fa-store me-1"></i> {vendor?.businessName || "Store Dashboard"}
        </span>
      </div>

      {/* Dynamic Time Greeting Badge */}
      <div className="d-none d-lg-flex align-items-center bg-warning-subtle text-dark border border-warning px-3 py-1.5 rounded-pill fw-semibold small shadow-2xs">
        <span className="me-1.5 fs-6">{timeGreeting.icon}</span>
        <span>{ownerGreeting}</span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Contact Info */}
        <div className="text-end d-none d-md-block">
          <div className="fw-semibold text-dark">{vendor?.ownerName}</div>
          <small className="text-muted">{vendor?.email}</small>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
          title="Logout"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="d-none d-md-inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
