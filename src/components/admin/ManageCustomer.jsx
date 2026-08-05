import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import {
  allCustomer, toggleBlockCustomer, aiRankCustomer, aiRankAllCustomers,
  approveAiEvaluation, updateCustomerRank
} from "../server/Customer";
import { addCoupon } from "../server/Coupon";
import ResponsivePagination from "react-responsive-pagination";

export default function ManageCustomer() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [autoRankingAll, setAutoRankingAll] = useState(false);
  const [currentpage, setcurrentpage] = useState(1);
  const limit = 10;

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editRank, setEditRank] = useState("Gold");
  const [editActivityStatus, setEditActivityStatus] = useState("Highly Active");
  const [editAiSummary, setEditAiSummary] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("20%");
  const [couponMinSpend, setCouponMinSpend] = useState(200);

  useEffect(() => {
    setcurrentpage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    allCustomer()
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data || []);
        } else {
          toast.error(res.data.message || "Failed to load customers");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching customers");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Run AI Evaluation for single customer
  const handleAiEvaluate = (customer) => {
    setEvaluatingId(customer._id);
    aiRankCustomer({ customerId: customer._id })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "AI evaluation generated!");
          fetchCustomers();
          // Open approval modal directly for this customer
          openApprovalModal(res.data.data || customer);
        } else {
          toast.error(res.data.message || "AI evaluation failed");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error running AI customer evaluation");
      })
      .finally(() => {
        setEvaluatingId(null);
      });
  };

  // Run AI Auto-Rank for ALL customers
  const handleAiAutoRankAll = () => {
    Swal.fire({
      title: "AI Auto-Rank All Customers?",
      text: "This will run Gemini AI evaluation on all customers and prepare rank & coupon proposals for Admin approval.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#81c408",
      confirmButtonText: "Yes, Run AI Evaluation!"
    }).then((result) => {
      if (result.isConfirmed) {
        setAutoRankingAll(true);
        aiRankAllCustomers()
          .then((res) => {
            if (res.data.success) {
              toast.success(res.data.message || "All customers evaluated!");
              fetchCustomers();
            } else {
              toast.error(res.data.message || "Auto-ranking failed");
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error("Error in AI batch evaluation");
          })
          .finally(() => {
            setAutoRankingAll(false);
          });
      }
    });
  };

  // Open Approval Modal
  const openApprovalModal = (customer) => {
    setSelectedCustomer(customer);
    const pRank = customer.pendingRank || customer.rank || "Gold";
    const pActivity = customer.pendingActivityStatus || customer.activityStatus || "Highly Active";
    const pSummary = customer.pendingAiSummary || customer.aiSummary || "Customer evaluated based on activity and review sentiment.";
    const pCoupon = customer.pendingRewardCoupon || {};

    setEditRank(pRank);
    setEditActivityStatus(pActivity);
    setEditAiSummary(pSummary);
    setCouponCode(pCoupon.code || `${pRank.replace(/\s+/g, '').toUpperCase()}${Math.floor(100 + Math.random() * 900)}`);
    setCouponDiscount(pCoupon.discount || (pRank === "VIP Premium" ? "30%" : pRank === "Platinum" ? "25%" : "20%"));
    setCouponMinSpend(pCoupon.minAmoutSpend || 200);

    setShowApprovalModal(true);
  };

  // Approve AI Proposal
  const handleApproveEvaluation = (action = "approve") => {
    if (!selectedCustomer) return;
    setLoading(true);

    const payload = {
      customerId: selectedCustomer._id,
      action: action,
      rank: editRank,
      activityStatus: editActivityStatus,
      aiSummary: editAiSummary,
      customCoupon: {
        code: couponCode,
        discount: couponDiscount,
        minAmoutSpend: Number(couponMinSpend),
        discountType: "percentage"
      }
    };

    approveAiEvaluation(payload)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "AI Evaluation decision applied!");
          setShowApprovalModal(false);
          fetchCustomers();
        } else {
          toast.error(res.data.message || "Failed to process decision");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error approving evaluation");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Toggle security block
  const handleBlockToggle = (userId, currentBlocked, customerName = "") => {
    if (!userId) {
      toast.warning("Associated user account not found");
      return;
    }

    const actionText = currentBlocked ? "Unblock" : "Block";
    Swal.fire({
      title: `${actionText} Customer?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} customer ${customerName ? `"${customerName}"` : "access"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentBlocked ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${actionText}!`
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        toggleBlockCustomer({ userId })
          .then((res) => {
            if (res.data.success) {
              toast.success(res.data.message || `Customer ${actionText.toLowerCase()}ed successfully`);
              fetchCustomers();
            } else {
              toast.error(res.data.message || "Failed to update block status");
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error("Error toggling block status");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  // Search filtering
  const filteredCustomers = data.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.rank && customer.rank.toLowerCase().includes(query)) ||
      (customer.activityStatus && customer.activityStatus.toLowerCase().includes(query)) ||
      (customer.Contact && customer.Contact.includes(query))
    );
  });

  const totalpages = Math.ceil(filteredCustomers.length / limit);
  const startindex = (currentpage - 1) * limit;
  const endindex = startindex + limit;
  const currentdata = filteredCustomers.slice(startindex, endindex);

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
    <>
      <div className="container-fluid py-3 py-md-4">
        <div className="container px-0 px-sm-3">
          <div className="p-3 p-sm-4 p-md-5 rounded-4 bg-light shadow-sm">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "750px" }}>
                  <h1 className="fw-bold text-primary mb-2">
                    Customer Ranks & AI Activity Evaluation
                  </h1>
                  <p className="text-muted small">
                    AI evaluates customer order completion (accepted/cancelled), total spend, active status recency, and review sentiment. AI proposals require Admin approval before issuing reward coupons.
                  </p>
                </div>

                {/* Filter / Search & Action Toolbar */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                  <div className="input-group" style={{ maxWidth: "450px" }}>
                    <span className="input-group-text bg-white border-0 shadow-sm">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 shadow-sm py-2.5 ps-2"
                      placeholder="Search customers by name, email, rank..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn btn-primary fw-bold rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                    onClick={handleAiAutoRankAll}
                    disabled={autoRankingAll}
                  >
                    {autoRankingAll ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        AI Batch Evaluating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles text-warning"></i>
                        ⚡ AI Auto-Rank All Customers
                      </>
                    )}
                  </button>
                </div>

                {/* Customers Table */}
                <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th scope="col" className="ps-4" style={{ width: "60px" }}>Sr</th>
                        <th scope="col">Customer Info</th>
                        <th scope="col">Order & Review Metrics</th>
                        <th scope="col">AI Rank & Active Status</th>
                        <th scope="col" className="text-center">Approval Status</th>
                        <th scope="col" className="text-end pe-4" style={{ width: "220px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <div className="d-flex justify-content-center py-4">
                              <HashLoader size={60} color={"#81c408"} />
                            </div>
                          </td>
                        </tr>
                      ) : currentdata.length > 0 ? (
                        currentdata.map((element, index) => {
                          const m = element.metrics || {};
                          const isPendingApproval = element.aiEvaluationStatus === "Pending Approval";

                          return (
                            <tr key={element._id}>
                              <td className="ps-4 fw-semibold text-muted">{startindex + index + 1}</td>
                              <td>
                                <div className="fw-bold text-dark">{element.name}</div>
                                <div className="text-muted small">{element.email}</div>
                                <div className="text-muted small">
                                  <i className="fa-solid fa-phone me-1 small"></i>{element.Contact || "N/A"}
                                </div>
                              </td>

                              {/* Metrics Column */}
                              <td>
                                <div className="small">
                                  <span className="text-success fw-bold me-2">
                                    <i className="fa-solid fa-circle-check me-1"></i>{m.acceptedOrders || 0} Accepted
                                  </span>
                                  <span className="text-danger fw-bold me-2">
                                    <i className="fa-solid fa-circle-xmark me-1"></i>{m.cancelledOrders || 0} Cancelled
                                  </span>
                                </div>
                                <div className="small text-dark fw-semibold mt-1">
                                  Spend: <span className="text-primary">Rs. {m.totalSpend || 0}</span> | Rate: {m.acceptanceRate || 100}%
                                </div>
                                <div className="small text-muted">
                                  Reviews: {m.reviewCount || 0} ({m.avgRating || 0}★ avg)
                                </div>
                              </td>

                              {/* AI Rank & Active Badges */}
                              <td>
                                <div className="d-flex flex-column align-items-start gap-1">
                                  <span className={`badge ${getRankBadgeClass(element.rank)} px-3 py-1.5 rounded-pill`}>
                                    <i className="fa-solid fa-trophy me-1"></i> {element.rank || "Bronze"} ({element.rankScore || 0} pts)
                                  </span>
                                  <span className={`badge ${getActivityBadgeClass(element.activityStatus)} px-2.5 py-1 rounded-pill small`}>
                                    <i className="fa-solid fa-bolt me-1"></i> {element.activityStatus || "Moderately Active"}
                                  </span>
                                </div>
                              </td>

                              {/* Approval Status */}
                              <td className="text-center">
                                {isPendingApproval ? (
                                  <button
                                    className="btn btn-warning btn-sm rounded-pill px-3 py-1 fw-bold text-dark shadow-sm animate-bounce"
                                    onClick={() => openApprovalModal(element)}
                                  >
                                    <i className="fa-solid fa-triangle-exclamation me-1"></i> Proposal Ready (Approve)
                                  </button>
                                ) : element.aiEvaluationStatus === "Approved" ? (
                                  <span className="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill">
                                    <i className="fa-solid fa-check me-1"></i> Approved
                                  </span>
                                ) : (
                                  <span className="badge bg-light text-muted border px-2.5 py-1 rounded-pill">
                                    Standard
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end align-items-center gap-2">
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-circle p-2"
                                    title="Run AI Evaluation"
                                    onClick={() => handleAiEvaluate(element)}
                                    disabled={evaluatingId === element._id}
                                  >
                                    {evaluatingId === element._id ? (
                                      <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    )}
                                  </button>

                                  <button
                                    className="btn btn-outline-success btn-sm rounded-circle p-2"
                                    title="Review & Approve Rank / Issue Coupon"
                                    onClick={() => openApprovalModal(element)}
                                  >
                                    <i className="fa-solid fa-gift"></i>
                                  </button>

                                  {/* Security Block Switch */}
                                  <Switch
                                    onChange={() => handleBlockToggle(element.userId?._id, element.userId?.isBlocked, element.name)}
                                    checked={element.userId?.isBlocked || false}
                                    onColor="#dc3545"
                                    offColor="#81c408"
                                    checkedIcon={false}
                                    uncheckedIcon={false}
                                    height={18}
                                    width={36}
                                    handleDiameter={14}
                                    disabled={!element.userId}
                                    title={element.userId?.isBlocked ? "Unblock Customer" : "Block Customer"}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5 text-muted">
                            <i className="fas fa-users-slash fa-3x mb-3 text-muted"></i>
                            <p className="mb-0">No customers found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* React Paging */}
                {totalpages > 0 && (
                  <div className="d-flex justify-content-center mt-4">
                    <ResponsivePagination
                      className="pagination mb-0"
                      onPageChange={setcurrentpage}
                      total={totalpages}
                      current={currentpage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Approval & Review Modal */}
      {showApprovalModal && selectedCustomer && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="fa-solid fa-shield-check me-2"></i> Admin Approval: Customer AI Evaluation & Reward
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowApprovalModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <h6 className="fw-bold text-dark mb-1">
                    Customer: {selectedCustomer.name} ({selectedCustomer.email})
                  </h6>
                  <div className="small text-muted">
                    Order Completion: {selectedCustomer.metrics?.acceptedOrders || 0} Accepted / {selectedCustomer.metrics?.cancelledOrders || 0} Cancelled | Total Spend: Rs. {selectedCustomer.metrics?.totalSpend || 0}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small text-secondary">Assign Customer Rank Tier:</label>
                    <select
                      className="form-select border-primary"
                      value={editRank}
                      onChange={(e) => setEditRank(e.target.value)}
                    >
                      <option value="VIP Premium">VIP Premium 👑</option>
                      <option value="Platinum">Platinum 💎</option>
                      <option value="Gold">Gold ⭐</option>
                      <option value="Silver">Silver 🥈</option>
                      <option value="Bronze">Bronze 🥉</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small text-secondary">Activity Status:</label>
                    <select
                      className="form-select border-primary"
                      value={editActivityStatus}
                      onChange={(e) => setEditActivityStatus(e.target.value)}
                    >
                      <option value="Highly Active">🟢 Highly Active</option>
                      <option value="Moderately Active">🟡 Moderately Active</option>
                      <option value="Dormant">🔴 Dormant</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold small text-secondary">AI Evaluation Rationale / Summary:</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editAiSummary}
                      onChange={(e) => setEditAiSummary(e.target.value)}
                      placeholder="Write rationale for rank assignment..."
                    ></textarea>
                  </div>

                  {/* Proposed Reward Coupon details */}
                  <div className="col-12">
                    <div className="p-3 rounded-3 border border-warning bg-warning bg-opacity-10 mt-2">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="fa-solid fa-gift text-warning me-2"></i> Issue Exclusive Reward Coupon:
                      </h6>
                      <div className="row g-2">
                        <div className="col-12 col-md-4">
                          <label className="form-label small text-muted mb-1">Coupon Code:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm text-uppercase fw-bold"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label small text-muted mb-1">Discount Off:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm fw-bold"
                            value={couponDiscount}
                            onChange={(e) => setCouponDiscount(e.target.value)}
                            placeholder="e.g. 20% or 500"
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label small text-muted mb-1">Min Spend (Rs):</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={couponMinSpend}
                            onChange={(e) => setCouponMinSpend(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light rounded-bottom-4 justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-pill px-3"
                  onClick={() => handleApproveEvaluation("reject")}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Reject Proposal
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-3"
                    onClick={() => setShowApprovalModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                    onClick={() => handleApproveEvaluation("approve")}
                  >
                    <i className="fa-solid fa-circle-check me-1"></i> ✅ Approve Rank & Issue Reward
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}