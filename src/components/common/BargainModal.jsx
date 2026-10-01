import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  startBargainSession,
  submitBargainOffer,
  acceptBargainCounterOffer,
  getBargainSessionStatus
} from "../server/Bargain";
import { addCart } from "../server/Cart";

export default function BargainModal({ isOpen, onClose, product, initialQuantity = 1 }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [customNote, setCustomNote] = useState("");
  const chatEndRef = useRef(null);

  const userId = sessionStorage.getItem("userId");

  const addToCartWithDeal = async (price, qty) => {
    const finalPrice = price || session?.finalAgreedPrice;
    const finalQty = qty || quantity || 1;
    if (!userId || !product?._id || !finalPrice) return false;

    try {
      setAddingToCart(true);
      const res = await addCart({
        user_id: userId,
        product_id: product._id,
        qty: Number(finalQty),
        price: Number(finalPrice)
      });
      if (res.data?.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        window.dispatchEvent(new Event("bargainDealLocked"));
        return true;
      } else {
        toast.error(res.data?.message || "Failed to add to cart");
        return false;
      }
    } catch (err) {
      console.error("addToCartWithDeal error:", err);
      toast.error(err.response?.data?.message || "Failed to add to cart");
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && product?._id) {
      initSession();
    } else {
      setSession(null);
      setOfferedPrice("");
    }
  }, [isOpen, product?._id, quantity]);

  // Real-time polling when waiting for vendor to supply margin and discount
  useEffect(() => {
    let timer = null;
    if (isOpen && session?.sessionId && session?.status === "waiting_vendor_approval") {
      timer = setInterval(async () => {
        try {
          const res = await getBargainSessionStatus({ sessionId: session.sessionId });
          if (res.data?.success && res.data.data) {
            const updated = res.data.data;
            if (updated.status !== "waiting_vendor_approval") {
              setSession((prev) => ({
                ...prev,
                ...updated
              }));
              if (updated.status === "in_progress") {
                toast.success("🎉 Vendor authorized bargaining! You can now start negotiating.");
                const listP = Number(updated.originalPrice || product.price || 0);
                setOfferedPrice(Math.round(listP * 0.9));
              } else if (updated.status === "vendor_declined") {
                toast.info("Vendor cannot offer additional discount on this item at this time.");
              }
            }
          }
        } catch (err) {
          // ignore polling errors
        }
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, session?.sessionId, session?.status]);

  useEffect(() => {
    if (session?.history?.length) {
      scrollToBottom();
    }
  }, [session?.history, submitting]);

  const initSession = async () => {
    if (!userId) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to bargain and negotiate prices with our AI agent.",
        icon: "info",
        confirmButtonText: "Log In",
        confirmButtonColor: "#81c408"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      onClose();
      return;
    }

    try {
      setLoading(true);
      const res = await startBargainSession({
        productId: product._id,
        quantity
      });
      if (res.data?.success) {
        setSession(res.data.data);
        if (res.data.data.status === "in_progress") {
          const listP = Number(res.data.data.product?.price || product.price || 0);
          setOfferedPrice(Math.round(listP * 0.9));
        }
      } else {
        toast.error(res.data?.message || "Failed to start bargaining session");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error starting negotiation");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    const offerNum = Number(offeredPrice);
    if (!offerNum || offerNum <= 0) {
      toast.warning("Please enter a valid offer price");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitBargainOffer({
        sessionId: session.sessionId,
        offeredPrice: offerNum,
        customerMessage: customNote
      });

      if (res.data?.success) {
        setSession((prev) => ({
          ...prev,
          ...res.data.data,
          history: res.data.data.history
        }));
        setCustomNote("");

        if (res.data.data.decision === "ACCEPT" || res.data.data.status === "deal_accepted") {
          const acceptedPrice = res.data.data.finalAgreedPrice || offerNum;
          toast.success("🎉 Deal Struck! Added to cart!");
          window.dispatchEvent(new Event("bargainDealLocked"));
          await addToCartWithDeal(acceptedPrice, quantity);
        } else {
          toast.info("Counter-offer received from Vendor AI");
        }
      } else {
        toast.error(res.data?.message || "Failed to submit offer");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptCounterOffer = async () => {
    try {
      setSubmitting(true);
      const res = await acceptBargainCounterOffer({
        sessionId: session.sessionId
      });

      if (res.data?.success) {
        const acceptedPrice = res.data.data.finalAgreedPrice || session?.aiLatestCounterOffer;
        setSession((prev) => ({
          ...prev,
          status: "deal_accepted",
          finalAgreedPrice: acceptedPrice,
          dealCouponCode: res.data.data.dealCouponCode,
          history: res.data.data.history
        }));
        toast.success("🎉 Deal Locked! Added to cart!");
        window.dispatchEvent(new Event("bargainDealLocked"));
        await addToCartWithDeal(acceptedPrice, quantity);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error accepting offer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const originalPrice = Number(product.price || 0);
  const stock = Number(product.stock || 0);
  const isDealLocked = session?.status === "deal_accepted";
  const agreedPrice = session?.finalAgreedPrice;
  const couponCode = session?.dealCouponCode;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 10550
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header border-0 text-white px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #064e3b, #047857)"
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4">🤝</span>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white">AI Price-Supply Bargaining</h5>
                <small className="text-white-50">Live automated deal negotiation based on real inventory supply</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-0 bg-light d-flex flex-column" style={{ minHeight: "480px" }}>
            {/* Top Product & Supply Snapshot Bar */}
            <div className="p-3 bg-white border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={Array.isArray(product.image) ? product.image[0] : product.image || "/assets/img/placeholder.jpg"}
                  alt={product.name}
                  className="rounded-3 border object-fit-cover"
                  style={{ width: "54px", height: "54px" }}
                />
                <div>
                  <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "260px" }}>
                    {product.name}
                  </h6>
                  <div className="d-flex align-items-center gap-2 small text-muted">
                    <span>List Price: <strong className="text-dark">₹{originalPrice}</strong></span>
                    <span>•</span>
                    <span>Supply: <strong className={stock <= 5 ? "text-danger" : "text-success"}>{stock} in stock</strong></span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & Supply Badge */}
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-pill border">
                  <span className="small text-muted ps-2 pe-1">Qty:</span>
                  <select
                    className="form-select form-select-sm border-0 bg-transparent fw-bold"
                    style={{ width: "65px", cursor: "pointer" }}
                    value={quantity}
                    disabled={isDealLocked || submitting}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 10].map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <span
                  className={`badge rounded-pill px-3 py-2 ${
                    stock >= 35
                      ? "bg-success-subtle text-success border border-success"
                      : stock >= 15
                      ? "bg-primary-subtle text-primary border border-primary"
                      : "bg-warning-subtle text-warning-emphasis border border-warning"
                  }`}
                  style={{ fontSize: "0.78rem" }}
                >
                  <i className="fa-solid fa-boxes-packing me-1"></i>
                  {stock >= 35 ? "Surplus Supply" : stock >= 15 ? "Normal Supply" : "Constrained Supply"}
                </span>
              </div>
            </div>

            {/* Negotiation Content / States */}
            {session?.status === "waiting_vendor_approval" ? (
              <div className="p-4 p-md-5 text-center my-auto d-flex flex-column align-items-center justify-content-center flex-grow-1">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{
                    width: "72px",
                    height: "72px",
                    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                    color: "#b45309"
                  }}
                >
                  <i className="fa-solid fa-hourglass-half fs-2 fa-spin"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Bargaining Request Sent to Vendor</h5>
                <p className="text-muted small mb-4" style={{ maxWidth: "480px", lineHeight: "1.6" }}>
                  Aventra is currently asking the vendor for their <strong>profit margin</strong> and <strong>maximum allowable discount</strong> on this product. Once the vendor authorizes, the live AI bargaining assistant will start automatically!
                </p>

                <div className="card border-0 bg-white shadow-sm rounded-4 p-3 mb-4 w-100" style={{ maxWidth: "420px" }}>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                    <span className="small text-muted">Store Vendor:</span>
                    <span className="fw-bold text-dark">{session.vendor?.businessName || "Vendor Store"}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                    <span className="small text-muted">List Price:</span>
                    <span className="fw-bold text-dark">₹{originalPrice} / unit</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                    <span className="small text-muted">Requested Quantity:</span>
                    <span className="fw-bold text-dark">{quantity} unit(s)</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="small text-muted">Status:</span>
                    <span className="badge bg-warning text-dark px-2.5 py-1.5 fw-semibold">
                      <i className="fa-solid fa-clock me-1"></i> Awaiting Vendor Margin & Discount
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-semibold"
                    disabled={checkingStatus}
                    onClick={async () => {
                      try {
                        setCheckingStatus(true);
                        const res = await getBargainSessionStatus({ sessionId: session.sessionId });
                        if (res.data?.success && res.data.data) {
                          const updated = res.data.data;
                          setSession((prev) => ({ ...prev, ...updated }));
                          if (updated.status === "in_progress") {
                            toast.success("Vendor has approved! You can negotiate now.");
                            const listP = Number(updated.originalPrice || product.price || 0);
                            setOfferedPrice(Math.round(listP * 0.9));
                          } else if (updated.status === "vendor_declined") {
                            toast.info("Vendor cannot provide additional discount at this time.");
                          } else {
                            toast.info("Vendor is still reviewing. Auto-refresh is active.");
                          }
                        }
                      } catch (err) {
                        toast.error("Error checking status");
                      } finally {
                        setCheckingStatus(false);
                      }
                    }}
                  >
                    {checkingStatus ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" /> Checking...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-arrows-rotate me-1"></i> Check Status Now
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-pill px-3 py-2"
                    onClick={onClose}
                  >
                    Close & Wait
                  </button>
                </div>
              </div>
            ) : session?.status === "vendor_declined" ? (
              <div className="p-4 p-md-5 text-center my-auto d-flex flex-column align-items-center justify-content-center flex-grow-1">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm bg-danger-subtle text-danger"
                  style={{ width: "68px", height: "68px" }}
                >
                  <i className="fa-solid fa-ban fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Bargaining Unavailable for this Product</h5>
                <p className="text-muted small mb-4" style={{ maxWidth: "420px" }}>
                  {session.vendorNote || "The vendor cannot provide additional discounts on this item due to tight profit margins."}
                </p>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4 py-2 fw-semibold"
                    onClick={onClose}
                  >
                    Continue at Regular Price (₹{originalPrice})
                  </button>
                </div>
              </div>
            ) : (
              /* Live Chat Message Thread */
              <div
                className="p-4 flex-grow-1 overflow-y-auto d-flex flex-column gap-3"
                style={{ maxHeight: "360px", minHeight: "260px", backgroundColor: "#f8fafc" }}
              >
                {loading ? (
                  <div className="text-center my-auto py-5">
                    <div className="spinner-border text-success" role="status"></div>
                    <p className="mt-2 text-muted small">Connecting with Store AI Negotiator...</p>
                  </div>
                ) : session?.history?.length > 0 ? (
                  session.history.map((msg, idx) => {
                    const isBot = msg.sender === "ai_vendor";
                    return (
                      <div
                        key={idx}
                        className={`d-flex flex-column ${isBot ? "align-self-start" : "align-self-end"}`}
                        style={{ maxWidth: "80%" }}
                      >
                        <div
                          className={`p-3 rounded-4 shadow-sm ${
                            isBot
                              ? "bg-white text-dark border-start border-4 border-success"
                              : "text-white"
                          }`}
                          style={{
                            background: isBot ? "#ffffff" : "linear-gradient(135deg, #059669, #10b981)",
                            fontSize: "0.92rem",
                            lineHeight: "1.45"
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1 gap-3">
                            <small className="fw-bold" style={{ color: isBot ? "#047857" : "#d1fae5" }}>
                              {isBot ? "Store AI Agent" : "You (Buyer)"}
                            </small>
                            {msg.offeredPrice && (
                              <span
                                className={`badge rounded-pill px-2 py-1 ${
                                  isBot ? "bg-success-subtle text-success" : "bg-white text-dark"
                                }`}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Offer: ₹{msg.offeredPrice}
                              </span>
                            )}
                          </div>
                          <p className="mb-0 text-break">{msg.message}</p>
                        </div>
                        <small className="text-muted mt-1 px-1" style={{ fontSize: "0.7rem", alignSelf: isBot ? "flex-start" : "flex-end" }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </small>
                      </div>
                    );
                  })
                ) : null}

                {submitting && (
                  <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3 shadow-sm align-self-start border">
                    <span className="spinner-border spinner-border-sm text-success" role="status"></span>
                    <small className="text-muted">Evaluating supply elasticity & pricing margin...</small>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Deal Locked Celebration Alert */}
            {isDealLocked && (
              <div className="p-3 bg-success text-white text-center shadow-inner">
                <h6 className="fw-bold mb-1">🎉 Deal Successfully Struck at ₹{agreedPrice} / unit!</h6>
                <p className="small mb-2 text-white-50">
                  Total order savings: <strong>₹{((originalPrice - agreedPrice) * quantity).toLocaleString()}</strong> for {quantity} unit(s).
                  Item added to your cart at your negotiated price!
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-light text-success fw-bold rounded-pill px-4 shadow-sm"
                    disabled={addingToCart}
                    onClick={async () => {
                      await addToCartWithDeal(agreedPrice, quantity);
                      onClose();
                      navigate("/cart");
                    }}
                  >
                    {addingToCart ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" /> Adding to Cart...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cart-shopping me-1"></i> Go to Cart & Checkout (₹{((agreedPrice || originalPrice) * quantity).toLocaleString()})
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

            {/* AI Counter-Offer Quick Acceptance Option */}
            {!isDealLocked && session?.status === "in_progress" && session?.aiLatestCounterOffer > 0 && session.aiLatestCounterOffer < originalPrice && (
              <div className="p-2 px-4 bg-warning-subtle border-top border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                <small className="text-dark">
                  Vendor AI Counter-Offer: <strong>₹{session.aiLatestCounterOffer}</strong> per unit (Round {session.currentRound - 1}/{session.maxRounds})
                </small>
                <button
                  type="button"
                  className="btn btn-sm btn-success rounded-pill px-3 fw-bold"
                  disabled={submitting}
                  onClick={handleAcceptCounterOffer}
                >
                  <i className="fa-solid fa-handshake me-1"></i> Accept Deal at ₹{session.aiLatestCounterOffer}
                </button>
              </div>
            )}

            {/* Bottom Form Input Area */}
            {!isDealLocked && session?.status === "in_progress" && (
              <form onSubmit={handleSendOffer} className="p-3 bg-white border-top">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-sm-4">
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted fw-bold">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Your Offer Price"
                        value={offeredPrice}
                        disabled={submitting || session?.currentRound > session?.maxRounds}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        required
                        min="1"
                        max={originalPrice}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-sm-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Optional note (e.g. buying multiple)"
                      value={customNote}
                      disabled={submitting || session?.currentRound > session?.maxRounds}
                      onChange={(e) => setCustomNote(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-sm-3 d-grid">
                    <button
                      type="submit"
                      className="btn btn-success fw-bold rounded-pill"
                      disabled={submitting || !offeredPrice || session?.currentRound > session?.maxRounds}
                    >
                      {submitting ? "Negotiating..." : "Propose Offer"}
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Round: <strong>{session?.currentRound || 1}</strong> of {session?.maxRounds || 3}
                  </small>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Negotiation Powered by Gemini AI & Real-time Stock Dynamics
                  </small>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
