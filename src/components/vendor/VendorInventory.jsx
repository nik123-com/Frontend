import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_all_products, vendor_update_stock } from "../endpoints";
import StockIntelligenceSection from "./StockIntelligenceSection";
import VendorBargainingSection from "./VendorBargainingSection";

export default function VendorInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("intelligence"); // 'intelligence' | 'catalog' | 'bargaining'

  const [editForm, setEditForm] = useState({
    stock: 0,
    sku: "",
    warehouse: ""
  });

  const fetchInventory = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_all_products,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setProducts(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load inventory");
      }
    } catch (err) {
      toast.error("Error loading inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStartEdit = (p) => {
    setEditingId(p._id);
    setEditForm({
      stock: p.stock || 0,
      sku: p.sku || "",
      warehouse: p.warehouse || "Main Warehouse"
    });
  };

  const handleSaveEdit = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_update_stock,
        { _id: id, ...editForm },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success("Inventory updated!");
        setEditingId(null);
        fetchInventory();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error updating inventory");
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Inventory & Stock Control</h3>
          <p className="text-muted mb-0">Predictive demand intelligence, automated reorder thresholds, and warehouse stock control.</p>
        </div>

        {/* Tab Pills */}
        <div className="btn-group p-1 bg-light rounded-pill border">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-bold ${activeTab === "intelligence" ? "btn-primary shadow-sm" : "btn-light text-muted"}`}
            onClick={() => setActiveTab("intelligence")}
          >
            <i className="fa-solid fa-brain me-1"></i> Stock Intelligence
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-bold ${activeTab === "bargaining" ? "btn-primary shadow-sm" : "btn-light text-muted"}`}
            onClick={() => setActiveTab("bargaining")}
          >
            <i className="fa-solid fa-handshake-simple me-1"></i> AI Bargaining Deals
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-bold ${activeTab === "catalog" ? "btn-primary shadow-sm" : "btn-light text-muted"}`}
            onClick={() => setActiveTab("catalog")}
          >
            <i className="fa-solid fa-boxes-stacked me-1"></i> Stock Adjustment Table
          </button>
        </div>
      </div>

      {/* Predictive Stock Intelligence Tab */}
      {activeTab === "intelligence" && (
        <StockIntelligenceSection
          onAdjustStock={(f) => {
            setActiveTab("catalog");
            const prod = products.find((p) => p._id.toString() === f.productId.toString());
            if (prod) handleStartEdit(prod);
          }}
        />
      )}

      {/* AI Price-Supply Bargaining Tab */}
      {activeTab === "bargaining" && <VendorBargainingSection />}

      {/* Catalog & Manual Stock Adjustment Table */}
      {(activeTab === "catalog" || activeTab === "intelligence") && (
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading stock levels...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Product Name</th>
                    <th className="text-nowrap" style={{ whiteSpace: "nowrap" }}>SKU Code</th>
                    <th className="text-nowrap" style={{ whiteSpace: "nowrap" }}>Warehouse Location</th>
                    <th className="text-nowrap" style={{ whiteSpace: "nowrap" }}>Stock Units</th>
                    <th className="text-nowrap" style={{ whiteSpace: "nowrap" }}>Stock Alert</th>
                    <th className="text-end pe-4 text-nowrap" style={{ whiteSpace: "nowrap", minWidth: "150px" }}>Stock Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isEditing = editingId === p._id;
                    const isLow = (p.stock || 0) <= 5;

                    return (
                      <tr key={p._id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{p.name}</div>
                          <small className="text-muted">{p.category_id?.name || "General"}</small>
                        </td>

                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editForm.sku}
                              onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                            />
                          ) : (
                            <code>{p.sku || "N/A"}</code>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editForm.warehouse}
                              onChange={(e) => setEditForm({ ...editForm, warehouse: e.target.value })}
                            />
                          ) : (
                            <span className="text-muted">{p.warehouse || "Main Warehouse"}</span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: "100px" }}
                              value={editForm.stock}
                              onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                            />
                          ) : (
                            <span className="fw-bold fs-6">{p.stock} units</span>
                          )}
                        </td>

                        <td>
                          {p.stock <= 0 ? (
                            <span className="badge bg-danger px-3 py-2">Out of Stock</span>
                          ) : isLow ? (
                            <span className="badge bg-warning text-dark px-3 py-2">
                              <i className="fa-solid fa-triangle-exclamation me-1"></i> Low Stock Alert
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                              Sufficient
                            </span>
                          )}
                        </td>

                        <td className="text-end pe-4 text-nowrap" style={{ whiteSpace: "nowrap", minWidth: "150px" }}>
                          {isEditing ? (
                            <div className="btn-group flex-nowrap">
                              <button
                                onClick={() => handleSaveEdit(p._id)}
                                className="btn btn-sm btn-success"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="btn btn-sm btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="btn btn-sm btn-outline-primary text-nowrap"
                            >
                              <i className="fa-solid fa-pen me-1"></i> Adjust Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <h5>No Inventory Found</h5>
              <p>Add products to configure stock parameters.</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
