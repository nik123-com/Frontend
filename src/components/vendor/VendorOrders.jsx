import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_all_orders, vendor_update_order_status } from "../endpoints";
import VendorInvoice from "./VendorInvoice";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState(null);

  const fetchOrders = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_all_orders,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setOrders(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error("Error loading vendor orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_update_order_status,
        { orderId, status },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success(`Order status updated to ${status}`);
        fetchOrders();
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating order status");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return true;
    return o.vendorItems?.some(
      (item) => item.itemStatus === activeTab || o.orderStatus === activeTab
    );
  });

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Order Management</h3>
          <p className="text-muted mb-0">Track and fulfill customer orders for your products.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
        <ul className="nav nav-pills flex-wrap gap-2">
          {["all", "pending", "accepted", "packed", "shipped", "delivered"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link text-capitalize px-4 py-2 fw-semibold ${
                  activeTab === tab ? "active bg-primary shadow-sm" : "text-dark bg-light"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Orders List Table */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading vendor orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Order ID & Date</th>
                    <th>Customer</th>
                    <th>Your Products</th>
                    <th>Vendor Subtotal</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const currentStatus =
                      order.vendorItems?.[0]?.itemStatus || order.orderStatus || "pending";

                    return (
                      <tr key={order._id}>
                        <td className="ps-4">
                          <div className="fw-bold text-primary">#{order.autoId}</div>
                          <small className="text-muted">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{order.customerId?.name || "Customer"}</div>
                          <small className="text-muted">{order.customerId?.email}</small>
                        </td>
                        <td>
                          {order.vendorItems?.map((item, idx) => (
                            <div key={idx} className="d-flex align-items-center gap-2 mb-1">
                              <img
                                src={
                                  item.productId?.image?.[0]?.startsWith("http")
                                    ? item.productId.image[0]
                                    : `/${item.productId?.image?.[0]}`
                                }
                                alt="Item"
                                className="rounded border"
                                style={{ width: "35px", height: "35px", objectFit: "cover" }}
                              />
                              <div>
                                <span className="fw-bold fs-7">{item.productId?.name}</span>
                                <small className="text-muted ms-2">x{item.quantity}</small>
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="fw-bold text-dark">
                          ₹{Number(order.vendorSubtotal || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                            {order.paymentStatus === "Paid" ? "Paid" : "COD"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge text-capitalize px-3 py-2 ${
                              currentStatus === "delivered"
                                ? "bg-success"
                                : currentStatus === "shipped"
                                ? "bg-info text-dark"
                                : currentStatus === "packed"
                                ? "bg-primary"
                                : currentStatus === "accepted"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {currentStatus}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group">
                            {currentStatus === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "accepted")}
                                className="btn btn-sm btn-outline-success"
                              >
                                Accept
                              </button>
                            )}

                            {currentStatus === "accepted" && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "packed")}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Mark Packed
                              </button>
                            )}

                            {currentStatus === "packed" && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "shipped")}
                                className="btn btn-sm btn-outline-info"
                              >
                                Mark Shipped
                              </button>
                            )}

                            {currentStatus === "shipped" && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "delivered")}
                                className="btn btn-sm btn-outline-success"
                              >
                                Mark Delivered
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedInvoiceOrderId(order._id)}
                              className="btn btn-sm btn-outline-dark"
                              title="Print Invoice / Packing Slip"
                            >
                              <i className="fa-solid fa-print"></i> Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-receipt fs-1 mb-2 text-secondary"></i>
              <h5>No Orders Found</h5>
              <p>Orders containing your products will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrderId && (
        <VendorInvoice
          orderId={selectedInvoiceOrderId}
          onClose={() => setSelectedInvoiceOrderId(null)}
        />
      )}
    </div>
  );
}
