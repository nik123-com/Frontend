import React from "react";
import "./DeliveryTracker.css";

export default function DeliveryTracker({ order, onClose }) {
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
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortTime = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate Amazon-style activity history log
  const getActivityLog = () => {
    const log = [];
    if (isCancelled) {
      log.push({ title: "Order Cancelled", date: "Processed", active: true });
      return log;
    }

    if (activeIndex >= 4) {
      log.push({
        title: "Package delivered to customer",
        date: formatDate(new Date(order.updatedAt || Date.now())),
        active: true
      });
    }
    if (activeIndex >= 3) {
      log.push({
        title: "Out for delivery with courier driver",
        date: formatDate(createdDate),
        active: activeIndex === 3
      });
      log.push({
        title: "Package arrived at regional sorting facility",
        date: formatDate(createdDate),
        active: false
      });
    }
    if (activeIndex >= 2) {
      log.push({
        title: "Package packed and sealed at fulfillment warehouse",
        date: formatDate(createdDate),
        active: activeIndex === 2
      });
    }
    if (activeIndex >= 1) {
      log.push({
        title: "Order accepted by seller & inventory allocated",
        date: formatDate(createdDate),
        active: activeIndex === 1
      });
    }
    log.push({
      title: "Order placed & payment verified",
      date: `${formatDate(createdDate)} at ${formatShortTime(order.createdAt)}`,
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
              ? "This order was cancelled."
              : activeIndex === 4
              ? `Delivered on ${formatDate(new Date(order.updatedAt || Date.now()))}`
              : "Standard Shipping with Live Tracking"}
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
                        {isActive
                          ? "Current Status"
                          : isCompleted
                          ? "Completed"
                          : "Pending"}
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
                <div className="amazon-info-title">Delivery Address</div>
                <div className="amazon-info-value text-truncate">
                  {order.addressId
                    ? `${order.addressId.houseno || ""}, ${order.addressId.city || ""}, ${order.addressId.state || ""}`
                    : "Saved Customer Address"}
                </div>
                <small className="text-muted d-block mt-1">
                  PIN: {order.addressId?.pin || "N/A"}
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
                  Status: {order.paymentStatus || "Pending"}
                </small>
              </div>
            </div>

            {/* Amazon Recent Updates Timeline Log */}
            <div className="amazon-activity-list">
              <h6 className="fw-bold text-dark mb-3">
                <i className="fa fa-list-check me-2 text-primary"></i>
                Tracking Activity Updates
              </h6>
              <div>
                {activityLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`amazon-activity-item ${log.active ? "active" : ""}`}
                  >
                    <div className="amazon-activity-dot"></div>
                    <div>
                      <div className="amazon-activity-text fw-bold">{log.title}</div>
                      <div className="amazon-activity-date">{log.date}</div>
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
