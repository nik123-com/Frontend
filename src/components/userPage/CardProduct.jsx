import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setsearch] = useState("");
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
    if (category_id) {
      fetchproductsbycat(category_id);
    } else if (brand_id) {
      fetchproductsbybrand(brand_id);
    } else {
      fetch();
    }
    fetch1();
    fetchWishList();
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
  const fetchWishList = (WishListData) => {
    allwishList({ public: 0 })
      .then((res) => {
        console.log(res);

        if (res.data.success) {
          console.log(res);
          setWishListData(res.data.data);
        } else {
          // toast.warning("Failed to load WishList");
          console.log(res)
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching WishList");
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
                        <div onClick={() => {
                          navotShop(el._id)
                        }} className="h-100">
                          <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
                            <div className="fruite-img position-relative" style={{ position: "relative" }}>
                              <img
                                src={Array.isArray(el?.image) ? el?.image?.[0] : el?.image}
                                className="img-fluid rounded-top"
                                alt={el?.name || "Image"}
                              />
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
                            <div
                              className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                              style={{ top: 10, left: 10 }}
                            >
                              {el.category_id?.name}
                            </div>
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
                                    <button className="btn fs-4 p-0 text-secondary" onClick={(e) => {
                                      e.stopPropagation();
                                      openModal(el._id)
                                    }}>
                                      <i className="fa-regular fa-bookmark"></i>
                                    </button>
                                  )}
                                  <AddToCartButton product={el} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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