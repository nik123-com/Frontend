import React from "react";
import "./DeliveryTracker.css";

export default function DeliveryTracker({ order, onClose, canCancel = false, onCancel = null }) {
  if (!order) return null;

  const STOPS = [
    { key: "placed", title: "Ordered", desc: "Order confirmed", icon: "fa-shopping-bag" },
    { key: "accepted", title: "Accepted", desc: "Preparing item", icon: "fa-clipboard-check" },
    { key: "packed", title: "Packed", desc: "Ready to dispatch", icon: "fa-box-open" },
    { key: "shipped", title: "Shipped", desc: "Out for delivery", icon: "fa-truck" },
    { key: "delivered", title: "Delivered", desc: "Handed to customer", icon: "fa-house-circle-check" },
  ];

  const getActiveStepIndex = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "cancelled") return -1;
    if (s === "delivered") return 4;
    if (s === "shipped" || s === "out for delivery") return 3;
    if (s === "packed") return 2;
    if (s === "accepted" || s === "processing") return 1;
    return 0; // default Placed
  };

  const activeIndex = getActiveStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus?.toLowerCase() === "cancelled";

  // Calculate progress fill percentage across the 4 segments between 5 stops (0%, 25%, 50%, 75%, 90%)
  const getProgressPercentage = () => {
    if (isCancelled) return 0;
    if (activeIndex === 0) return 0;
    if (activeIndex === 1) return 25;
    if (activeIndex === 2) return 50;
    if (activeIndex === 3) return 75;
    if (activeIndex === 4) return 90; // Fill line to end node
    return 0;
  };

  const fillPercent = getProgressPercentage();

  // Dates
  const createdDate = new Date(order.createdAt || Date.now());
  const estDate = new Date(createdDate);
  estDate.setDate(createdDate.getDate() + 3);

  const formatDate = (date) => {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortTime = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return `${formatDate(d)} at ${formatShortTime(d)}`;
  };

  const getTimelineTime = (statusKey) => {
    if (Array.isArray(order.statusTimeline) && order.statusTimeline.length > 0) {
      const match = [...order.statusTimeline]
        .reverse()
        .find((entry) => (entry.status || "").toLowerCase() === statusKey.toLowerCase());
      if (match && match.timestamp) {
        return new Date(match.timestamp);
      }
    }
    return null;
  };

  const createdMs = new Date(order.createdAt || Date.now()).getTime();
  const updatedMs = order.updatedAt ? new Date(order.updatedAt).getTime() : createdMs;
  const nowMs = Date.now();

  const getStepTimestamp = (stepIndex, statusKey) => {
    const explicit = getTimelineTime(statusKey);
    if (explicit) return explicit;

    if (stepIndex === 0) {
      return new Date(createdMs);
    }

    if (stepIndex === activeIndex && order.updatedAt) {
      return new Date(updatedMs);
    }

    let offsetMinutes = 30;
    if (stepIndex === 1) offsetMinutes = 25;
    else if (stepIndex === 2) offsetMinutes = 85;
    else if (stepIndex === 2.5) offsetMinutes = 145;
    else if (stepIndex === 3) offsetMinutes = 215;
    else if (stepIndex === 4) offsetMinutes = 330;

    if (updatedMs > createdMs && activeIndex >= stepIndex) {
      const totalSteps = Math.max(activeIndex, 1);
      const stepRatio = Math.min(stepIndex / totalSteps, 1);
      const computedMs = createdMs + (updatedMs - createdMs) * stepRatio;
      return new Date(Math.min(computedMs, nowMs));
    }

    const targetMs = createdMs + offsetMinutes * 60 * 1000;
    return new Date(Math.min(targetMs, nowMs));
  };

  // Generate Amazon-style activity history log
  const getActivityLog = () => {
    const log = [];
    if (isCancelled) {
      const cancelTime = getTimelineTime("cancelled") || (order.updatedAt ? new Date(order.updatedAt) : new Date());
      log.push({
        title: "Order Cancelled",
        date: formatDateTime(cancelTime),
        active: true
      });
      return log;
    }

    if (activeIndex >= 4) {
      const deliveredTime = getStepTimestamp(4, "delivered");
      log.push({
        title: "Package delivered to customer",
        date: formatDateTime(deliveredTime),
        active: true
      });
    }
    if (activeIndex >= 3) {
      const shippedTime = getStepTimestamp(3, "shipped");
      const sortingTime = getStepTimestamp(2.5, "sorting");
      log.push({
        title: "Out for delivery with courier driver",
        date: formatDateTime(shippedTime),
        active: activeIndex === 3
      });
      log.push({
        title: "Package arrived at regional sorting facility",
        date: formatDateTime(sortingTime),
        active: false
      });
    }
    if (activeIndex >= 2) {
      const packedTime = getStepTimestamp(2, "packed");
      log.push({
        title: "Package packed and sealed at fulfillment warehouse",
        date: formatDateTime(packedTime),
        active: activeIndex === 2
      });
    }
    if (activeIndex >= 1) {
      const acceptedTime = getStepTimestamp(1, "accepted");
      log.push({
        title: "Order accepted by seller & inventory allocated",
        date: formatDateTime(acceptedTime),
        active: activeIndex === 1
      });
    }
    const placedTime = getStepTimestamp(0, "placed");
    log.push({
      title: "Order placed & payment verified",
      date: formatDateTime(placedTime),
      active: activeIndex === 0
    });

    return log;
  };

  const activityLogs = getActivityLog();

  return (
    <div className="amazon-tracker-card my-3">
      {/* Amazon-style Header */}
      <div className="amazon-tracker-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="amazon-subtext text-uppercase fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
            Shipment Status • Order #{order._id ? order._id.slice(-8).toUpperCase() : order.autoId}
          </div>
          <div className="amazon-eta-heading">
            {isCancelled
              ? "Order Cancelled"
              : activeIndex === 4
              ? "Delivered"
              : `Arriving by ${formatDate(estDate)}`}
          </div>
          <div className="amazon-subtext">
            {isCancelled
              ? `Cancelled on ${formatDateTime(order.updatedAt || order.createdAt)}`
              : activeIndex === 4
              ? `Delivered on ${formatDateTime(order.updatedAt || Date.now())}`
              : `Last updated: ${formatDateTime(order.updatedAt || order.createdAt)} • Real-time Tracking`}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {onClose && (
            <button
              type="button"
              className="btn btn-sm btn-outline-light rounded-pill px-3"
              onClick={onClose}
            >
              <i className="fa fa-times me-1"></i> Close
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="amazon-tracker-body">
        {isCancelled ? (
          <div className="amazon-cancelled-box">
            <i className="fa fa-circle-exclamation fs-2 mb-2"></i>
            <h5 className="fw-bold">Order Cancelled</h5>
            <p className="mb-0 text-secondary" style={{ fontSize: "0.9rem" }}>
              Your order has been cancelled and stock returned. If you were charged, a refund will be issued.
            </p>
          </div>
        ) : (
          <>
            {canCancel && onCancel ? (
              <div className="alert alert-warning py-2 px-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 border-0 bg-warning-subtle text-dark">
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-hourglass-half text-warning fs-5"></i>
                  <span style={{ fontSize: "0.85rem" }}>
                    <strong>Awaiting Vendor Acceptance:</strong> You can cancel this order at this stage before the seller accepts it.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-danger rounded-pill px-3 fw-bold text-nowrap shadow-sm"
                  onClick={onCancel}
                >
                  <i className="fa-solid fa-ban me-1"></i> Cancel Order
                </button>
              </div>
            ) : activeIndex >= 1 ? (
              <div className="alert alert-success py-2 px-3 rounded-3 d-flex align-items-center gap-2 mb-3 border-0 bg-success-subtle text-success-emphasis" style={{ fontSize: "0.85rem" }}>
                <i className="fa-solid fa-shield-halved text-success fs-5"></i>
                <span>
                  <strong>Order Accepted by Seller:</strong> The seller has confirmed your order and is fulfilling it. Cancellation is now closed.
                </span>
              </div>
            ) : null}

            {/* Amazon-Style Timeline Progress Bar */}
            <div className="amazon-progress-container">
              <div className="amazon-progress-bar-background"></div>
              <div
                className="amazon-progress-bar-fill"
                style={{ width: `${fillPercent}%` }}
              ></div>

              <div className="amazon-steps-row">
                {STOPS.map((stop, idx) => {
                  const isCompleted = idx <= activeIndex;
                  const isActive = idx === activeIndex;
                  const stepTime = getStepTimestamp(idx, stop.key);

                  return (
                    <div
                      key={stop.key}
                      className={`amazon-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                    >
                      <div className="amazon-step-node">
                        {isCompleted && idx < activeIndex ? (
                          <i className="fa fa-check"></i>
                        ) : (
                          <i className={`fa ${stop.icon}`}></i>
                        )}
                      </div>
                      <div className="amazon-step-title">{stop.title}</div>
                      <div className="amazon-step-time">
                        {isActive ? (
                          <span className="text-success fw-bold">
                            {formatShortTime(stepTime)}
                          </span>
                        ) : isCompleted ? (
                          <span>{formatShortTime(stepTime)}</span>
                        ) : (
                          "Pending"
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Summary Information Cards */}
            <div className="amazon-info-grid">
              <div className="amazon-info-card">
                <div className="amazon-info-title">Carrier & Tracking ID</div>
                <div className="amazon-info-value d-flex align-items-center gap-2">
                  <i className="fa fa-shield-halved text-success"></i>
                  <span>Prime Delivery Express</span>
                </div>
                <small className="text-muted d-block mt-1">
                  ID: TRK-{order._id ? order._id.slice(-10).toUpperCase() : "8F29A01B"}
                </small>
              </div>

              <div className="amazon-info-card">
                <div className="amazon-info-title d-flex justify-content-between align-items-center">
                  <span>Delivery Address</span>
                  <i className="fa fa-location-dot text-primary"></i>
                </div>
                <div className="amazon-info-value text-truncate" title={(() => {
                  if (!order.addressId) return "Saved Customer Address";
                  const parts = [order.addressId.houseno, order.addressId.landmark, order.addressId.city, order.addressId.state]
                    .map(s => (s || "").trim())
                    .filter(s => s.length > 0);
                  return parts.length > 0 ? parts.join(", ") : "Saved Customer Address";
                })()}>
                  {(() => {
                    if (!order.addressId) return "Saved Customer Address";
                    const parts = [order.addressId.houseno, order.addressId.landmark, order.addressId.city, order.addressId.state]
                      .map(s => (s || "").trim())
                      .filter(s => s.length > 0);
                    return parts.length > 0 ? parts.join(", ") : "Saved Customer Address";
                  })()}
                </div>
                <small className="text-muted d-block mt-1">
                  <strong className="text-dark">PIN Code:</strong>{" "}
                  {order.addressId?.pin && order.addressId.pin !== "N/A" ? (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0 ms-1 fw-bold">
                      {order.addressId.pin}
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning border px-2 py-0 ms-1">
                      N/A
                    </span>
                  )}
                </small>
              </div>

              <div className="amazon-info-card">
                <div className="amazon-info-title">Payment Info</div>
                <div className="amazon-info-value">
                  ₹{order.grandTotal}{" "}
                  <span className="badge bg-success-subtle text-success ms-2" style={{ fontSize: "0.75rem" }}>
                    {order.paymentMethod || "COD"}
                  </span>
                </div>
                <small className="text-muted d-block mt-1">
                  Status: {order.paymentStatus === "Paid" ? "Paid" : "COD"}
                </small>
              </div>
            </div>

            {/* Amazon Recent Updates Timeline Log */}
            <div className="amazon-activity-list">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h6 className="fw-bold text-dark mb-0">
                  <i className="fa fa-list-check me-2 text-primary"></i>
                  Tracking Activity Updates
                </h6>
                <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-2 px-2 py-1" style={{ fontSize: "0.75rem" }}>
                  <span className="live-dot-pulse"></span>
                  Live Real-Time Updates
                </span>
              </div>
              <div>
                {activityLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`amazon-activity-item ${log.active ? "active" : ""}`}
                  >
                    <div className="amazon-activity-dot-wrapper">
                      <div className="amazon-activity-dot"></div>
                      {index < activityLogs.length - 1 && <div className="amazon-activity-line"></div>}
                    </div>
                    <div className="flex-grow-1 pb-2">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="amazon-activity-text fw-bold">{log.title}</span>
                        {log.active && (
                          <span className="badge bg-success text-white" style={{ fontSize: "0.68rem", padding: "2px 6px" }}>
                            Real-time Status
                          </span>
                        )}
                      </div>
                      <div className="amazon-activity-date mt-1 d-flex align-items-center gap-1">
                        <i className="fa fa-clock text-muted" style={{ fontSize: "0.72rem" }}></i>
                        <span>{log.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Contents */}
            {order.products && order.products.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold mb-3 text-secondary" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                  ITEMS IN THIS SHIPMENT ({order.products.length})
                </h6>
                <div className="row g-2">
                  {order.products.map((item, i) => {
                    const product = item.productId || item;
                    return (
                      <div key={i} className="col-md-6">
                        <div className="d-flex align-items-center gap-3 bg-white p-2 rounded-3 border">
                          <img
                            src={product?.image?.[0] || product?.image || "/assets/img/default.png"}
                            alt={product?.name || "Product"}
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }}
                          />
                          <div className="overflow-hidden">
                            <h6 className="mb-0 text-truncate" style={{ fontSize: "0.85rem" }}>
                              {product?.name || "Product"}
                            </h6>
                            <small className="text-muted">
                              Qty: {item.quantity} | ₹{product?.price || 0}
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
