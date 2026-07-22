import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import { addCategory } from "../server/Category";

export default function Category() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  let [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    const token = sessionStorage.getItem("token");

    const head = {
      Authorization: token
    }
    let data = new FormData()
    data.append("name", name)
    data.append("description", description)
    data.append("image", image)
  addCategory(data).then((res) => {
      console.log(res.data);
      if (res.data.success) {
        toast.success(res.data.message);
        setName("");
        setDescription("");
        setImage("");
        e.target.reset();
      } else {
        toast.warning(res.data.message);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
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
                    Add Category
                  </h1>
                </div>
              </div>
              <div className="col-lg-7 mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Category Name</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control py-3 rounded border-0 bg-white"
                      rows="4"
                      placeholder="Enter category description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Category Image</label>
                    <input
                      type="file"
                      className="form-control py-3 rounded border-0 bg-white"
                      onChange={(e) => setImage(e.target.files[0])}
                    />

                  </div>
                  <button
                    type="submit"
                    className="btn w-100 py-3 text-white fw-bold rounded"
                    style={{ backgroundColor: "#81c408" }}
                  >
                    Add Category
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