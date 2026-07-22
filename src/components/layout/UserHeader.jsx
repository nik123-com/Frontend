import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { allCart } from "../server/Cart";

function UserHeader() {
  const location = useLocation();
  const isLogin = sessionStorage.getItem("isLogin") === "true";
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setCartCount(0);
      return;
    }
    allCart({ userId })
      .then((res) => {
        if (res.data.success && res.data.data) {
          const count = res.data.data.reduce((acc, curr) => acc + (curr.qty || 0), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      })
      .catch((err) => {
        console.error("Error fetching cart count:", err);
        setCartCount(0);
      });
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, [location]);

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top">
        <div className="container topbar bg-primary d-none d-lg-block">
          <div className="d-flex justify-content-between">
            <div className="top-info ps-2">
              <small className="me-3">
                <i className="fas fa-map-marker-alt me-2 text-secondary" />{" "}
                <a href="https://maps.app.goo.gl/J85uiPMzs2s3Vfu1A" className="text-white">
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
              <a href="/assets/privacyPolicy/Privacy.pdf" target="_blank" className="text-white">
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
            <Link to="/" className="navbar-brand d-flex align-items-center">
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
                <Link to="/" className="nav-item nav-link active" onClick={() => setIsNavCollapsed(true)}>
                  Home
                </Link>
                <Link to="/CardCategory" className="nav-item nav-link" onClick={() => setIsNavCollapsed(true)}>
                  Category
                </Link>
                <Link to="/cardProduct" className="nav-item nav-link" onClick={() => setIsNavCollapsed(true)}>
                  Product
                </Link>
                <Link to="/cardBrand" className="nav-item nav-link" onClick={() => setIsNavCollapsed(true)}>
                  Brand
                </Link>

                <Link to="/Contact" className="nav-item nav-link" onClick={() => setIsNavCollapsed(true)}>
                  Contact
                </Link>
                <Link to="/viewWishlist" className="nav-item nav-link" onClick={() => setIsNavCollapsed(true)}>
                  View WishList
                </Link>
                <Link to="/myorders" className="nav-item nav-link" onClick={() => setIsNavCollapsed(true)}>
                  My Orders
                </Link>

              </div>
              <div className="d-flex m-3 me-0">
                <button
                  className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                  data-bs-toggle="modal"
                  data-bs-target="#searchModal"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <i className="fas fa-search text-primary" />
                </button>
                <Link to="/cart" className="position-relative me-4 my-auto" onClick={() => setIsNavCollapsed(true)}>
                  <i className="fa fa-shopping-bag fa-2x text-primary" />
                  {isLogin && (
                    <span
                      className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                      style={{ top: "-5px", left: 15, height: 20, minWidth: 20 }}
                    >
                      {cartCount}</span>
                  )}
                </Link>

                {/* User Profile Icon   */}
                {/* <a href="#" class="my-auto">
              <i class="fas fa-user fa-2x"></i> </a> */}

                {isLogin ? (
                  <button
                    className="btn btn-primary text-light m-1"
                    onClick={() => {
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <Link className="btn btn-primary text-light m-1" to="/Login" onClick={() => setIsNavCollapsed(true)}>
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
  )
}
export default UserHeader