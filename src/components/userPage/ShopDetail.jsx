import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { single, getproductbycat } from "../server/Product";
import { addCart } from "../server/Cart";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { addreview, allreview } from "../server/Review";
import ReactStars from 'react-stars'
import React from 'react'
import AddToCartButton from "../common/AddToCartButton";

export default function ShopDetail() {
  const { _id } = useParams();
  const [data, setdata] = useState();
  const [products, setproducts] = useState();
  const navigate = useNavigate();
  const [cat_id, setcat_id] = useState();
  const [review, setReview] = useState();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [_id]);

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
      .filter((img) => typeof img === "string" && img.trim() !== "")
      .map((img) => {
        const trimmed = img.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
          return trimmed;
        }
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      });
  };

  const productImages = getProductImages(data?.image);
  const currentMainImage = productImages[selectedImageIndex] || "/assets/img/placeholder.jpg";

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
      Swal.fire({
        title: "Login Required",
        text: "Please log in to submit a review.",
        icon: "info",
        confirmButtonText: "Log In",
        confirmButtonColor: "#81c408"
      }).then(() => {
        navigate("/login");
      });
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
      if (res?.data?.data) {
        setdata(res.data.data);
        const catId = res.data.data?.category_id?._id || res.data.data?.category_id;
        if (catId) {
          setcat_id(catId);
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  };
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
                  {/* Main Image Display Box */}
                  <div
                    className="border rounded position-relative shadow-sm bg-white overflow-hidden p-2"
                    style={{ position: "relative", minHeight: "360px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <div
                      className="w-100 text-center position-relative"
                      onClick={() => setIsLightboxOpen(true)}
                      style={{ cursor: "zoom-in" }}
                      title="Click to view full screen"
                    >
                      <img
                        src={currentMainImage}
                        className="img-fluid rounded"
                        alt={data?.name || "Product Image"}
                        style={{ maxHeight: "420px", width: "auto", objectFit: "contain", transition: "all 0.3s ease" }}
                      />
                    </div>

                    {/* Expand / Lightbox Button */}
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="btn btn-light btn-sm rounded-circle shadow-sm position-absolute"
                      style={{ top: "12px", right: "12px", zIndex: 5, width: "36px", height: "36px" }}
                      title="View Fullsize"
                    >
                      <i className="fa-solid fa-expand text-secondary"></i>
                    </button>

                    {/* Image Count Badge */}
                    {productImages.length > 1 && (
                      <span
                        className="badge bg-dark bg-opacity-75 text-white position-absolute rounded-pill px-3 py-2"
                        style={{ top: "12px", left: "12px", zIndex: 5, fontSize: "12px", backdropFilter: "blur(4px)" }}
                      >
                        <i className="fa-solid fa-camera me-1"></i> {selectedImageIndex + 1} / {productImages.length}
                      </span>
                    )}

                    {/* Navigation Arrows for Main Image */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                          }}
                          className="btn btn-light btn-sm rounded-circle shadow-sm position-absolute d-flex align-items-center justify-content-center"
                          style={{ left: "12px", top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", zIndex: 5, opacity: 0.9 }}
                          title="Previous Image"
                        >
                          <i className="fa-solid fa-chevron-left text-dark"></i>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="btn btn-light btn-sm rounded-circle shadow-sm position-absolute d-flex align-items-center justify-content-center"
                          style={{ right: "12px", top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", zIndex: 5, opacity: 0.9 }}
                          title="Next Image"
                        >
                          <i className="fa-solid fa-chevron-right text-dark"></i>
                        </button>
                      </>
                    )}

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

                  {/* Thumbnail Gallery Strip */}
                  {productImages.length > 0 && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold text-uppercase text-muted" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                          Product Images ({productImages.length})
                        </span>
                        {data?.vendorId && (
                          <span className="badge bg-light text-secondary border">
                            <i className="fa-solid fa-store me-1"></i> Uploaded by Vendor
                          </span>
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        {productImages.map((imgUrl, idx) => {
                          const isSelected = idx === selectedImageIndex;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className="position-relative rounded overflow-hidden"
                              style={{
                                width: "75px",
                                height: "75px",
                                cursor: "pointer",
                                border: isSelected ? "3px solid #81c408" : "1.5px solid #dee2e6",
                                boxShadow: isSelected ? "0 4px 12px rgba(129, 196, 8, 0.4)" : "0 2px 4px rgba(0,0,0,0.05)",
                                transform: isSelected ? "scale(1.05)" : "scale(1)",
                                transition: "all 0.2s ease-in-out",
                                backgroundColor: "#ffffff"
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`Thumbnail ${idx + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                        <div key={index} className="mb-4 p-3 border rounded shadow-sm bg-white">
                          <div className="d-flex align-items-start">
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

                          {/* Vendor / Store Reply */}
                          {el.reply && (
                            <div className="mt-3 ms-md-5 p-3 rounded bg-light border-start border-4 border-success shadow-xs">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-success" style={{ fontSize: "14px" }}>
                                  <i className="fa-solid fa-store me-2"></i>Store Reply:
                                </span>
                                {el.repliedAt && (
                                  <small className="text-muted" style={{ fontSize: "12px" }}>
                                    {new Date(el.repliedAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </small>
                                )}
                              </div>
                              <p className="mb-0 text-dark fw-medium" style={{ fontSize: "14px", lineHeight: "1.5" }}>
                                {el.reply}
                              </p>
                            </div>
                          )}
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
                        src={getProductImages(card?.image)?.[0] || "/assets/img/placeholder.jpg"}
                        className="img-fluid w-100 rounded-top " style={{ height: "300px", objectFit: "cover" }}
                        alt="Product Image"
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

      {/* Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="modal d-block bg-dark bg-opacity-75"
          tabIndex="-1"
          style={{ zIndex: 1060, backdropFilter: "blur(5px)" }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark text-white border-0 shadow-lg position-relative rounded-4 overflow-hidden">
              {/* Header */}
              <div className="modal-header border-secondary d-flex align-items-center justify-content-between px-4 py-3">
                <h6 className="modal-title mb-0 text-light fw-bold">
                  <i className="fa-regular fa-image me-2 text-success"></i>
                  {data?.name || "Product"} - Image {selectedImageIndex + 1} of {productImages.length}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsLightboxOpen(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body text-center p-4 position-relative d-flex align-items-center justify-content-center" style={{ minHeight: "450px" }}>
                <img
                  src={currentMainImage}
                  alt={data?.name}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />

                {/* Lightbox Navigation Buttons */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="btn btn-dark btn-lg rounded-circle position-absolute border-secondary shadow"
                      style={{ left: "20px", top: "50%", transform: "translateY(-50%)", width: "50px", height: "50px", opacity: 0.9 }}
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    >
                      <i className="fa-solid fa-chevron-left text-white"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark btn-lg rounded-circle position-absolute border-secondary shadow"
                      style={{ right: "20px", top: "50%", transform: "translateY(-50%)", width: "50px", height: "50px", opacity: 0.9 }}
                      onClick={() => setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    >
                      <i className="fa-solid fa-chevron-right text-white"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Modal Footer with Thumbnails */}
              {productImages.length > 1 && (
                <div className="modal-footer border-secondary justify-content-center py-2 px-3 bg-black bg-opacity-50">
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {productImages.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Modal Thumbnail ${idx + 1}`}
                        onClick={() => setSelectedImageIndex(idx)}
                        className="rounded cursor-pointer"
                        style={{
                          width: "55px",
                          height: "55px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: idx === selectedImageIndex ? "2px solid #81c408" : "1px solid #555",
                          opacity: idx === selectedImageIndex ? 1 : 0.6,
                          transition: "all 0.2s ease"
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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