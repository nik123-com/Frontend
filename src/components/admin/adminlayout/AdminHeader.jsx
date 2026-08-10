import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function AdminHeader() {
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

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
    window.location.href = "/Login";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top px-0" ref={navRef}>
        {/* Main Navbar */}
        <div className="container-fluid px-3 px-xl-4">
          <nav className="navbar navbar-light bg-white navbar-expand-xl py-2">
            <Link to="/admin" className="navbar-brand d-flex align-items-center me-3 me-xxl-4 flex-shrink-0" onClick={closeNav}>
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "45px", marginRight: "10px" }} />
              <h1 className="text-primary display-6 mb-0 fw-bold" style={{ color: "#81c408" }}>Aventra</h1>
            </Link>

            <button
              className="navbar-toggler py-2 px-3"
              type="button"
              onClick={handleNavCollapse}
              aria-label="Toggle navigation"
            >
              <span className={`fa ${isNavCollapsed ? 'fa-bars' : 'fa-times'} text-primary`} />
            </button>

            <div className={`collapse navbar-collapse bg-white ${isNavCollapsed ? '' : 'show'}`} id="navbarCollapse">
              {/* Navigation links on LEFT side */}
              <div className="navbar-nav me-auto py-2 py-xl-0 align-items-center text-nowrap gap-1">
                <Link
                  to="/admin"
                  className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin' ? 'active' : ''}`}
                  onClick={closeNav}
                >
                  Home
                </Link>

                {/* Category Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'category' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 ${location.pathname.toLowerCase().includes('category') ? 'active' : ''}`}
                    onClick={(e) => toggleDropdown('category', e)}
                  >
                    Category
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow ${openDropdown === 'category' ? 'show d-block' : ''}`}>
                    <Link to="/admin/addcategory" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-plus me-2 text-muted small"></i>Add Category
                    </Link>
                    <Link to="/admin/ManageCategory" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-list-check me-2 text-muted small"></i>Manage Category
                    </Link>
                  </div>
                </div>

                {/* Product Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'product' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 ${location.pathname.toLowerCase().includes('product') ? 'active' : ''}`}
                    onClick={(e) => toggleDropdown('product', e)}
                  >
                    Product
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow ${openDropdown === 'product' ? 'show d-block' : ''}`}>
                    <Link to="/admin/addproduct" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-plus me-2 text-muted small"></i>Add Product
                    </Link>
                    <Link to="/admin/productmanage" className="dropdown-item py-2 px-3" onClick={closeNav}>
                      <i className="fa-solid fa-boxes-stacked me-2 text-muted small"></i>Manage Product
                    </Link>
                  </div>
                </div>

                {/* Brand Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'brand' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 ${location.pathname.toLowerCase().includes('brand') ? 'active' : ''}`}
                    onClick={(e) => toggleDropdown('brand', e)}
                  >
                    Brand
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow ${openDropdown === 'brand' ? 'show d-block' : ''}`}>
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
                  className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/customermanage' ? 'active' : ''}`}
                  onClick={closeNav}
                >
                  Customers
                </Link>

                <Link
                  to="/admin/managevendors"
                  className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/managevendors' ? 'active' : ''}`}
                  onClick={closeNav}
                >
                  Vendors
                </Link>

                {/* Coupon Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'coupon' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 px-xxl-3 ${location.pathname.toLowerCase().includes('coupon') ? 'active' : ''}`}
                    onClick={(e) => toggleDropdown('coupon', e)}
                  >
                    Coupon
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-white rounded-3 shadow ${openDropdown === 'coupon' ? 'show d-block' : ''}`}>
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
                  className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/manageorder' ? 'active' : ''}`}
                  onClick={closeNav}
                >
                  Orders
                </Link>

                <Link
                  to="/admin/managequeries"
                  className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/managequeries' ? 'active' : ''}`}
                  onClick={closeNav}
                >
                  Queries
                </Link>

                <Link
                  to="/admin/announcements"
                  className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/announcements' ? 'active' : ''}`}
                  onClick={closeNav}
                >
                  Announcements
                </Link>
              </div>

              {/* Action Icons & Logout */}
              <div className="d-flex my-2 my-xl-0 ms-auto align-items-center position-relative flex-shrink-0">
                <button
                  className="btn-search btn border border-warning btn-md-square rounded-circle bg-white me-3 me-xl-4"
                  data-bs-toggle="modal"
                  data-bs-target="#searchModal"
                  onClick={closeNav}
                  title="Search"
                >
                  <i className="fas fa-search text-warning" style={{ color: "#ffc107" }} />
                </button>

                <Link to="/admin/manageorder" className="position-relative me-3 me-xl-4 my-auto" onClick={closeNav} title="Manage Orders">
                  <i className="fa fa-shopping-bag fa-2x text-primary" style={{ color: "#81c408" }} />
                </Link>

                {sessionStorage.getItem("isLogin") === "true" ? (
                  <button
                    className="btn btn-primary text-white m-1 rounded-pill px-3 px-xl-4 py-2 fw-bold text-nowrap flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: "#81c408", borderColor: "#81c408" }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/Login"
                    className="btn btn-primary text-white m-1 rounded-pill px-3 px-xl-4 py-2 fw-bold text-decoration-none text-nowrap flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: "#81c408", borderColor: "#81c408" }}
                    onClick={closeNav}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
      {/* Navbar End */}

      {/* Modal Search */}
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