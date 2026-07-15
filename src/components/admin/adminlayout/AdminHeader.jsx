import { Link } from "react-router-dom";
import { useState } from "react";

function AdminHeader() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

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
            <Link to="/admin" className="navbar-brand d-flex align-items-center">
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "45px", marginRight: "10px" }} />
              <h1 className="text-primary display-6 mb-0">Aventra</h1>
            </Link>
            <button
              className="navbar-toggler py-2 px-3"
              type="button"
              onClick={handleNavCollapse}
            >
              <span className={`fa ${isNavCollapsed ? 'fa-bars' : 'fa-times'} text-primary`} />
            </button>
            <div className={`collapse navbar-collapse bg-white ${isNavCollapsed ? '' : 'show'}`} id="navbarCollapse">
              <div className="navbar-nav mx-auto">
                <Link to="/admin" className="nav-item nav-link active" onClick={() => setIsNavCollapsed(true)}>
                  Dashboard
                </Link>
                <div className="nav-item dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Category
                  </a>
                  <div className="dropdown-menu m-0 bg-secondary rounded-0">
                    <Link to="/admin/addcategory" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Add
                    </Link>
                    <Link to="/admin/ManageCategory" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Manage
                    </Link>

                  </div>
                </div>

                <div className="nav-item dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Product
                  </a>
                  <div className="dropdown-menu m-0 bg-secondary rounded-0">
                    <Link to="/admin/addProduct" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Add
                    </Link>
                    <Link to="/admin/productmanage" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Manage
                    </Link>
                  </div>
                </div>
                <div className="nav-item dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Brand
                  </a>
                  <div className="dropdown-menu m-0 bg-secondary rounded-0">
                    <Link to="/admin/addbrand" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Add
                    </Link>
                    <Link to="/admin/managebrand" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Manage
                    </Link>
                  </div>
                </div>
                <Link to="/admin/customermanage" className="nav-item nav-link active" onClick={() => setIsNavCollapsed(true)}>
                  Customer Manage
                </Link>
                <div className="nav-item dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Coupon
                  </a>
                  <div className="dropdown-menu m-0 bg-secondary rounded-0">
                    <Link to="/admin/addCoupon" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Add Coupon
                    </Link>
                    <Link to="/admin/manageCoupon" className="dropdown-item" onClick={() => setIsNavCollapsed(true)}>
                      Manage Coupon
                    </Link>
                  </div>
                </div>
                <Link to="/admin/manageorder" className="nav-item nav-link active" onClick={() => setIsNavCollapsed(true)}>
                  Orders
                </Link>
              </div>
              <div className="d-flex m-3 me-0">
            

                {/* User Profile Icon 
                <a href="#" className="my-auto">
                  <i className="fas fa-user fa-2x"></i> </a> */}
                <Link className="btn btn-primary text-light m-1 " to="/Login" onClick={() => setIsNavCollapsed(true)}>
                  Logout
                </Link>
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