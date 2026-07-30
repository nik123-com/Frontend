function UserFooter(){
    return(
        <>
         {/* Footer Start */}
  <div className="container-fluid bg-dark text-white-50 footer pt-5 mt-5">
    <div className="container py-5">
      <div
        className="pb-4 mb-4"
        style={{ borderBottom: "1px solid rgba(226, 175, 24, 0.5)" }}
      >
        <div className="row g-4">
          <div className="col-lg-3">
            <a href="#" className="d-flex align-items-center mb-2">
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "40px", marginRight: "10px" }} />
              <h1 className="text-primary mb-0">Aventra</h1>
            </a>
            <p className="text-secondary mb-0">Fresh products</p>
          </div>
          <div className="col-lg-6">
            <div className="position-relative mx-auto">
              <input
                className="form-control border-0 w-100 py-3 px-4 rounded-pill"
                type="email"
                placeholder="Your Email"
              />
              <button
                type="submit"
                className="btn btn-primary border-0 border-secondary py-3 px-4 position-absolute rounded-pill text-white"
                style={{ top: 0, right: 0 }}
              >
                Subscribe Now
              </button>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="d-flex justify-content-end pt-3">
              <a
                className="btn  btn-outline-secondary me-2 btn-md-square rounded-circle"
                href=""
              >
                <i className="fab fa-twitter" />
              </a>
              <a
                className="btn btn-outline-secondary me-2 btn-md-square rounded-circle"
                href=""
              >
                <i className="fab fa-facebook-f" />
              </a>
              <a
                className="btn btn-outline-secondary me-2 btn-md-square rounded-circle"
                href=""
              >
                <i className="fab fa-youtube" />
              </a>
              <a
                className="btn btn-outline-secondary btn-md-square rounded-circle"
                href=""
              >
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-5">
        <div className="col-lg-3 col-md-6">
          <div className="footer-item">
            <h4 className="text-light mb-3">Why People Like us!</h4>
            <p className="mb-4">
              We provide high-quality products at competitive prices, backed by secure payment options, fast delivery, hassle-free returns, and dedicated customer support. Our commitment to customer satisfaction, reliable service, and a seamless shopping experience makes us a trusted choice for thousands of happy shoppers.
            </p>
            {/* <a
              href=""
              className="btn border-secondary py-2 px-4 rounded-pill text-primary"
            >
              Read More
            </a> */}
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="d-flex flex-column text-start footer-item">
            <h4 className="text-light mb-3">Shop Info</h4>
            <a className="btn-link" href="">
              About Us
            </a>
            <a className="btn-link" href="/Contact">
              Contact Us
            </a>
            <a className="btn-link" href="/assets/privacyPolicy/Privacy.pdf">
              Privacy Policy
            </a>
            <a className="btn-link" href="/assets/Terms of use/Terms of Use.pdf">
              Terms &amp; Condition
            </a>
            <a className="btn-link" href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf">
              Return Policy
            </a>
            <a className="btn-link" href="/queries">
              FAQs &amp; Help
            </a>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="d-flex flex-column text-start footer-item">
            <h4 className="text-light mb-3">Account</h4>
            <a className="btn-link" href="">
              My Account
            </a>
            <a className="btn-link" href="/shopDetail/:_id">
              Shop details
            </a>
            <a className="btn-link" href="/cart">
              Shopping Cart
            </a>
            <a className="btn-link" href="/viewWishlist">
              Wishlist
            </a>
            <a className="btn-link" href="/myorders">
              Order History
            </a>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="footer-item">
            <h4 className="text-light mb-3">Contact</h4>
            <p>Address: 123 Model town</p>
            <p>Email: admin@gmail.com</p>
            <p>Phone: +0123 4567 8910</p>
            <p>Payment Accepted</p>
            <img src="/assets/img/payment.png" className="img-fluid" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Copyright Start */}
  <div className="container-fluid copyright bg-dark py-4">
    <div className="container">
      <div className="row">
        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
          <span className="text-light">
            <a href="#">
              <i className="fas fa-copyright text-light me-2" />
              Aventra
            </a>
            , All right reserved.
          </span>
        </div>
        <div className="col-md-6 my-auto text-center text-md-end text-white">
          {/*/*** This template is free as long as you keep the below author’s credit link/attribution link/backlink. *** /*/}
          {/*/*** If you'd like to use the template without the below author’s credit link/attribution link/backlink, *** /*/}
          {/*/*** you can purchase the Credit Removal License from "https://htmlcodex.com/credit-removal". *** /*/}
          Designed By{" "}
          Nikhil
          Distributed By{" "}
            NK
        </div>
      </div>
    </div>
  </div>
  {/* Copyright End */}
        </>
    )
}
export default UserFooter