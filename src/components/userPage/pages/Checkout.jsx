import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { allCart } from "../../server/Cart";
import { AllAddress, addAddress, updateAddress } from "../../server/Address";
import { addOrder } from "../../server/Order";
import { numberToWords } from "../../../utils/numberToWords";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Address modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    _id: "",
    houseno: "",
    pin: "",
    city: "",
    district: "",
    state: "",
    landmark: "",
    contact: "",
    altercontact: "",
  });

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
        AllAddress({ userId }),
      ]);
      if (cartRes.data.success) setCartItems(cartRes.data.data);
      if (addrRes.data.success) {
        const addrList = addrRes.data.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          setSelectedAddress(addrList[0]._id);
        } else {
          // If no address saved, open the address prompt automatically
          openNewAddressModal();
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load checkout data");
    }
    setLoading(false);
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.qty,
    0
  );
  const deliveryCharge = cartItems.length > 0 ? 70 : 0;
  const grandTotal = subtotal + deliveryCharge;

  const openNewAddressModal = () => {
    setAddressForm({
      _id: "",
      houseno: "",
      pin: "",
      city: "",
      district: "",
      state: "",
      landmark: "",
      contact: sessionStorage.getItem("userContact") || "",
      altercontact: "",
    });
    setModalMode("add");
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setAddressForm({
      _id: addr._id || "",
      houseno: addr.houseno || "",
      pin: addr.pin && addr.pin !== "N/A" ? addr.pin : "",
      city: addr.city || "",
      district: addr.district || "",
      state: addr.state || "",
      landmark: addr.landmark || "",
      contact: addr.contact || "",
      altercontact: addr.altercontact || "",
    });
    setModalMode("edit");
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanPin = (addressForm.pin || "").trim();
    if (!cleanPin || !/^\d{6}$/.test(cleanPin)) {
      toast.error("Please enter a valid 6-digit delivery PIN Code (e.g. 144001)");
      return;
    }
    if (!addressForm.houseno || addressForm.houseno.trim() === "") {
      toast.error("Please enter house/flat no and street address");
      return;
    }
    if (!addressForm.city || addressForm.city.trim() === "") {
      toast.error("Please enter city / town");
      return;
    }
    if (!addressForm.state || addressForm.state.trim() === "") {
      toast.error("Please enter state");
      return;
    }
    if (!addressForm.contact || addressForm.contact.trim() === "") {
      toast.error("Please enter contact mobile number");
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        ...addressForm,
        pin: cleanPin,
        editbyid: userId,
      };

      let res;
      if (modalMode === "edit" && addressForm._id) {
        res = await updateAddress(payload);
      } else {
        res = await addAddress(payload);
      }

      if (res.data.success) {
        toast.success(res.data.message || (modalMode === "edit" ? "Address updated successfully!" : "Address added successfully!"));
        setShowAddressModal(false);

        // Reload addresses
        const addrRes = await AllAddress({ userId });
        if (addrRes.data.success) {
          const updatedList = addrRes.data.data || [];
          setAddresses(updatedList);
          const savedId = res.data.data?._id || addressForm._id;
          if (savedId) {
            setSelectedAddress(savedId);
          } else if (updatedList.length > 0) {
            setSelectedAddress(updatedList[0]._id);
          }
        }
      } else {
        toast.error(res.data.message || "Failed to save address");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving address");
    } finally {
      setSavingAddress(false);
    }
  };

  const currentSelectedAddr = addresses.find((a) => a._id === selectedAddress);
  const isPinMissing = !currentSelectedAddr?.pin || currentSelectedAddr.pin === "N/A" || !/^\d{6}$/.test(currentSelectedAddr.pin.trim());

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.warning("Please enter or select a delivery address");
      openNewAddressModal();
      return;
    }

    const currentAddr = addresses.find((a) => a._id === selectedAddress);
    if (!currentAddr) {
      toast.warning("Please select a valid delivery address");
      openNewAddressModal();
      return;
    }

    // Require valid 6-digit PIN code
    const pinStr = (currentAddr.pin || "").trim();
    if (!pinStr || pinStr === "N/A" || !/^\d{6}$/.test(pinStr)) {
      toast.warning("Delivery PIN code is required. Please provide your 6-digit PIN code.");
      openEditAddressModal(currentAddr);
      return;
    }

    if (!currentAddr.houseno || currentAddr.houseno.trim() === "") {
      toast.warning("Complete street/house delivery address is required.");
      openEditAddressModal(currentAddr);
      return;
    }

    if (paymentMethod === "ONLINE") {
      handleRazorpayPayment(currentAddr);
      return;
    }

    if (paymentMethod === "COD") {
      setPlacingOrder(true);
      try {
        const orderData = {
          userId,
          shipingAddress: selectedAddress,
          pin: currentAddr.pin,
          paymentMethod: "COD",
          paymentStatus: "COD",
          totalAmount: grandTotal,
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

  const handleRazorpayPayment = (currentAddr) => {
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
            pin: currentAddr.pin,
            paymentMethod: "ONLINE",
            paymentStatus: "Paid",
            totalAmount: grandTotal,
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
        name: "Customer",
        email: "customer@example.com",
        contact: currentAddr?.contact || "9876543210",
      },
      theme: {
        color: "#9BCB45",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Checkout</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <a href="#">Pages</a>
          </li>
          <li className="breadcrumb-item active text-white">Checkout</li>
        </ol>
      </div>

      <div className="container-fluid py-3 py-md-5">
        <div className="container py-3 py-md-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading checkout...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="fa fa-shopping-cart fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Your cart is empty</h5>
              <Link
                to="/cardProduct"
                className="btn border-secondary rounded-pill px-4 py-3 text-primary mt-3"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="row g-4 g-lg-5">
              <div className="col-12 col-lg-7">
                {/* Delivery Address Section */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="mb-0">
                      <i className="fa fa-location-dot text-primary me-2"></i>
                      Delivery Address & PIN Code
                    </h3>
                    <small className="text-muted">
                      Delivery PIN Code and full address are required for order dispatch
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                    onClick={openNewAddressModal}
                  >
                    <i className="fa fa-plus me-1"></i> Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="alert alert-warning border border-warning rounded-4 p-4 text-center">
                    <i className="fa fa-map-location-dot fs-2 text-warning mb-2 d-block"></i>
                    <h5 className="fw-bold">No Delivery Address Found</h5>
                    <p className="mb-3 text-muted">
                      Please provide your delivery address and 6-digit PIN code to proceed.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                      onClick={openNewAddressModal}
                    >
                      <i className="fa fa-plus me-1"></i> Enter Delivery Address & PIN Code
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    {/* Warning if current selected address has missing PIN */}
                    {isPinMissing && (
                      <div className="alert alert-danger border-danger rounded-3 d-flex align-items-center justify-content-between p-3 mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa fa-triangle-exclamation fs-4 text-danger"></i>
                          <div>
                            <strong className="d-block text-danger">PIN Code Missing</strong>
                            <small className="text-dark">
                              Your selected delivery address requires a 6-digit postal PIN Code before ordering.
                            </small>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger rounded-pill px-3 fw-bold text-nowrap"
                          onClick={() => openEditAddressModal(currentSelectedAddr)}
                        >
                          <i className="fa fa-pen me-1"></i> Add PIN Code Now
                        </button>
                      </div>
                    )}

                    <div className="row g-3">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddress === addr._id;
                        const hasPin = addr.pin && addr.pin !== "N/A" && /^\d{6}$/.test(addr.pin.trim());

                        return (
                          <div key={addr._id} className="col-12">
                            <div
                              className={`p-3 border rounded-3 transition-all ${
                                isSelected
                                  ? "border-primary bg-light shadow-sm"
                                  : "border-secondary-subtle"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => setSelectedAddress(addr._id)}
                            >
                              <div className="d-flex justify-content-between align-items-start gap-2">
                                <div className="d-flex align-items-start gap-3">
                                  <input
                                    className="form-check-input mt-1"
                                    type="radio"
                                    name="addressSelection"
                                    value={addr._id}
                                    checked={isSelected}
                                    onChange={() => setSelectedAddress(addr._id)}
                                  />
                                  <div>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                      <strong className="text-dark fs-6">
                                        {addr.houseno}
                                      </strong>
                                      {hasPin ? (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                          <i className="fa fa-map-pin me-1"></i>
                                          PIN: {addr.pin}
                                        </span>
                                      ) : (
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                                          <i className="fa fa-circle-exclamation me-1"></i>
                                          PIN Missing
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-secondary" style={{ fontSize: "0.9rem" }}>
                                      {[addr.landmark, addr.district, addr.city, addr.state]
                                        .map((s) => (s || "").trim())
                                        .filter((s) => s.length > 0)
                                        .join(", ")}
                                    </div>
                                    <small className="text-muted mt-1 d-block">
                                      <i className="fa fa-phone me-1"></i>
                                      {addr.contact || "No contact"}
                                    </small>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1"
                                  style={{ fontSize: "0.75rem" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditAddressModal(addr);
                                  }}
                                  title="Edit Address & PIN"
                                >
                                  <i className="fa fa-pen me-1"></i> Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h3 className="mb-3 mt-4">Order Summary</h3>
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
                                src={
                                  item.product_id?.image?.[0] ||
                                  item.product_id?.image ||
                                  "/assets/img/default.png"
                                }
                                alt=""
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                }}
                              />
                              <span className="fw-semibold">
                                {item.product_id?.name}
                              </span>
                            </div>
                          </td>
                          <td>Rs.{item.price}</td>
                          <td>{item.qty}</td>
                          <td className="text-end fw-bold">
                            Rs.{Number(item.price) * item.qty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total & Payment Section */}
              <div className="col-12 col-lg-5">
                <div className="bg-light rounded-4 p-4 shadow-sm border">
                  <h3 className="mb-4">Payment & Order</h3>

                  <div className="mb-4">
                    <h5 className="mb-3">Select Payment Method</h5>

                    <div
                      className={`form-check p-3 mb-2 rounded-3 border bg-white ${
                        paymentMethod === "COD" ? "border-primary" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setPaymentMethod("COD")}
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment"
                        id="paymentCOD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      <label
                        className="form-check-label fw-bold ms-2"
                        htmlFor="paymentCOD"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fa fa-hand-holding-dollar text-success me-2"></i>
                        Cash On Delivery (COD)
                      </label>
                    </div>

                    <div
                      className={`form-check p-3 rounded-3 border bg-white ${
                        paymentMethod === "ONLINE" ? "border-primary" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setPaymentMethod("ONLINE")}
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment"
                        id="paymentONLINE"
                        checked={paymentMethod === "ONLINE"}
                        onChange={() => setPaymentMethod("ONLINE")}
                      />
                      <label
                        className="form-check-label fw-bold ms-2"
                        htmlFor="paymentONLINE"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fa fa-credit-card text-primary me-2"></i>
                        Online Payment (UPI, QR, Card)
                      </label>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Subtotal</span>
                    <span className="fw-bold">Rs.{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Delivery Charge</span>
                    <span className="fw-bold">
                      {deliveryCharge === 0 ? "Free" : `Rs.${deliveryCharge}`}
                    </span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="fw-bold mb-0">Grand Total</h5>
                    <div className="text-end">
                      <h4 className="fw-bold text-primary mb-0">
                        Rs.{grandTotal}
                      </h4>
                      <small
                        className="text-muted d-block fw-bold"
                        style={{ fontSize: "0.8rem", marginTop: "2px" }}
                      >
                        {numberToWords(grandTotal)}
                      </small>
                    </div>
                  </div>

                  {/* Delivery destination preview */}
                  {currentSelectedAddr && (
                    <div className="p-3 bg-white border rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                      <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "0.72rem" }}>
                        Delivering To:
                      </div>
                      <div className="fw-bold text-dark text-truncate">
                        {currentSelectedAddr.houseno}
                      </div>
                      <div className="text-secondary">
                        {currentSelectedAddr.city}, {currentSelectedAddr.state}
                      </div>
                      <div className="mt-1">
                        <strong className="text-dark">PIN: </strong>
                        {currentSelectedAddr.pin && currentSelectedAddr.pin !== "N/A" ? (
                          <span className="text-success fw-bold">{currentSelectedAddr.pin}</span>
                        ) : (
                          <span className="text-danger fw-bold">Missing (Required)</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-6 shadow-sm"
                    onClick={placeOrder}
                    disabled={placingOrder || addresses.length === 0}
                  >
                    {placingOrder ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Placing Order...
                      </>
                    ) : isPinMissing ? (
                      <>
                        <i className="fa fa-map-pin me-2"></i>
                        Provide PIN Code to Place Order
                      </>
                    ) : (
                      <>
                        <i className="fa fa-check-circle me-2"></i>
                        Place Order (Rs.{grandTotal})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address & PIN Code Interactive Modal */}
      {showAddressModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div
                className="modal-header bg-dark text-white p-3 px-4"
                style={{ borderBottom: "3px solid #81c408" }}
              >
                <div>
                  <h5 className="modal-title fw-bold text-white mb-0">
                    <i className="fa fa-location-dot text-success me-2"></i>
                    {modalMode === "edit"
                      ? "Update Delivery Address & PIN Code"
                      : "Enter Delivery Address & PIN Code"}
                  </h5>
                  <small className="text-light opacity-75">
                    Your 6-digit postal PIN code is required for real-time tracking & courier delivery
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddressModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveAddress}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* PIN Code and City */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Delivery PIN Code <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fa fa-map-pin text-primary"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 144001 (6 digits)"
                          maxLength={6}
                          value={addressForm.pin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setAddressForm({ ...addressForm, pin: val });
                          }}
                          required
                        />
                      </div>
                      <small className="text-muted">
                        Must be a valid 6-digit postal PIN code
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        City / Town <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Jalandhar"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, city: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* House No / Street Address */}
                    <div className="col-12">
                      <label className="form-label fw-bold">
                        House / Flat No, Building & Street Address{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. House #142, Model Town, Near Clock Tower"
                        value={addressForm.houseno}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, houseno: e.target.value })
                        }
                        required
                      ></textarea>
                    </div>

                    {/* State and District */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        State <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Punjab"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, state: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">District</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Jalandhar"
                        value={addressForm.district}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, district: e.target.value })
                        }
                      />
                    </div>

                    {/* Landmark and Contact Number */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Nearby Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Opposite City Park"
                        value={addressForm.landmark}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, landmark: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Delivery Contact Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fa fa-phone text-primary"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="e.g. 9876543210"
                          value={addressForm.contact}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, contact: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 px-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={savingAddress}
                  >
                    {savingAddress ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-check me-1"></i>
                        Confirm Address & PIN Code
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
