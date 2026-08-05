import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getVendorCustomerRanks } from "../server/Customer";

export default function VendorCustomerRanks() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomerRanks = () => {
    setLoading(true);
    getVendorCustomerRanks()
      .then((res) => {
        if (res.data?.success) {
          setCustomers(res.data.data || []);
        } else {
          toast.error(res.data?.message || "Failed to load customer ranks");
        }
      })
      .catch((err) => {
        console.error("Error fetching vendor customer ranks:", err);
        toast.error("Error loading customer ranks");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomerRanks();
  }, []);

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.rank?.toLowerCase().includes(q) ||
      c.activityStatus?.toLowerCase().includes(q)
    );
  });

  const getRankBadgeClass = (rank) => {
    switch (rank) {
      case "VIP Premium": return "bg-dark text-warning border border-warning fw-bold";
      case "Platinum": return "bg-info-subtle text-info border border-info fw-bold";
      case "Gold": return "bg-warning text-dark fw-bold";
      case "Silver": return "bg-secondary text-white fw-bold";
      default: return "bg-light text-dark border fw-semibold";
    }
  };

  const getActivityBadgeClass = (status) => {
    switch (status) {
      case "Highly Active": return "bg-success text-white";
      case "Moderately Active": return "bg-warning text-dark";
      default: return "bg-secondary text-white";
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Customer Ranks & AI Reliability Insights</h3>
          <p className="text-muted mb-0">
            Inspect customer reliability, order completion rate (Accepted vs Cancelled), active status, and review ratings left by customers.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
        <div className="input-group" style={{ maxWidth: "450px" }}>
          <span className="input-group-text bg-white border-0">
            <i className="fas fa-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 py-2 ps-2"
            placeholder="Search customers by name, email, rank tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Ranks Table */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading customer rank insights...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Customer Info</th>
                    <th>AI Customer Rank</th>
                    <th>Active Status</th>
                    <th>Order Reliability (Accepted vs Cancelled)</th>
                    <th>Review History</th>
                    <th className="pe-4">AI Assessment Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cust) => {
                    const vi = cust.vendorInsight || {};

                    return (
                      <tr key={cust._id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{cust.name}</div>
                          <small className="text-muted">{cust.email}</small>
                        </td>

                        <td>
                          <span className={`badge ${getRankBadgeClass(cust.rank)} px-3 py-1.5 rounded-pill`}>
                            <i className="fa-solid fa-trophy me-1"></i> {cust.rank || "Bronze"} ({cust.rankScore || 0} pts)
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${getActivityBadgeClass(cust.activityStatus)} px-2.5 py-1 rounded-pill small`}>
                            <i className="fa-solid fa-bolt me-1"></i> {cust.activityStatus || "Moderately Active"}
                          </span>
                          <div className="small text-muted mt-0.5">
                            {vi.daysSinceLastOrder !== undefined ? `${vi.daysSinceLastOrder}d ago` : ""}
                          </div>
                        </td>

                        <td>
                          <div className="small fw-semibold">
                            <span className="text-success me-2">
                              <i className="fa-solid fa-check me-1"></i>{vi.acceptedOrders || 0} Accepted
                            </span>
                            <span className="text-danger">
                              <i className="fa-solid fa-xmark me-1"></i>{vi.cancelledOrders || 0} Cancelled
                            </span>
                          </div>
                          <div className="progress mt-1" style={{ height: "6px", maxWidth: "150px" }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${vi.acceptanceRate || 100}%` }}
                            ></div>
                          </div>
                        </td>

                        <td>
                          <div className="small fw-bold text-dark">
                            <i className="fa-solid fa-star text-warning me-1"></i>{vi.avgRating || 0}/5.0
                          </div>
                          <small className="text-muted">{vi.reviewCount || 0} review(s) written</small>
                        </td>

                        <td className="pe-4">
                          <small className="text-muted d-block" style={{ maxWidth: "250px", lineHeight: "1.3" }}>
                            {cust.aiSummary || "No detailed AI rationale recorded."}
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-users-slash fa-3x mb-3 text-secondary"></i>
              <p className="mb-0">No customer rank records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
