import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_wallet, vendor_request_payout } from "../endpoints";

export default function VendorWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDesc, setPayoutDesc] = useState("");

  const fetchWallet = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_wallet,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setWallet(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to fetch wallet");
      }
    } catch (err) {
      toast.error("Error loading wallet details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_request_payout,
        { amount: Number(payoutAmount), description: payoutDesc },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success("Payout request submitted successfully!");
        setShowPayoutModal(false);
        setPayoutAmount("");
        setPayoutDesc("");
        fetchWallet();
      } else {
        toast.error(res.data.message || "Payout request failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting payout request");
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Financial Wallet & Settlements</h3>
          <p className="text-muted mb-0">Track earnings, pending settlements, payouts, and ledger history.</p>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          className="btn btn-success fw-bold px-4 py-2 shadow-sm"
        >
          <i className="fa-solid fa-money-bill-transfer me-2"></i> Request Payout / Withdrawal
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Earnings Balance */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-primary text-white rounded-3">
            <span className="text-white-50 fw-semibold">Available Earnings Balance</span>
            <h2 className="fw-bold mb-0 mt-2">₹{(wallet?.earnings || 0).toLocaleString()}</h2>
            <small className="text-white-50 mt-1">Ready for direct bank settlement</small>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
            <span className="text-muted fw-semibold">Pending Settlements</span>
            <h2 className="fw-bold text-warning mb-0 mt-2">
              ₹{(wallet?.pendingSettlements || 0).toLocaleString()}
            </h2>
            <small className="text-muted mt-1">Under processing by Admin</small>
          </div>
        </div>

        {/* Completed Settlements */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
            <span className="text-muted fw-semibold">Completed Settlements</span>
            <h2 className="fw-bold text-success mb-0 mt-2">
              ₹{(wallet?.completedSettlements || 0).toLocaleString()}
            </h2>
            <small className="text-muted mt-1">Disbursed to your registered bank account</small>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="fw-bold mb-0 text-dark">Transaction Ledger & Payout History</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading transactions...</p>
            </div>
          ) : wallet?.history?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th className="text-end pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.history.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="ps-4 text-muted">
                        {new Date(tx.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="fw-semibold text-dark">{tx.description || "Settlement / Earnings"}</td>
                      <td>
                        <span
                          className={`badge ${
                            tx.type === "credit" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                          }`}
                        >
                          {tx.type === "credit" ? "+ Credit" : "- Debit"}
                        </span>
                      </td>
                      <td className={`fw-bold ${tx.type === "credit" ? "text-success" : "text-danger"}`}>
                        {tx.type === "credit" ? "+" : "-"}₹{(tx.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="text-end pe-4">
                        <span
                          className={`badge text-capitalize px-3 py-2 ${
                            tx.status === "completed"
                              ? "bg-success"
                              : tx.status === "pending"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-wallet fs-1 mb-2 text-secondary"></i>
              <h5>No Financial Transactions Recorded</h5>
              <p>Completed order payouts and withdrawals will be logged here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Request Settlement Payout</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPayoutModal(false)}></button>
              </div>
              <form onSubmit={handlePayoutSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Withdrawal Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 5000"
                      max={wallet?.earnings || 0}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted">
                      Max available balance: ₹{(wallet?.earnings || 0).toLocaleString()}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Notes / Reference (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Payout request for weekly order settlements"
                      value={payoutDesc}
                      onChange={(e) => setPayoutDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPayoutModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success fw-bold">
                    Submit Payout Request
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
