import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { Navigate, useNavigate } from "react-router-dom";
import { allBrand, HardDelete, softDelete } from "../server/Brand";
import { HashLoader } from "react-spinners";
// React Paging 
import ResponsivePagination from "react-responsive-pagination";

export default function ManageBrand() {
  const [data, setdata] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // React Paging
  const [currentpage, setcurrentpage] = useState(1);
  const [totalpages, settotalpages] = useState(1);
  const limit = 2;

  const fetch = () => {
    allBrand(data).then((res) => {
      console.log(res);
      setdata(res.data.data);
    }).catch((err) => {
      status: 200
      success: false
      message: err
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
      toast.error(err);
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
        console.log(err)
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
                    Manage brand
                  </h1>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Sr No</th>
                        <th scope="col">Name</th>
                        <th scope="col">LOGO</th>
                        <th scope="col">Status</th>
                        <th scope="col">Hard Delete</th>
                        <th scope="col">Edit</th>

                      </tr>
                    </thead>
                    <tbody>
                      {data?.map((element, index) => (
                        <tr>
                          <td>{index + 1}</td>
                          <td>{element.name}</td>
                          <td><img src={element.logo} width={50} height={50} alt="logo" /></td>
                          {/* For Soft Delete */}
                          <td><Switch onChange={() => { SoftDelete(element._id) }} checked={element.status} /></td>
                          {/* For Hard Delete */}
                          <td><button onClick={() => { deleteBrand(element._id) }} style={{ border: "none", cursor: "pointer" }}><i class="fa-solid fa-trash-can fa-2x"></i></button></td>
                          <td><button onClick={() => navigate(`/admin/updateBrand/${element._id}`)} style={{ border: "none", cursor: "pointer" }}><i class="fa-solid fa-pen fa-2x"></i></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ResponsivePagination
                  className="d-flex"
                  onPageChange={setcurrentpage}
                  total={totalpages}
                  current={currentpage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};