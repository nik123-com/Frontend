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
      <div className="container-fluid fixed-top">
        <div className="container topbar bg-primary d-none d-lg-block">
          <div className="d-flex justify-content-between">
            <div className="top-info ps-2">
              <small className="me-3">
                <i className="fas fa-map-marker-alt me-2 text-secondary" />{" "}
                <a href="#" className="text-white">
                  123 Model Town,Jalandhar
                </a>
              </small>
              <small className="me-3">
                <i className="fas fa-envelope me-2 text-secondary" />
                <a href="#" className="text-white">
                  admin@gmail.com
                </a>
              </small>
            </div>
            <div className="top-link pe-2">
              <a href="#" className="text-white">
                <small className="text-white mx-2">Privacy Policy</small>/
              </a>
              <a href="#" className="text-white">
                <small className="text-white mx-2">Terms of Use</small>/
              </a>
              <a href="#" className="text-white">
                <small className="text-white ms-2">Sales and Refunds</small>
              </a>
            </div>
          </div>
        </div>
        <div className="container px-0">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/admin" className="navbar-brand d-flex align-items-center" onClick={closeNav}>
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
              <div className="navbar-nav ms-auto py-2 py-xl-0 align-items-center text-nowrap gap-1 gap-xl-2">
                <Link to="/admin" className={`nav-item nav-link px-2 ${location.pathname === '/admin' ? 'active text-primary fw-bold' : ''}`} onClick={closeNav}>
                  Dashboard
                </Link>
                
                {/* Category Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'category' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className="nav-link dropdown-toggle px-2"
                    onClick={(e) => toggleDropdown('category', e)}
                  >
                    Category
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-light rounded-3 shadow-sm ${openDropdown === 'category' ? 'show d-block' : ''}`}>
                    <Link to="/admin/addcategory" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Add Category
                    </Link>
                    <Link to="/admin/ManageCategory" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Manage Category
                    </Link>
                  </div>
                </div>

                {/* Product Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'product' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className="nav-link dropdown-toggle px-2"
                    onClick={(e) => toggleDropdown('product', e)}
                  >
                    Product
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-light rounded-3 shadow-sm ${openDropdown === 'product' ? 'show d-block' : ''}`}>
                    <Link to="/admin/productmanage" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Manage Product
                    </Link>
                  </div>
                </div>

                {/* Brand Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'brand' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className="nav-link dropdown-toggle px-2"
                    onClick={(e) => toggleDropdown('brand', e)}
                  >
                    Brand
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-light rounded-3 shadow-sm ${openDropdown === 'brand' ? 'show d-block' : ''}`}>
                    <Link to="/admin/addbrand" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Add Brand
                    </Link>
                    <Link to="/admin/managebrand" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Manage Brand
                    </Link>
                  </div>
                </div>

                <Link to="/admin/customermanage" className={`nav-item nav-link px-2 ${location.pathname === '/admin/customermanage' ? 'active text-primary fw-bold' : ''}`} onClick={closeNav}>
                  Customers
                </Link>

                <Link to="/admin/managevendors" className={`nav-item nav-link px-2 ${location.pathname === '/admin/managevendors' ? 'active text-primary fw-bold' : ''}`} onClick={closeNav}>
                  Vendors
                </Link>

                {/* Coupon Dropdown */}
                <div className={`nav-item dropdown ${openDropdown === 'coupon' ? 'show' : ''}`}>
                  <a
                    href="#"
                    className="nav-link dropdown-toggle px-2"
                    onClick={(e) => toggleDropdown('coupon', e)}
                  >
                    Coupon
                  </a>
                  <div className={`dropdown-menu m-0 border-0 bg-light rounded-3 shadow-sm ${openDropdown === 'coupon' ? 'show d-block' : ''}`}>
                    <Link to="/admin/addCoupon" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Add Coupon
                    </Link>
                    <Link to="/admin/manageCoupon" className="dropdown-item py-2 ps-4" onClick={closeNav}>
                      Manage Coupon
                    </Link>
                  </div>
                </div>

                <Link to="/admin/manageorder" className={`nav-item nav-link px-2 ${location.pathname === '/admin/manageorder' ? 'active text-primary fw-bold' : ''}`} onClick={closeNav}>
                  Orders
                </Link>
                <Link to="/admin/managequeries" className={`nav-item nav-link px-2 ${location.pathname === '/admin/managequeries' ? 'active text-primary fw-bold' : ''}`} onClick={closeNav}>
                  Queries
                </Link>
                <Link to="/admin/announcements" className={`nav-item nav-link px-2 ${location.pathname === '/admin/announcements' ? 'active text-primary fw-bold' : ''}`} onClick={closeNav}>
                  Announcements
                </Link>
              </div>

              <div className="d-flex align-items-center ms-xl-3 my-2 my-xl-0">
                <button
                  className="btn btn-primary text-light px-3 py-2 rounded-pill w-100 w-xl-auto fw-medium text-nowrap"
                  onClick={() => {
                    sessionStorage.clear();
                    closeNav();
                    window.location.href = "/Login";
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket me-2"></i>Logout
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