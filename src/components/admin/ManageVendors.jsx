import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { allVendor, approveVendor, rejectVendor, toggleBlockVendor, allotVendorRank, revokeVendorRank } from "../server/Vendor";

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

  const handleAllotRank = (vendor) => {
    const currentRank = vendor.rank || 1;
    Swal.fire({
      title: vendor.rank ? `Update Rank for "${vendor.businessName}"` : `Allot Rank for "${vendor.businessName}"`,
      html: `
        <div className="text-start fs-6 p-2">
          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Numerical Rank:</label>
            <input type="number" id="swal-vendor-rank" class="form-control" min="1" value="${currentRank}" placeholder="Enter rank number (e.g. 1, 2, 3)" />
          </div>
          <div id="swal-vendor-rank1-fields" style="display: ${currentRank === 1 ? 'block' : 'none'};" class="p-3 bg-light rounded-3 border border-success-subtle shadow-xs">
            <h6 className="fw-bold text-success mb-2"><i className="fas fa-gift me-1"></i> Rank 1 Reward Coupon Details</h6>
            <div className="mb-2">
              <label className="form-label small mb-1 fw-semibold">Discount Value:</label>
              <input type="number" id="swal-vendor-discount" class="form-control form-control-sm" value="20" placeholder="e.g. 20" />
            </div>
            <div className="mb-2">
              <label className="form-label small mb-1 fw-semibold">Discount Type:</label>
              <select id="swal-vendor-disctype" class="form-select form-select-sm">
                <option value="Percentage">Percentage (%)</option>
                <option value="Flat">Flat Amount (₹/$)</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label small mb-1 fw-semibold">Min Spend Amount:</label>
              <input type="number" id="swal-vendor-minspend" class="form-control form-control-sm" value="0" placeholder="0" />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: Boolean(vendor.rank),
      denyButtonText: "Revoke Rank",
      denyButtonColor: "#dc3545",
      confirmButtonText: vendor.rank ? "Update Rank" : "Assign Rank",
      confirmButtonColor: "#81c408",
      didOpen: () => {
        const rankInput = document.getElementById("swal-vendor-rank");
        const rank1Fields = document.getElementById("swal-vendor-rank1-fields");
        if (rankInput && rank1Fields) {
          rankInput.addEventListener("input", (e) => {
            const val = parseInt(e.target.value, 10);
            if (val === 1) {
              rank1Fields.style.display = "block";
            } else {
              rank1Fields.style.display = "none";
            }
          });
        }
      },
      preConfirm: () => {
        const rankVal = document.getElementById("swal-vendor-rank")?.value;
        const discountVal = document.getElementById("swal-vendor-discount")?.value;
        const discTypeVal = document.getElementById("swal-vendor-disctype")?.value;
        const minSpendVal = document.getElementById("swal-vendor-minspend")?.value;

        if (!rankVal || parseInt(rankVal, 10) < 1) {
          Swal.showValidationMessage("Please enter a valid positive rank number");
          return false;
        }

        const numericRankVal = parseInt(rankVal, 10);
        const existingVendorWithRank = vendors.find(
          (v) => v.rank === numericRankVal && v._id !== vendor._id
        );
        if (existingVendorWithRank) {
          const vName = existingVendorWithRank.businessName || existingVendorWithRank.ownerName || "another vendor";
          const msg = numericRankVal === 1
            ? `Rank 1 is already allotted to vendor "${vName}". Please revoke Rank 1 from "${vName}" first!`
            : `Rank #${numericRankVal} is already allotted to "${vName}".`;
          Swal.showValidationMessage(msg);
          return false;
        }

        return {
          rank: parseInt(rankVal, 10),
          discount: discountVal || "20",
          discountType: discTypeVal || "Percentage",
          minAmoutSpend: minSpendVal || "0"
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await allotVendorRank({
            vendorId: vendor._id,
            rank: result.value.rank,
            discount: result.value.discount,
            discountType: result.value.discountType,
            minAmoutSpend: result.value.minAmoutSpend
          });
          if (res.data.success) {
            const couponMsg = res.data.rewardCoupon ? `<p className="mt-2 mb-0 small text-success fw-bold"><i className="fas fa-gift me-1"></i> Exclusive Reward Coupon generated: '${res.data.rewardCoupon}'</p>` : '';
            Swal.fire({
              title: "Vendor Rank Allotted! 🎉",
              html: `
                <div className="py-2 text-center">
                  <p className="mb-2 fs-5">Vendor Store <strong>"${vendor.businessName}"</strong> has been allotted <span class="badge bg-success fs-6">Rank #${result.value.rank}</span></p>
                  ${couponMsg}
                  <p className="text-muted small mt-3 mb-0">Popup notification will trigger when the vendor logs in.</p>
                </div>
              `,
              icon: "success",
              timer: 4000,
              timerProgressBar: true,
              showConfirmButton: true,
              confirmButtonText: "OK",
              confirmButtonColor: "#81c408"
            });
            fetchVendors();
          } else {
            toast.error(res.data.message || "Failed to allot rank");
          }
        } catch (err) {
          toast.error("Error allotting rank to vendor");
        }
      } else if (result.isDenied) {
        handleRevokeRank(vendor);
      }
    });
  };

  const handleRevokeRank = (vendor) => {
    Swal.fire({
      title: "Revoke Store Rank?",
      text: `Are you sure you want to revoke rank from store "${vendor.businessName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Revoke Rank!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await revokeVendorRank({ vendorId: vendor._id });
          if (res.data.success) {
            toast.success(res.data.message || "Vendor rank revoked successfully");
            fetchVendors();
          } else {
            toast.error(res.data.message || "Failed to revoke vendor rank");
          }
        } catch (err) {
          toast.error("Error revoking rank from vendor");
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
    <br /><br /><br />
      <div className="container-fluid py-2 py-md-3">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold text-success mb-0">Manage Vendor Partners</h3>
            <p className="text-muted mb-0">Review vendor registration applications, GST/PAN compliance, and manage store access.</p>
          </div>
          <Link to="/admin/managesettlements" className="btn btn-warning fw-bold text-dark px-3 py-2 shadow-sm">
            <i className="fa-solid fa-money-check-dollar me-2"></i> Manage Vendor Settlements
          </Link>
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
                      <th>Rank</th>
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
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              v.rank
                                ? v.rank === 1
                                  ? "btn-warning text-dark border-warning shadow-sm"
                                  : "btn-success text-white shadow-sm"
                                : "btn-outline-secondary"
                            } rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 fw-semibold`}
                            onClick={() => handleAllotRank(v)}
                            title={v.rank ? `Rank #${v.rank} allotted. Click to edit rank.` : "Click to allot rank"}
                          >
                            <i className={`fas fa-award ${v.rank === 1 ? "text-dark" : v.rank ? "text-warning" : "text-muted"}`}></i>
                            <span>{v.rank ? `Rank #${v.rank}` : "Allot Rank"}</span>
                          </button>
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
                          <div className="btn-group align-items-center">
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
                                onClick={() => handleToggleBlock(v._id, v.isBlocked)}
                                className={`btn btn-sm ${v.isBlocked ? "btn-outline-success" : "btn-outline-danger"}`}
                              >
                                {v.isBlocked ? "Unblock Store" : "Block Store"}
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
