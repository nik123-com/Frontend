import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_add_coupon, vendor_all_coupons, vendor_delete_coupon } from "../endpoints";

export default function VendorCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    discountType: "Percentage",
    minAmoutSpend: 0,
    expiryDate: ""
  });

  const fetchCoupons = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_all_coupons,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setCoupons(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load coupons");
      }
    } catch (err) {
      toast.error("Error loading coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount) {
      toast.error("Code and Discount value are required.");
      return;
    }

    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_add_coupon,
        formData,
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success("Vendor coupon created!");
        setShowModal(false);
        setFormData({ code: "", discount: "", discountType: "Percentage", minAmoutSpend: 0, expiryDate: "" });
        fetchCoupons();
      } else {
        toast.error(res.data.message || "Failed to create coupon");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error creating coupon");
    }
  };

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_delete_coupon,
        { _id: id },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting coupon");
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Vendor Store Coupons</h3>
          <p className="text-muted mb-0">View coupons created by Admin and manage promotional discount coupons for your store.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary fw-bold shadow-sm">
          <i className="fa-solid fa-plus me-2"></i> Create Store Coupon
        </button>
      </div>

      {/* Coupons Grid / Table */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading coupons...</p>
            </div>
          ) : coupons.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Coupon Code</th>
                    <th>Discount</th>
                    <th>Min Spend (₹)</th>
                    <th>Expiry Date</th>
                    <th>Added By</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const isAdmin = !c.vendorId;
                    return (
                      <tr key={c._id}>
                        <td className="ps-4">
                          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 fs-6 fw-bold font-monospace">
                            {c.code}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">
                          {c.discount}{c.discountType === "Percentage" || c.discountType === "2" ? "% OFF" : " ₹ OFF"}
                        </td>
                        <td>₹{c.minAmoutSpend || 0}</td>
                        <td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "No Expiry"}</td>
                        <td>
                          {isAdmin ? (
                            <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1">
                              <i className="fa-solid fa-user-shield me-1"></i> Admin
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                              <i className="fa-solid fa-store me-1"></i> Vendor (You)
                            </span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {!isAdmin ? (
                            <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-outline-danger">
                              <i className="fa-solid fa-trash me-1"></i> Delete
                            </button>
                          ) : (
                            <span className="badge bg-light text-muted border px-2 py-1">
                              <i className="fa-solid fa-lock me-1"></i> Read Only
                            </span>
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
              <i className="fa-solid fa-ticket fs-1 mb-2 text-secondary"></i>
              <h5>No Coupons Active</h5>
              <p>No active coupons found. Create custom discount codes for your customers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Create Vendor Coupon</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Coupon Code *</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. SUMMER10"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Discount Value *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="10"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">Discount Type</label>
                      <select
                        className="form-select"
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      >
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Min Spend Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="500"
                        value={formData.minAmoutSpend}
                        onChange={(e) => setFormData({ ...formData, minAmoutSpend: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold">
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
