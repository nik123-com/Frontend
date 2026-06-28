import { useEffect, useState } from "react";
import Switch from "react-switch";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { allProduct, DeleteOne, softDelete } from "../server/Product";
import { HashLoader } from "react-spinners";
// React Paging 
import ResponsivePagination from "react-responsive-pagination";

export default function ManageProduct() {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentpage, setcurrentpage] = useState(1);
  const [totalpages, settotalpages] = useState(1);
  const limit = 2;

  const navigate = useNavigate();
  useEffect(() => {
    fetch()
  }, []);
  const fetch = () => {
    allProduct()
      .then((res) => {
        console.log(res);
        const productsList = res.data.data || [];
        setdata(productsList);
        settotalpages(Math.ceil(productsList.length / limit));
      })
      .catch((error) => {
        toast.error(error.message)
      });
  };

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
  const deleteProduct = (id) => {
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
      });
  }

  const startindex = (currentpage - 1) * limit;
  const endindex = startindex + limit;
  const currentdata = data ? data.slice(startindex, endindex) : [];

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
                    Manage Product
                  </h1>
                </div>
                <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th scope="col" className="ps-4">Sr No</th>
                        <th scope="col">Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Image</th>
                        <th scope="col">Price</th>
                        <th scope="col">Category</th>
                        <th scope="col">Brand</th>
                        <th scope="col">Status</th>
                        <th scope="col">Delete</th>
                        <th scope="col">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentdata.map((element, index) => (
                        <tr key={element?._id}>
                          <td className="ps-4 fw-semibold text-muted">{startindex + index + 1}</td>
                          <td className="fw-bold text-dark">{element?.name}</td>
                          <td className="text-muted text-truncate" style={{ maxWidth: "180px" }} title={element?.description}>
                            {element?.description}
                          </td>
                          <td>
                            <img
                              src={element?.image}
                              width={60}
                              height={60}
                              alt="Image"
                              className="rounded border"
                              style={{ objectFit: "cover" }}
                            />
                          </td>
                          <td className="fw-bold">₹{(element.price || 0).toLocaleString("en-IN")}</td>
                          <td>{element?.category_id?.name || "N/A"}</td>
                          <td>{element?.brand_id?.name || "N/A"}</td>
                          <td>
                            <Switch
                              onChange={() => { SoftDelete(element?._id) }}
                              checked={element.status}
                              onColor="#81c408"
                              height={20}
                              width={40}
                              handleDiameter={16}
                              checkedIcon={false}
                              uncheckedIcon={false}
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => { deleteProduct(element?._id); }}
                              className="btn btn-link text-danger p-0"
                              style={{ cursor: "pointer" }}
                            >
                              <i className="fa-solid fa-trash-can fa-xl"></i>
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() => navigate(`/admin/updateProduct/${element?._id}`)}
                              className="btn btn-link text-primary p-0"
                              style={{ cursor: "pointer" }}
                            >
                              <i className="fa-solid fa-pen fa-xl"></i>
                            </button>
                          </td>
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