// import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import { addCoupon } from "../server/Coupon";

export default function Coupon() {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("1");
  const [MinAmtSpend, setminAmtSpend] = useState("");
  const [expiry, setExpiry] = useState("");
 let [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token
    }

    let data={
      code,
      discount,
      discountType,
      minAmoutSpend:MinAmtSpend,
      expiryDate:expiry
    }
    // let data = new FormData()
    // data.append("code", code)
    // data.append("discount",discount)
    // data.append("discountType",discountType)
    // data.append("minAmoutSpend",MinAmtSpend)
    // data.append("expiryDate",expiry)
    
  addCoupon(data).then((res) => {
      console.log(res.data);
      setLoading(true)
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.warning(res.data.message);
      }
    })
    .catch((err) => {
      console.log(err.message);
      toast.error(err);
    }).finally(() => {
      setLoading(false)
    })
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
          }
          }>

          <HashLoader size={50} color={"green"} />
        </div>
      )
      }
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
                    <label className="form-label fw-semibold">Code : </label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter coupon Code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Discount :</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter Discount Amount"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Discount Type :</label>
                    <select  className="form-control"
                     value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                       name="" id="">
                      {/* <option disabled selected value="">Choose one</option> */}
                      <option value="1">Flat</option>
                      <option value="2">Percentage</option>

                    </select>
                   
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Minimium Amount:</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter Minimium Amount"
                      value={MinAmtSpend}
                      onChange={(e) => setminAmtSpend(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Expiry Date:</label>
                    <input
                      type="date"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter Minimium Amount"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
               
                  <button
                    type="submit"
                    className="btn w-100 py-3 text-white fw-bold rounded"
                    style={{ backgroundColor: "#81c408" }}
                  >
                    Add Coupon
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};