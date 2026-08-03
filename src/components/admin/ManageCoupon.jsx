import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// React Paging 
import ResponsivePagination from "react-responsive-pagination";
import { adminCoupon, deleteCoupon } from "../server/Coupon";

export default function ManageCoupon() {
  const [data, setdata] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // React Paging
  const [currentpage, setcurrentpage] = useState(1);
  const [totalpages, settotalpages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetch();
  }, []);
  
  const fetch = () => {
    setLoading(true);
    adminCoupon()
      .then((res) => {
        if (res.data.success) {
          const couponList = res.data.data || [];
          setdata(couponList);
          const totalP = Math.ceil(couponList.length / limit) || 1;
          settotalpages(totalP);
          if (currentpage > totalP) {
            setcurrentpage(totalP);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load coupons");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      deleteCoupon({ _id: id })
        .then((res) => {
          if (res.data.success) {
            toast.success(res.data.message || "Coupon deleted successfully");
            fetch();
          } else {
            toast.error(res.data.message || "Failed to delete coupon");
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.response?.data?.message || "Error deleting coupon");
        });
    }
  };

  // React Paging
  const startindex = (currentpage - 1) * limit;
  const endindex = startindex + limit;
  const currentdata = data.slice(startindex, endindex);

  return (
    <>
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Manage Coupon
                  </h1>
                </div>
                <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th scope="col" className="ps-4">Sr No</th>
                        <th scope="col">Code</th>
                        <th scope="col">Discount</th>
                        <th scope="col">Discount Type</th>
                        <th scope="col">Minimum Spend</th>
                        <th scope="col">Expiry Date</th>
                        <th scope="col">Created By</th>
                        <th scope="col" className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-muted">
                            <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                            Loading coupons...
                          </td>
                        </tr>
                      ) : currentdata.length > 0 ? (
                        currentdata.map((element, index) => (
                          <tr key={element._id}>
                            <td className="ps-4 fw-semibold text-muted">{startindex + index + 1}</td>
                            <td>
                              <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 fs-6 fw-bold font-monospace">
                                {element.code}
                              </span>
                            </td>
                            <td className="fw-bold text-success">{element.discount}</td>
                            <td className="text-capitalize">
                              {element.discountType === "1" || element.discountType === "Flat"
                                ? "Flat (₹)"
                                : element.discountType === "2" || element.discountType === "Percentage"
                                ? "Percentage (%)"
                                : element.discountType}
                            </td>
                            <td>₹{(element.minAmoutSpend || 0).toLocaleString("en-IN")}</td>
                            <td className="text-muted">
                              {element.expiryDate ? new Date(element.expiryDate).toLocaleDateString() : "No Expiry"}
                            </td>
                            <td>
                              {element.vendorId ? (
                                <span className="badge bg-info-subtle text-info border border-info px-2 py-1">
                                  <i className="fa-solid fa-store me-1"></i> Vendor ({element.vendorId.businessName || element.vendorId.ownerName || "Vendor"})
                                </span>
                              ) : (
                                <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1">
                                  <i className="fa-solid fa-user-shield me-1"></i> Admin
                                </span>
                              )}
                            </td>
                            <td className="text-end pe-4">
                              <button
                                onClick={() => handleDelete(element._id)}
                                className="btn btn-sm btn-outline-danger shadow-sm"
                                title="Delete Coupon"
                              >
                                <i className="fa-solid fa-trash me-1"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-muted">
                            No coupons found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* React Paging  */}
                {totalpages > 1 && (
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