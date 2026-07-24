import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { allProduct } from "../server/Product";
import { allCustomer } from "../server/Customer";
import { adminAllOrders } from "../server/Order";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Admindashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resProducts, resOrders, resCustomers] = await Promise.all([
        allProduct(),
        adminAllOrders({}),
        allCustomer()
      ]);

      if (resProducts.data.success) {
        setProducts(resProducts.data.data || []);
      }
      if (resOrders.data.success) {
        const sortedOrders = [...(resOrders.data.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
      if (resCustomers.data.success) {
        setCustomers(resCustomers.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting for Revenue
  const totalRevenue = orders.reduce((acc, order) => acc + (Number(order.grandTotal) || 0), 0);
  const formatRevenue = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  // 1. Order Status Counts
  const orderStatusCounts = {
    Placed: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  orders.forEach((order) => {
    const status = order.orderStatus;
    if (status && orderStatusCounts[status] !== undefined) {
      orderStatusCounts[status]++;
    } else {
      // fallback for case mismatches or other statuses
      const normalized = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "";
      if (orderStatusCounts[normalized] !== undefined) {
        orderStatusCounts[normalized]++;
      }
    }
  });

  const orderData = {
    labels: Object.keys(orderStatusCounts),
    datasets: [
      {
        label: "Orders Count",
        data: Object.values(orderStatusCounts),
        backgroundColor: [
          "#ffc107", // Placed
          "#0dcaf0", // Processing
          "#0d6efd", // Shipped
          "#198754", // Delivered
          "#dc3545", // Cancelled
        ],
      },
    ],
  };

  // 2. Revenue Analytics by Month (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    revenueByMonth.push({
      label: monthNames[d.getMonth()],
      month: d.getMonth(),
      year: d.getFullYear(),
      total: 0,
    });
  }

  orders.forEach((order) => {
    if (order.orderStatus?.toLowerCase() !== "cancelled") {
      const orderDate = new Date(order.createdAt);
      const oMonth = orderDate.getMonth();
      const oYear = orderDate.getFullYear();
      
      const match = revenueByMonth.find((m) => m.month === oMonth && m.year === oYear);
      if (match) {
        match.total += Number(order.grandTotal) || 0;
      }
    }
  });

  const salesData = {
    labels: revenueByMonth.map((m) => m.label),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueByMonth.map((m) => m.total),
        borderColor: "#81C408",
        backgroundColor: "rgba(129,196,8,0.2)",
        tension: 0.4,
      },
    ],
  };

  // 3. Recent Orders
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "placed": return "bg-warning text-dark";
      case "processing": return "bg-info text-dark";
      case "shipped": return "bg-primary text-white";
      case "delivered": return "bg-success text-white";
      case "cancelled": return "bg-danger text-white";
      default: return "bg-secondary text-white";
    }
  };

  // 4. Calculate Top Selling Products
  const productSales = {};
  orders.forEach((order) => {
    if (order.orderStatus?.toLowerCase() !== "cancelled") {
      order.products?.forEach((item) => {
        const prodId = item.productId?._id || item.productId;
        if (prodId) {
          productSales[prodId] = (productSales[prodId] || 0) + (item.quantity || 0);
        }
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([id, salesCount]) => {
      const matchedProd = products.find((p) => p._id === id);
      return {
        name: matchedProd?.name || "Unknown Product",
        sales: salesCount,
      };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return (
    <>

      <div className="container-fluid py-4">
        <br />
        <br />
        <br />
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-success">Admin Dashboard</h2>
          <button
            className="btn btn-success text-white"
            onClick={() => navigate("/admin/addproduct")}
          >
            + Add Product
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="row g-4 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6>Total Products</h6>
                <h2 className="fw-bold text-success">{products.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6>Total Orders</h6>
                <h2 className="fw-bold text-primary">{orders.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6>Customers</h6>
                <h2 className="fw-bold text-warning">{customers.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6>Total Revenue</h6>
                <h2 className="fw-bold text-danger">{formatRevenue(totalRevenue)}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0">Revenue Analytics</h5>
              </div>
              <div className="card-body">
                <Line data={salesData} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0">Order Status</h5>
              </div>
              <div className="card-body">
                <Bar data={orderData} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders + Products */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0">Recent Orders</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.slice(0, 5).map((order) => (
                          <tr key={order._id}>
                            <td>#{order._id.slice(-6).toUpperCase()}</td>
                            <td>{order.customerId?.name || "N/A"}</td>
                            <td>₹{(order.grandTotal || 0).toLocaleString("en-IN")}</td>
                            <td>
                              <span className={`badge ${getStatusClass(order.orderStatus)}`}>
                                {order.orderStatus || "Placed"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-3 text-muted">
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

          {/* Right Side Panel */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Top Products</h5>
              </div>
              <div className="card-body">
                {topProducts.length > 0 ? (
                  topProducts.map((p, idx) => (
                    <div className="d-flex justify-content-between mb-3" key={idx}>
                      <span className="text-truncate" style={{ maxWidth: "200px" }}>{p.name}</span>
                      <span className="fw-semibold text-success">{p.sales} Sales</span>
                    </div>
                  ))
                ) : (
                  <span className="text-muted small">No product sales recorded</span>
                )}
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body d-grid gap-2">
                <button
                  className="btn btn-success text-white"
                  onClick={() => navigate("/admin/addproduct")}
                >
                  Add Product
                </button>
                <button
                  className="btn btn-primary text-white"
                  onClick={() => navigate("/admin/manageorder")}
                >
                  Manage Orders
                </button>
                <button
                  className="btn btn-warning text-white"
                  onClick={() => navigate("/admin/customermanage")}
                >
                  Manage Customers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}