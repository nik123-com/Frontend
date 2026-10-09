import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { allProduct, getproductbycat, getproductbybrand } from "../server/Product";
import { addCart } from "../server/Cart"
import { addItem, addwishList, allwishList } from '../server/WishList'

import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { allCategory } from "../server/Category";
import AddToCartButton from "../common/AddToCartButton";
import { Colors } from "chart.js";

const getProductImages = (imageData) => {
  if (!imageData) return [];
  let images = [];
  if (Array.isArray(imageData)) {
    images = imageData;
  } else if (typeof imageData === "string") {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) images = parsed;
      else if (imageData.trim()) images = [imageData];
    } catch {
      if (imageData.includes(",")) {
        images = imageData.split(",").map((s) => s.trim());
      } else if (imageData.trim()) {
        images = [imageData];
      }
    }
  }

  return images
    .map((item) => {
      if (typeof item === "object" && item !== null && item.url) return item.url;
      return item;
    })
    .filter((img) => typeof img === "string" && img.trim() !== "")
    .map((img) => {
      const trimmed = img.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
        return trimmed;
      }
      return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    });
};

function CustomerProductCardItem({ el, isLogin, openModal, navotShop }) {
  const images = useMemo(() => {
    return getProductImages(el?.image);
  }, [el?.image]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Preload images so hover slideshow has zero lag
  useEffect(() => {
    if (images.length > 1) {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [images]);

  // Slideshow interval on hover
  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 1400);

    return () => clearInterval(intervalId);
  }, [isHovered, images.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImgIndex(0); // Reset to first image on mouse leave
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    setCurrentImgIndex(index);
  };

  const activeSrc = images.length > 0 ? images[currentImgIndex] : "/assets/img/fruite-item-5.jpg";

  return (
    <div
      onClick={() => navotShop(el._id)}
      className="h-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
        {/* Product Image Area with Hover Slideshow */}
        <div className="fruite-img position-relative" style={{ position: "relative" }}>
          <img
            key={currentImgIndex}
            src={activeSrc}
            className="img-fluid rounded-top product-slideshow-img"
            alt={el?.name || "Image"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/img/fruite-item-5.jpg";
            }}
          />

          {/* Slideshow Image Counter Badge (shows vendor upload count) */}
          {images.length > 1 && (
            <div
              className={`position-absolute badge rounded-pill px-2 py-1 ${
                isHovered ? "bg-dark bg-opacity-75 text-white" : "bg-dark bg-opacity-50 text-white-50"
              }`}
              style={{
                top: "10px",
                right: "10px",
                zIndex: 4,
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                pointerEvents: "none",
                transition: "all 0.25s ease"
              }}
              title={`${images.length} images uploaded by vendor`}
            >
              <i className="fa-solid fa-images me-1 text-warning"></i>
              {currentImgIndex + 1}/{images.length}
            </div>
          )}

          {/* Slideshow Arrow Buttons (visible on hover if multiple images) */}
          {images.length > 1 && isHovered && (
            <>
              <button
                type="button"
                className="btn btn-sm product-slideshow-btn position-absolute rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "28px",
                  height: "28px",
                  padding: 0,
                  zIndex: 5
                }}
                onClick={handlePrev}
                title="Previous Image"
              >
                <i className="fa-solid fa-chevron-left" style={{ fontSize: "11px" }}></i>
              </button>
              <button
                type="button"
                className="btn btn-sm product-slideshow-btn position-absolute rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "28px",
                  height: "28px",
                  padding: 0,
                  zIndex: 5
                }}
                onClick={handleNext}
                title="Next Image"
              >
                <i className="fa-solid fa-chevron-right" style={{ fontSize: "11px" }}></i>
              </button>
            </>
          )}

          {/* Slideshow Progress Indicators / Dots */}
          {images.length > 1 && (
            <div
              className="position-absolute d-flex justify-content-center align-items-center gap-1 w-100"
              style={{
                bottom: el?.status === false ? "44px" : "10px",
                left: 0,
                zIndex: 4,
                transition: "opacity 0.25s ease",
                opacity: isHovered ? 1 : 0.6
              }}
            >
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className="product-slideshow-dot"
                  style={{
                    width: idx === currentImgIndex ? "18px" : "6px",
                    height: "4px",
                    borderRadius: "4px",
                    backgroundColor: idx === currentImgIndex ? "#81c408" : "rgba(100, 116, 139, 0.65)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    display: "inline-block"
                  }}
                  title={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Out of stock badge */}
          {el?.status === false && (
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#424242",
                color: "#ffffff",
                padding: "6px 20px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "14px",
                whiteSpace: "nowrap",
                zIndex: 10,
                pointerEvents: "none",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
              }}
            >
              Stock not available
            </div>
          )}
        </div>

        {/* Category Badge on top-left of Card */}
        {el.category_id?.name && (
          <div
            className="text-white bg-secondary px-3 py-1 rounded position-absolute fruite-category-badge"
            style={{ top: 10, left: 10, zIndex: 3 }}
          >
            {el.category_id?.name}
          </div>
        )}

        {/* Product Details Section */}
        <div className="p-4 border border-secondary border-top-0 rounded-bottom d-flex flex-column flex-grow-1">
          <h4>{el?.name}</h4>
          <p className="flex-grow-1">
            {el?.description}
          </p>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-auto">
            <p className="text-dark fs-5 fw-bold mb-0">
              ₹{el?.price}
            </p>
            <div className="d-flex align-items-center gap-2">
              {isLogin && (
                <button
                  className="btn fs-4 p-0 text-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(el._id);
                  }}
                  title="Save to Wishlist"
                >
                  <i className="fa-regular fa-bookmark"></i>
                </button>
              )}
              <AddToCartButton product={el} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



const customStyles = {
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1050,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '24px',
    border: 'none',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '0',
    maxWidth: '460px',
    width: '92%',
    overflow: 'visible',
    background: '#ffffff',
  },
};


export default function CardProduct() {
  const isLogin = sessionStorage.getItem("isLogin") === "true";
  const { category_id, brand_id } = useParams();
  const [searchParams] = useSearchParams();

  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setsearch] = useState(searchParams.get("q") || searchParams.get("search") || "");
  const [data1, setdata1] = useState([]);
  const [cart, setcart] = useState();
  const [isAdd, setisAdd] = useState(false);
  const [wishlist, setWishList] = useState([])
  const [data2, setData2] = useState("")
  const [WishListData, setWishListData] = useState([])
  const [addwishlistname, setaddwishlistname] = useState("")
  const [selectedProductId, setSelectedProductId] = useState();
  const [addProductData, setaddProductData] = useState()

  const navigate = useNavigate();

  useEffect(() => {
    const urlQuery = searchParams.get("q") || searchParams.get("search");
    if (urlQuery !== null) {
      setsearch(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (category_id) {
      fetchproductsbycat(category_id);
    } else if (brand_id) {
      fetchproductsbybrand(brand_id);
    } else {
      fetch();
    }
    fetch1();
    if (sessionStorage.getItem("token")) {
      fetchWishList();
    }
  }, [category_id, brand_id]);

  const fetch = (data) => {
    console.log("HLo", data);
    setLoading(true);

    allProduct(data).then((res) => {
      console.log(res);
      setdata(res.data.data);

    })
      .catch((err) => {
        console.log(err);

      })
      .finally(() => {
        setLoading(false);
      });
  };
  const fetchWishList = () => {
    if (!sessionStorage.getItem("token")) return;
    allwishList({ public: 0 })
      .then((res) => {
        if (res.data && res.data.success) {
          setWishListData(res.data.data);
        }
      })
      .catch((err) => {
        console.log("Wishlist fetch error:", err);
      });
  };


  const fetch1 = (data1) => {
    allCategory(data1).then((res) => {
      console.log(res.data.data);
      setdata1(res.data.data);
    })
      .catch((err) => {
        console.log(err);

      });
  };

  // This is Cart Demo
  const addToCart = (element) => {
    const user = sessionStorage.getItem("userId");

    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to add items to your cart.",
        icon: "info",
        confirmButtonText: "Log In",
        confirmButtonColor: "#81c408"
      }).then(() => {
        navigate("/login");
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

  const navotShop = (id) => {
    navigate(`/ShopDetail/${id}`)
  }


  const AddWISHLIST = () => {
    // apis call 
    const addwishListData = {
      name: addwishlistname,
      ispublic: 0
    }

    addwishList(addwishListData).then((res) => {
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message);

        const addProductData = {
          _id: res.data.data._id,
          productId: selectedProductId
        }

        console.log(addProductData);
        fetchWishList();

        addItem(addProductData).then((res) => {
          console.log(res);

          if (res.data.success) {
            toast.success(res.data.message);
            closeModal()
          } else {
            toast.error(res.data.message);
          }
        })
          .catch((err) => {
            toast.error(err);
          });


      } else {
        toast.error(res.data.message);
      }
    })
      .catch((err) => {
        toast.error(err);
      });
  }
  const AddITEM = () => {
    // apis call 
    const addProductData = {
      _id: wishlist,
      productId: selectedProductId
    }

    console.log(addProductData);


    addItem(addProductData).then((res) => {
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    })
      .catch((err) => {
        toast.error(err);
      });
  }


  //  let subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal(productId) {
    setSelectedProductId(productId);
    setIsOpen(true);
    fetchWishList();
  }
  const fetchproductsbycat = async (id) => {
    try {
      setLoading(true);
      if (id === "ALL") {
        fetch();
      } else {
        const data4 = { category_id: id };
        const res = await getproductbycat(data4);
        console.log(res);
        setdata(res.data.data);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetchproductsbybrand = async (id) => {
    try {
      setLoading(true);
      if (id === "ALL") {
        fetch();
      } else {
        const brandData = { brand_id: id };
        const res = await getproductbybrand(brandData);
        console.log(res);
        setdata(res.data.data);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  function closeModal() {
    setIsOpen(false);
    setSelectedProductId(null);
    setisAdd(false)
  }

  return (
    <>
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">View Products</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>

          <li className="breadcrumb-item active text-white">Product</li>
        </ol>
      </div>
      {/* Single Page Header End */}
      {/* Fruits CardCategory Start*/}
      <div className="container-fluid fruite py-5">
        <div className="container py-3 py-md-5">
          <h1 className="mb-4 text-center text-md-start">Products</h1>
          <div className="row g-4">
            <div className="col-12">
              <div className="row g-4 mb-3">
                <div className="col-12 col-md-6 col-lg-4 ms-auto">
                  <div className="input-group w-100">
                    <input
                      type="search"
                      className="form-control p-3"
                      value={search}
                      onChange={(e) => {
                        setsearch(e.target.value)
                      }}
                      placeholder="Search products..."
                      aria-describedby="search-icon-1"
                    />
                    <span id="search-icon-1" className="input-group-text p-3">
                      <i className="fa fa-search" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="row g-4">
                <div className="col-12 col-lg-3">
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="mb-3 p-3 bg-light rounded-3">
                        <h4 className="fw-bold mb-3 text-primary">Categories</h4>
                        <ul className="list-unstyled fruite-categorie mb-0">
                          <li>
                            <div className="d-flex justify-content-between fruite-name text-success">
                              <button onClick={() => {
                                fetchproductsbycat("ALL")
                              }} className="btn hover-btn text-start p-1 fw-semibold">
                                All
                              </button>
                            </div>
                          </li>

                          {data1?.map((Element, index) => (
                            <li key={index}>
                              <div className="d-flex justify-content-between fruite-name text-success">
                                <button onClick={() => {
                                  fetchproductsbycat(Element._id)
                                }} className="btn hover-btn text-start p-1">
                                  {Element.name}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-9">
                  <div className="row g-4">

                    {loading ? (
                      <div className="col-12 d-flex justify-content-center align-items-center py-5 my-5">
                        <HashLoader size={60} color={"#81c408"} />
                      </div>
                    ) : (
                      data?.filter(el => (
                        el.name.toLowerCase().includes(search.toLowerCase())
                      )).map((el, index) => (
                        <div className="col-12 col-sm-6 col-md-6 col-lg-4" key={el._id || index}>
                          <CustomerProductCardItem
                            el={el}
                            isLogin={isLogin}
                            openModal={openModal}
                            navotShop={navotShop}
                          />
                        </div>
                      )))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </a>

      <div>
        {/* <button onClick={() => openModal(element?._id)}>Open Modal</button> */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          ariaHideApp={false}
          contentLabel="Wishlist Selection Modal"
        >
          <div className="invite-modal-card p-4 position-relative">
            <button
              type="button"
              onClick={closeModal}
              className="btn-close-modal position-absolute top-0 end-0 m-3"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center mb-4 pt-2">
              <div className="modal-icon-badge mx-auto mb-3 d-flex align-items-center justify-content-center text-white">
                <i className={isAdd ? "fa-solid fa-heart-circle-plus" : "fa-solid fa-heart"}></i>
              </div>
              <h4 className="fw-bold mb-1 text-dark">
                {isAdd ? "Create New Wishlist" : "Add to Wishlist"}
              </h4>
              <p className="text-muted small mb-0 px-2">
                {isAdd ? "Enter a name for your new wishlist collection." : "Select an existing wishlist to save this product."}
              </p>
            </div>

            {isAdd ? (
              <div className="invite-pill-container">
                <i className="fa-solid fa-folder-plus modal-input-icon ms-1"></i>
                <input
                  type="text"
                  className="invite-input"
                  placeholder="Wishlist Name (e.g., Favorites)"
                  value={addwishlistname}
                  onChange={(e) => setaddwishlistname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') AddWISHLIST();
                  }}
                />
                <button type="button" className="invite-btn" onClick={AddWISHLIST}>
                  <span>Create</span>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select rounded-pill py-2 px-3 border shadow-sm"
                    style={{ cursor: "pointer", fontSize: "0.95rem" }}
                    value={wishlist}
                    onChange={(e) => setWishList(e.target.value)}
                  >
                    <option value="">Select Wishlist</option>
                    {WishListData?.map((ele) => (
                      <option key={ele?._id} value={ele?._id}>
                        {ele?.listName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-success rounded-circle icon-hover-bounce d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "42px", height: "42px" }}
                    title="Create New Wishlist"
                    onClick={() => setisAdd(true)}
                  >
                    <i className="fa-solid fa-plus fs-6"></i>
                  </button>
                </div>
                <button
                  type="button"
                  className="invite-btn w-100 justify-content-center mt-1"
                  onClick={AddITEM}
                >
                  <span>Add to Selected Wishlist</span>
                  <i className="fa-solid fa-circle-check"></i>
                </button>
              </div>
            )}
          </div>
        </Modal>
      </div>


    </>
  )
}