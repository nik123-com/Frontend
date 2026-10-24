import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTimeGreeting } from "../../../utils/greetingUtils";

function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [timeGreeting, setTimeGreeting] = useState(() => getTimeGreeting());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeGreeting(getTimeGreeting());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const toggleDropdown = (name, e) => {
    e.preventDefault();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeNav = () => {
    setIsNavCollapsed(true);
    setOpenDropdown(null);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    closeNav();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top px-0 bg-white shadow-sm">
        {/* Topbar */}
        <div
          className="container topbar d-none d-lg-block"
          style={{
            backgroundColor: "#81c408",
            borderRadius: "0 0 20px 20px",
            padding: "8px 24px"
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="top-info d-flex align-items-center">
              <small className="me-4 d-flex align-items-center">
                <i className="fas fa-map-marker-alt me-2" style={{ color: "#ffc107" }} />
                <a
                  href="https://maps.app.goo.gl/J85uiPMzs2s3Vfu1A"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white text-decoration-none fw-medium"
                >
                  123 Model Town,Jalandhar
                </a>
              </small>
              <small className="me-4 d-flex align-items-center">
                <i className="fas fa-envelope me-2" style={{ color: "#ffc107" }} />
                <a
                  href="mailto:admin@gmail.com"
                  className="text-white text-decoration-none fw-medium"
                >
                  admin@gmail.com
                </a>
              </small>
            </div>
            {/* Center Dynamic Admin Greeting Badge */}
            <div className="d-none d-lg-flex align-items-center bg-white bg-opacity-25 px-3 py-1 rounded-pill text-white fw-semibold small shadow-2xs" style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
              <span className="me-1.5">{timeGreeting.icon}</span>
              <span>{timeGreeting.greeting}, Admin!</span>
            </div>
            <div className="top-link d-flex align-items-center">
              <a
                href="/assets/privacyPolicy/Privacy.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-white text-decoration-none"
              >
                <small className="text-white mx-1">Privacy Policy</small> /
              </a>
              <a
                href="/assets/Terms of use/Terms of Use.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-white text-decoration-none"
              >
                <small className="text-white mx-1">Terms of Use</small> /
              </a>
              <a
                href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-white text-decoration-none"
              >
                <small className="text-white ms-1">Sales and Refunds</small>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container-fluid px-2 px-lg-4 px-xxl-5">
          <nav className="navbar navbar-light bg-white navbar-expand-xl py-2 px-2 px-lg-0">
            {/* Brand Logo & Title */}
            <Link to="/admin" className="navbar-brand d-flex align-items-center me-2 me-xl-3 me-xxl-4 flex-shrink-0" onClick={closeNav}>
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "42px", marginRight: "10px" }} />
              <h1 className="display-6 mb-0 fw-bold" style={{ color: "#81c408", letterSpacing: "-0.5px" }}>
                Aventra
              </h1>
            </Link>

            <button
              className="navbar-toggler py-2 px-3 border-0"
              type="button"
              onClick={handleNavCollapse}
              aria-label="Toggle navigation"
            >
              <span className={`fa ${isNavCollapsed ? "fa-bars" : "fa-times"}`} style={{ color: "#81c408", fontSize: "1.3rem" }} />
            </button>

            <div className={`collapse navbar-collapse bg-white ${isNavCollapsed ? "" : "show"}`} id="navbarCollapse">
              {/* Navigation links */}
              <div className="navbar-nav me-auto ms-1 ms-xl-2 py-2 py-xl-0 align-items-center text-nowrap gap-0 gap-xl-1">
                <Link
                  to="/admin"
                  className={`nav-item nav-link px-2 px-xxl-3 py-2 ${location.pathname === "/admin" || location.pathname === "/admin/" ? "active" : ""}`}
                  onClick={closeNav}
                >
                  Home
                </Link>

                {/* Category Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === "category" ? "show" : ""}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 py-2 d-flex align-items-center ${location.pathname.toLowerCase().includes("category") ? "active" : ""}`}
                    onClick={(e) => toggleDropdown("category", e)}
                  >
                    Category
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow-lg ${openDropdown === "category" ? "show d-block" : ""}`}>
                    <Link to="/admin/addcategory" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-plus me-2 text-muted small"></i>Add Category
                    </Link>
                    <Link to="/admin/ManageCategory" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-list-check me-2 text-muted small"></i>Manage Category
                    </Link>
                  </div>
                </div>

                {/* Product Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === "product" ? "show" : ""}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 py-2 d-flex align-items-center ${location.pathname.toLowerCase().includes("product") ? "active" : ""}`}
                    onClick={(e) => toggleDropdown("product", e)}
                  >
                    Product
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow-lg ${openDropdown === "product" ? "show d-block" : ""}`}>
                    <Link to="/admin/addproduct" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-plus me-2 text-muted small"></i>Add Product
                    </Link>
                    <Link to="/admin/productmanage" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-boxes-stacked me-2 text-muted small"></i>Manage Product
                    </Link>
                  </div>
                </div>

                {/* Brand Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === "brand" ? "show" : ""}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 py-2 d-flex align-items-center ${location.pathname.toLowerCase().includes("brand") ? "active" : ""}`}
                    onClick={(e) => toggleDropdown("brand", e)}
                  >
                    Brand
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow-lg ${openDropdown === "brand" ? "show d-block" : ""}`}>
                    <Link to="/admin/addbrand" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-plus me-2 text-muted small"></i>Add Brand
                    </Link>
                    <Link to="/admin/managebrand" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-tags me-2 text-muted small"></i>Manage Brand
                    </Link>
                  </div>
                </div>

                <Link
                  to="/admin/customermanage"
                  className={`nav-item nav-link px-2 px-xxl-3 py-2 ${location.pathname === "/admin/customermanage" ? "active" : ""}`}
                  onClick={closeNav}
                >
                  Customers
                </Link>

                <Link
                  to="/admin/managevendors"
                  className={`nav-item nav-link px-2 px-xxl-3 py-2 ${location.pathname === "/admin/managevendors" ? "active" : ""}`}
                  onClick={closeNav}
                >
                  Vendors
                </Link>

                {/* Coupon Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === "coupon" ? "show" : ""}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 py-2 d-flex align-items-center ${location.pathname.toLowerCase().includes("coupon") ? "active" : ""}`}
                    onClick={(e) => toggleDropdown("coupon", e)}
                  >
                    Coupon
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow-lg ${openDropdown === "coupon" ? "show d-block" : ""}`}>
                    <Link to="/admin/addCoupon" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-plus me-2 text-muted small"></i>Add Coupon
                    </Link>
                    <Link to="/admin/manageCoupon" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-ticket me-2 text-muted small"></i>Manage Coupon
                    </Link>
                  </div>
                </div>

                <Link
                  to="/admin/manageorder"
                  className={`nav-item nav-link px-2 px-xxl-3 py-2 ${location.pathname === "/admin/manageorder" ? "active" : ""}`}
                  onClick={closeNav}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/managequeries"
                  className={`nav-item nav-link px-2 px-xxl-3 py-2 ${location.pathname === "/admin/managequeries" ? "active" : ""}`}
                  onClick={closeNav}
                >
                  Queries
                </Link>
                <Link
                  to="/admin/announcements"
                  className={`nav-item nav-link px-2 px-xxl-3 py-2 ${location.pathname === "/admin/announcements" ? "active" : ""}`}
                  onClick={closeNav}
                >
                  Announcements
                </Link>
              </div>

              {/* Settlements Icon & Logout Button */}
              <div className="d-flex align-items-center position-relative my-2 my-xl-0 ms-auto flex-shrink-0">
                <Link
                  to="/admin/managesettlements"
                  className={`position-relative me-3 my-auto d-flex align-items-center text-decoration-none p-2 rounded-circle ${location.pathname === "/admin/managesettlements" ? "bg-light text-success" : ""}`}
                  onClick={closeNav}
                  title="Manage Settlements"
                >
                  <i className="fa-solid fa-hand-holding-dollar" style={{ color: "#81c408", fontSize: "1.5rem" }} />
                </Link>

                {sessionStorage.getItem("isLogin") === "true" ? (
                  <button
                    className="btn btn-logout shadow-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/Login"
                    className="btn btn-logout text-decoration-none shadow-sm"
                    onClick={closeNav}
                  >
                    Logout
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
      {/* Navbar End */}

      <div
        className="modal fade"
        id="searchModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Search by keyword
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body d-flex align-items-center">
              <div className="input-group w-75 mx-auto d-flex">
                <input
                  type="search"
                  className="form-control p-3"
                  placeholder="keywords"
                  aria-describedby="search-icon-1"
                />
                <span id="search-icon-1" className="input-group-text p-3">
                  <i className="fa fa-search" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Search End */}
    </>
  );
}

export default AdminHeader;