import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_dashboard } from "../endpoints";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function VendorDashboard() {
  const { vendor } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_dashboard,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setStats(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load dashboard metrics");
      }
    } catch (err) {
      toast.error("Error fetching dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Calculating Store Analytics...</p>
      </div>
    );
  }

  // Monthly Sales Bar Chart Config
  const barChartData = {
    labels: stats?.monthlySalesChart?.labels || [],
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: stats?.monthlySalesChart?.data || [],
        backgroundColor: "#0d6efd",
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Annual Sales Performance" },
    },
  };

  // Ratings Pie Chart Config
  const ratingData = stats?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const pieChartData = {
    labels: ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"],
    datasets: [
      {
        data: [ratingData[5], ratingData[4], ratingData[3], ratingData[2], ratingData[1]],
        backgroundColor: ["#198754", "#0d6efd", "#ffc107", "#fd7e14", "#dc3545"],
      },
    ],
  };

  return (
    <div className="container-fluid p-0">
      {/* Welcome Banner */}
      <div className="bg-primary text-white p-4 mb-4 rounded-3 shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h3 className="fw-bold mb-1">Welcome back, {vendor?.businessName}! 👋</h3>
          <p className="mb-0 text-white-50">Here is your store summary and operational performance.</p>
        </div>
        <Link to="/vendor/products" className="btn btn-light fw-bold px-4 py-2 shadow-sm">
          <i className="fa-solid fa-plus me-2"></i> Add New Product
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold fs-7">Total Revenue</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
              </div>
              <div className="bg-success-subtle text-success p-3 rounded-circle">
                <i className="fa-solid fa-indian-rupee-sign fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold fs-7">Total Orders</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats?.totalOrders || 0}</h3>
                <small className="text-muted">
                  <span className="text-warning fw-bold">{stats?.pendingOrders || 0} Pending</span> |{" "}
                  <span className="text-success fw-bold">{stats?.completedOrders || 0} Completed</span>
                </small>
              </div>
              <div className="bg-primary-subtle text-primary p-3 rounded-circle">
                <i className="fa-solid fa-bag-shopping fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold fs-7">Active Products</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats?.totalProducts || 0}</h3>
              </div>
              <div className="bg-info-subtle text-info p-3 rounded-circle">
                <i className="fa-solid fa-box-open fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold fs-7">Customer Rating</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">
                  ⭐ {stats?.averageRating || 0} <span className="fs-6 text-muted font-normal">/ 5</span>
                </h3>
                <small className="text-muted">{stats?.totalReviews || 0} reviews received</small>
              </div>
              <div className="bg-warning-subtle text-warning p-3 rounded-circle">
                <i className="fa-solid fa-star fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* Sales Bar Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">Revenue Overview</h5>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Ratings Breakdown Pie Chart */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">Rating Breakdown</h5>
            <div className="d-flex justify-content-center align-items-center style-pie" style={{ maxHeight: "260px" }}>
              <Pie data={pieChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warnings */}
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            <i className="fa-solid fa-triangle-exclamation text-warning me-2"></i> Low Stock Alerts
          </h5>
          <span className="badge bg-warning text-dark px-3 py-2">
            {stats?.lowStockCount || 0} Items low on stock
          </span>
        </div>

        {stats?.lowStockProducts?.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Remaining Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((p) => (
                  <tr key={p._id}>
                    <td className="fw-bold">{p.name}</td>
                    <td><code>{p.sku || "N/A"}</code></td>
                    <td>
                      <span className="badge bg-danger">{p.stock} units left</span>
                    </td>
                    <td>
                      <Link to="/vendor/inventory" className="btn btn-sm btn-outline-primary">
                        Update Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-success p-3 text-center bg-success-subtle rounded-3">
            <i className="fa-solid fa-circle-check me-2 fs-5"></i> All products are well stocked!
          </div>
        )}
      </div>
    </div>
  );
}
