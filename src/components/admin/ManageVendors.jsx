import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { allVendor, approveVendor, rejectVendor, toggleBlockVendor } from "../server/Vendor";

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVendors = async () => {
    try {
      const res = await allVendor();
      if (res.data.success) {
        setVendors(res.data.data || []);
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
    Swal.fire({
      title: "Approve Vendor?",
      text: `Are you sure you want to approve vendor "${businessName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#81c408",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, approve!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await approveVendor({ vendorId });
          if (res.data.success) {
            toast.success(`Approved vendor "${businessName}" successfully!`);
            fetchVendors();
          } else {
            toast.error(res.data.message || "Approval failed");
          }
        } catch (err) {
          toast.error("Error approving vendor");
        }
      }
    });
  };

  const handleReject = async (vendorId, businessName) => {
    Swal.fire({
      title: "Reject Vendor?",
      text: `Are you sure you want to reject vendor "${businessName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, reject!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await rejectVendor({ vendorId });
          if (res.data.success) {
            toast.info(`Rejected vendor "${businessName}"`);
            fetchVendors();
          } else {
            toast.error(res.data.message || "Rejection failed");
          }
        } catch (err) {
          toast.error("Error rejecting vendor");
        }
      }
    });
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
        try {
          const res = await toggleBlockVendor({ vendorId });
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
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (v.businessName && v.businessName.toLowerCase().includes(query)) ||
      (v.ownerName && v.ownerName.toLowerCase().includes(query)) ||
      (v.email && v.email.toLowerCase().includes(query)) ||
      (v.phone && v.phone.includes(query)) ||
      (v.gstNumber && v.gstNumber.toLowerCase().includes(query)) ||
      (v.panNumber && v.panNumber.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="container-fluid py-2 py-md-3">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold text-success mb-0">Manage Vendor Partners</h3>
            <p className="text-muted mb-0">Review vendor registration applications, GST/PAN compliance, and manage store access.</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search by store, owner, email, GST..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-8">
              <div className="btn-group flex-wrap w-100" role="group">
                {["all", "Pending", "Approved", "Rejected", "Blocked"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn text-capitalize ${
                      filterStatus === status ? "btn-success text-white" : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status} ({vendors.filter((v) => (status === "all" ? true : v.status === status)).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="card border-0 shadow-sm bg-white rounded-3">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
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
                                  className="btn btn-sm btn-success text-white"
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
                                className="btn btn-sm btn-success text-white"
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
    </>
  );
}
