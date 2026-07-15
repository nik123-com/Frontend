import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { allOrder } from "../server/Order";
import { numberToWords } from "../../utils/numberToWords";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      toast.error("Please login to view orders");
      return;
    }

    setLoading(true);
    allOrder({ userId })
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
        toast.error("Failed to load orders");
        setLoading(false);
      });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "placed": return "bg-success";
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
        <div className="container py-5">
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
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
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
                          <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#orderDetail${index}`}
                          >
                            View Items
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="collapse" id={`orderDetail${index}`}>
                            <div className="p-3 bg-light rounded">
                              <div className="row g-3">
                                {order.products?.map((item, i) => (
                                  <div key={i} className="col-md-4">
                                    <div className="d-flex align-items-center gap-3 p-2 bg-white rounded-3">
                                      <img
                                        src={item.productId?.image?.[0] || item.productId?.image || item.image}
                                        alt=""
                                        style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }}
                                      />
                                      <div>
                                        <h6 className="mb-1">{item.productId?.name || item.name}</h6>
                                        <small className="text-muted d-block">Qty: {item.quantity}</small>
                                        <small className="text-muted">₹{Number(item.productId?.price) || 0} each</small>
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
                  ))}
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
    </>
  );
}
