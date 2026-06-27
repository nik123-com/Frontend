import { useEffect, useState } from "react";
import { data, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { allCart } from "../../server/Cart";
import { AllAddress } from "../../server/Address";
import { addOrder } from "../../server/Order";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cartRes, addrRes] = await Promise.all([
        allCart({ userId }),
        AllAddress({ userId })
      ]);
      if (cartRes.data.success) setCartItems(cartRes.data.data);
      if (addrRes.data.success) setAddresses(addrRes.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load checkout data");
    }
    setLoading(false);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
  const deliveryCharge = cartItems.length > 0 ? 70 : 0;
  const grandTotal = subtotal + deliveryCharge;

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (paymentMethod === "ONLINE") {
      handleRazorpayPayment();
      return;
    }
    if (paymentMethod === "COD") {
      setPlacingOrder(true);
      try {
        const orderData = {
          userId,
          shipingAddress: selectedAddress,
          paymentMethod: "COD",
          paymentStatus: "Pending",
          totalAmount: grandTotal
        };
        const res = await addOrder(orderData);
        if (res.data.success) {
          toast.success("Order placed successfully!");
          navigate("/myorders");
        } else {
          toast.error(res.data.message || "Failed to place order");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setPlacingOrder(false);
      }
      return;
    }


  };
  const handleRazorpayPayment = () => {
    const options = {
      key: "rzp_test_T3MqnpQkpq38GN",

      amount: grandTotal * 100,
      currency: "INR",

      name: "Ecommerce Website",
      description: "Order Payment",
      handler: async function (response) {
        setPlacingOrder(true);
        try {
          const orderData = {
            userId,
            shipingAddress: selectedAddress,
            paymentMethod: "ONLINE",
            paymentStatus: "Paid",
            totalAmount: grandTotal
          };
          const res = await addOrder(orderData);
          if (res.data.success) {
            toast.success("Order placed successfully!");
            navigate("/myorders");
          } else {
            toast.error(res.data.message || "Failed to place order");
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Something went wrong while saving the order");
        } finally {
          setPlacingOrder(false);
        }
      },
      prefill: {
        name: "Nikhil",
        email: "nikhil@gmail.com",
        contact: "9779843211",
      },

      theme: {
        color: "#9BCB45"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    e.preventDefault();
  };
  return (
    <>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Checkout</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><a href="#">Pages</a></li>
          <li className="breadcrumb-item active text-white">Checkout</li>
        </ol>
      </div>

      <div className="container-fluid py-5">
        <div className="container py-5">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading checkout...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="fa fa-shopping-cart fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Your cart is empty</h5>
              <Link to="/cardProduct" className="btn border-secondary rounded-pill px-4 py-3 text-primary mt-3">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="row g-5">
              <div className="col-md-12 col-lg-7">
                <h3 className="mb-4">Delivery Address</h3>
                {addresses.length === 0 ? (
                  <div className="alert alert-warning">
                    No saved addresses. <Link to="/address/add" className="alert-link">Add one here</Link>
                  </div>
                ) : (
                  <div className="mb-5">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`form-check p-3 mb-2 border rounded-3 ${selectedAddress === addr._id ? "border-primary bg-light" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedAddress(addr._id)}
                      >
                        <input
                          className="form-check-input"
                          type="radio"
                          name="address"
                          value={addr._id}
                          checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)}
                        />
                        <label className="form-check-label ms-2 w-100">
                          <strong>{addr.houseno}</strong>
                          {addr.landmark && <span>, {addr.landmark}</span>}
                          <span>, {addr.district}, {addr.city}</span>
                          <span>, {addr.state} - {addr.pin}</span>
                          <br />
                          <small className="text-muted">{addr.contact}</small>
                        </label>
                      </div>
                    ))}
                    <Link to="/address/add" className="btn btn-sm btn-outline-primary rounded-pill mt-2">
                      <i className="fa fa-plus me-1"></i> Add New Address
                    </Link>
                  </div>
                )}

                <h3 className="mb-4">Order Summary</h3>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={item.product_id?.image?.[0] || item.product_id?.image || "/assets/img/default.png"}
                                alt=""
                                style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }}
                              />
                              <span>{item.product_id?.name}</span>
                            </div>
                          </td>
                          <td>Rs.{item.price}</td>
                          <td>{item.qty}</td>
                          <td className="text-end fw-bold">Rs.{Number(item.price) * item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-12 col-lg-5">
                <div className="bg-light rounded-4 p-4">
                  <h3 className="mb-4">Cart Total</h3>
                  <div className="mb-4">
                    <h5 className="mb-3">Payment Method</h5>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      <label className="form-check-label">
                        Cash On Delivery
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "ONLINE"}
                        onChange={() => setPaymentMethod("ONLINE")}
                      />
                      <label className="form-check-label">
                        Online Payment (UPI, QR, Card, Net Banking)
                      </label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotal</span>
                    <span className="fw-bold">Rs.{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Delivery Charge</span>
                    <span className="fw-bold">{deliveryCharge === 0 ? "Free" : `Rs.${deliveryCharge}`}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="fw-bold">Total</h5>
                    <h5 className="fw-bold text-primary">Rs.{grandTotal}</h5>
                  </div>
                  <button
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold"
                    onClick={placeOrder}
                    disabled={placingOrder || !selectedAddress}
                  >
                    {placingOrder ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
