import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { HashLoader } from "react-spinners";
import { allCustomer, toggleBlockCustomer } from "../server/Customer";

export default function ManageCustomer() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

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
  const handleBlockToggle = (userId) => {
    if (!userId) {
      toast.warning("Associated user account not found");
      return;
    }

    setLoading(true);
    toggleBlockCustomer({ userId })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
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
      {loading && (
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "9999"
          }}
        >
          <HashLoader size={50} color={"#81c408"} />
        </div>
      )}

      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light shadow-sm">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold text-primary mb-2">
                    Manage Customers
                  </h1>
                  <p className="text-muted">
                    Monitor customer accounts, inspect government evidence proofs, toggle listing visibility, and restrict login block access.
                  </p>
                </div>

                {/* Filter / Search section */}
                <div className="mb-4 col-md-5 mx-auto">
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
                        <th scope="col">Contact & Address</th>
                        <th scope="col">Identity Proof</th>
                        <th scope="col">Registered On</th>
                        <th scope="col" className="text-center" style={{ width: "150px" }}>Security Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((element, index) => (
                          <tr key={element._id}>
                            <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                            <td>
                              <div className="fw-bold text-dark">{element.name}</div>
                              <div className="text-muted small">{element.email}</div>
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
                              {/* Block toggle */}
                              <div className="d-flex flex-column align-items-center gap-1.5">
                                <span className={`badge ${element.userId?.isBlocked ? "bg-danger text-white" : "bg-success-subtle text-success border border-success"} px-2.5 py-1.5 rounded-pill small mb-1`}>
                                  {element.userId?.isBlocked ? "Blocked" : "Allowed"}
                                </span>
                                <Switch
                                  onChange={() => handleBlockToggle(element.userId?._id)}
                                  checked={element.userId?.isBlocked || false}
                                  onColor="#dc3545"
                                  offColor="#81c408"
                                  checkedIcon={false}
                                  uncheckedIcon={false}
                                  height={20}
                                  width={40}
                                  handleDiameter={16}
                                  disabled={!element.userId}
                                  title={!element.userId ? "Linked user account not found" : ""}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
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

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}