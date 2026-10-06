import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { register } from "../server/auth"
import { formatContact, sanitizePhoneNumber, validatePhoneNumber } from "../../utils/countryCodes"
import PhoneInputLayout from "../common/PhoneInputLayout"

export default function CustomerReg() {
  const nav = useNavigate();

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneDigits, setPhoneDigits] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [GovtID, setGovtID] = useState("")
  const [evidence, setevidence] = useState("aadhar")
  const [Address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const ChangeName = (e) => {
    setName(e.target.value)
  }

  const ChangeEmail = (e) => {
    setEmail(e.target.value)
  }

  const handlePhoneChange = (e) => {
    const sanitized = sanitizePhoneNumber(e.target.value);
    setPhoneDigits(sanitized);
    if (!sanitized) {
      setPhoneError("Contact / Mobile number is required");
    } else if (sanitized.length < 10) {
      setPhoneError(`Contact number must be exactly 10 digits (currently ${sanitized.length})`);
    } else {
      setPhoneError("");
    }
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
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter password");
      return;
    }

    const phoneValidation = validatePhoneNumber(phoneDigits, true);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      toast.error(phoneValidation.error);
      return;
    }

    if (!GovtID.trim()) {
      toast.error("Please enter Government ID proof");
      return;
    }
    if (!Address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    const formattedContact = formatContact(countryCode, phoneDigits);

    let data = {
      name: name.trim(),
      email: email.trim(),
      Contact: formattedContact,
      countryCode: countryCode,
      evidence: evidence,
      GovtID: GovtID.trim(),
      Address: Address.trim(),
      password: password
    };

    setSubmitting(true);
    register(data)
      .then((res) => {
        if (res.data && res.data.success) {
          toast.success("Registered Successfully!");
          nav("/login");
        } else {
          const msg = Array.isArray(res.data?.message)
            ? res.data.message.join(", ")
            : (res.data?.message || "Registration failed");
          toast.error(msg);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Registration failed. Please try again.");
      })
      .finally(() => {
        setSubmitting(false);
      });
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
                  <PhoneInputLayout
                    label="Contact / Mobile Number"
                    countryCode={countryCode}
                    phoneDigits={phoneDigits}
                    phoneError={phoneError}
                    onCountryCodeChange={(e) => setCountryCode(e.target.value)}
                    onPhoneChange={handlePhoneChange}
                    placeholder="9779843211"
                    required={true}
                    className="mb-4"
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
                    className="w-100 btn form-control border-secondary py-3 bg-white text-primary fw-bold"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting Registration..." : "Submit"}
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