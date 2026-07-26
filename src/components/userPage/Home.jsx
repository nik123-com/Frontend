import { useEffect, useState } from "react";
import { allProduct } from "../server/Product";
import { allCategory } from "../server/Category";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { addCart } from "../server/Cart";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AddToCartButton from "../common/AddToCartButton";


function Home() {
  const [productData, setProductData] = useState();
  const [categoryData, setCategoryData] = useState();
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const filteredProducts = activeCategory === "all"
    ? productData
    : productData?.filter((el) => el.category_id?._id === activeCategory);

  const fetchProduct = (data) => {
    allProduct(data).then((res) => {
      console.log(res);
      setProductData(res.data.data);

    })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchCategory = (data) => {
    allCategory(data).then((res) => {
      console.log(res);
      setCategoryData(res.data.data);

    })
      .catch((err) => {
        console.log(err);
      });
  };

  const addToCart = (element) => {
    const user = sessionStorage.getItem("userId");

   if (!user) {
  Swal.fire({
    title: "Login Required",
    text: "Please log in to access this feature.",
    icon: "warning",
    confirmButtonText: "OK",
  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/Login");
    }
  });

  return;
}

    const data2 = {
      user_id: user,
      product_id: element?._id,
      qty: 1,
      price: element?.price
    };


    addCart(data2).then((res) => {
      console.log(res.data.message);

      if (res.data.success) {
        toast.success(res.data.message);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(res.data.message);
      }
    })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(() => {
    fetchProduct();
    fetchCategory()
  }, []);

  return (
    <>
      {/* Hero Start */}
      <div className="container-fluid py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-md-12 col-lg-7">
              <h4 className="mb-3 text-secondary">Fast Delivery,Happy Customers</h4>
              <h1 className="mb-5 display-3 text-primary">
                Your Satisfaction<br />Our Priority
              </h1>


            </div>

            <div className="col-md-12 col-lg-5">
              <div
                id="carouselId"
                className="carousel slide position-relative"
                data-bs-ride="carousel"
              >
                <div className="carousel-inner" role="listbox">
                  <div className="carousel-item active rounded">
                    <img
                      src="/assets/img/hero-img-1.png"
                      className="img-fluid w-100 h-100 bg-secondary rounded"
                      alt="First slide"
                    />
                    <a href="#" className="btn px-4 py-2 text-white rounded">
                      Fruits
                    </a>
                  </div>

                  <div className="carousel-item rounded">
                    <img
                      src="/assets/img/hero-img-2.jpg"
                      className="img-fluid w-100 h-100 rounded"
                      alt="Second slide"
                    />
                    <a href="#" className="btn px-4 py-2 text-white rounded">
                      Vegetables
                    </a>
                  </div>
                </div>

                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselId"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>

                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselId"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hero End */}

      {/* Features Section Start */}
      <div className="container-fluid featurs py-5">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fas fa-car-side fa-3x text-white" />
                </div>
                <div className="featurs-content text-center">
                  <h5>Free Shipping</h5>
                  <p className="mb-0">Free on order over $300</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fas fa-user-shield fa-3x text-white" />
                </div>
                <div className="featurs-content text-center">
                  <h5>Security Payment</h5>
                  <p className="mb-0">100% security payment</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fas fa-exchange-alt fa-3x text-white" />
                </div>
                <div className="featurs-content text-center">
                  <h5>30 Day Return</h5>
                  <p className="mb-0">30 day money guarantee</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fa fa-phone-alt fa-3x text-white" />
                </div>
                <div className="featurs-content text-center">
                  <h5>24/7 Support</h5>
                  <p className="mb-0">Support every time fast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section End */}

      {/* Fruits Shop Start */}
      <div className="container-fluid fruite py-5">
        <div className="container py-5">
          <div className="tab-class text-center">
            <div className="row g-4 align-items-center mb-4">
              <div className="col-lg-4 text-start">
                <h1 className="fw-bold text-dark mb-0">Our Organic Products</h1>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-12">
                <div className="d-flex overflow-auto py-2 scrollbar-hidden" style={{
                  gap: "10px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  whiteSpace: "nowrap",
                  WebkitOverflowScrolling: "touch"
                }}>
                  <style>{`
                    .scrollbar-hidden::-webkit-scrollbar {
                      display: none;
                    }
                    .category-tab-btn {
                      background-color: #f4f6f8;
                      color: #495057;
                      font-weight: 600;
                      font-size: 14px;
                      padding: 10px 24px;
                      border-radius: 50px;
                      border: none;
                      cursor: pointer;
                      transition: all 0.2s ease-in-out;
                      white-space: nowrap;
                    }
                    .category-tab-btn:hover {
                      background-color: #e9ecef;
                      color: #212529;
                    }
                    .category-tab-btn.active {
                      background-color: #81c408;
                      color: white !important;
                      box-shadow: 0 4px 10px rgba(129, 196, 8, 0.2);
                    }
                  `}</style>
                  <button 
                    className={`category-tab-btn ${activeCategory === "all" ? "active" : ""}`}
                    onClick={() => setActiveCategory("all")}
                  >
                    All Products
                  </button>
                  {categoryData?.map((category) => (
                    <button
                      key={category._id}
                      className={`category-tab-btn ${activeCategory === category._id ? "active" : ""}`}
                      onClick={() => setActiveCategory(category._id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="tab-content">
              <div id="tab-1" className="tab-pane fade show p-0 active">
                <div className="row g-4">
                  <div className="col-lg-12">
                    <div className="row g-4">
                      <div className="col-lg-12">
                        <div className="row g-4">
                          {filteredProducts?.map((el, index) => (
                            <div
                              key={el._id || index}
                              className="col-md-6 col-lg-4 col-xl-3"
                            >
                              <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
                                <div className="fruite-img">
                                  <img
                                    src={Array.isArray(el.image) ? el.image?.[0] : el.image}
                                    className="img-fluid w-100 rounded-top"
                                    alt={el.name}
                                  />
                                </div>

                                <div
                                  className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                                  style={{ top: 10, left: 10 }}
                                >
                                  {el.category_id?.name}
                                </div>

                                <div className="p-4 border border-secondary border-top-0 rounded-bottom text-center d-flex flex-column flex-grow-1">
                                  <h4>{el.name}</h4>

                                  <p className="flex-grow-1">{el.description}</p>

                                  <div className="d-flex justify-content-center align-items-center gap-3 flex-lg-wrap mt-auto">
                                    <p className="text-dark fs-5 fw-bold mb-0">
                                      ₹{el.price}
                                    </p>

                                    <AddToCartButton product={el} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fruits Shop End */}

      {/* Service Start */}
      <div className="container-fluid service py-5">
        <div className="container py-5">
          <div className="row g-4 justify-content-center">
            <div className="col-md-6 col-lg-4">
              <a href="#">
                <div className="service-item bg-secondary rounded border border-secondary">
                  <img
                    src="/assets/img/featur-1.jpg"
                    className="img-fluid rounded-top w-100"
                    alt=""
                  />
                  <div className="px-4 rounded-bottom">
                    <div className="service-content bg-primary text-center p-4 rounded">
                      <h5 className="text-white">Fresh Apples</h5>
                      <h3 className="mb-0">20% OFF</h3>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="col-md-6 col-lg-4">
              <a href="#">
                <div className="service-item bg-dark rounded border border-dark">
                  <img
                    src="/assets/img/featur-2.jpg"
                    className="img-fluid rounded-top w-100"
                    alt=""
                  />
                  <div className="px-4 rounded-bottom">
                    <div className="service-content bg-light text-center p-4 rounded">
                      <h5 className="text-primary">Tasty Fruits</h5>
                      <h3 className="mb-0">Free delivery</h3>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="col-md-6 col-lg-4">
              <a href="#">
                <div className="service-item bg-primary rounded border border-primary">
                  <img
                    src="/assets/img/featur-3.jpg"
                    className="img-fluid rounded-top w-100"
                    alt=""
                  />
                  <div className="px-4 rounded-bottom">
                    <div className="service-content bg-secondary text-center p-4 rounded">
                      <h5 className="text-white">Exotic Vegitable</h5>
                      <h3 className="mb-0">Discount 30%</h3>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Service End */}

      {/* Fresh Organic Vegetables Start */}
      <div className="container-fluid vesitable py-5">
        <div className="container py-5">
          <h1 className="mb-4">Quality Products, Delivered to Your Door</h1>

          <div className="row g-4">
            {productData?.map((el, index) => (
              <div
                key={el._id || index}
                className="col-md-6 col-lg-4 col-xl-3"
              >
                <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
                  <div className="fruite-img">
                    <img
                      src={Array.isArray(el?.image) ? el?.image?.[0] : el?.image}
                      className="img-fluid w-100 rounded-top"
                      alt={el?.name}
                    />
                  </div>

                  <div
                    className="text-white bg-primary px-3 py-1 rounded position-absolute"
                    style={{ top: 10, left: 10 }}
                  >
                    {el?.category_id?.name}
                  </div>

                  <div className="p-4 border border-primary border-top-0 rounded-bottom text-center d-flex flex-column flex-grow-1">
                    <h4>{el?.name}</h4>

                    <p className="flex-grow-1">{el?.description}</p>

                    <div className="d-flex justify-content-center align-items-center gap-3 flex-lg-wrap mt-auto">
                      <p className="text-dark fs-5 fw-bold mb-0">
                        ₹{el?.price}
                      </p>

                      <AddToCartButton product={el} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Fresh Organic Vegetables End */}

      {/* Banner Section Start */}
      <div className="container-fluid banner bg-secondary my-5">
        <div className="container py-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="py-4">
                <h1 className="display-3 text-white">Fresh Exotic Fruits</h1>
                <p className="fw-normal display-3 text-dark mb-4">in Our Store</p>
                <p className="mb-4 text-dark">
                  Indulge in the finest collection of exotic fruits, carefully chosen for their freshness, quality, and taste. Experience vibrant flavors, natural sweetness, and healthy goodness with every bite. Shop now and enjoy freshness delivered to your home.
                </p>
                <Link
                  to="/cardProduct"
                  className="banner-btn btn border-2 border-white rounded-pill text-dark py-3 px-5"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="/assets/img/baner-1.png"
                  className="img-fluid w-100 rounded"
                  alt=""
                />
                <div
                  className="d-flex align-items-center justify-content-center bg-white rounded-circle position-absolute"
                  style={{ width: 140, height: 140, top: 0, left: 0 }}
                >
                  <h1 style={{ fontSize: 100 }}>1</h1>
                  <div className="d-flex flex-column">
                    <span className="h2 mb-0">50$</span>
                    <span className="h4 text-muted mb-0">kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Banner Section End */}

      {/* Bestseller Product Start */}
      <div className="container-fluid py-5">
  <div className="container py-5">
    <div
      className="text-center mx-auto mb-5"
      style={{ maxWidth: "700px" }}
    >
      <h1 className="display-4">Bestseller Products</h1>
      <p>
        Discover our most popular products, trusted and loved by customers.
      </p>
    </div>

    <div className="row g-4">
      {productData?.map((e) => (
        <div
          className="col-12 col-md-6 col-xl-4"
          key={e._id}
        >
          <div className="bestseller-card p-4 h-100 d-flex align-items-center">
            <div className="row align-items-center w-100 g-3 m-0">
              <div className="col-5 col-sm-5 d-flex justify-content-center p-0">
                <div className="bestseller-img-circle">
                  <img
                    src={Array.isArray(e.image) ? e.image?.[0] : e.image}
                    alt={e.name}
                  />
                </div>
              </div>

              <div className="col-7 col-sm-7 d-flex flex-column justify-content-between h-100 ps-3 pe-0">
                <h5 className="bestseller-title" title={e.name}>
                  {e.name}
                </h5>

                <div className="d-flex align-items-center mb-2 bestseller-stars">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${
                        i < Math.round(e.rating || 5) ? "text-primary" : "text-secondary opacity-25"
                      }`}
                      style={{ fontSize: "0.85rem", marginRight: "2px" }}
                    />
                  ))}
                </div>

                <h4 className="bestseller-price">₹{e.price}</h4>

                <div>
                  <AddToCartButton product={e} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
      {/* Bestseller Product End */}

      {/* Fact Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="bg-light p-5 rounded">
            <div className="row g-4 justify-content-center">
              <div className="col-md-6 col-lg-6 col-xl-3">
                <div className="counter bg-white rounded p-5">
                  <i className="fa fa-users text-secondary" />
                  <h4>satisfied customers</h4>
                  
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-xl-3">
                <div className="counter bg-white rounded p-5">
                  <i className="fa fa-users text-secondary" />
                  <h4>quality of service</h4>
                  
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-xl-3">
                <div className="counter bg-white rounded p-5">
                  <i className="fa fa-users text-secondary" />
                  <h4>quality certificates</h4>
                  
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-xl-3">
                <div className="counter bg-white rounded p-5">
                  <i className="fa fa-users text-secondary" />
                  <h4>Available Products</h4>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fact End */}


      <a
        href="#"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </a>

    </>
  );
}

export default Home;