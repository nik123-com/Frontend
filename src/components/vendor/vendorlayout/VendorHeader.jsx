import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VendorHeader({ vendor }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="bg-white border-bottom shadow-sm">
      {/* Reversed Topbar */}
      <div className="px-3 pt-2 d-none d-lg-block">
        <div className="topbar-reversed bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            {/* Left side: Policy Links (Reversed position) */}
            <div className="top-link ps-3">
              <a href="/assets/privacyPolicy/Privacy.pdf" target="_blank" rel="noreferrer" className="text-white">
                <small className="text-white mx-2">Privacy Policy</small>/
              </a>
              <a href="/assets/Terms of use/Terms of Use.pdf" target="_blank" rel="noreferrer" className="text-white">
                <small className="text-white mx-2">Terms of Use</small>/
              </a>
              <a href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf" target="_blank" rel="noreferrer" className="text-white">
                <small className="text-white ms-2">Sales and Refunds</small>
              </a>
            </div>

            {/* Right side: Contact Info (Reversed position) */}
            <div className="top-info pe-3">
              <small className="me-4 d-flex align-items-center gap-1">
                <i className="fas fa-map-marker-alt text-secondary" />{" "}
                <a href="https://maps.app.goo.gl/J85uiPMzs2s3Vfu1A" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                  123 Model Town, Jalandhar
                </a>
              </small>
              <small className="d-flex align-items-center gap-1">
                <i className="fas fa-envelope text-secondary" />
                <a href={`mailto:${vendor?.email || "admin@gmail.com"}`} className="text-white text-decoration-none">
                  {vendor?.email || "admin@gmail.com"}
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Vendor Header Bar (Reversed Flex Direction) */}
      <div className="px-4 py-3 d-flex justify-content-between align-items-center">
        {/* Left Side (Reversed): Profile & Logout Action */}
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={handleLogout}
            className="btn btn-primary text-white rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm border-0"
            title="Logout"
            style={{ backgroundColor: "#81c408" }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>

          {vendor?.ownerName && (
            <div className="d-none d-md-block text-start ps-2 border-start">
              <div className="fw-bold text-dark fs-6">{vendor?.ownerName}</div>
              <small className="text-muted">Vendor Owner</small>
            </div>
          )}
        </div>

        {/* Center: Vendor Badge & Status */}
        <div className="d-none d-md-flex align-items-center gap-2">
          <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill fs-7 fw-semibold">
            <i className="fa-solid fa-store me-1"></i> {vendor?.businessName || "Store Dashboard"}
          </span>
          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill fs-7 fw-semibold">
            <i className="fa-solid fa-circle-check me-1"></i> Approved Seller
          </span>
        </div>

        {/* Right Side (Reversed): Brand & Logo */}
        <div className="d-flex align-items-center gap-2">
          <h1 className="text-primary display-6 mb-0 fw-bold fs-3">Aventra</h1>
          <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "40px" }} />
        </div>
      </div>
    </header>
  );
}
