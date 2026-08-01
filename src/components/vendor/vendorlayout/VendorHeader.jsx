import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VendorHeader({ vendor }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    sessionStorage.clear();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vendor/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const navLinks = [
    { name: "Home", path: "/vendor" },
    { name: "Products", path: "/vendor/products" },
    { name: "Orders", path: "/vendor/orders" },
    { name: "Inventory", path: "/vendor/inventory" },
    { name: "Coupons", path: "/vendor/coupons" },
    { name: "Reviews", path: "/vendor/reviews" },
    { name: "Wallet", path: "/vendor/wallet" },
    { name: "Settings", path: "/vendor/settings" },
  ];

  return (
    <header className="bg-white border-bottom shadow-sm">
      {/* Top Bar - Green Pill Shape */}
      <div className="px-3 pt-2">
        <div
          className="d-none d-lg-flex justify-content-between align-items-center px-4 py-2 text-white shadow-sm"
          style={{
            backgroundColor: "#81c408",
            borderRadius: "30px",
            fontSize: "0.88rem",
            fontWeight: "500",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span className="d-flex align-items-center me-2">
              <i className="fas fa-map-marker-alt text-warning me-2"></i>
              {vendor?.address || "123 Model Town,Jalandhar"}
            </span>
            <span className="d-flex align-items-center">
              <i className="fas fa-envelope text-warning me-2"></i>
              {vendor?.email || "admin@gmail.com"}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <a
              href="/assets/privacyPolicy/Privacy.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-white text-decoration-none"
            >
              Privacy Policy
            </a>
            <span>/</span>
            <a
              href="/assets/Terms of use/Terms of Use.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-white text-decoration-none"
            >
              Terms of Use
            </a>
            <span>/</span>
            <a
              href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-white text-decoration-none"
            >
              Sales and Refunds
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 py-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          {/* Logo & Store Info */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/vendor" className="d-flex align-items-center text-decoration-none">
              <img
                src="/assets/img/Logo.png"
                alt="Aventra Logo"
                style={{ height: "42px", marginRight: "10px" }}
              />
              <h1 className="display-6 mb-0 fw-bold" style={{ color: "#81c408", fontSize: "2rem" }}>
                Aventra
              </h1>
            </Link>
            {vendor?.businessName && (
              <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill d-none d-xl-inline-block">
                <i className="fa-solid fa-store me-1"></i> {vendor.businessName}
              </span>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler d-md-none border-0 fs-3"
            type="button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            style={{ color: "#81c408" }}
          >
            <i className={`fa-solid ${isNavCollapsed ? "fa-bars" : "fa-xmark"}`}></i>
          </button>

          {/* Middle Navigation Links */}
          <div className={`w-100 w-md-auto d-md-flex align-items-center justify-content-center ${isNavCollapsed ? "d-none d-md-flex" : "d-flex flex-column my-3"}`}>
            <nav className="d-flex flex-column flex-md-row align-items-center gap-3 gap-lg-4">
              {navLinks.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/vendor" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsNavCollapsed(true)}
                    className="text-decoration-none fw-semibold px-1 py-1"
                    style={{
                      color: isActive ? "#81c408" : "#6c757d",
                      fontSize: "1.05rem",
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Button */}
          <div className="d-flex align-items-center gap-3">
            {/* Search Icon Button with Golden Border */}
            <button
              className="btn rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: "42px",
                height: "42px",
                border: "2px solid #ffb524",
                backgroundColor: "#fff",
                transition: "transform 0.2s ease",
              }}
              onClick={() => setShowSearch(!showSearch)}
              title="Search Products"
            >
              <i className="fas fa-search" style={{ color: "#81c408", fontSize: "1.1rem" }}></i>
            </button>

            {/* Shopping Bag Icon */}
            <Link to="/vendor/orders" className="text-decoration-none position-relative p-1" title="Vendor Orders">
              <i className="fa-solid fa-bag-shopping" style={{ color: "#81c408", fontSize: "1.7rem" }}></i>
            </Link>

            {/* Solid Green Logout Button */}
            <button
              onClick={handleLogout}
              className="btn text-white fw-bold px-4 py-2 shadow-sm"
              style={{
                backgroundColor: "#81c408",
                borderRadius: "12px",
                border: "none",
                fontSize: "1rem",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Collapsible Search Input Bar */}
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="mt-3">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border" style={{ borderColor: "#81c408" }}>
              <input
                type="text"
                className="form-control px-4 py-2 border-0"
                placeholder="Search vendor products, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="btn text-white px-4 fw-semibold"
                style={{ backgroundColor: "#81c408", border: "none" }}
              >
                Search
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
}

