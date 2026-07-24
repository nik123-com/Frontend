import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
// Use of Axios for Link with Backend
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { register } from "../server/auth"


export default function CustomerReg() {

  const nav = useNavigate();

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [Contact, setContact] = useState("")
  const [GovtID, setGovtID] = useState("")
  const [evidence, setevidence] = useState("aadhar")
  const [Address, setAddress] = useState("")
  const [password, setPassword] = useState("")

  const ChangeName = (e) => {
    setName(e.target.value)
  }

  const ChangeEmail = (e) => {
    setEmail(e.target.value)
  }
  const ChangeContact = (e) => {
    setContact(e.target.value)
  }
  const ChangeEvidence = (e) => {
    setevidence(e.target.value)
  }
  const ChangeGovtID = (e) => {
    setGovtID(e.target.value)
  }
  const ChangeAddress = (e) => {
    setAddress(e.target.value)
  }
  const ChangePassword = (e) => {
    setPassword(e.target.value)
  }


  const handleForm = (e) => {
    e.preventDefault()
    let data = {
      name: name,
      email: email,
      Contact: Contact,
      evidence: evidence,
      GovtID: GovtID,
      Address: Address,
      password: password
    }

    console.log(data);


    register(data).then((res) => {
      console.log(res);
      toast.success("Registered Successfully");
      nav("/login")


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
        <h1 className="text-center text-white display-6">Customer Registration</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Form</li>
        </ol>
      </div>
      {/* Single Page Header End */}
      {/* Contact Start */}
      <div className="container-fluid contact py-3 py-md-5">
        <div className="container py-3 py-md-4">
          <div className="p-3 p-sm-4 p-md-5 bg-light rounded-4 shadow-sm">
            <div className="row g-4 justify-content-center">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                  <h1 className="text-primary">Customer Registration Form</h1>
                </div>
              </div>
              <div className="col-12 col-md-10 col-lg-8">
                <form onSubmit={handleForm}>
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Your Name"
                    onChange={ChangeName}
                    value={name}
                  />
                  <input
                    type="email"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Your Email"
                    onChange={ChangeEmail}
                    value={email}
                  />
                  <input
                    type="password"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Password"
                    onChange={ChangePassword}
                    value={password}
                  />
                  <input
                    type="tel"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Your contact"
                    onChange={ChangeContact}
                    value={Contact}
                    maxLength={"10"}
                  />
                  <select
                    className="w-100 form-control border-1 py-3 mb-4 bg-white"
                    onChange={(e) => {
                      setevidence(e.target.value)
                    }}
                    value={evidence}>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="voter">Voter ID Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="dl">Driving Licence</option>
                  </select>
                  <input
                    type="String"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Goverment ID Proof"
                    onChange={ChangeGovtID}
                    value={GovtID}
                  />
                  <textarea
                    className="w-100 form-control border-0 mb-4"
                    rows={5}
                    cols={10}
                    placeholder="Your Address"
                    onChange={ChangeAddress}
                    value={Address}
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
        to="/customerReg"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </Link>
    </>
  )
}