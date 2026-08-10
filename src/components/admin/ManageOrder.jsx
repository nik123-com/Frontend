import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminAllOrders, adminSingleOrder } from "../server/Order";

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDetail, setViewDetail] = useState(false);

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    adminAllOrders({})
      .then((res) => {
        if (res.data.success) {
          const sorted = [...(res.data.data || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sorted);
        } else if (!isSilent) {
          toast.error(res.data.message);
        }
        if (!isSilent) setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        if (!isSilent) {
          toast.error("Error fetching orders");
          setLoading(false);
        }
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
      case "accepted": return "bg-success text-white";
      case "packed": return "bg-info text-dark";
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
        <div className="container-fluid py-3 py-md-4">
          <div className="container px-0 px-sm-3">
            <div className="p-3 p-sm-4 p-md-5 rounded-4 bg-light shadow-sm">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h2 className="fw-bold mb-0" style={{ color: "#81c408" }}>
                  Order #{selectedOrder._id.slice(-8)}
                </h2>
                <button className="btn btn-outline-secondary rounded-pill px-4 align-self-start align-self-sm-auto" onClick={() => { setViewDetail(false); setSelectedOrder(null); }}>
                  Back to List
                </button>
              </div>

              <div className="row g-4">
                <div className="col-12 col-lg-8">
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
                              <th>Vendor</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th className="text-end pe-4">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.products?.map((item, index) => {
                              const vendorInfo = item.productId?.vendorId;
                              const vendorName = vendorInfo?.businessName || vendorInfo?.ownerName || "In-House / Direct";
                              return (
                                <tr key={index}>
                                  <td className="ps-4">
                                    <div className="d-flex align-items-center gap-3">
                                      <img
                                        src={item.productId?.image?.[0] || item.productId?.image || item.image}
                                        alt=""
                                        style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }}
                                      />
                                      <div>
                                        <span className="fw-medium d-block">{item.productId?.name || item.name}</span>
                                        {item.itemStatus && (
                                          <span className="badge bg-secondary text-capitalize mt-1" style={{ fontSize: "0.7rem" }}>
                                            {item.itemStatus}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-light text-dark border px-2 py-1">
                                      <i className="fa-solid fa-store me-1 text-primary"></i>
                                      {vendorName}
                                    </span>
                                    {vendorInfo?.email && (
                                      <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                        {vendorInfo.email}
                                      </small>
                                    )}
                                  </td>
                                  <td>₹{Number(item.productId?.price) || 0}</td>
                                  <td>{item.quantity}</td>
                                  <td className="text-end fw-bold pe-4">₹{(Number(item.productId?.price) || 0) * item.quantity}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan="4" className="text-end fw-bold">Grand Total:</td>
                              <td className="text-end fw-bold text-primary pe-4">₹{selectedOrder.grandTotal}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-white py-3">
                      <h5 className="m-0 fw-bold">Manage Order</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-4">
                        <label className="form-label small text-uppercase text-muted fw-bold d-block">Order Status</label>
                        <span className={`badge text-capitalize px-3 py-2 fs-6 ${getStatusClass(selectedOrder.orderStatus)}`}>
                          {selectedOrder.orderStatus || "Pending"}
                        </span>
                        <small className="text-muted d-block mt-1">Managed by Vendor</small>
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
                            {selectedOrder.paymentStatus === "Paid" ? "Paid" : "COD"}
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
      <div className="container-fluid py-3 py-md-4">
        <div className="container px-0 px-sm-3">
          <div className="p-3 p-sm-4 p-md-5 rounded-4 bg-light shadow-sm">
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
                          <th scope="col">Vendor(s)</th>
                          <th scope="col">Total</th>
                          <th scope="col">Payment</th>
                          <th scope="col">Status</th>
                          <th scope="col">Date</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="9" className="text-center py-5">
                              <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2 text-muted fw-semibold mb-0">Loading orders...</p>
                            </td>
                          </tr>
                        ) : orders?.length > 0 ? (
                          orders.map((order, index) => (
                            <tr key={order._id}>
                              <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                              <td>
                                <div className="fw-bold text-dark">{order.customerId?.name || "N/A"}</div>
                                <div className="text-muted small">{order.customerId?.email || ""}</div>
                              </td>
                              <td>{order.products?.length || 0}</td>
                              <td>
                                {Array.from(
                                  new Set(
                                    (order.products || []).map(
                                      (p) => p.productId?.vendorId?.businessName || p.productId?.vendorId?.ownerName || "In-House"
                                    )
                                  )
                                ).map((vName, idx) => (
                                  <span key={idx} className="badge bg-light text-dark border me-1 mb-1" style={{ fontSize: "0.75rem" }}>
                                    <i className="fa-solid fa-store me-1 text-primary"></i>
                                    {vName}
                                  </span>
                                ))}
                              </td>
                              <td className="fw-bold">₹{(order.grandTotal || 0).toLocaleString("en-IN")}</td>
                              <td>
                                <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                                  {order.paymentStatus === "Paid" ? "Paid" : "COD"}
                                </span>
                              </td>
                              <td>
                                <span className={`badge text-capitalize px-3 py-2 ${getStatusClass(order.orderStatus)}`}>
                                  {order.orderStatus || "pending"}
                                </span>
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
                            <td colSpan="9" className="text-center py-5 text-muted">
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
