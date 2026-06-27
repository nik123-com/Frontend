import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { singleBrand, updateBrand } from '../server/Brand';

function UpdateBrand() {
  const navigate = useNavigate();

  const {_id} = useParams();

  const [name, setName] = useState("");
  const [logo, setLogo] = useState();

  const getSingleBrand = async () => {
    try {
      const res = await singleBrand({_id:_id});

      if (res.data.success) {
        setName(res.data.data.name);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSingleBrand();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData()

      formData.append("_id", _id);
      formData.append("name",name)
      if (logo) {
        formData.append("logo", logo);
      }

      const res = await updateBrand(formData);
      if (res.data.success) {
        toast.error(res.data.message)
      }
      else {
        toast.success(res.data.message)
        navigate("/admin/managebrand");
      }

    }
    catch (err) {
      console.log(err);
    }
  }
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
                    Update Brand
                  </h1>
                </div>
              </div>
              <div className="col-lg-7 mx-auto">
                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Brand Name</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter Brand name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Logo</label>
                    <input
                      type="file"
                      className="form-control py-3 rounded border-0 bg-white"
                      onChange={(e) => setLogo(e.target.files[0])}
                    />

                  </div>
                  <button
                    type="submit"
                    className="btn w-100 py-3 text-white fw-bold rounded"
                    style={{ backgroundColor: "#81c408" }}
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}
export default UpdateBrand