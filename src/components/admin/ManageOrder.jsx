import { useEffect, useState } from "react";
import { adminAllOrders, adminSingleOrder, adminUpdateOrder } from "../server/Order";

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDetail, setViewDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    adminAllOrders({})
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data);
        } else {
          toast.error(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching orders");
        setLoading(false);
      });
  };

  const handleStatusChange = (_id, newStatus) => {
    adminUpdateOrder({ _id, orderStatus: newStatus })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          if (viewDetail) {
            viewSingleOrder(_id);
          } else {
            fetchOrders();
          }
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error updating status");
      });
  };

  const viewSingleOrder = (_id) => {
    setLoading(true);
    adminSingleOrder({ _id })
      .then((res) => {
        if (res.data.success) {
          setSelectedOrder(res.data.data);
          setViewDetail(true);
        } else {
          toast.error(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching order");
        setLoading(false);
      });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "placed": return "bg-success text-white";
      case "processing": return "bg-info text-dark";
      case "shipped": return "bg-primary text-white";
      case "delivered": return "bg-success text-white";
      case "cancelled": return "bg-danger text-white";
      default: return "bg-warning text-dark";
    }
  };

  if (viewDetail && selectedOrder) {
    return (
      <>
        <br />
        <div className="container-fluid py-5 mt-2">
          <div className="container py-5">
            <div className="p-5 rounded bg-light">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: "#81c408" }}>
                  Order #{selectedOrder._id.slice(-8)}
                </h2>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => { setViewDetail(false); setSelectedOrder(null); }}>
                  Back to List
                </button>
              </div>

              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-white py-3">
                      <h5 className="m-0 fw-bold">Items Ordered</h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="ps-4">Product</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th className="text-end pe-4">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.products?.map((item, index) => (
                              <tr key={index}>
                                <td className="ps-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <img
                                      src={item.productId?.image?.[0] || item.productId?.image || item.image}
                                      alt=""
                                      style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }}
                                    />
                                    <span className="fw-medium">{item.productId?.name || item.name}</span>
                                  </div>
                                </td>
                                <td>₹{Number(item.productId?.price) || 0}</td>
                                <td>{item.quantity}</td>
                                <td className="text-end fw-bold pe-4">₹{(Number(item.productId?.price) || 0) * item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan="3" className="text-end fw-bold">Grand Total:</td>
                              <td className="text-end fw-bold text-primary pe-4">₹{selectedOrder.grandTotal}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-white py-3">
                      <h5 className="m-0 fw-bold">Manage Order</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-4">
                        <label className="form-label small text-uppercase text-muted fw-bold">Status Update</label>
                        <select
                          className={`form-select ${getStatusClass(selectedOrder.orderStatus)}`}
                          value={selectedOrder.orderStatus}
                          onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="placed">Placed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="border-top pt-3 mb-4">
                        <label className="small text-uppercase text-muted fw-bold d-block mb-2">Customer</label>
                        <p className="mb-1 fw-bold">{selectedOrder.customerId?.name || "N/A"}</p>
                        <p className="mb-0 small">{selectedOrder.customerId?.email || ""}</p>
                      </div>

                      <div className="border-top pt-3">
                        <label className="small text-uppercase text-muted fw-bold d-block mb-2">Payment</label>
                        <p className="mb-1"><strong>Method:</strong> {selectedOrder.paymentMethod}</p>
                        <p className="mb-0">
                          <strong>Status:</strong>{" "}
                          <span className={`badge ${selectedOrder.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Manage Orders
                  </h1>
                </div>
                  <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light text-secondary">
                        <tr>
                          <th scope="col" className="ps-4">#</th>
                          <th scope="col">Customer</th>
                          <th scope="col">Items</th>
                          <th scope="col">Total</th>
                          <th scope="col">Payment</th>
                          <th scope="col">Status</th>
                          <th scope="col">Date</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders?.length > 0 ? (
                          orders.map((order, index) => (
                            <tr key={order._id}>
                              <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                              <td>
                                <div className="fw-bold text-dark">{order.customerId?.name || "N/A"}</div>
                                <div className="text-muted small">{order.customerId?.email || ""}</div>
                              </td>
                              <td>{order.products?.length || 0}</td>
                              <td className="fw-bold">₹{(order.grandTotal || 0).toLocaleString("en-IN")}</td>
                              <td>
                                <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <select
                                  className={`form-select form-select-sm border-0 ${getStatusClass(order.orderStatus)}`}
                                  value={order.orderStatus || "pending"}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  style={{ cursor: "pointer", minWidth: "120px", fontWeight: "500" }}
                                >
                                  <option value="pending" className="bg-white text-dark">Pending</option>
                                  <option value="placed" className="bg-white text-dark">Placed</option>
                                  <option value="processing" className="bg-white text-dark">Processing</option>
                                  <option value="shipped" className="bg-white text-dark">Shipped</option>
                                  <option value="delivered" className="bg-white text-dark">Delivered</option>
                                  <option value="cancelled" className="bg-white text-dark">Cancelled</option>
                                </select>
                              </td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary rounded-pill"
                                  onClick={() => viewSingleOrder(order._id)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center py-5 text-muted">
                              No orders found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
