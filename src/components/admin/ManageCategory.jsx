import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
// React Paging 
import ResponsivePagination from "react-responsive-pagination";
import { allCategory, DeleteOne, softDelete } from "../server/Category";

export default function ManageCategory() {

  const [data, setdata] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // React Paging
  const [currentpage, setcurrentpage] = useState(1);
  const [totalpages, settotalpages] = useState(1);
  const limit = 2;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = () => {
    // setLoading(true);

    allCategory(data).then((res) => {
      console.log(res.data.data);
      setdata(res.data.data);
      settotalpages(Math.ceil(res.data.data.length / limit));

    })
      .catch((err) => {
        console.log(err);

      });
  };

  // Soft Delete(Status updated)
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
        toast.warning(res.data.message);
      } else {
        toast.success(res.data.message);
      }
    }).catch((err) => {
      toast.error(err);
    })
  }
  //For Deleting
  const deleteCategory = (id) => {
    const data2 = {
      _id: id,
    };
    DeleteOne(data2).then((res) => {
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message);

      } else {
        toast.warning(res.data.message);
      }
      fetch();
    })
      .catch((err) => {
        console.log(err);
        toast.error(err)
      })
  }

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
      <br />
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Manage Category
                  </h1>
                  <table class="table border">
                    <thead>
                      <tr>
                        <th scope="col">Sr No</th>
                        <th scope="col">Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Image</th>
                        <th scope="col">Status</th>
                        <th scope="col">Hard Delete</th>
                        <th scope="col">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentdata.map((element, index) => (
                        <tr>
                          <td>{index + 1}</td>
                          <td>{element.name}</td>
                          <td>{element.description}</td>
                          <td><img src={element.image} width={50} height={50} alt="Image" /></td>
                          <td><Switch onChange={() => { SoftDelete(element._id) }} checked={element.status} /></td>
                          <td><button onClick={() => { deleteCategory(element._id); }} style={{ border: "none", cursor: "pointer" }}><i class="fa-solid fa-trash-can fa-2x"></i></button></td>
                          <td><button onClick={() => navigate(`/admin/updateCategory/${element._id}`)} style={{ border: "none", cursor: "pointer" }}><i class="fa-solid fa-pen fa-2x"></i></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* React Paging  */}
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
      </div>

    </>
  );
};