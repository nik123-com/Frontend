import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { single, getproductbycat } from "../server/Product";
import { addCart } from "../server/Cart";
import { toast } from "react-toastify";
import { addreview, allreview } from "../server/Review";
import ReactStars from 'react-stars'
import React from 'react'
import AddToCartButton from "../common/AddToCartButton";

export default function ShopDetail() {

  const [data, setdata] = useState()
  const [products, setproducts] = useState();
  const navigate = useNavigate();
  const [cat_id, setcat_id] = useState();
  const [review, setReview] = useState();
  const { _id } = useParams()

  const ratingChanged = (newRating) => {
    setRating(newRating);
    console.log("Selected Rating:", newRating);
  }

  // Reviews
  const userId = sessionStorage.getItem("userId");
  const [username, setUsername] = useState(sessionStorage.getItem("userId.name") || "");
  const [usermail, setUsermail] = useState(sessionStorage.getItem('email') || "");
  const [message, setMessage] = useState();
  const [rating, setRating] = useState(0);
  const ChangeUsername = (e) => {
    setUsername(e.target.value)
  }
  const ChangeUsermail = (e) => {
    setUsermail(e.target.value)
  }
  const ChangeMessage = (e) => {
    setMessage(e.target.value)
  }


  const changeRating = (newRating) => {
    setRating(newRating);
  };
  const Reviews = (e) => {
    e.preventDefault();

    const user = sessionStorage.getItem("userId");
    if (!user) {
      alert("Login first");
      navigate("/login");
      return;
    }

    let feedback = {
      comment: message,
      rating: rating,
      productId: _id
    };

    console.log("Sending:", feedback);

    addreview(feedback)
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          toast.success("Thanks for Reviews 😊 ")
          setMessage("");
          setRating(0);
          fetchreviews();
        } else {
          toast.error(res.data.message || "Failed to submit review");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchreviews = () => {
    if (!_id) return;
    allreview({ productId: _id }).then((res) => {
      console.log(res);
      setReview(res.data.data)
      toast.success(res.data.message)
    }).catch((err) => {
      console.log(err);
    })
  }
  // Reviews
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
      // console.log(res.data.message)
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


  const getsingle = () => {

    single({ _id: _id }).then((res) => {
      // console.log(res.data.data.category_id._id);
      setdata(res.data.data)
      setcat_id(res.data.data.category_id._id)
    }).catch((err) => {
      console.log(err);

    })
  }
  const category_id = cat_id;
  console.log(category_id);


  const fetchproductsbycat = async () => {
    try {

      const data4 = {
        "category_id": category_id
      }

      const res = await getproductbycat(data4)

      if (res.data.success) {
        setproducts(res.data.data);
        console.log(res.data.data);
      }
      else {
        // console.log(res.data.data);
      }
    }
    catch (err) {
      console.log(err);
    }

  }

  // console.log("Filtered products are", products)


  useEffect(() => {
    if (_id) {
      getsingle();
      fetchreviews();
    }
  }, [_id]);
  useEffect(() => {
    if (cat_id) {
      fetchproductsbycat();
    }
  }, [cat_id]);
  return (
    <>

      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Shop Detail</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Shop Detail</li>
        </ol>
      </div>
      {/* Single Page Header End */}

      {/* Single Product Start */}
      <div className="container-fluid py-5 mt-5">
        <div className="container py-5">
          <div className="row g-4 mb-5">
            <div className="col-lg-12 col-xl-12">
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="border rounded position-relative" style={{ position: "relative" }}>
                    <a href="#">
                      <img
                        src={Array.isArray(data?.image) ? data?.image?.[0] : data?.image}
                        className="img-fluid rounded"
                        alt="Image"
                      />
                    </a>
                    {data?.status === false && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "16px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "#424242",
                          color: "#ffffff",
                          padding: "8px 24px",
                          borderRadius: "10px",
                          fontWeight: "700",
                          fontSize: "16px",
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
                </div>
                <div className="col-lg-6">
                  <h4 className="fw-bold mb-3">{data?.name}</h4>
                  <div className="d-flex mb-3 align-items-center">
                    <ReactStars
                      count={5}
                      value={Number(data?.rating || 0)}
                      edit={false}
                      size={24}
                      color2={"#ffd700"}
                    />
                    {data?.rating > 0 && (
                      <span className="ms-2 text-muted">({Number(data.rating).toFixed(1)} / 5)</span>
                    )}
                  </div>
                  <p className="mb-3">Category: {data?.category_id?.name}</p>

                  <h5 className="fw-bold mb-3">₹ {data?.price}</h5>

                  <p className="mb-4">
                    {data?.description}
                  </p>



                  <AddToCartButton product={data} variant="full" className="mb-4" />
                </div>
                <div className="col-lg-12">
                  <nav>
                    <div className="nav nav-tabs mb-3">
                      <button
                        className="nav-link active border-white border-bottom-0"
                        type="button"
                        role="tab"
                        id="nav-about-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#nav-about"
                        aria-controls="nav-about"
                        aria-selected="true"
                      >
                        Description
                      </button>
                      <button
                        className="nav-link border-white border-bottom-0"
                        type="button"
                        role="tab"
                        id="nav-mission-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#nav-mission"
                        aria-controls="nav-mission"
                        aria-selected="false"
                        onClick={fetchreviews}
                      >
                        Reviews
                      </button>
                    </div>
                  </nav>

                  <div className="tab-content mb-5">
                    <div
                      className="tab-pane active"
                      id="nav-about"
                      role="tabpanel"
                      aria-labelledby="nav-about-tab"
                    >

                      <div className="px-2">
                        <div className="row g-4">
                          <div className="col-6">
                            <div className="row bg-light align-items-center text-center justify-content-center py-2">
                              <div className="col-6">
                                <p className="mb-0">Weight</p>
                              </div>
                              <div className="col-6">
                                <p className="mb-0">1 kg</p>
                              </div>
                            </div>

                            <div className="row text-center align-items-center justify-content-center py-2">
                              <div className="col-6">
                                <p className="mb-0">Country of Origin</p>
                              </div>
                              <div className="col-6">
                                <p className="mb-0">Agro Farm</p>
                              </div>
                            </div>

                            <div className="row bg-light text-center align-items-center justify-content-center py-2">
                              <div className="col-6">
                                <p className="mb-0">Quality</p>
                              </div>
                              <div className="col-6">
                                <p className="mb-0">Organic</p>
                              </div>
                            </div>

                            <div className="row text-center align-items-center justify-content-center py-2">
                              <div className="col-6">
                                <p className="mb-0">Сheck</p>
                              </div>
                              <div className="col-6">
                                <p className="mb-0">Healthy</p>
                              </div>
                            </div>

                            <div className="row bg-light text-center align-items-center justify-content-center py-2">
                              <div className="col-6">
                                <p className="mb-0">Min Weight</p>
                              </div>
                              <div className="col-6">
                                <p className="mb-0">250 Kg</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="tab-pane"
                      id="nav-mission"
                      role="tabpanel"
                      aria-labelledby="nav-mission-tab"
                    >
                      {review?.map((el, index) => (
                        <div key={index} className="d-flex mb-4 p-3 border rounded shadow-sm bg-white align-items-start">
                          <div className="me-3" style={{ flexShrink: 0 }}>
                            <img
                              src="/assets/img/avatar.jpg"
                              className="img-fluid rounded-circle"
                              style={{ width: 60, height: 60, objectFit: "cover" }}
                              alt="avatar"
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-2">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "16px" }}>{el?.userId?.name}</h5>
                                <div className="d-flex align-items-center" style={{ pointerEvents: 'none', height: '24px' }}>
                                  <ReactStars
                                    count={5}
                                    value={Number(el.rating)}
                                    edit={false}
                                    size={18}
                                    color2={"#ffd700"}
                                  />
                                </div>
                              </div>
                              <span className="text-muted" style={{ fontSize: "13px" }}>
                                {new Date(el.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <p className="mb-0 text-secondary" style={{ fontSize: "14px", lineHeight: "1.5" }}>
                              {el.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <form action="#">
                  <h4 className="mb-5 fw-bold">Leave a Reply</h4>
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="border-bottom rounded">
                        <input
                          type="text"
                          value={username}
                          onChange={ChangeUsername}
                          className="form-control border-0 me-4"
                          placeholder="Your Name *"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="border-bottom rounded">
                        <input
                          type="email"
                          value={usermail}
                          onChange={ChangeUsermail}
                          className="form-control border-0"
                          placeholder="Your Email *"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="border-bottom rounded my-4">
                        <textarea
                          className="form-control border-0"
                          cols={30}
                          rows={8}
                          value={message || ""}
                          onChange={ChangeMessage}
                          placeholder="Your Review *"
                          spellCheck="false"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="d-flex justify-content-between py-3 mb-5">
                        <div className="d-flex align-items-center">
                          <p className="mb-0 me-3">Please rate:</p>
                          <div
                            className="d-flex align-items-center"
                            style={{ fontSize: 12 }}
                          >
                            <ReactStars
                              count={5}
                              onChange={ratingChanged}
                              value={rating}
                              size={24}
                              color2={"#ffd700"}
                            />
                          </div>
                        </div>

                        <button
                          onClick={Reviews}
                          className="btn border border-secondary text-primary rounded-pill px-4 py-3"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>


          </div>

          {/* Related products header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fw-bold mb-0">Related products</h1>
          </div>
          <div className="row g-4">

            {products?.map((card, index) => {
              return (

                <div className="col-md-6 col-lg-4 col-xl-3">
                  <div className="rounded position-relative fruite-item">
                    <div className="fruite-img">
                      <img
                        src={Array.isArray(card?.image) ? card?.image?.[0] : card?.image}
                        className="img-fluid w-100 rounded-top " style={{ height: "300px" }}
                        alt="Image is loading..."
                      />
                    </div>
                    <div
                      className="text-white bg-primary px-3 py-2 rounded position-absolute"
                      style={{ top: 12, right: 12 }}
                    >
                      {card.category_id?.name}
                    </div>
                    <div className="p-4 border border-primary border-top-0 rounded-bottom">
                      <h4>{card?.name}</h4>
                      <p>
                        {card?.description}
                      </p>
                      <div className="d-flex justify-content-between flex-lg-wrap">
                        <p className="text-dark fs-5 fw-bold mb-0">{card.price}</p>
                        <AddToCartButton product={card} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
      {/* Single Product End */}
      <a
        href="#"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </a>
    </>
  )
}