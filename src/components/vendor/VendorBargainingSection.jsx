import React, { useState, useEffect } from "react";
import {
  getVendorBargainHistory,
  authorizeVendorBargain,
  declineVendorBargain,
  deleteBargainRecord
} from "../server/Bargain";
import { baseUrl } from "../endpoints";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function VendorBargainingSection() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);

  // Per-session input state for pending demands: { [sessionId]: { marginPercent, maxDiscountPercent, vendorNote } }
  const [approvalInputs, setApprovalInputs] = useState({});

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getVendorBargainHistory();
      if (res.data && res.data.success) {
        const data = res.data.data || [];
        setNegotiations(data);

        // Initialize default input values for pending demands
        const initialInputs = {};
        data
          .filter((n) => n.status === "waiting_vendor_approval")
          .forEach((n) => {
            initialInputs[n._id] = {
              marginPercent: 25,
              maxDiscountPercent: 10,
              vendorNote: ""
            };
          });
        setApprovalInputs((prev) => ({ ...initialInputs, ...prev }));
      }
    } catch (err) {
      console.error("Error loading bargaining history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInputChange = (sessionId, field, value) => {
    setApprovalInputs((prev) => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || { marginPercent: 25, maxDiscountPercent: 10, vendorNote: "" }),
        [field]: value
      }
    }));
  };

  const handleAuthorize = async (sessionId, originalPrice) => {
    const inputs = approvalInputs[sessionId] || { marginPercent: 25, maxDiscountPercent: 10, vendorNote: "" };
    const margin = Number(inputs.marginPercent);
    const maxDiscount = Number(inputs.maxDiscountPercent);

    if (isNaN(margin) || margin < 0 || margin > 100) {
      toast.error("Please enter a valid Profit Margin (0 - 100%)");
      return;
    }
    if (isNaN(maxDiscount) || maxDiscount < 0 || maxDiscount > 100) {
      toast.error("Please enter a valid Max Discount (0 - 100%)");
      return;
    }
    if (maxDiscount > margin) {
      const confirmExceed = await Swal.fire({
        title: "Discount Exceeds Margin?",
        text: `You have entered a ${maxDiscount}% discount with only ${margin}% profit margin. This will result in selling below your acquisition cost. Do you want to proceed?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Authorize Anyway",
        cancelButtonText: "Adjust Values",
        confirmButtonColor: "#f59e0b"
      });
      if (!confirmExceed.isConfirmed) return;
    }

    try {
      setActionLoadingId(sessionId);
      const res = await authorizeVendorBargain({
        negotiationId: sessionId,
        marginPercent: margin,
        maxDiscountPercent: maxDiscount,
        vendorNote: inputs.vendorNote || ""
      });

      if (res.data && res.data.success) {
        toast.success(
          `Bargaining Authorized! AI will negotiate within your ${maxDiscount}% discount limit (Floor: ₹${(
            originalPrice * (1 - maxDiscount / 100)
          ).toFixed(0)}).`
        );
        fetchHistory();
        if (selectedSession && selectedSession._id === sessionId) {
          setSelectedSession(null);
        }
      } else {
        toast.error(res.data?.message || "Failed to authorize session.");
      }
    } catch (err) {
      console.error("Authorize error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to authorize.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (sessionId) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Decline Customer Bargaining Request?",
      text: "Let the customer know why you cannot negotiate for this item at this time (optional):",
      input: "text",
      inputPlaceholder: "e.g., Fixed vendor retail price / High raw material cost",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Decline Request",
      cancelButtonText: "Cancel"
    });

    if (!isConfirmed) return;

    try {
      setActionLoadingId(sessionId);
      const res = await declineVendorBargain({
        negotiationId: sessionId,
        reason: reason || "Vendor unable to discount product at this time"
      });

      if (res.data && res.data.success) {
        toast.info("Bargaining request declined. Customer will be notified.");
        fetchHistory();
        if (selectedSession && selectedSession._id === sessionId) {
          setSelectedSession(null);
        }
      } else {
        toast.error(res.data?.message || "Failed to decline session.");
      }
    } catch (err) {
      console.error("Decline error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to decline.");
    } finally {
      setActionLoadingId(null);
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

  const total = negotiations.length;
  const pendingDemands = negotiations.filter((n) => n.status === "waiting_vendor_approval");
  const accepted = negotiations.filter((n) => n.status === "deal_accepted" || n.status === "accepted").length;
  const inProgress = negotiations.filter((n) => n.status === "in_progress").length;
  const closedOrExpired = negotiations.filter(
    (n) =>
      n.status === "closed" ||
      n.status === "rejected" ||
      n.status === "deal_rejected" ||
      n.status === "expired" ||
      n.status === "vendor_declined"
  ).length;

  const totalDiscountAcc = negotiations
    .filter((n) => (n.status === "deal_accepted" || n.status === "accepted") && (n.finalAgreedPrice || n.agreedPrice) && n.originalPrice)
    .reduce((sum, n) => {
      const price = n.finalAgreedPrice || n.agreedPrice;
      return sum + ((n.originalPrice - price) / n.originalPrice) * 100;
    }, 0);
  const avgDiscount = accepted > 0 ? (totalDiscountAcc / accepted).toFixed(1) : 0;

  const filtered = negotiations.filter((n) => {
    if (filter === "pending") return n.status === "waiting_vendor_approval";
    if (filter === "accepted") return n.status === "deal_accepted" || n.status === "accepted";
    if (filter === "in_progress") return n.status === "in_progress";
    if (filter === "closed")
      return (
        n.status === "closed" ||
        n.status === "rejected" ||
        n.status === "deal_rejected" ||
        n.status === "expired" ||
        n.status === "vendor_declined"
      );
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
              Customer negotiations first ask for your profit margin & allowable discount before AI bargaining starts.
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
              <div className="text-muted small fw-semibold text-uppercase">Total Sessions</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className="fw-bold mb-0 text-dark">{total}</h3>
                <span className="badge bg-primary-subtle text-primary">All Sessions</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className={`card border-0 shadow-sm rounded-3 p-3 h-100 ${
                pendingDemands.length > 0 ? "bg-warning-subtle border border-warning" : "bg-white"
              }`}
            >
              <div className="text-muted small fw-semibold text-uppercase">Pending Approval</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className={`fw-bold mb-0 ${pendingDemands.length > 0 ? "text-danger" : "text-dark"}`}>
                  {pendingDemands.length}
                </h3>
                <span className={`badge ${pendingDemands.length > 0 ? "bg-danger text-white" : "bg-secondary-subtle text-secondary"}`}>
                  {pendingDemands.length > 0 ? "Action Required" : "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="text-muted small fw-semibold text-uppercase">Deals Locked</div>
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
              <div className="text-muted small fw-semibold text-uppercase">Avg Concession Given</div>
              <div className="d-flex align-items-baseline gap-2 mt-2">
                <h3 className="fw-bold mb-0 text-warning">{avgDiscount}%</h3>
                <span className="badge bg-warning-subtle text-dark">Below List Price</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION REQUIRED: Pending Customer Demands Section */}
      {pendingDemands.length > 0 && (
        <div className="p-4 bg-warning bg-opacity-10 border-bottom">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-danger" role="status"></span>
              <h5 className="fw-bold mb-0 text-dark">
                Customer Bargaining Demands Awaiting Margin & Discount Approval
              </h5>
              <span className="badge bg-danger text-white rounded-pill px-2 py-1">
                {pendingDemands.length} Waiting
              </span>
            </div>
            <small className="text-muted">
              Enter your profit margin and the maximum discount percentage you agree to provide. AI will strictly negotiate within your limits.
            </small>
          </div>

          <div className="row g-3">
            {pendingDemands.map((demand) => {
              const prod = demand.productId || {};
              const user = demand.userId || {};
              const inputs = approvalInputs[demand._id] || { marginPercent: 25, maxDiscountPercent: 10, vendorNote: "" };
              const originalPrice = demand.originalPrice || prod.price || 0;
              const maxDiscountPercent = Number(inputs.maxDiscountPercent) || 0;
              const floorPrice = Math.round(originalPrice * (1 - maxDiscountPercent / 100));
              const maxSavings = Math.round(originalPrice - floorPrice);
              const marginPercent = Number(inputs.marginPercent) || 0;
              const retainedMargin = (marginPercent - maxDiscountPercent).toFixed(1);

              return (
                <div key={demand._id} className="col-12 col-xl-6">
                  <div className="card border-warning shadow-sm rounded-4 h-100 bg-white overflow-hidden">
                    <div className="card-header bg-warning-subtle border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-user-tag text-warning"></i>
                        <span className="fw-bold text-dark">{user.name || "Customer"}</span>
                        <span className="text-muted small">({user.email || "Shopper"})</span>
                      </div>
                      <span className="badge bg-warning text-dark border border-warning">
                        Demand Pending
                      </span>
                    </div>

                    <div className="card-body p-4">
                      {/* Product Preview */}
                      <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3 border">
                        {prod.image ? (
                          <img
                            src={
                              Array.isArray(prod.image)
                                ? (prod.image[0]?.startsWith("http") ? prod.image[0] : `${baseUrl}/${prod.image[0]}`)
                                : (prod.image.startsWith("http") ? prod.image : `${baseUrl}/${prod.image}`)
                            }
                            alt={prod.name}
                            className="rounded border"
                            style={{ width: "54px", height: "54px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="rounded border bg-white d-flex align-items-center justify-content-center text-muted"
                            style={{ width: "54px", height: "54px" }}
                          >
                            <i className="fa-solid fa-box fs-4"></i>
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <h6 className="fw-bold text-dark mb-1">{prod.name || "Product"}</h6>
                          <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
                            <span>
                              List Price: <strong className="text-dark">₹{originalPrice}</strong>
                            </span>
                            <span>
                              Demand Qty: <strong className="text-primary">{demand.quantity || 1} units</strong>
                            </span>
                            <span>
                              Your Stock: <strong className="text-success">{demand.currentStock || prod.stock || 0} units</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Margin & Max Discount Inputs */}
                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">
                            <i className="fa-solid fa-chart-line text-success me-1"></i>
                            Your Profit Margin (%)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="form-control fw-bold"
                              value={inputs.marginPercent}
                              onChange={(e) => handleInputChange(demand._id, "marginPercent", e.target.value)}
                              placeholder="e.g. 25"
                            />
                            <span className="input-group-text bg-white">%</span>
                          </div>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            What % profit you make on this item
                          </small>
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">
                            <i className="fa-solid fa-percent text-danger me-1"></i>
                            Max Discount to Provide (%)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="form-control fw-bold text-danger"
                              value={inputs.maxDiscountPercent}
                              onChange={(e) => handleInputChange(demand._id, "maxDiscountPercent", e.target.value)}
                              placeholder="e.g. 10"
                            />
                            <span className="input-group-text bg-white">%</span>
                          </div>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            Max AI will concede to this customer
                          </small>
                        </div>
                      </div>

                      {/* Calculated Limits Card */}
                      <div className="p-3 rounded-3 bg-light border mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted">Protected Floor Price:</span>
                          <span className="fw-bold text-dark fs-6">₹{floorPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted">Max Concession Amount:</span>
                          <span className="fw-bold text-danger small">-₹{maxSavings}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small text-muted">Retained Net Profit Margin:</span>
                          <span className={`fw-bold small ${retainedMargin >= 0 ? "text-success" : "text-danger"}`}>
                            {retainedMargin}%
                          </span>
                        </div>
                      </div>

                      {/* Optional Note */}
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Optional vendor note to customer / AI constraints..."
                          value={inputs.vendorNote || ""}
                          onChange={(e) => handleInputChange(demand._id, "vendorNote", e.target.value)}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success flex-grow-1 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                          disabled={actionLoadingId === demand._id}
                          onClick={() => handleAuthorize(demand._id, originalPrice)}
                        >
                          {actionLoadingId === demand._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                              Authorizing...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-circle-check"></i>
                              Authorize & Start Bargaining
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-outline-danger rounded-pill px-3 fw-bold"
                          disabled={actionLoadingId === demand._id}
                          onClick={() => handleDecline(demand._id)}
                        >
                          <i className="fa-solid fa-ban me-1"></i> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              className={`btn btn-sm rounded-pill px-3 fw-bold ${
                filter === "pending"
                  ? "btn-warning text-dark shadow-sm"
                  : pendingDemands.length > 0
                  ? "btn-light text-danger fw-bold"
                  : "btn-light text-muted"
              }`}
              onClick={() => setFilter("pending")}
            >
              Pending Approval ({pendingDemands.length})
              {pendingDemands.length > 0 && <span className="ms-1 badge bg-danger text-white rounded-circle p-1">!</span>}
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
                  <th>Vendor Terms</th>
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
                  const isWaitingApproval = neg.status === "waiting_vendor_approval";
                  const isDeclined = neg.status === "vendor_declined";
                  const agreedPrice = neg.finalAgreedPrice || neg.agreedPrice;
                  const latestOffer = neg.customerLatestOffer || neg.aiLatestCounterOffer || neg.finalOfferedPrice;

                  const discountPercent =
                    agreedPrice && neg.originalPrice
                      ? Math.round(((neg.originalPrice - agreedPrice) / neg.originalPrice) * 100)
                      : null;

                  return (
                    <tr key={neg._id} className={isWaitingApproval ? "table-warning bg-opacity-25" : ""}>
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
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "180px" }}>
                              {prod.name || "Product"}
                            </div>
                            <small className="text-muted">
                              Qty: <strong>{neg.quantity || 1}</strong> | Stock: {neg.currentStock || prod.stock || 0} units
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {neg.isVendorApproved ? (
                          <div className="small">
                            <span className="badge bg-success-subtle text-success me-1">
                              Margin: {neg.vendorMarginPercent ?? "—"}%
                            </span>
                            <span className="badge bg-primary-subtle text-primary">
                              Max Disc: {neg.vendorMaxDiscountPercent ?? "—"}%
                            </span>
                            <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
                              Floor: ₹{neg.floorPrice}
                            </div>
                          </div>
                        ) : isWaitingApproval ? (
                          <span className="badge bg-warning text-dark border border-warning">
                            <i className="fa-solid fa-clock-rotate-left me-1"></i> Awaiting Terms
                          </span>
                        ) : isDeclined ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger">
                            <i className="fa-solid fa-ban me-1"></i> Declined
                          </span>
                        ) : (
                          <span className="text-muted small">Standard Formula</span>
                        )}
                      </td>

                      <td>
                        {(neg.currentStock || prod.stock || 0) >= 30 ? (
                          <span className="badge bg-success-subtle text-success border border-success">
                            <i className="fa-solid fa-boxes-packing me-1"></i> Surplus
                          </span>
                        ) : (neg.currentStock || prod.stock || 0) >= 15 ? (
                          <span className="badge bg-info-subtle text-info border border-info">
                            <i className="fa-solid fa-box me-1"></i> Moderate
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border border-warning">
                            <i className="fa-solid fa-triangle-exclamation me-1"></i> Limited
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
                        ) : isWaitingApproval ? (
                          <span className="badge bg-warning text-dark px-2 py-1">
                            <i className="fa-solid fa-hourglass-start me-1"></i> Needs Margin
                          </span>
                        ) : isDeclined ? (
                          <span className="badge bg-danger-subtle text-danger px-2 py-1">Declined</span>
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
                          {isWaitingApproval ? (
                            <button
                              className="btn btn-warning btn-sm rounded-pill px-2 px-md-3 d-inline-flex align-items-center gap-1 shadow-sm fw-bold"
                              onClick={() => setSelectedSession(neg)}
                              title="Set Margin & Max Discount"
                            >
                              <i className="fa-solid fa-sliders"></i>
                              <span>Authorize</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-success btn-sm rounded-pill px-2 px-md-3 d-inline-flex align-items-center gap-1 shadow-sm"
                              onClick={() => setSelectedSession(neg)}
                              title="View Negotiation Transcript"
                            >
                              <i className="fa-regular fa-comment-dots"></i>
                              <span>Logs</span>
                            </button>
                          )}
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

      {/* Negotiation History & Approval Modal */}
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
                    {selectedSession.status === "waiting_vendor_approval"
                      ? "Authorize Customer Bargaining Demand"
                      : "AI Negotiation Transcript"}
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

              <div className="modal-body p-4 bg-light" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {/* Round & Margin Tracker */}
                <div className="row g-2 mb-3 bg-white p-3 rounded-3 border">
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">List Price:</span>
                    <strong className="fs-6">₹{selectedSession.originalPrice}</strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Protected Floor:</span>
                    <strong className="text-danger fs-6">
                      {selectedSession.floorPrice ? `₹${selectedSession.floorPrice}` : "Awaiting Authorization"}
                    </strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Vendor Terms:</span>
                    <span className="small fw-bold text-primary">
                      {selectedSession.isVendorApproved
                        ? `Margin: ${selectedSession.vendorMarginPercent}% | Max Disc: ${selectedSession.vendorMaxDiscountPercent}%`
                        : "Not set yet"}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Status:</span>
                    <span className="badge bg-primary text-uppercase">{selectedSession.status}</span>
                  </div>
                </div>

                {/* If session is pending approval, offer inline authorization panel */}
                {selectedSession.status === "waiting_vendor_approval" && (
                  <div className="p-4 bg-warning bg-opacity-10 border border-warning rounded-3 mb-4">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="fa-solid fa-hand-holding-dollar text-warning me-2"></i>
                      Set Your Terms to Start Bargaining
                    </h6>
                    <p className="small text-muted mb-3">
                      Please enter your profit margin and the maximum discount percentage you can provide. Once approved, the AI will bargain with the customer strictly honoring your limits.
                    </p>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-bold">Your Profit Margin (%)</label>
                        <div className="input-group">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control"
                            value={approvalInputs[selectedSession._id]?.marginPercent ?? 25}
                            onChange={(e) => handleInputChange(selectedSession._id, "marginPercent", e.target.value)}
                          />
                          <span className="input-group-text">%</span>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-bold text-danger">Max Discount to Provide (%)</label>
                        <div className="input-group">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control text-danger fw-bold"
                            value={approvalInputs[selectedSession._id]?.maxDiscountPercent ?? 10}
                            onChange={(e) =>
                              handleInputChange(selectedSession._id, "maxDiscountPercent", e.target.value)
                            }
                          />
                          <span className="input-group-text">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success rounded-pill fw-bold px-4"
                        disabled={actionLoadingId === selectedSession._id}
                        onClick={() => handleAuthorize(selectedSession._id, selectedSession.originalPrice)}
                      >
                        <i className="fa-solid fa-circle-check me-1"></i> Authorize & Begin
                      </button>
                      <button
                        className="btn btn-outline-danger rounded-pill px-3"
                        disabled={actionLoadingId === selectedSession._id}
                        onClick={() => handleDecline(selectedSession._id)}
                      >
                        <i className="fa-solid fa-ban me-1"></i> Decline Demand
                      </button>
                    </div>
                  </div>
                )}

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
                    <p className="text-muted text-center my-4">
                      {selectedSession.status === "waiting_vendor_approval"
                        ? "Bargaining conversation will start after you authorize your margin and discount limits."
                        : "No message history."}
                    </p>
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
