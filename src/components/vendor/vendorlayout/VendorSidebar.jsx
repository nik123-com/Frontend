import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function VendorSidebar({ vendor }) {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { label: "Dashboard", path: "/vendor", icon: "fa-gauge-high" },
    { label: "Products", path: "/vendor/products", icon: "fa-box-open" },
    { label: "Orders", path: "/vendor/orders", icon: "fa-shopping-cart" },
    { label: "Inventory", path: "/vendor/inventory", icon: "fa-warehouse" },
    { label: "Coupons", path: "/vendor/coupons", icon: "fa-ticket" },
    { label: "Reviews", path: "/vendor/reviews", icon: "fa-star" },
    { label: "Wallet & Settlements", path: "/vendor/wallet", icon: "fa-wallet" },
    { label: "Store Settings", path: "/vendor/settings", icon: "fa-sliders" },
  ];

  return (
    <div className="bg-dark text-white p-3 min-vh-100 shadow d-flex flex-column" style={{ width: "260px" }}>
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom border-secondary">
        {vendor?.logo ? (
          <img
            src={vendor.logo}
            alt="Logo"
            className="rounded-circle border border-primary"
            style={{ width: "45px", height: "45px", objectFit: "cover" }}
          />
        ) : (
          <div
            className="bg-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-white fs-5"
            style={{ width: "45px", height: "45px" }}
          >
            {vendor?.businessName?.charAt(0) || "V"}
          </div>
        )}
        <div className="text-truncate">
          <h6 className="fw-bold mb-0 text-white text-truncate">{vendor?.businessName || "Vendor Panel"}</h6>
          <small className="text-success d-flex align-items-center gap-1">
            <i className="fa-solid fa-circle text-success" style={{ fontSize: "8px" }}></i> Approved Seller
          </small>
        </div>
      </div>

      {/* Navigation List */}
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.map((item, idx) => {
          const isActive = path === item.path || (item.path !== "/vendor" && path.startsWith(item.path));
          return (
            <li className="nav-item mb-1" key={idx}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 text-white rounded-3 ${
                  isActive ? "bg-primary active shadow-sm fw-bold" : "hover-bg-secondary"
                }`}
                style={{ transition: "all 0.2s" }}
              >
                <i className={`fa-solid ${item.icon} fs-5`} style={{ width: "24px" }}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer Info */}
      <div className="pt-3 border-top border-secondary text-center text-muted fs-7">
        Vendor Portal v1.0
      </div>
    </div>
  );
}
