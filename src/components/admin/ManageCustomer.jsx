import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { allCustomer, toggleBlockCustomer, allotCustomerRank } from "../server/Customer";
import ResponsivePagination from "react-responsive-pagination";

export default function ManageCustomer() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentpage, setcurrentpage] = useState(1);
  const limit = 10;

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

  // Toggle security block (block/unblock user login and API access)
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

  const handleAllotRank = (customer) => {
    const currentRank = customer.rank || 1;
    Swal.fire({
      title: `Allot Rank for ${customer.name}`,
      html: `
        <div className="text-start fs-6 p-2">
          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Numerical Rank:</label>
            <input type="number" id="swal-input-rank" class="form-control" min="1" value="${currentRank}" placeholder="Enter rank number (e.g. 1, 2, 3)" />
          </div>
          <div id="swal-rank1-fields" style="display: ${currentRank === 1 ? 'block' : 'none'};" class="p-3 bg-light rounded border border-success-subtle">
            <h6 className="fw-bold text-success mb-2"><i className="fas fa-gift me-1"></i> Rank 1 Reward Coupon Details</h6>
            <div className="mb-2">
              <label className="form-label small mb-1 fw-semibold">Discount Value:</label>
              <input type="number" id="swal-input-discount" class="form-control form-control-sm" value="20" placeholder="e.g. 20" />
            </div>
            <div className="mb-2">
              <label className="form-label small mb-1 fw-semibold">Discount Type:</label>
              <select id="swal-input-disctype" class="form-select form-select-sm">
                <option value="Percentage">Percentage (%)</option>
                <option value="Flat">Flat Amount (₹/$)</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label small mb-1 fw-semibold">Min Spend Amount:</label>
              <input type="number" id="swal-input-minspend" class="form-control form-control-sm" value="0" placeholder="0" />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Assign Rank",
      confirmButtonColor: "#81c408",
      didOpen: () => {
        const rankInput = document.getElementById("swal-input-rank");
        const rank1Fields = document.getElementById("swal-rank1-fields");
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
        const rankVal = document.getElementById("swal-input-rank")?.value;
        const discountVal = document.getElementById("swal-input-discount")?.value;
        const discTypeVal = document.getElementById("swal-input-disctype")?.value;
        const minSpendVal = document.getElementById("swal-input-minspend")?.value;

        if (!rankVal || parseInt(rankVal, 10) < 1) {
          Swal.showValidationMessage("Please enter a valid positive rank number");
          return false;
        }

        return {
          rank: parseInt(rankVal, 10),
          discount: discountVal || "20",
          discountType: discTypeVal || "Percentage",
          minAmoutSpend: minSpendVal || "0"
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setLoading(true);
        allotCustomerRank({
          customerId: customer._id,
          rank: result.value.rank,
          discount: result.value.discount,
          discountType: result.value.discountType,
          minAmoutSpend: result.value.minAmoutSpend
        })
          .then((res) => {
            if (res.data.success) {
              // 5-SECOND MAX DISPLAY POPUP WITH PROGRESS BAR
              Swal.fire({
                title: "Rank Allotted Successfully! 🎉",
                html: `
                  <div className="py-2 text-center">
                    <p className="mb-2 fs-5">Customer <strong>"${customer.name}"</strong> allotted <span class="badge bg-success fs-6">Rank #${result.value.rank}</span></p>
                    ${res.data.rewardCoupon ? `<div class="alert alert-success mt-3 mb-0 p-2"><i class="fas fa-gift me-2 fs-5"></i><strong>Reward Coupon Generated:</strong> <span class="fw-bold fs-5 text-dark">${res.data.rewardCoupon}</span></div>` : ''}
                    <p className="text-muted small mt-3 mb-0">Popup will auto-close in 5 seconds.</p>
                  </div>
                `,
                icon: "success",
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: "OK",
                confirmButtonColor: "#81c408"
              });
              fetchCustomers();
            } else {
              toast.error(res.data.message || "Failed to allot rank");
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error("Error allotting rank to customer");
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
      (customer.Contact && customer.Contact.includes(query)) ||
      (customer.Address && customer.Address.toLowerCase().includes(query)) ||
      (customer.GovtID && customer.GovtID.includes(query))
    );
  });

  const totalpages = Math.ceil(filteredCustomers.length / limit);

  // React Paging index
  const startindex = (currentpage - 1) * limit;
  const endindex = startindex + limit;
  const currentdata = filteredCustomers.slice(startindex, endindex);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <>
      <div className="container-fluid py-3 py-md-4">
        <div className="container px-0 px-sm-3">
          <div className="p-3 p-sm-4 p-md-5 rounded-4 bg-light shadow-sm">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold text-primary mb-2">
                    Manage Customers
                  </h1>
                  <p className="text-muted small">
                    Monitor customer accounts, allot numerical ranks, inspect government evidence proofs, toggle listing visibility, and restrict login block access.
                  </p>
                </div>

                {/* Filter / Search section */}
                <div className="mb-4 col-12 col-md-8 col-lg-6 mx-auto">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-0 shadow-sm">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 shadow-sm py-2.5 ps-2"
                      placeholder="Search customers by name, email, contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Customers Table */}
                <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th scope="col" className="ps-4" style={{ width: "80px" }}>Sr No</th>
                        <th scope="col">Customer Info</th>
                        <th scope="col">Rank</th>
                        <th scope="col">Contact & Address</th>
                        <th scope="col">Identity Proof</th>
                        <th scope="col">Registered On</th>
                        <th scope="col" className="text-center" style={{ width: "200px" }}>Actions & Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="d-flex justify-content-center py-4">
                              <HashLoader size={60} color={"#81c408"} />
                            </div>
                          </td>
                        </tr>
                      ) : currentdata.length > 0 ? (
                        currentdata.map((element, index) => (
                          <tr key={element._id}>
                            <td className="ps-4 fw-semibold text-muted">{startindex + index + 1}</td>
                            <td>
                              <div className="fw-bold text-dark">{element.name}</div>
                              <div className="text-muted small">{element.email}</div>
                            </td>
                            <td>
                              <span className={`badge ${element.rank === 1 ? 'bg-warning text-dark border border-warning' : 'bg-primary-subtle text-primary border border-primary'} px-2.5 py-1.5 rounded-pill fw-bold`}>
                                <i className="fas fa-award me-1"></i>Rank #{element.rank || 1}
                              </span>
                            </td>
                            <td>
                              <div className="text-dark small"><i className="fa-solid fa-phone text-muted me-1.5 small"></i>{element.Contact || "N/A"}</div>
                              <div className="text-muted text-truncate small" style={{ maxWidth: "200px" }} title={element.Address}>
                                <i className="fa-solid fa-location-dot text-muted me-1.5 small"></i>{element.Address || "N/A"}
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold text-secondary text-capitalize small">
                                {element.evidence || "No Doc"}
                              </div>
                              <div className="text-muted font-monospace small">
                                {element.GovtID || "N/A"}
                              </div>
                            </td>
                            <td className="small text-muted">{formatDate(element.created_at)}</td>
                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-warning text-dark fw-semibold px-2.5 py-1 rounded-2"
                                  onClick={() => handleAllotRank(element)}
                                  title="Allot Rank to customer"
                                >
                                  <i className="fas fa-award me-1"></i>Allot Rank
                                </button>

                                <div className="d-flex align-items-center gap-1.5 mt-1">
                                  <span className={`badge ${element.userId?.isBlocked ? "bg-danger text-white" : "bg-success-subtle text-success border border-success"} px-2 py-1 rounded-pill small`}>
                                    {element.userId?.isBlocked ? "Blocked" : "Allowed"}
                                  </span>
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
                                    title={!element.userId ? "Linked user account not found" : ""}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            <i className="fas fa-users-slash fa-3x mb-3 text-muted"></i>
                            <p className="mb-0">No customers found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* React Paging  */}
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
    </>
  );
}