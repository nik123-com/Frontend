import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { allCart, decrement, HardDelete, increment } from "../../server/Cart";
import { addOrder } from "../../server/Order";
import {allCoupon} from "../../server/Coupon";
import {AllAddress} from '../../server/Address'
import { numberToWords } from "../../../utils/numberToWords";

export default function Cart() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState();
  const [total, settotal] = useState();
  const [coupon, setcoupon] = useState();
  const [couponData, setcouponData] = useState();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [address,setAddress] = useState();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId")

  
  // const navigate = useNavigate();
  useEffect(() => {
    fetch(true);
    fetchAddress();
  }, []);


  const fetch = (isInitial = false) => {
    if (isInitial) setLoading(true);

    allCart({data, userId}).then((res) => {
      setData(res.data.data || []);

      //For Calculating Total(We use Reduce Function because map() is not execute at the end of React)
      let t = (res.data.data || []).reduce((acc, CurrentValue) => {
        return acc + (CurrentValue.price * CurrentValue.qty)
        //  console.log(acc + Element.price );
      }, 0)
      settotal(t)
      // console.log("total",total);
    }).catch((err) => {
      console.log(err);

    }).finally(() => {
      setLoading(false);
    });
  }
  const deliveryCharge = total > 0 ? 70 : 0;

  const checkOut = async () => {
    try {
      if (!userId) {
        toast.error("Please login first");
        return;
      }
      if (!address) {
        toast.error("Please select a delivery address");
        return;
      }

      setPlacingOrder(true);
      const payload = {
        userId: userId,
        shipingAddress: address,
        paymentMethod: "COD",
        totalAmount: total + deliveryCharge,
        discount: 0
      };

      if (appliedCoupon) {
        payload.couponId = appliedCoupon._id;
        payload.discount = appliedCoupon.discount;
      }

      const res = await addOrder(payload);
      if (res?.data?.success) {
        toast.success(res.data.message);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/myorders");
      } else {
        toast.error(res?.data?.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Something went wrong");
    } finally {
      setPlacingOrder(false);
    }
  };

   const fetchAddress = () => {
  AllAddress({userId})
    .then((res) => {
      console.log(res);

      if (res.data.success) {
        setData3(res.data.data);
        if (res.data.data && res.data.data.length > 0) {
          setAddress(res.data.data[0]._id);
        }
      } else {
        toast.warning("Failed to load Address");
      }
    })
    .catch((err) => {
      console.log(err);
      toast.error("Error fetching Addresses");
    });
};

  const Increment = (_id) => {
    const data = {
      cart_id: _id,
    }
    increment(data)
      .then((res) => {
        console.log(res);
        // setData(res.data.data);
        fetch()
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const Decrement = (_id, qty) => {
  const data = {
    cart_id: _id,
  };

  decrement(data)
    .then((res) => {
      fetch();
      window.dispatchEvent(new Event("cartUpdated"));
    })
    .catch((err) => {
      console.log(err);
    });
};

  //Delete Hard
  const deleteCart = (id) => {
    const data2 = {
      _id: id,
    };

    HardDelete(data2).then((res) => {
      console.log(res);
      if (res.data.success) {
        toast.success(res.data.message);

      } else {
        toast.warning(res.data.message);
      }
      fetch();
      window.dispatchEvent(new Event("cartUpdated"));
    }).catch((err) => {
      console.log(err);
      toast.error(err)
    });
  }


  const applyCoupon = () => {
    allCoupon({ code: coupon }).then((res) => {
      console.log(res);
      if (res.data.data.length > 0) {
        toast.success("Coupon loaded")
        setcouponData(res.data.data)
      } else {
        toast.warning("Coupon Not found")

      }

    }).catch((err) => {

    })
  }
  const Check = () => {
    console.log(total, couponData[0].minAmoutSpend);

    if (total >= couponData[0].minAmoutSpend) {
      if(couponData[0].discountType=="1"){
        settotal(total - couponData[0].discount)
      }else{
      let per=(total/100)*couponData[0].discount
      console.log(per);
        settotal(total - per)
      }
      setAppliedCoupon(couponData[0]);
      toast.success("Congratulations Your Coupon Applied")
    } else {
      toast.info("Sorry, Try Next time")
    }
  }
  return (
    <>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Cart</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Cart</li>
        </ol>
      </div>
      {/* Single Page Header End */}
      {/* Cart Page Start */}
      <div className="container-fluid py-3 py-md-5">
        <div className="container py-3 py-md-4">
          <div className="table-responsive shadow-sm rounded border bg-white mb-4">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-center ps-4" style={{ width: "120px" }}>Products</th>
                  <th scope="col" className="text-start">Name</th>
                  <th scope="col" className="text-center">Price</th>
                  <th scope="col" className="text-center">Quantity</th>
                  <th scope="col" className="text-center">Total</th>
                  <th scope="col" className="text-center pe-4">Handle</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted fw-semibold mb-0">Loading cart items...</p>
                    </td>
                  </tr>
                ) : data?.length > 0 ? (
                  data?.map((Element) => (
                    <tr key={Element?._id}>
                      <td className="text-center ps-4">
                        <div className="d-flex align-items-center justify-content-center">
                          <img
                            src={Array.isArray(Element?.product_id?.image) ? Element?.product_id?.image?.[0] : Element?.product_id?.image}
                            className="img-fluid rounded-circle"
                            style={{ width: 70, height: 70, objectFit: "cover" }}
                            alt={Element?.product_id?.name || ""}
                          />
                        </div>
                      </td>
                      <td className="text-start">
                        <p className="mb-0 fw-semibold text-dark">{Element?.product_id?.name}</p>
                      </td>
                      <td className="text-center">
                        <p className="mb-0 fw-medium">₹ {Element?.price}</p>
                      </td>
                      <td className="text-center">
                        <div
                          className="input-group quantity mx-auto"
                          style={{ width: 110 }}
                        >
                          <div className="input-group-btn">
                            <button onClick={() => { Decrement(Element._id) }} className="btn btn-sm btn-minus rounded-circle bg-light border">
                              <i className="fa fa-minus" />
                            </button>
                          </div>
                          <input style={{ backgroundColor: "white" }}
                            type="text"
                            className="form-control form-control-sm text-center border-0"
                            value={Element?.qty}
                            disabled
                          />
                          <div className="input-group-btn">
                            <button onClick={() => { Increment(Element._id)}} className="btn btn-sm btn-plus rounded-circle bg-light border">
                              <i className="fa fa-plus" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <p className="mb-0 fw-semibold text-success">₹ {Element.price * Element.qty}</p>
                      </td>
                      <td className="text-center pe-4">
                        <button onClick={() => { deleteCart(Element?._id) }} className="btn btn-md rounded-circle bg-light border" title="Remove Item">
                          <i className="fa fa-times text-danger" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="fa fa-shopping-cart fs-1 mb-3 text-secondary d-block"></i>
                      <h5 className="fw-normal">Your cart is empty</h5>
                      <Link to="/cardproduct" className="btn btn-sm btn-outline-primary rounded-pill px-4 mt-2">
                        Browse Products
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Coupon Input Section */}
          <div className="mt-5">
            <input
              type="text"
              className="border border-primary rounded me-5 py-3 px-3 mb-4 bg-white text-dark"
              placeholder="Coupon Code"
              value={coupon}
              onChange={(e) => { setcoupon(e.target.value) }}
            />
            <button
              className="btn border-secondary rounded-pill px-4 py-4 m-4 text-primary"
              type="button"
              disabled={!coupon || coupon == null}
              onClick={applyCoupon}
            >
              Apply Coupon
            </button>
          </div>

          {/* Choose Address */}
          <div className="d-flex justify-content-end mb-3">
            <select
              className="form-control"
              style={{ width: "200px" }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            >
              <option value="">Select Address</option>
              {data3?.map((el, index) => (
                <option key={el._id} value={el._id}>
                  {el.houseno},{el.landmark},{el.district},{el.city},{el.state},{el.country},{el.pin}
                </option>
              ))}
            </select>
            <Link to="/address/add"><i className="fa-solid fa-plus fs-4 m-2"></i></Link>
          </div>

          {/* Cards Row — Coupon card (if any) + Cart Total side by side */}
          <div className="d-flex flex-wrap gap-4 mt-2">

            {/* Coupon Card */}
            {!!couponData && (
              <div style={{ flex: "1 1 300px", maxWidth: "420px" }}>
                <div className="bg-light rounded h-100">
                  <div className="p-4">
                    <h1 className="display-6 mb-4">
                      <span className="fw-normal">Coupon</span>
                    </h1>
                    <div className="d-flex justify-content-between mb-4">
                      <h5 className="mb-0 me-4">Code:</h5>
                      <p className="mb-0">{couponData[0].code}</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <h5 className="mb-0 me-4">Discount</h5>
                      <p className="mb-0">{couponData[0].discount}</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="mb-0">Discount Type</p>
                      <p className="mb-0">
                        {couponData[0].discountType == "1" ? "Flate" : "Percentage"}
                      </p>
                    </div>
                  </div>
                  <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between px-4">
                    <h5 className="mb-0">Minmum amt</h5>
                    <p className="mb-0">₹{couponData[0].minAmoutSpend}</p>
                  </div>
                  <div className="text-center mb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); Check(); }}
                      className="btn border-secondary rounded-pill px-4 py-3 m-4 text-primary text-uppercase"
                      type="button"
                    >
                      Applied Coupon
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Total Card */}
            <div  style={{
    marginLeft: "auto",
    width: "420px",
    maxWidth: "100%",
  }}>
              <div className="bg-light rounded h-100">
                <div className="p-4">
                  <h1 className="display-6 mb-4">
                    Cart <span className="fw-normal">Total</span>
                  </h1>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="mb-0 me-4">Subtotal:</h5>
                    <p className="mb-0">₹ {total}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 me-4">handling fees</h5>
                    <p className="mb-0">{deliveryCharge}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p className="mb-0">Delivery Charges</p>
                    <span></span>
                  </div>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between px-4">
                  <h5 className="mb-0">Total</h5>
                  <div className="text-end">
                    <p className="mb-0 fw-bold">₹{total + deliveryCharge}</p>
                    <small className="text-muted d-block fw-bold" style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                      {numberToWords(total + deliveryCharge)}
                    </small>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/checkout') }}
                    className="btn border-secondary rounded-pill px-4 py-3 m-4 text-primary text-uppercase"
                    type="button"
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Placing Order...
                      </>
                    ) : (
                      "Proceed Checkout"
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
      {/* Cart Page End */}
      {/* Back to Top */}
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