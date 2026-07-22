import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";  
// React Paging 
import ResponsivePagination from "react-responsive-pagination";
import { adminCoupon } from "../server/Coupon";


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
    // setLoading(true);
    
    adminCoupon(data).then((res) =>{
      console.log(res.data.data);
      setdata(res.data.data);
      settotalpages(Math.ceil(res.data.data.length / limit));
      
    })
      .catch((err) => {
        console.log(err);
        
      });
  };

//   // Soft Delete(Status updated)
//   const SoftDelete = (id) => {
//     // It is used to Show GUI
//     setdata((prev) =>
//       prev.map((item) =>
//         item._id === id ? { ...item, status: !item.status } : item,
//       ),
//     );

//     const data1 = {
//       _id: id,
//     }
//     softDelete(data1).then((res) => {
//       if (res.data.success) {
//         toast.warning(res.data.message);
//       } else {
//         toast.success(res.data.message);
//       }
//     }).catch((err) => {
//       toast.error(err);
//     })
//   }
//   //For Deleting
//   const deleteCategory = (id) => {
//     const data2 = {
//       _id: id,
//     };
//     deleteOne(data2).then((res) => {
//       console.log(res);

//       if (res.data.success) {
//         toast.success(res.data.message);

//       } else {
//         toast.warning(res.data.message);
//       }
//       fetch();
//     })
//       .catch((err) => {
//         console.log(err);
//         toast.error(err)
//       })
//   }

  // React Paging
  const startindex = (currentpage - 1) * limit
  const endindex = startindex + limit

  const currentdata = data.slice(startindex, endindex);
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
                      </tr>
                    </thead>
                    <tbody>
                      {currentdata.map((element, index) => (
                        <tr key={element._id}>
                          <td className="ps-4 fw-semibold text-muted">{startindex + index + 1}</td>
                          <td className="fw-bold text-dark">{element.code}</td>
                          <td className="fw-bold text-success">{element.discount}</td>
                          <td className="text-capitalize">{element.discountType}</td>
                          <td>₹{(element.minAmoutSpend || 0).toLocaleString("en-IN")}</td>
                          <td className="text-muted">{element.expiryDate ? new Date(element.expiryDate).toLocaleDateString() : "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* React Paging  */}
                <div className="d-flex justify-content-center mt-4">
                  <ResponsivePagination
                    className="pagination mb-0"
                    onPageChange={setcurrentpage}
                    total={totalpages}
                    current={currentpage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};