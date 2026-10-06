import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { allOrder, cancelOrder } from "../server/Order";
import { numberToWords } from "../../utils/numberToWords";
import DeliveryTracker from "./DeliveryTracker";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [activeTrackingId, setActiveTrackingId] = useState(null);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const location = useLocation();

  const toggleOrderExpand = (index) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleTracking = (orderId) => {
    setActiveTrackingId((prev) => (prev === orderId ? null : orderId));
  };

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = (isSilent = false) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      if (!isSilent) toast.error("Please login to view orders");
      return;
    }

    if (!isSilent) setLoading(true);
    allOrder({ userId })
      .then((res) => {
        if (res.data.success) {
          const fetchedOrders = res.data.data;
          setOrders(fetchedOrders);

          if (!isSilent && fetchedOrders.length > 0) {
            const targetId = location.state?.trackOrderId || null;
            setActiveTrackingId(targetId);
          }
        } else if (!isSilent) {
          toast.error(res.data.message);
        }
        if (!isSilent) setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        if (!isSilent) {
          toast.error("Failed to load orders");
          setLoading(false);
        }
      });
  };

  /**
   * Authority Check:
   * A customer has authority to cancel as long as NO vendor has accepted the order yet.
   * If any item or the overall order is marked 'accepted', 'packed', 'shipped', 'delivered',
   * or if it's already 'cancelled', cancellation authority is locked.
   */
  const canCancelOrder = (order) => {
    if (!order) return false;
    const currentStatus = (order.orderStatus || "").toLowerCase();
    if (currentStatus === "cancelled") return false;

    const uncancelableStatuses = ["accepted", "packed", "shipped", "delivered"];
    if (uncancelableStatuses.includes(currentStatus)) return false;

    // Check individual items
    const hasAcceptedItem = order.products?.some((item) =>
      uncancelableStatuses.includes((item.itemStatus || "").toLowerCase())
    );
    if (hasAcceptedItem) return false;

    return true; // Not accepted yet -> Customer can cancel!
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason("Changed my mind");
    setCustomReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelling(true);
    try {
      const finalReason =
        cancelReason === "Other"
          ? customReason.trim() || "Customer requested cancellation"
          : cancelReason;

      const res = await cancelOrder({
        orderId: orderToCancel._id,
        reason: finalReason,
      });

      if (res.data?.success) {
        toast.success("Order cancelled successfully! Stock released.");
        setCancelModalOpen(false);
        setOrderToCancel(null);

        // Optimistically update order status in state
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderToCancel._id
              ? {
                  ...o,
                  orderStatus: "cancelled",
                  products: o.products?.map((p) => ({ ...p, itemStatus: "cancelled" })),
                  paymentStatus:
                    (o.paymentMethod || "").toUpperCase() === "ONLINE"
                      ? "Refund Pending"
                      : "Cancelled",
                  updatedAt: new Date(),
                }
              : o
          )
        );

        // Refresh orders from server
        fetchOrders(true);
      } else {
        toast.error(res.data?.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      const errorMsg =
        err.response?.data?.message || "Error while cancelling order";
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "placed": return "bg-success";
      case "accepted": return "bg-success";
      case "packed": return "bg-info text-dark";
      case "processing": return "bg-info text-dark";
      case "shipped": return "bg-primary";
      case "delivered": return "bg-success";
      case "cancelled": return "bg-danger";
      default: return "bg-warning text-dark";
    }
  };

  return (
    <>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">My Orders</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><a href="#">Pages</a></li>
          <li className="breadcrumb-item active text-white">My Orders</li>
        </ol>
      </div>

      <div className="container-fluid py-5">
        <div className="container py-3">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Date</th>
                    <th scope="col">Products</th>
                    <th scope="col">Total</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-center">Delivery & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const orderCanBeCancelled = canCancelOrder(order);
                    const isCancelled = (order.orderStatus || "").toLowerCase() === "cancelled";

                    return (
                      <React.Fragment key={order._id}>
                        <tr>
                          <td>{index + 1}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {order.products?.slice(0, 3).map((item, i) => (
                                <img
                                  key={i}
                                  src={item.productId?.image?.[0] || item.productId?.image || item.image}
                                  alt=""
                                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }}
                                />
                              ))}
                              {order.products?.length > 3 && (
                                <span className="badge bg-secondary">+{order.products.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="fw-bold">
                            <div>₹{order.grandTotal}</div>
                            <small className="text-muted fw-bold d-block" style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                              {numberToWords(order.grandTotal)}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : (isCancelled ? "bg-danger" : "bg-warning text-dark")}`}>
                              {order.paymentStatus === "Paid" ? "Paid" : (isCancelled && order.paymentStatus !== "Paid" ? "Cancelled" : (order.paymentStatus || "COD"))}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-column align-items-start">
                              <span className={`badge ${getStatusBadge(order.orderStatus)} text-capitalize`}>
                                {order.orderStatus}
                              </span>

                              {/* Authority status indication */}
                              {orderCanBeCancelled ? (
                                <span
                                  className="badge bg-light text-secondary border mt-1 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.68rem" }}
                                  title="The vendor has not accepted this order yet. You can cancel anytime."
                                >
                                  <i className="fa-solid fa-hourglass-half text-warning"></i>
                                  Awaiting Seller
                                </span>
                              ) : !isCancelled ? (
                                <span
                                  className="badge bg-light text-success border mt-1 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.68rem" }}
                                  title="Seller accepted this order. Cancellation is closed."
                                >
                                  <i className="fa-solid fa-lock text-success"></i>
                                  Seller Accepted
                                </span>
                              ) : (
                                <span
                                  className="badge bg-light text-danger border mt-1 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.68rem" }}
                                >
                                  <i className="fa-solid fa-ban text-danger"></i>
                                  Cancelled
                                </span>
                              )}

                              <small className="text-muted mt-1 d-flex align-items-center gap-1" style={{ fontSize: "0.72rem" }}>
                                <i className="fa fa-clock text-secondary" style={{ fontSize: "0.68rem" }}></i>
                                {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                              <button
                                className={`btn btn-sm ${activeTrackingId === order._id ? "btn-success" : "btn-primary"} rounded-pill px-3 fw-bold d-flex align-items-center gap-1`}
                                type="button"
                                onClick={() => toggleTracking(order._id)}
                              >
                                <i className="fa fa-truck-fast"></i>
                                {activeTrackingId === order._id ? "Hide Tracker" : "Track"}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                type="button"
                                onClick={() => toggleOrderExpand(index)}
                              >
                                {expandedOrders[index] ? "Hide Items" : "Items"}
                              </button>

                              {/* Customer Authority: Cancel button ONLY before Vendor accepts */}
                              {orderCanBeCancelled ? (
                                <button
                                  className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold d-flex align-items-center gap-1 shadow-sm"
                                  type="button"
                                  onClick={() => handleOpenCancelModal(order)}
                                  title="Vendor hasn't accepted yet. Click to cancel order."
                                >
                                  <i className="fa-solid fa-ban"></i>
                                  Cancel Order
                                </button>
                              ) : !isCancelled ? (
                                <span
                                  className="badge bg-light text-muted border rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.72rem" }}
                                  title="Order accepted by seller. Cancellation is locked."
                                >
                                  <i className="fa-solid fa-lock text-secondary"></i> Locked
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>

                        {activeTrackingId === order._id && (
                          <tr>
                            <td colSpan={7} className="p-0 border-0">
                              <div className="px-2 py-3 bg-light">
                                <DeliveryTracker
                                  order={order}
                                  onClose={() => setActiveTrackingId(null)}
                                  canCancel={orderCanBeCancelled}
                                  onCancel={() => handleOpenCancelModal(order)}
                                />
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr>
                          <td colSpan={7} className="p-0 border-0">
                            <div className={`collapse ${expandedOrders[index] ? "show" : ""}`} id={`orderDetail${index}`}>
                              <div className="p-3 bg-light rounded m-2">
                                {/* Informational Banner regarding Cancellation Authority */}
                                {orderCanBeCancelled ? (
                                  <div className="alert alert-warning py-2 px-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 border-0 bg-warning-subtle text-dark">
                                    <div className="d-flex align-items-center gap-2">
                                      <i className="fa-solid fa-hourglass-half text-warning fs-5"></i>
                                      <div>
                                        <strong>Vendor Acceptance Pending:</strong> You have full authority to cancel this order as long as the seller hasn't accepted it yet.
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger rounded-pill px-3 fw-bold shadow-sm"
                                      onClick={() => handleOpenCancelModal(order)}
                                    >
                                      <i className="fa-solid fa-ban me-1"></i> Cancel Order
                                    </button>
                                  </div>
                                ) : !isCancelled ? (
                                  <div className="alert alert-success py-2 px-3 rounded-3 d-flex align-items-center gap-2 mb-3 border-0 bg-success-subtle text-success-emphasis">
                                    <i className="fa-solid fa-shield-halved text-success fs-5"></i>
                                    <div>
                                      <strong>Order Accepted by Seller:</strong> The seller has confirmed your order and allocated inventory. Cancellation is locked.
                                    </div>
                                  </div>
                                ) : (
                                  <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center gap-2 mb-3 border-0 bg-danger-subtle text-danger-emphasis">
                                    <i className="fa-solid fa-ban text-danger fs-5"></i>
                                    <div>
                                      <strong>Order Cancelled:</strong> This order was cancelled before vendor acceptance.
                                    </div>
                                  </div>
                                )}

                                <div className="row g-3">
                                  {order.products?.map((item, i) => (
                                    <div key={i} className="col-md-4">
                                      <div className="d-flex align-items-center gap-3 p-2 bg-white rounded-3 shadow-sm">
                                        <img
                                          src={item.productId?.image?.[0] || item.productId?.image || item.image}
                                          alt=""
                                          style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }}
                                        />
                                        <div>
                                          <h6 className="mb-1">{item.productId?.name || item.name}</h6>
                                          <small className="text-muted d-block">Qty: {item.quantity}</small>
                                          <small className="text-muted">₹{Number(item.productId?.price) || 0} each</small>
                                          {item.itemStatus && (
                                            <div>
                                              <span className={`badge text-capitalize mt-1 ${getStatusBadge(item.itemStatus)}`}>
                                                {item.itemStatus}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <hr />
                                <div className="row">
                                  <div className="col-md-6">
                                    <p className="mb-1"><strong>Order ID:</strong> {order._id.slice(-8)}</p>
                                    <p className="mb-1"><strong>Payment:</strong> {order.paymentMethod}</p>
                                  </div>
                                  <div className="col-md-6 text-md-end">
                                    <p className="mb-1"><strong>Subtotal:</strong> ₹{order.grandTotal - 70 + (order.discount || 0)}</p>
                                    <p className="mb-1"><strong>Shipping:</strong> ₹70</p>
                                    {order.discount > 0 && <p className="mb-1 text-success"><strong>Discount:</strong> -₹{order.discount}</p>}
                                    <p className="fw-bold text-primary mb-0"><strong>Grand Total:</strong> ₹{order.grandTotal}</p>
                                    <small className="text-muted d-block fw-bold" style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                                      {numberToWords(order.grandTotal)}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="fa fa-shopping-bag fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">No orders yet</h5>
              <p className="text-muted mb-4">Start shopping to place your first order!</p>
              <Link to="/cardProduct" className="btn border-secondary rounded-pill px-4 py-3 text-primary">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modern Cancel Order Confirmation Modal */}
      {cancelModalOpen && orderToCancel && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-danger text-white py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Cancel Order #{orderToCancel.autoId || orderToCancel._id.slice(-8)}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  disabled={cancelling}
                  onClick={() => {
                    setCancelModalOpen(false);
                    setOrderToCancel(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div
                  className="alert alert-info py-2 px-3 rounded-3 d-flex align-items-center gap-2 mb-3"
                  style={{ fontSize: "0.88rem" }}
                >
                  <i className="fa-solid fa-circle-info text-primary fs-5"></i>
                  <div>
                    <strong>Seller hasn't accepted yet:</strong> You have full authority to cancel this order now. All reserved stock will be immediately restored.
                  </div>
                </div>

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Total Amount:</span>
                    <span className="fw-bold text-dark">₹{orderToCancel.grandTotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Payment Method:</span>
                    <span className="fw-semibold">{orderToCancel.paymentMethod}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Items:</span>
                    <span>{orderToCancel.products?.length || 0} product(s)</span>
                  </div>
                </div>

                <label className="form-label fw-bold small text-secondary">
                  Please select a reason for cancellation:
                </label>
                <select
                  className="form-select mb-3 shadow-none"
                  value={cancelReason}
                  disabled={cancelling}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Other">Other reason</option>
                </select>

                {cancelReason === "Other" && (
                  <textarea
                    className="form-control mb-3 shadow-none"
                    rows="2"
                    placeholder="Please specify reason..."
                    value={customReason}
                    disabled={cancelling}
                    onChange={(e) => setCustomReason(e.target.value)}
                  ></textarea>
                )}

                <p className="text-muted small mb-0">
                  <i className="fa-solid fa-shield-halved text-success me-1"></i>
                  {orderToCancel.paymentStatus === "Paid"
                    ? "Since you paid online, a refund request will be initiated immediately."
                    : "No charges apply as this order was placed via COD."}
                </p>
              </div>
              <div className="modal-footer bg-light py-2 px-4 border-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  disabled={cancelling}
                  onClick={() => {
                    setCancelModalOpen(false);
                    setOrderToCancel(null);
                  }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                  disabled={cancelling}
                  onClick={handleConfirmCancel}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-ban"></i>
                      Confirm Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
