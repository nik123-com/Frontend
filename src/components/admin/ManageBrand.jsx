import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { Navigate, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { allBrand, HardDelete, softDelete } from "../server/Brand";
// React Paging 
import ResponsivePagination from "react-responsive-pagination";

export default function ManageBrand() {
  const [data, setdata] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // React Paging
  const [currentpage, setcurrentpage] = useState(1);
  const [totalpages, settotalpages] = useState(1);
  const limit = 10;

  const fetch = () => {
    setLoading(true);
    allBrand({}).then((res) => {
      console.log(res);
      const brandsList = res.data.data || [];
      setdata(brandsList);
      settotalpages(Math.ceil(brandsList.length / limit));
    }).catch((err) => {
      console.error(err);
      toast.error(err?.message || "Error fetching brands");
    }).finally(() => {
      setLoading(false);
    });
  };

  // Soft Delete
  const SoftDelete = (id) => {
    // It is used to Show GUI
    setdata((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: !item.status } : item,
      ),
    );

    const data1 = {
      _id: id,
    }
    softDelete(data1).then((res) => {
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.warning(res.data.message);
      }
    }).catch((err) => {
      toast.error(err?.message || "Error updating status");
    })
  }
  useEffect(() => {
    fetch();
  }, []);

  const deleteBrand = (id) => {
    const data2 = {
      _id: id,
    };

    //For Hard Delete
    HardDelete(data2)
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          toast.success(res.data.message);
          fetch();
        } else {
          toast.warning(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(err?.message || "Error deleting brand");
      });
  };

  // React Paging
  const startindex = (currentpage - 1) * limit;
  const endindex = startindex + limit;
  const currentdata = data ? data.slice(startindex, endindex) : [];

  return (
    <>
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Manage Brand
                  </h1>
                </div>
                <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th scope="col" className="ps-4">Sr No</th>
                        <th scope="col">Name</th>
                        <th scope="col">LOGO</th>
                        <th scope="col">Status</th>
                        <th scope="col">Hard Delete</th>
                        <th scope="col">Edit</th>
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
                        currentdata.map((element, index) => (
                          <tr key={element._id}>
                            <td className="ps-4 fw-semibold text-muted">{startindex + index + 1}</td>
                            <td className="fw-bold text-dark">{element.name}</td>
                            <td>
                              <img
                                src={element.logo}
                                width={50}
                                height={50}
                                alt="logo"
                                className="rounded border"
                                style={{ objectFit: "cover" }}
                              />
                            </td>
                            {/* For Soft Delete */}
                            <td>
                              <Switch
                                onChange={() => { SoftDelete(element._id) }}
                                checked={element.status}
                                onColor="#81c408"
                                height={20}
                                width={40}
                                handleDiameter={16}
                                checkedIcon={false}
                                uncheckedIcon={false}
                              />
                            </td>
                            {/* For Hard Delete */}
                            <td>
                              <button
                                onClick={() => { deleteBrand(element._id) }}
                                className="btn btn-link text-danger p-0"
                                style={{ cursor: "pointer" }}
                              >
                                <i className="fa-solid fa-trash-can fa-xl"></i>
                              </button>
                            </td>
                            <td>
                              <button
                                onClick={() => navigate(`/admin/updateBrand/${element._id}`)}
                                className="btn btn-link text-primary p-0"
                                style={{ cursor: "pointer" }}
                              >
                                <i className="fa-solid fa-pen fa-xl"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5 text-muted">
                            No brands found.
                          </td>
                        </tr>
                      )}
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