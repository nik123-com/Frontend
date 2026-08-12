import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { allSettlements, updateSettlementStatus } from "../server/Vendor";

export default function ManageSettlements() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await allSettlements();
      if (res.data.success) {
        setSettlements(res.data.data || []);
      } else {
        toast.error(res.data.message || "Failed to load settlement requests");
      }
    } catch (err) {
      toast.error("Error fetching settlements list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleApprove = async (item) => {
    Swal.fire({
      title: "Approve Payout Settlement?",
      html: `
        <div class="text-start fs-6 p-2">
          <p class="mb-2">Vendor: <strong>${item.businessName}</strong></p>
          <p class="mb-2 text-warning fw-bold fs-5">Amount: ₹${Number(item.amount).toLocaleString()}</p>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Admin Reference / Remarks (Optional):</label>
            <input type="text" id="swal-settlement-remarks" class="form-control" placeholder="e.g. Bank Ref UTR #12345678" />
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Approve & Disburse"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const remarks = document.getElementById("swal-settlement-remarks")?.value || "";
        try {
          const res = await updateSettlementStatus({
            vendorId: item.vendorId,
            txIndex: item.txIndex,
            txId: item._id,
            status: "completed",
            remarks: remarks || "Approved and disbursed by Admin"
          });
          if (res.data.success) {
            toast.success(`Settlement of ₹${item.amount} approved for "${item.businessName}"`);
            fetchSettlements();
          } else {
            toast.error(res.data.message || "Failed to update settlement status");
          }
        } catch (err) {
          toast.error("Error approving settlement payout");
        }
      }
    });
  };

  const handleReject = async (item) => {
    Swal.fire({
      title: "Reject Payout Request?",
      html: `
        <div class="text-start fs-6 p-2">
          <p class="mb-2">Vendor: <strong>${item.businessName}</strong></p>
          <p class="mb-2 text-danger fw-bold fs-5">Amount to Refund: ₹${Number(item.amount).toLocaleString()}</p>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Reason for Rejection (Required):</label>
            <input type="text" id="swal-reject-remarks" class="form-control" placeholder="e.g. Incorrect bank account details" />
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Reject & Refund Vendor"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const remarks = document.getElementById("swal-reject-remarks")?.value || "";
        if (!remarks.trim()) {
          toast.error("Rejection reason is required");
          return;
        }
        try {
          const res = await updateSettlementStatus({
            vendorId: item.vendorId,
            txIndex: item.txIndex,
            txId: item._id,
            status: "rejected",
            remarks: remarks
          });
          if (res.data.success) {
            toast.info(`Settlement request rejected. ₹${item.amount} released back to vendor available earnings.`);
            fetchSettlements();
          } else {
            toast.error(res.data.message || "Failed to reject settlement request");
          }
        } catch (err) {
          toast.error("Error rejecting settlement payout");
        }
      }
    });
  };

  // Metrics
  const pendingItems = settlements.filter((s) => s.status === "pending");
  const completedItems = settlements.filter((s) => s.status === "completed");
  const rejectedItems = settlements.filter((s) => s.status === "rejected" || s.status === "cancelled");

  const totalPendingAmount = pendingItems.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
  const totalCompletedAmount = completedItems.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  // Filtering
  const filteredSettlements = settlements.filter((item) => {
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "rejected"
          ? item.status === "rejected" || item.status === "cancelled"
          : item.status === filterStatus;

    const matchesSearch =
      (item.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ownerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <br /><br /><br />
      <div className="container-fluid py-4 px-4">
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              <i className="fa-solid fa-money-check-dollar text-primary me-2"></i>
              Vendor Settlement & Payout Authority
            </h3>
            <p className="text-muted mb-0">Review, approve, and process vendor payout requests and track disbursement history.</p>
          </div>
          <button className="btn btn-outline-primary fw-bold" onClick={fetchSettlements}>
            <i className="fa-solid fa-rotate me-2"></i> Refresh Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-warning text-white rounded-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-white text-opacity-90 fw-bold small text-uppercase" style={{ letterSpacing: "0.5px" }}>Pending Approvals</span>
                  <h2 className="fw-bold text-white mb-0 mt-1">₹{totalPendingAmount.toLocaleString()}</h2>
                  <small className="text-white text-opacity-90 fw-medium">{pendingItems.length} payout request(s) queued</small>
                </div>
                <div className="bg-white text-warning p-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "54px", height: "54px" }}>
                  <i className="fa-solid fa-clock fa-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-success text-white rounded-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-white text-opacity-90 fw-bold small text-uppercase" style={{ letterSpacing: "0.5px" }}>Total Disbursed</span>
                  <h2 className="fw-bold text-white mb-0 mt-1">₹{totalCompletedAmount.toLocaleString()}</h2>
                  <small className="text-white text-opacity-90 fw-medium">{completedItems.length} completed payout(s)</small>
                </div>
                <div className="bg-white text-success p-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "54px", height: "54px" }}>
                  <i className="fa-solid fa-circle-check fa-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-danger text-white rounded-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-white text-opacity-90 fw-bold small text-uppercase" style={{ letterSpacing: "0.5px" }}>Rejected Requests</span>
                  <h2 className="fw-bold text-white mb-0 mt-1">{rejectedItems.length}</h2>
                  <small className="text-white text-opacity-90 fw-medium">Requests returned to vendor wallet</small>
                </div>
                <div className="bg-white text-danger p-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "54px", height: "54px" }}>
                  <i className="fa-solid fa-circle-xmark fa-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="card border-0 shadow-sm bg-white rounded-3">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            {/* Status Tabs */}
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === "pending" ? "btn-warning text-dark fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending ({pendingItems.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === "completed" ? "btn-success fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("completed")}
              >
                Completed ({completedItems.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === "rejected" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("rejected")}
              >
                Rejected ({rejectedItems.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === "all" ? "btn-primary fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("all")}
              >
                All Requests ({settlements.length})
              </button>
            </div>

            {/* Search Box */}
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="fa-solid fa-magnifying-glass text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search vendor or remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading settlement requests...</p>
              </div>
            ) : filteredSettlements.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-receipt fa-3x text-muted mb-3 opacity-50"></i>
                <h5 className="text-secondary fw-semibold">No Settlement Requests Found</h5>
                <p className="text-muted small">There are no records matching your current filter criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Request Date</th>
                      <th>Vendor Store</th>
                      <th>Bank Details</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions / Authority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettlements.map((item, idx) => {
                      const isPending = item.status === "pending";
                      const isCompleted = item.status === "completed";
                      const isRejected = item.status === "rejected" || item.status === "cancelled";

                      return (
                        <tr key={idx}>
                          <td className="ps-4 text-muted small">
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{item.businessName}</div>
                            <small className="text-muted d-block">{item.ownerName} ({item.phone || item.email})</small>
                          </td>
                          <td>
                            {item.bankAccountNo !== "N/A" ? (
                              <small className="d-block text-dark">
                                <i className="fa-solid fa-building-columns text-secondary me-1"></i>
                                {item.bankName} - A/C: <strong>{item.bankAccountNo}</strong> <br />
                                IFSC: <code>{item.bankIfsc}</code>
                              </small>
                            ) : (
                              <span className="badge bg-light text-muted">Bank Details Pending</span>
                            )}
                          </td>
                          <td>
                            <span className="text-dark small fw-medium">{item.description}</span>
                            {item.remarks && (
                              <small className="d-block text-info mt-1">
                                <i className="fa-solid fa-circle-info me-1"></i>Remarks: {item.remarks}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className="fw-bold text-dark fs-6">₹{Number(item.amount).toLocaleString()}</span>
                          </td>
                          <td>
                            {isPending && <span className="badge bg-warning text-dark"><i className="fa-solid fa-clock me-1"></i>Pending Admin</span>}
                            {isCompleted && <span className="badge bg-success"><i className="fa-solid fa-circle-check me-1"></i>Disbursed</span>}
                            {isRejected && <span className="badge bg-danger"><i className="fa-solid fa-circle-xmark me-1"></i>Rejected</span>}
                          </td>
                          <td className="text-end pe-4">
                            {isPending ? (
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-success fw-semibold me-1 rounded"
                                  title="Approve & Disburse Funds"
                                  onClick={() => handleApprove(item)}
                                >
                                  <i className="fa-solid fa-check me-1"></i> Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger fw-semibold rounded"
                                  title="Reject Payout Request"
                                  onClick={() => handleReject(item)}
                                >
                                  <i className="fa-solid fa-xmark me-1"></i> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted small">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
