import React, { useState, useEffect } from "react";
import { getVendorBargainHistory, deleteBargainRecord } from "../server/Bargain";
import { baseUrl } from "../endpoints";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function VendorBargainingSection() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getVendorBargainHistory();
      if (res.data && res.data.success) {
        setNegotiations(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading bargaining history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id, e) => {
    if (e) e.stopPropagation();

    const result = await Swal.fire({
      title: "Permanently Delete Record?",
      text: "Are you sure you want to permanently delete this bargaining record? This negotiation transcript, pricing concessions, and logs will be permanently deleted from the database. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: '<i class="fa-solid fa-trash-can me-1"></i> Yes, delete permanently!',
      cancelButtonText: "Cancel",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteBargainRecord(id);
        if (res.data && res.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: "The bargaining record has been permanently deleted.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false
          });
          if (selectedSession && selectedSession._id === id) {
            setSelectedSession(null);
          }
          fetchHistory();
        } else {
          Swal.fire("Failed", res.data?.message || "Could not delete record.", "error");
        }
      } catch (err) {
        console.error("Error deleting bargaining record:", err);
        Swal.fire(
          "Error",
          err.response?.data?.message || err.message || "Failed to delete record.",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const total = negotiations.length;
  const accepted = negotiations.filter((n) => n.status === "deal_accepted" || n.status === "accepted").length;
  const inProgress = negotiations.filter((n) => n.status === "in_progress").length;
  const closedOrExpired = negotiations.filter(
    (n) => n.status === "closed" || n.status === "rejected" || n.status === "deal_rejected" || n.status === "expired"
  ).length;

  const totalDiscountAcc = negotiations
    .filter((n) => (n.status === "deal_accepted" || n.status === "accepted") && (n.finalAgreedPrice || n.agreedPrice) && n.originalPrice)
    .reduce((sum, n) => {
      const price = n.finalAgreedPrice || n.agreedPrice;
      return sum + ((n.originalPrice - price) / n.originalPrice) * 100;
    }, 0);
  const avgDiscount = accepted > 0 ? (totalDiscountAcc / accepted).toFixed(1) : 0;

  const filtered = negotiations.filter((n) => {
    if (filter === "accepted") return n.status === "deal_accepted" || n.status === "accepted";
    if (filter === "in_progress") return n.status === "in_progress";
    if (filter === "closed")
      return n.status === "closed" || n.status === "rejected" || n.status === "deal_rejected" || n.status === "expired";
    return true;
  });

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied coupon ${code}`);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
      {/* Header Banner */}
      <div
        className="p-4 text-white d-flex align-items-center justify-content-between flex-wrap gap-3"
        style={{
          background: "linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)"
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 bg-white bg-opacity-20 shadow-sm"
            style={{ width: "54px", height: "54px", backdropFilter: "blur(10px)" }}
          >
            <i className="fa-solid fa-handshake-simple fs-3 text-warning"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h4 className="fw-bold mb-0 text-white">AI Price-Supply Bargaining Logs</h4>
              <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                <i className="fa-solid fa-wand-magic-sparkles me-1"></i> Gemini 2.5
              </span>
            </div>
            <p className="mb-0 text-white-50 small mt-1">
              Autonomous customer price negotiations regulated by your real-time stock levels, surplus velocity, and margin floors.
            </p>
          </div>
        </div>

        <button
          className="btn btn-outline-light btn-sm rounded-pill px-3 shadow-sm"
          onClick={fetchHistory}
        >
          <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Logs
        </button>
      </div>

      {/* KPI Cards */}
      <div className="p-4 bg-light border-bottom">
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="text-muted small fw-semibold text-uppercase">Negotiations Initiated</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className="fw-bold mb-0 text-dark">{total}</h3>
                <span className="badge bg-primary-subtle text-primary">All Sessions</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="text-muted small fw-semibold text-uppercase">Deals Locked (Accepted)</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className="fw-bold mb-0 text-success">{accepted}</h3>
                <span className="badge bg-success-subtle text-success">
                  {total > 0 ? `${Math.round((accepted / total) * 100)}% Win Rate` : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="text-muted small fw-semibold text-uppercase">Active In-Progress</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className="fw-bold mb-0 text-info">{inProgress}</h3>
                <span className="badge bg-info-subtle text-info">Ongoing</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="text-muted small fw-semibold text-uppercase">Avg Concession Given</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className="fw-bold mb-0 text-warning">{avgDiscount}%</h3>
                <span className="badge bg-warning-subtle text-dark">Below List Price</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="btn-group p-1 bg-light rounded-pill border">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === "all" ? "btn-dark shadow-sm" : "btn-light text-muted"}`}
              onClick={() => setFilter("all")}
            >
              All Sessions ({total})
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === "accepted" ? "btn-success shadow-sm" : "btn-light text-muted"}`}
              onClick={() => setFilter("accepted")}
            >
              Deals Locked ({accepted})
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === "in_progress" ? "btn-info shadow-sm text-white" : "btn-light text-muted"}`}
              onClick={() => setFilter("in_progress")}
            >
              In Progress ({inProgress})
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === "closed" ? "btn-secondary shadow-sm" : "btn-light text-muted"}`}
              onClick={() => setFilter("closed")}
            >
              Expired / Closed ({closedOrExpired})
            </button>
          </div>

          <span className="small text-muted">
            <i className="fa-solid fa-circle-info me-1"></i>
            Deals automatically generate exclusive 1-hour single-use coupon tokens for checkout.
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading bargaining sessions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted border rounded-3 bg-light">
            <i className="fa-solid fa-comments-dollar fs-1 mb-3 opacity-25"></i>
            <h6 className="fw-bold">No Bargaining Sessions in this view</h6>
            <p className="small mb-0">Customer bargaining sessions will appear here as buyers negotiate product prices.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Customer</th>
                  <th>Product & Quantity</th>
                  <th>Supply Condition</th>
                  <th>List vs Agreed Price</th>
                  <th>Status</th>
                  <th>Deal Coupon</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((neg) => {
                  const prod = neg.productId || {};
                  const user = neg.userId || {};
                  const isAccepted = neg.status === "accepted" || neg.status === "deal_accepted";
                  const isInProgress = neg.status === "in_progress";
                  const agreedPrice = neg.finalAgreedPrice || neg.agreedPrice;
                  const latestOffer = neg.customerLatestOffer || neg.aiLatestCounterOffer || neg.finalOfferedPrice;

                  const discountPercent =
                    agreedPrice && neg.originalPrice
                      ? Math.round(((neg.originalPrice - agreedPrice) / neg.originalPrice) * 100)
                      : null;

                  return (
                    <tr key={neg._id}>
                      <td className="ps-3">
                        <div className="fw-bold text-dark">{user.name || "Customer"}</div>
                        <small className="text-muted d-block">{user.email || "Registered Shopper"}</small>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {prod.image ? (
                            <img
                              src={
                                Array.isArray(prod.image)
                                  ? (prod.image[0]?.startsWith("http") ? prod.image[0] : `${baseUrl}/${prod.image[0]}`)
                                  : (prod.image.startsWith("http") ? prod.image : `${baseUrl}/${prod.image}`)
                              }
                              alt={prod.name}
                              className="rounded border"
                              style={{ width: "38px", height: "38px", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                              style={{ width: "38px", height: "38px" }}
                            >
                              <i className="fa-solid fa-box"></i>
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "200px" }}>
                              {prod.name || "Product"}
                            </div>
                            <small className="text-muted">
                              Qty: <strong>{neg.quantity || 1}</strong> | Stock: {neg.currentStock || prod.stock || 0} units
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {(neg.currentStock || prod.stock || 0) >= 30 ? (
                          <span className="badge bg-success-subtle text-success border border-success">
                            <i className="fa-solid fa-boxes-packing me-1"></i> Surplus Inventory
                          </span>
                        ) : (neg.currentStock || prod.stock || 0) >= 15 ? (
                          <span className="badge bg-info-subtle text-info border border-info">
                            <i className="fa-solid fa-box me-1"></i> Moderate Supply
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border border-warning">
                            <i className="fa-solid fa-triangle-exclamation me-1"></i> Limited / Scarce
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="small">
                          <span className="text-muted text-decoration-line-through me-2">₹{neg.originalPrice}</span>
                          {agreedPrice ? (
                            <span className="fw-bold text-success fs-6">₹{agreedPrice}</span>
                          ) : latestOffer ? (
                            <span className="fw-bold text-primary">₹{latestOffer}</span>
                          ) : (
                            <span className="text-muted">Pending</span>
                          )}
                        </div>
                        {discountPercent !== null && (
                          <span className="badge bg-success-subtle text-success mt-1">
                            -{discountPercent}% Discount
                          </span>
                        )}
                      </td>

                      <td>
                        {isAccepted ? (
                          <span className="badge bg-success px-2 py-1">
                            <i className="fa-solid fa-check-double me-1"></i> Deal Locked
                          </span>
                        ) : isInProgress ? (
                          <span className="badge bg-info text-dark px-2 py-1">
                            <i className="fa-solid fa-spinner fa-spin me-1"></i> Round {neg.currentRound}/{neg.maxRounds}
                          </span>
                        ) : (
                          <span className="badge bg-secondary px-2 py-1">Closed / No Deal</span>
                        )}
                      </td>

                      <td>
                        {neg.dealCouponCode ? (
                          <div className="d-flex align-items-center gap-1">
                            <code className="bg-light border px-2 py-1 rounded fw-bold text-dark">
                              {neg.dealCouponCode}
                            </code>
                            <button
                              className="btn btn-outline-secondary btn-sm p-1"
                              style={{ width: "24px", height: "24px", lineHeight: "1" }}
                              onClick={() => copyCoupon(neg.dealCouponCode)}
                              title="Copy Coupon"
                            >
                              <i className="fa-solid fa-copy" style={{ fontSize: "11px" }}></i>
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      <td className="text-end pe-3 text-nowrap">
                        <div className="d-inline-flex align-items-center justify-content-end gap-1 flex-nowrap">
                          <button
                            className="btn btn-outline-success btn-sm rounded-pill px-2 px-md-3 d-inline-flex align-items-center gap-1 shadow-sm"
                            onClick={() => setSelectedSession(neg)}
                            title="View Negotiation Transcript"
                          >
                            <i className="fa-regular fa-comment-dots"></i>
                            <span>Logs</span>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-2 px-md-3 d-inline-flex align-items-center gap-1 shadow-sm"
                            onClick={(e) => handleDeleteRecord(neg._id, e)}
                            title="Permanently Delete Bargaining Record"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Negotiation History Modal */}
      {selectedSession && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div
                className="modal-header text-white"
                style={{
                  background: "linear-gradient(135deg, #1e1b4b, #312e81)"
                }}
              >
                <div>
                  <h5 className="modal-title fw-bold">
                    <i className="fa-solid fa-robot text-warning me-2"></i>
                    AI Negotiation Transcript
                  </h5>
                  <small className="text-white-50">
                    Product: {selectedSession.productId?.name || "Product"} | Customer: {selectedSession.userId?.name || "Shopper"}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedSession(null)}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {/* Round Tracker */}
                <div className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-3 border">
                  <div>
                    <span className="text-muted small">List Price:</span>{" "}
                    <strong>₹{selectedSession.originalPrice}</strong>
                  </div>
                  <div>
                    <span className="text-muted small">Floor Limit:</span>{" "}
                    <strong className="text-danger">₹{selectedSession.floorPrice}</strong>
                  </div>
                  <div>
                    <span className="text-muted small">Final Agreed:</span>{" "}
                    <strong className="text-success">
                      {selectedSession.agreedPrice ? `₹${selectedSession.agreedPrice}` : "N/A"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted small">Status:</span>{" "}
                    <span className="badge bg-primary text-uppercase">{selectedSession.status}</span>
                  </div>
                </div>

                {/* Conversation bubbles */}
                <div className="d-flex flex-column gap-3">
                  {selectedSession.history && selectedSession.history.length > 0 ? (
                    selectedSession.history.map((h, idx) => {
                      const isAI = h.sender === "ai_vendor";
                      return (
                        <div
                          key={idx}
                          className={`d-flex ${isAI ? "justify-content-start" : "justify-content-end"}`}
                        >
                          <div
                            className={`p-3 rounded-4 shadow-sm border ${
                              isAI ? "bg-white text-dark" : "bg-primary text-white"
                            }`}
                            style={{ maxWidth: "80%" }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <small className={`fw-bold ${isAI ? "text-primary" : "text-white-50"}`}>
                                {isAI ? "🤖 Gemini AI Vendor" : "👤 Customer"}
                              </small>
                              {h.offeredPrice && (
                                <span className={`badge ${isAI ? "bg-warning text-dark" : "bg-light text-dark"}`}>
                                  ₹{h.offeredPrice}
                                </span>
                              )}
                            </div>
                            <p className="mb-0 small" style={{ whiteSpace: "pre-line" }}>
                              {h.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted text-center">No message history.</p>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                {selectedSession.dealCouponCode ? (
                  <div>
                    <span className="small text-muted me-2">Deal Coupon:</span>
                    <code className="fw-bold fs-6 text-success">{selectedSession.dealCouponCode}</code>
                  </div>
                ) : (
                  <div></div>
                )}
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-sm"
                    onClick={(e) => handleDeleteRecord(selectedSession._id, e)}
                    title="Permanently Delete This Record"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span>Delete Permanently</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setSelectedSession(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
