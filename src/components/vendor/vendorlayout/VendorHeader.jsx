import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VendorHeader({ vendor }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <h4 className="fw-bold text-dark mb-0">Vendor Portal</h4>
        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
          <i className="fa-solid fa-store me-1"></i> {vendor?.businessName || "Store Dashboard"}
        </span>
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
