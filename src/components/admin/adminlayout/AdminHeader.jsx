import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function AdminHeader() {
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

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

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top">
        <div className="container topbar bg-primary d-none d-lg-block" style={{ borderRadius: "45px 0 45px 45px" }}>
          <div className="d-flex justify-content-between">
            <div className="top-info ps-3">
              <small className="me-4">
                <i className="fas fa-map-marker-alt me-2 text-secondary" />{" "}
                <a href="#" className="text-white text-decoration-none">
                  123 Model Town,Jalandhar
                </a>
              </small>
              <small className="me-4">
                <i className="fas fa-envelope me-2 text-secondary" />
                <a href="#" className="text-white text-decoration-none">
                  admin@gmail.com
                </a>
              </small>
            </div>
            <div className="top-link pe-3">
              <a href="/assets/privacyPolicy/Privacy.pdf" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                <small className="text-white mx-2">Privacy Policy</small>/
              </a>
              <a href="/assets/Terms of use/Terms of Use.pdf" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                <small className="text-white mx-2">Terms of Use</small>/
              </a>
              <a href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                <small className="text-white ms-2">Sales and Refunds</small>
              </a>
            </div>
          </div>
        </div>

        <div className="container px-0">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/admin" className="navbar-brand d-flex align-items-center me-3 me-xxl-4" onClick={closeNav}>
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "45px", marginRight: "10px" }} />
              <h1 className="text-primary display-6 mb-0">Aventra</h1>
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
              {/* Navigation links shifted to the LEFT side */}
              <div className="navbar-nav me-auto py-2 py-xl-0 align-items-center text-nowrap gap-1">
                <Link to="/admin" className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeNav}>
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

                <Link to="/admin/customermanage" className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/customermanage' ? 'active' : ''}`} onClick={closeNav}>
                  Customers
                </Link>

                <Link to="/admin/managevendors" className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/managevendors' ? 'active' : ''}`} onClick={closeNav}>
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

                <Link to="/admin/manageorder" className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/manageorder' ? 'active' : ''}`} onClick={closeNav}>
                  Orders
                </Link>
                <Link to="/admin/managequeries" className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/managequeries' ? 'active' : ''}`} onClick={closeNav}>
                  Queries
                </Link>
                <Link to="/admin/announcements" className={`nav-item nav-link px-2 px-xxl-3 ${location.pathname === '/admin/announcements' ? 'active' : ''}`} onClick={closeNav}>
                  Announcements
                </Link>
              </div>

              <div className="d-flex m-3 me-0 align-items-center position-relative">
                <button
                  className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                  data-bs-toggle="modal"
                  data-bs-target="#searchModal"
                  onClick={closeNav}
                >
                  <i className="fas fa-search text-primary" />
                </button>

                <Link to="/admin/manageorder" className="position-relative me-4 my-auto" onClick={closeNav} title="Manage Orders">
                  <i className="fa fa-shopping-bag fa-2x text-primary" />
                </Link>

                {sessionStorage.getItem("isLogin") === "true" ? (
                  <button
                    className="btn btn-primary text-light m-1 rounded-pill px-4 py-2 fw-bold"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/Login"
                    className="btn btn-primary text-light m-1 rounded-pill px-4 py-2 fw-bold text-decoration-none"
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