import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { addCoupon } from "../server/Coupon";

export default function Coupon() {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("1");
  const [MinAmtSpend, setminAmtSpend] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    const prefixes = ["SAVE", "OFFER", "PROMO", "DEAL", "SPECIAL"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setCode(`${prefix}${num}`);
  };

  useEffect(() => {
    generateCode();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    let data = {
      code: code || undefined,
      discount,
      discountType,
      minAmoutSpend: MinAmtSpend,
      expiryDate: expiry
    };

    addCoupon(data)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          setCode("");
          setDiscount("");
          setminAmtSpend("");
          setExpiry("");
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
                    Add Coupon
                  </h1>
                </div>
              </div>
              <div className="col-lg-7 mx-auto">
                <form onSubmit={handleSubmit}>
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
                        Adding Coupon...
                      </>
                    ) : (
                      "Add Coupon"
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