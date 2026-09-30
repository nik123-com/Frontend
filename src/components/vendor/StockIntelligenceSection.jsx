import React, { useState, useEffect } from "react";
import { getVendorStockIntelligence } from "../server/Recommendation";

export default function StockIntelligenceSection({ onAdjustStock }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const res = await getVendorStockIntelligence();
      if (res.data && res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error loading stock intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
        <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
        <h6 className="fw-bold text-dark">Calculating Predictive Stock Forecasts...</h6>
        <small className="text-muted">Analyzing 90-day order velocity, demand run-rates, and depletion trends.</small>
      </div>
    );
  }

  if (!data || !data.forecasts || data.forecasts.length === 0) {
    return null;
  }

  const { summary = {}, forecasts = [] } = data;

  const filteredForecasts = forecasts.filter((f) => {
    if (filter === "critical") return f.stockStatus === "critical" || f.stockStatus === "out_of_stock";
    if (filter === "warning") return f.stockStatus === "warning";
    if (filter === "adequate") return f.stockStatus === "adequate" || f.stockStatus === "low_velocity";
    return true;
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
      {/* Header */}
      <div
        className="p-4 text-white d-flex align-items-center justify-content-between flex-wrap gap-3"
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e293b)"
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 p-3 text-white d-flex align-items-center justify-content-center"
            style={{ background: "rgba(255, 255, 255, 0.12)" }}
          >
            <i className="fa-solid fa-chart-line fs-3 text-warning"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-1 text-white d-flex align-items-center gap-2">
              Predictive Stock-Out Intelligence
              <span className="badge bg-warning text-dark fs-7 px-2 py-1 rounded-pill">AI Forecast</span>
            </h4>
            <p className="mb-0 text-white-50 small">
              Statistical demand forecasting based on actual historical sales velocity and stock depletion rates.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-light rounded-pill px-3"
          onClick={fetchIntelligence}
        >
          <i className="fa-solid fa-rotate me-1"></i> Refresh Forecasts
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="p-4 bg-light border-bottom">
        <div className="row g-3">
          {/* Critical Risk */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className={`p-3 rounded-3 bg-white border h-100 cursor-pointer ${filter === "critical" ? "border-danger border-2 shadow-sm" : ""}`}
              onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted fw-semibold">Critical Stock-Out (≤5 Days)</span>
                <span className="badge bg-danger-subtle text-danger p-2 rounded-circle">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </span>
              </div>
              <h3 className="fw-bold text-danger mb-0 mt-2">{summary.criticalStockCount || 0}</h3>
              <small className="text-muted">Urgent replenishment recommended</small>
            </div>
          </div>

          {/* Warning Risk */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className={`p-3 rounded-3 bg-white border h-100 cursor-pointer ${filter === "warning" ? "border-warning border-2 shadow-sm" : ""}`}
              onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted fw-semibold">Depleting Steadily (6-14 Days)</span>
                <span className="badge bg-warning-subtle text-warning p-2 rounded-circle">
                  <i className="fa-solid fa-clock"></i>
                </span>
              </div>
              <h3 className="fw-bold text-warning mb-0 mt-2">{summary.warningStockCount || 0}</h3>
              <small className="text-muted">Reorder within lead time</small>
            </div>
          </div>

          {/* Adequate Stock */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className={`p-3 rounded-3 bg-white border h-100 cursor-pointer ${filter === "adequate" ? "border-success border-2 shadow-sm" : ""}`}
              onClick={() => setFilter(filter === "adequate" ? "all" : "adequate")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted fw-semibold">Adequate Stock</span>
                <span className="badge bg-success-subtle text-success p-2 rounded-circle">
                  <i className="fa-solid fa-circle-check"></i>
                </span>
              </div>
              <h3 className="fw-bold text-success mb-0 mt-2">{summary.adequateStockCount || 0}</h3>
              <small className="text-muted">Inventory covers regular demand</small>
            </div>
          </div>

          {/* Catalog Monitored */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className={`p-3 rounded-3 bg-white border h-100 cursor-pointer ${filter === "all" ? "border-primary border-2 shadow-sm" : ""}`}
              onClick={() => setFilter("all")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted fw-semibold">Total Monitored Items</span>
                <span className="badge bg-primary-subtle text-primary p-2 rounded-circle">
                  <i className="fa-solid fa-boxes-stacked"></i>
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-0 mt-2">{summary.totalProducts || 0}</h3>
              <small className="text-muted">Filtered: {filter === "all" ? "All" : filter}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Data Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Product & Category</th>
              <th>Current Stock</th>
              <th>Daily Sales Velocity</th>
              <th>Est. Stock-Out</th>
              <th>Demand Trend</th>
              <th>Confidence</th>
              <th>Suggested Reorder</th>
              <th>AI Action Recommendation</th>
              <th className="text-end pe-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredForecasts.map((f) => {
              const isOutOfStock = f.stockStatus === "out_of_stock";
              const isCritical = f.stockStatus === "critical";
              const isWarning = f.stockStatus === "warning";

              return (
                <tr key={f.productId} className={isCritical ? "table-danger bg-opacity-25" : ""}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{f.name}</div>
                    <small className="text-muted">
                      SKU: <code>{f.sku}</code> | {f.categoryName}
                    </small>
                  </td>

                  <td>
                    <span
                      className={`badge px-3 py-2 ${
                        isOutOfStock
                          ? "bg-danger"
                          : isCritical
                          ? "bg-danger"
                          : isWarning
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`}
                    >
                      {f.currentStock} units
                    </span>
                  </td>

                  <td>
                    <div className="fw-semibold text-dark">
                      {f.averageDailySales > 0 ? `${f.averageDailySales} / day` : "0.0 / day"}
                    </div>
                    <small className="text-muted">
                      {f.unitsSold30d} sold (30d)
                    </small>
                  </td>

                  <td>
                    {isOutOfStock ? (
                      <span className="text-danger fw-bold">Depleted</span>
                    ) : f.estimatedStockOutDays !== null ? (
                      <span
                        className={`fw-bold ${
                          f.estimatedStockOutDays <= 5
                            ? "text-danger"
                            : f.estimatedStockOutDays <= 14
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        ~{f.estimatedStockOutDays} days
                      </span>
                    ) : (
                      <span className="text-muted">Sufficient</span>
                    )}
                  </td>

                  <td>
                    {f.demandTrend === "increasing" ? (
                      <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                        <i className="fa-solid fa-arrow-trend-up me-1"></i> Increasing
                      </span>
                    ) : f.demandTrend === "decreasing" ? (
                      <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                        <i className="fa-solid fa-arrow-trend-down me-1"></i> Decreasing
                      </span>
                    ) : (
                      <span className="badge bg-light text-dark border px-2 py-1">
                        <i className="fa-solid fa-minus me-1"></i> Stable
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: "6px", width: "50px" }}>
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{ width: `${Math.round(f.confidence * 100)}%` }}
                        ></div>
                      </div>
                      <small className="text-muted fw-bold">{Math.round(f.confidence * 100)}%</small>
                    </div>
                  </td>

                  <td>
                    {f.suggestedReorderQuantity > 0 ? (
                      <span className="fw-bold text-primary">
                        +{f.suggestedReorderQuantity} units
                      </span>
                    ) : (
                      <span className="text-muted">0 units</span>
                    )}
                  </td>

                  <td style={{ maxWidth: "240px" }}>
                    <small className="text-dark d-block">
                      {f.suggestedAction}
                    </small>
                  </td>

                  <td className="text-end pe-4">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      onClick={() => onAdjustStock && onAdjustStock(f)}
                    >
                      <i className="fa-solid fa-pen-to-square me-1"></i> Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
