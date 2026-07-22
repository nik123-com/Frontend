import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { allProduct, getproductbycat, getproductbybrand } from "../server/Product";
import { addCart } from "../server/Cart"
import { addItem, addwishList, allwishList } from '../server/WishList'

import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { allCategory } from "../server/Category";
import { Colors } from "chart.js";


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    borderRadius: "34px",
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};


export default function CardProduct() {
  const isLogin = sessionStorage.getItem("isLogin") === "true";
  const { category_id, brand_id } = useParams();

  const [data, setdata] = useState([]);
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

    allProduct(data).then((res) => {
      console.log(res);
      setdata(res.data.data);

    })
      .catch((err) => {
        console.log(err);

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
      alert("Login first");
      navigate("/login");
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
        toast.error(res.data.data);
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
      if (id === "ALL") {
        fetch();
      } else {
        const data4 = { category_id: id };
        const res = await getproductbycat(data4);
        console.log(res);
        setdata(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchproductsbybrand = async (id) => {
    try {
      if (id === "ALL") {
        fetch();
      } else {
        const brandData = { brand_id: id };
        const res = await getproductbybrand(brandData);
        console.log(res);
        setdata(res.data.data);
      }
    } catch (err) {
      console.log(err);
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
        <div className="container py-5">
          <h1 className="mb-4">Products</h1>
          <div className="row g-4">
            <div className="col-lg-12">
              <div className="row g-4">
                <div className="col-xl-3">
                  <div className="input-group w-100 mx-auto d-flex">
                    <input
                      type="search"
                      className="form-control p-3"
                      value={search}
                      onChange={(e) => {
                        setsearch(e.target.value)
                      }}
                      placeholder="keywords"
                      aria-describedby="search-icon-1"
                    />
                    <span id="search-icon-1" className="input-group-text p-3">
                      <i className="fa fa-search" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="row g-4">
                <div className="col-lg-3">
                  <div className="row g-4">
                    <div className="col-lg-12">
                      <div className="mb-3"><br />
                        <h4>Categories</h4>
                        <ul className="list-unstyled fruite-categorie">
                          <li >
                            <div className="d-flex justify-content-between fruite-name text-success">
                              <button onClick={() => {
                                fetchproductsbycat("ALL")
                              }} className="btn hover-btn">
                                All
                              </button>
                              {/* <span>(3)</span> */}
                            </div>
                          </li>

                          {data1?.map((Element, index) => (
                            <li key={index}>
                              <div className="d-flex justify-content-between fruite-name text-success">
                                <button onClick={() => {
                                  fetchproductsbycat(Element._id)
                                }} className="btn hover-btn">
                                  {Element.name}
                                </button>
                                {/* <span>(3)</span> */}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>



                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="row g-4 justify-content-center">

                    {data?.filter(el => (
                      el.name.toLowerCase().includes(search.toLowerCase())
                    )).map((el, index) => (
                      <div className="col-md-6 col-lg-6 col-xl-4" key={el._id || index}>
                        <div onClick={() => {
                          navotShop(el._id)
                        }} className="h-100">
                          <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
                            <div className="fruite-img" style={
                              {
                                height: "300px"
                              }
                            }>
                              <img
                                src={Array.isArray(el?.image) ? el?.image?.[0] : el?.image}
                                className="img-fluid w-100 rounded-top"
                                style={{ height: "300px" }} alt="Image"
                              />
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
                              <div className="d-flex justify-content-between flex-lg-wrap mt-auto">
                                <p className="text-dark fs-5 fw-bold mb-0">
                                  ₹{el?.price}
                                </p>
                                {isLogin && (<>
                                  <button className="btn fs-2" onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(el._id)
                                  }}>
                                    <i class="fa-regular fa-bookmark"></i>
                                  </button>
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(el)
                                    // dispatch(INC)
                                  }}
                                    to="/"
                                    className="btn border border-secondary rounded-pill px-3 text-primary"
                                  >
                                    <i class="fa-solid fa-bag-shopping"></i>{" "}
                                    Add to cart
                                  </button>
                                </>)}
                              </div>
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
          // onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          ariaHideApp={false}
          contentLabel="Example Modal"
        >
          <button className="btn" onClick={closeModal}><i class="fa-solid fa-xmark"></i></button>
          {
            isAdd ?
              <div className="d-flex justify-content-end">
                <input type="text" value={addwishlistname} onChange={(e) => {
                  setaddwishlistname(e.target.value)
                }} />
                {/* <div onClick={()=>{
              setisAdd(false)
            }}><i class="fa-solid fa-plus fs-4 m-2"></i></div> */}
                <button onClick={AddWISHLIST} className="btn">Add</button>
              </div>
              :
              <div className="d-flex justify-content-end">
                <select
                  className="form-control"
                  style={{ width: "200px", cursor: "pointer" }}
                  value={wishlist}
                  onChange={(e) => setWishList(e.target.value)}
                >
                  <option value="">Choose</option>

                  {WishListData?.map((ele) => (
                    <option key={ele?._id} value={ele?._id}>
                      {ele?.listName}
                    </option>
                  ))}
                </select>
                <div onClick={() => {
                  setisAdd(true)
                }}><i class="fa-solid fa-plus fs-4 m-2"></i></div>
                <button className="btn" onClick={() => {
                  AddITEM()

                }}>Select</button>
              </div>

          }


        </Modal>
      </div>


    </>
  )
}