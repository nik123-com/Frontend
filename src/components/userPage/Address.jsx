import { useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { Link } from "react-router-dom"
import { addAddress } from "../server/Address"


export default function Address() {


  const [houseno, setHouseno] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [pin, setPin] = useState("")
  const [landmark, setLandmark] = useState("")
  const [contact, setContact] = useState("")
  const [altercontact, setAltercontact] = useState("")
  const editbyid = sessionStorage.getItem("userId")
  const ChangeHouseno = (e) => {
    setHouseno(e.target.value)
  }

  const ChangeCity = (e) => {
    setCity(e.target.value)
  }
  const ChangeDistrict = (e) => {
    setDistrict(e.target.value)
  }
  const ChangeState = (e) => {
    setState(e.target.value)
  }
  const ChangeCountry = (e) => {
    setCountry(e.target.value)
  }
  const ChangePin = (e) => {
    setPin(e.target.value)
  }
  const ChangeLandmark = (e) => {
    setLandmark(e.target.value)
  }
  const ChangeContact = (e) => {
    setContact(e.target.value)
  }
  const ChangeAltercontact = (e) => {
    setAltercontact(e.target.value)
  }
  


  const handleForm = (e) => {
    e.preventDefault()
    let data = {
      houseno,
      city,
      district,
      state,
      country,
      pin,
      landmark,
      contact,
      altercontact,
      editbyid
    }

    console.log(data);


    addAddress(data).then((res) => {
      console.log(res);
      toast.success("Address Added Successfully !");

    }).catch((err) => {
      console.log(err);
    })
  }

  return (
    <>
      <div
        className="modal fade"
        id="searchModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Search by keyword
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body d-flex align-items-center">
              <div className="input-group w-75 mx-auto d-flex">
                <input
                  type="search"
                  className="form-control p-3"
                  placeholder="keywords"
                  aria-describedby="search-icon-1"
                />
                <span id="search-icon-1" className="input-group-text p-3">
                  <i className="fa fa-search" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Search End */}
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Address</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <a href="#">Address</a>
          </li>
          <li className="breadcrumb-item active text-white">Form</li>
        </ol>
      </div>
      {/* Single Page Header End */}
      {/* Contact Start */}
      <div className="container-fluid contact py-5">
        <div className="container py-5">
          <div className="p-5 bg-light rounded">
            <div className="row g-4 justify-content-center">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                  <h1 className="text-primary">Address Panel</h1>
                </div>
              </div>
              <div className="col-lg-7">
                <form onSubmit={handleForm}>
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter House Number"
                    onChange={ChangeHouseno}
                    value={houseno}
                  />
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Your City"
                    onChange={ChangeCity}
                    value={city}
                  />
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter District"
                    onChange={ChangeDistrict}
                    value={district}
                  />
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Your State"
                    onChange={ChangeState}
                    value={state}
                  />
                  <input
                    type="String"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Country"
                    onChange={ChangeCountry}
                    value={country}
                  />
                  <input
                    type="String"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="PIN Code"
                    onChange={ChangePin}
                    value={pin}
                  />
                  <input
                    type="String"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Land Mark"
                    onChange={ChangeLandmark}
                    value={landmark}
                  />
                  <input
                    type="tel"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter your Contact"
                    onChange={ChangeContact}
                    value={contact}
                    maxLength={10}
                  />
                  <input
                    type="tel"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Alter Contact"
                    onChange={ChangeAltercontact}
                    value={altercontact}
                    maxLength={10}
                  />

                  <button
                    className="w-100 btn form-control border-secondary py-3 bg-white text-primary "
                    type="submit"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}
      {/* Back to Top */}
      <Link
        to="/address"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
      >
        <i className="fa fa-arrow-up" />
      </Link>
    </>
  )
}