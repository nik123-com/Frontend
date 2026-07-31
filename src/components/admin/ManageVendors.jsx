import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  baseUrl,
  admin_all_vendors,
  admin_approve_vendor,
  admin_reject_vendor,
  admin_toggle_block_vendor
} from "../endpoints";

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchVendors = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + admin_all_vendors,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setVendors(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load vendors");
      }
    } catch (err) {
      toast.error("Error fetching vendors list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApprove = async (vendorId, businessName) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + admin_approve_vendor,
        { vendorId },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success(`Approved vendor "${businessName}" successfully!`);
        fetchVendors();
      } else {
        toast.error(res.data.message || "Approval failed");
      }
    } catch (err) {
      toast.error("Error approving vendor");
    }
  };

  const handleReject = async (vendorId, businessName) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + admin_reject_vendor,
        { vendorId },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.info(`Rejected vendor "${businessName}"`);
        fetchVendors();
      } else {
        toast.error(res.data.message || "Rejection failed");
      }
    } catch (err) {
      toast.error("Error rejecting vendor");
    }
  };

  const handleToggleBlock = async (vendorId, currentBlocked) => {
    const actionText = currentBlocked ? "Unblock" : "Block";
    Swal.fire({
      title: `${actionText} Vendor?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} this vendor store?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem("token");
        try {
          const res = await axios.post(
            baseUrl + admin_toggle_block_vendor,
            { vendorId },
            { headers: { Authorization: token } }
          );
          if (res.data.success) {
            toast.success(res.data.message || "Vendor status updated");
            fetchVendors();
          } else {
            toast.error(res.data.message || "Operation failed");
          }
        } catch (err) {
          toast.error("Error toggling vendor block status");
        }
      }
    });
  };

  const filtered = vendors.filter((v) => {
    if (filterStatus === "all") return true;
    return v.status === filterStatus;
  });

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Manage Vendor Partners</h3>
          <p className="text-muted mb-0">Review vendor registration applications, GST/PAN compliance, and block/approve stores.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
        <div className="btn-group" role="group">
          {["all", "Pending", "Approved", "Rejected", "Blocked"].map((status) => (
            <button
              key={status}
              type="button"
              className={`btn text-capitalize ${
                filterStatus === status ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status} ({vendors.filter((v) => (status === "all" ? true : v.status === status)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading vendor applications...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Store Name & Owner</th>
                    <th>Contact Info</th>
                    <th>GST & PAN</th>
                    <th>Bank Account</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v._id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{v.businessName}</div>
                        <small className="text-muted">Owner: {v.ownerName}</small>
                      </td>
                      <td>
                        <div className="fs-7">{v.email}</div>
                        <small className="text-muted">{v.phone || "No phone"}</small>
                      </td>
                      <td>
                        <div>GST: <code>{v.gstNumber || "N/A"}</code></div>
                        <small>PAN: <code>{v.panNumber || "N/A"}</code></small>
                      </td>
                      <td className="fs-7">
                        {v.bankDetails?.accountNo ? (
                          <div>
                            <div>Acc: {v.bankDetails.accountNo}</div>
                            <small className="text-muted">IFSC: {v.bankDetails.ifsc}</small>
                          </div>
                        ) : (
                          <span className="text-muted">Not provided</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge text-capitalize px-3 py-2 ${
                            v.status === "Approved"
                              ? "bg-success"
                              : v.status === "Pending"
                              ? "bg-warning text-dark"
                              : v.status === "Blocked"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          {v.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(v._id, v.businessName)}
                                className="btn btn-sm btn-success"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(v._id, v.businessName)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {v.status === "Approved" && (
                            <button
                              onClick={() => handleToggleBlock(v._id, false)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Block Store
                            </button>
                          )}

                          {v.status === "Blocked" && (
                            <button
                              onClick={() => handleToggleBlock(v._id, true)}
                              className="btn btn-sm btn-success"
                            >
                              Unblock Store
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-store fs-1 mb-2 text-secondary"></i>
              <h5>No Vendors Found</h5>
              <p>Vendor applications will appear here for Admin approval.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
