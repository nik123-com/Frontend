import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { addCoupon } from "../server/Coupon";
import { allVendor } from "../server/Vendor";
import { allCustomer } from "../server/Customer";

export default function Coupon() {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("1");
  const [MinAmtSpend, setminAmtSpend] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(false);

  // Recipient selection state
  const [targetType, setTargetType] = useState("all"); // 'all', 'vendor', 'customer'
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [vendorsList, setVendorsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const generateCode = () => {
    const prefixes = ["SAVE", "OFFER", "PROMO", "DEAL", "SPECIAL"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setCode(`${prefix}${num}`);
  };

  useEffect(() => {
    generateCode();
  }, []);

  useEffect(() => {
    if (targetType === "vendor" && vendorsList.length === 0) {
      setLoadingLists(true);
      allVendor()
        .then((res) => {
          if (res.data && res.data.success) {
            setVendorsList(res.data.data || []);
          }
        })
        .catch((err) => console.error("Error loading vendors:", err))
        .finally(() => setLoadingLists(false));
    } else if (targetType === "customer" && customersList.length === 0) {
      setLoadingLists(true);
      allCustomer()
        .then((res) => {
          if (res.data && res.data.success) {
            setCustomersList(res.data.data || []);
          }
        })
        .catch((err) => console.error("Error loading customers:", err))
        .finally(() => setLoadingLists(false));
    }
  }, [targetType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (targetType === "vendor" && !selectedVendorId) {
      toast.warning("Please select a target vendor");
      setLoading(false);
      return;
    }
    if (targetType === "customer" && !selectedCustomerId) {
      toast.warning("Please select a target customer");
      setLoading(false);
      return;
    }

    let data = {
      code: code || undefined,
      discount,
      discountType,
      minAmoutSpend: MinAmtSpend,
      expiryDate: expiry,
      vendorId: targetType === "vendor" ? selectedVendorId : undefined,
      customerId: targetType === "customer" ? selectedCustomerId : undefined
    };

    addCoupon(data)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Coupon created and notification sent!");
          setCode("");
          setDiscount("");
          setminAmtSpend("");
          setExpiry("");
          setSelectedVendorId("");
          setSelectedCustomerId("");
          setTargetType("all");
          generateCode();
        } else {
          toast.warning(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
        toast.error(err.response?.data?.message || "Error adding coupon");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <br />
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Add & Grant Coupon
                  </h1>
                  <p className="text-muted small">Create general coupons or grant exclusive promotional coupons directly to vendors/customers with instant notifications.</p>
                </div>
              </div>
              <div className="col-lg-7 mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Grant Coupon To :</label>
                    <select
                      className="form-control py-3 rounded border-0 bg-white fw-medium"
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value)}
                    >
                      <option value="all">🌐 All Users / General Public</option>
                      <option value="vendor">🏪 Specific Vendor Store</option>
                      <option value="customer">👤 Specific Customer Account</option>
                    </select>
                  </div>

                  {targetType === "vendor" && (
                    <div className="mb-4 p-3 bg-white rounded border border-success-subtle shadow-xs">
                      <label className="form-label fw-semibold text-success">
                        <i className="fa-solid fa-store me-1"></i> Select Vendor :
                      </label>
                      {loadingLists ? (
                        <div className="text-muted small">Loading vendors list...</div>
                      ) : (
                        <select
                          className="form-select py-2"
                          value={selectedVendorId}
                          onChange={(e) => setSelectedVendorId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Vendor Store --</option>
                          {vendorsList.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.businessName || v.ownerName} ({v.email || "No email"})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {targetType === "customer" && (
                    <div className="mb-4 p-3 bg-white rounded border border-info-subtle shadow-xs">
                      <label className="form-label fw-semibold text-info">
                        <i className="fa-solid fa-user me-1"></i> Select Customer :
                      </label>
                      {loadingLists ? (
                        <div className="text-muted small">Loading customers list...</div>
                      ) : (
                        <select
                          className="form-select py-2"
                          value={selectedCustomerId}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Customer --</option>
                          {customersList.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name} ({c.email})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Coupon Code :</label>
                    <div className="input-group shadow-sm rounded">
                      <input
                        type="text"
                        className="form-control py-3 border-0 bg-white text-uppercase font-monospace fw-bold"
                        placeholder="e.g. SAVE101"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn text-white fw-bold px-3"
                        style={{ backgroundColor: "#81c408" }}
                        onClick={generateCode}
                        title="Auto Generate Random Coupon Code"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles me-1"></i> Auto Generate
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Discount :</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter Discount Amount"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Discount Type :</label>
                    <select
                      className="form-control py-3 rounded border-0 bg-white"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="1">Flat (₹)</option>
                      <option value="2">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Minimum Amount:</label>
                    <input
                      type="number"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter Minimum Amount"
                      value={MinAmtSpend}
                      onChange={(e) => setminAmtSpend(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Expiry Date:</label>
                    <input
                      type="date"
                      className="form-control py-3 rounded border-0 bg-white"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-3 text-white fw-bold rounded shadow-sm"
                    style={{ backgroundColor: "#81c408" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Granting Coupon...
                      </>
                    ) : (
                      "Grant & Add Coupon"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}