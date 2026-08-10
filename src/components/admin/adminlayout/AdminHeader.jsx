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

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top p-0">
        <div className="container-fluid topbar bg-primary d-none d-lg-block px-4 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="top-info ps-2 d-flex align-items-center gap-3">
              <small className="d-flex align-items-center text-white">
                <i className="fas fa-map-marker-alt me-2 text-secondary" />
                <a href="#" className="text-white text-decoration-none">
                  123 Model Town, Jalandhar
                </a>
              </small>
              <small className="d-flex align-items-center text-white">
                <i className="fas fa-envelope me-2 text-secondary" />
                <a href="#" className="text-white text-decoration-none">
                  admin@gmail.com
                </a>
              </small>
            </div>
            <div className="top-link pe-2 d-flex align-items-center">
              <a href="#" className="text-white text-decoration-none">
                <small className="text-white">Privacy Policy</small>
              </a>
              <span className="mx-2 text-white-50 opacity-50">|</span>
              <a href="#" className="text-white text-decoration-none">
                <small className="text-white">Terms of Use</small>
              </a>
              <span className="mx-2 text-white-50 opacity-50">|</span>
              <a href="#" className="text-white text-decoration-none">
                <small className="text-white">Sales and Refunds</small>
              </a>
            </div>
          </div>
        </div>
        <div className="container-fluid px-3 px-md-4">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/admin" className="navbar-brand d-flex align-items-center me-3 me-xxl-4" onClick={closeNav}>
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "40px", marginRight: "10px" }} />
              <h1 className="text-primary display-6 mb-0 fw-bold fs-3" style={{ letterSpacing: "-0.5px" }}>Aventra</h1>
            </Link>
            <button
              className="navbar-toggler py-2 px-3 border-0"
              type="button"
              onClick={handleNavCollapse}
              aria-label="Toggle navigation"
            >
              <span className={`fa ${isNavCollapsed ? 'fa-bars' : 'fa-times'} text-primary fs-4`} />
            </button>
            <div className={`collapse navbar-collapse bg-white ${isNavCollapsed ? '' : 'show'}`} id="navbarCollapse">
              {/* Navigation items aligned to LEFT side */}
              <div className="navbar-nav me-auto py-2 py-xl-0 align-items-center text-nowrap gap-1">
                <Link to="/admin" className={`nav-item nav-link px-2 ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeNav}>
                  Dashboard
                </Link>
                
                {/* Category Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'category' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 ${location.pathname.toLowerCase().includes('category') ? 'active' : ''}`}
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
                    className={`nav-link dropdown-toggle px-2 ${location.pathname.toLowerCase().includes('product') ? 'active' : ''}`}
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
                    className={`nav-link dropdown-toggle px-2 ${location.pathname.toLowerCase().includes('brand') ? 'active' : ''}`}
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

                <Link to="/admin/customermanage" className={`nav-item nav-link px-2 ${location.pathname === '/admin/customermanage' ? 'active' : ''}`} onClick={closeNav}>
                  Customers
                </Link>

                <Link to="/admin/managevendors" className={`nav-item nav-link px-2 ${location.pathname === '/admin/managevendors' ? 'active' : ''}`} onClick={closeNav}>
                  Vendors
                </Link>

                <Link to="/admin/managesettlements" className={`nav-item nav-link px-2 ${location.pathname === '/admin/managesettlements' ? 'active' : ''}`} onClick={closeNav}>
                  Settlements
                </Link>

                {/* Coupon Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'coupon' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className={`nav-link dropdown-toggle px-2 ${location.pathname.toLowerCase().includes('coupon') ? 'active' : ''}`}
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

                <Link to="/admin/manageorder" className={`nav-item nav-link px-2 ${location.pathname === '/admin/manageorder' ? 'active' : ''}`} onClick={closeNav}>
                  Orders
                </Link>
                <Link to="/admin/managequeries" className={`nav-item nav-link px-2 ${location.pathname === '/admin/managequeries' ? 'active' : ''}`} onClick={closeNav}>
                  Queries
                </Link>
                <Link to="/admin/announcements" className={`nav-item nav-link px-2 ${location.pathname === '/admin/announcements' ? 'active' : ''}`} onClick={closeNav}>
                  Announcements
                </Link>
              </div>

              {/* Action area on far right */}
              <div className="d-flex align-items-center ms-auto ms-xl-3 my-2 my-xl-0">
                <button
                  className="btn btn-outline-danger btn-sm px-3 py-2 rounded-pill fw-medium text-nowrap d-flex align-items-center gap-2"
                  onClick={() => {
                    sessionStorage.clear();
                    closeNav();
                    window.location.href = "/Login";
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span>Logout</span>
                </button>
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
  )
}
export default AdminHeader