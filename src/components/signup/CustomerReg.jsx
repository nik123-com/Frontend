import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { register } from "../server/auth"

const ID_CONFIGS = {
  aadhar: {
    label: "Aadhar Card",
    regex: /^\d{12}$/,
    regexDisplay: "/^[0-9]{12}$/",
    maxLength: 12,
    allowedChars: "Numbers only (0-9)",
    example: "123456789012",
    placeholder: "Enter 12-digit Aadhar Number (e.g. 123456789012)",
    hint: "Must be exactly 12 numeric digits",
    errorMessage: "Aadhar Card number must be exactly 12 digits (numeric only).",
    transform: (val) => val.replace(/\D/g, "")
  },
  voter: {
    label: "Voter ID Card",
    regex: /^[A-Z]{3}[0-9]{7}$/,
    regexDisplay: "/^[A-Z]{3}[0-9]{7}$/",
    maxLength: 10,
    allowedChars: "3 Letters + 7 Digits",
    example: "ABC1234567",
    placeholder: "Enter 10-character Voter ID (e.g. ABC1234567)",
    hint: "Must be 3 uppercase letters followed by 7 numeric digits",
    errorMessage: "Voter ID must be 3 letters followed by 7 digits (e.g. ABC1234567).",
    transform: (val) => val.toUpperCase().replace(/[^A-Z0-9]/g, "")
  },
  pan: {
    label: "PAN Card",
    regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    regexDisplay: "/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/",
    maxLength: 10,
    allowedChars: "5 Letters + 4 Digits + 1 Letter",
    example: "ABCDE1234F",
    placeholder: "Enter 10-character PAN Card (e.g. ABCDE1234F)",
    hint: "Must be 5 letters, 4 digits, and 1 letter",
    errorMessage: "PAN Card must be 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).",
    transform: (val) => val.toUpperCase().replace(/[^A-Z0-9]/g, "")
  },
  passport: {
    label: "Passport",
    regex: /^[A-Z][0-9]{7}$/,
    regexDisplay: "/^[A-Z][0-9]{7}$/",
    maxLength: 8,
    allowedChars: "1 Letter + 7 Digits",
    example: "A1234567",
    placeholder: "Enter 8-character Passport Number (e.g. A1234567)",
    hint: "Must start with 1 uppercase letter followed by 7 numeric digits",
    errorMessage: "Passport must start with 1 letter followed by 7 digits (e.g. A1234567).",
    transform: (val) => val.toUpperCase().replace(/[^A-Z0-9]/g, "")
  },
  dl: {
    label: "Driving Licence",
    regex: /^[A-Z]{2}[0-9]{13}$/,
    regexDisplay: "/^[A-Z]{2}[0-9]{13}$/",
    maxLength: 15,
    allowedChars: "2 Letters + 13 Digits",
    example: "DL1420110012345",
    placeholder: "Enter 15-character Driving Licence (e.g. DL1420110012345)",
    hint: "Must be 2 uppercase state code letters followed by 13 digits",
    errorMessage: "Driving Licence must be 2 letters followed by 13 digits (e.g. DL1420110012345).",
    transform: (val) => val.toUpperCase().replace(/[^A-Z0-9]/g, "")
  }
}

export default function CustomerReg() {
  const nav = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [Contact, setContact] = useState("")
  const [GovtID, setGovtID] = useState("")
  const [evidence, setevidence] = useState("aadhar")
  const [Address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [govtIdTouched, setGovtIdTouched] = useState(false)
  const [contactTouched, setContactTouched] = useState(false)

  const currentIdConfig = ID_CONFIGS[evidence] || ID_CONFIGS.aadhar

  const ChangeName = (e) => {
    setName(e.target.value)
  }

  const ChangeEmail = (e) => {
    setEmail(e.target.value)
  }

  const ChangeContact = (e) => {
    const numericVal = e.target.value.replace(/\D/g, "")
    setContact(numericVal)
    if (!contactTouched) setContactTouched(true)
  }

  const ChangeEvidence = (e) => {
    const selectedType = e.target.value
    setevidence(selectedType)
    const config = ID_CONFIGS[selectedType]
    if (config) {
      setGovtID(config.transform(GovtID).slice(0, config.maxLength))
    }
    setGovtIdTouched(false)
  }

  const ChangeGovtID = (e) => {
    const rawVal = e.target.value
    const transformed = currentIdConfig.transform(rawVal).slice(0, currentIdConfig.maxLength)
    setGovtID(transformed)
    if (!govtIdTouched) setGovtIdTouched(true)
  }

  const ChangeAddress = (e) => {
    setAddress(e.target.value)
  }

  const ChangePassword = (e) => {
    setPassword(e.target.value)
  }

  const isContactValid = /^[0-9]{10}$/.test(Contact)
  const isGovtIdValid = currentIdConfig.regex.test(GovtID)

  const handleForm = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name.")
      return
    }

    if (!email.trim()) {
      toast.error("Please enter your email.")
      return
    }

    if (!password) {
      toast.error("Please enter password.")
      return
    }

    if (!isContactValid) {
      toast.error("Contact number must be exactly 10 digits.")
      setContactTouched(true)
      return
    }

    if (!isGovtIdValid) {
      toast.error(currentIdConfig.errorMessage)
      setGovtIdTouched(true)
      return
    }

    if (!Address.trim()) {
      toast.error("Please enter your address.")
      return
    }

    let data = {
      name: name,
      email: email,
      Contact: Contact,
      evidence: evidence,
      GovtID: GovtID,
      Address: Address,
      password: password
    }

    register(data)
      .then((res) => {
        toast.success("Registered Successfully")
        nav("/login")
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Registration failed")
      })
  }

  return (
    <>
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
      <div className="container-fluid contact py-5">
        <div className="container py-5">
          <div className="p-5 bg-light rounded">
            <div className="row g-4 justify-content-center">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                  <h1 className="text-primary">Customer Registration Form</h1>
                </div>
              </div>
              <div className="col-lg-7">
                <form onSubmit={handleForm}>
                  <div className="mb-4">
                    <input
                      type="text"
                      className="w-100 form-control border-0 py-3"
                      placeholder="Your Name"
                      onChange={ChangeName}
                      value={name}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="email"
                      className="w-100 form-control border-0 py-3"
                      placeholder="Enter Your Email"
                      onChange={ChangeEmail}
                      value={email}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="password"
                      className="w-100 form-control border-0 py-3"
                      placeholder="Enter Password"
                      onChange={ChangePassword}
                      value={password}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="tel"
                      className={`w-100 form-control border-0 py-3 ${contactTouched && !isContactValid ? "border border-danger text-danger" : ""
                        }`}
                      placeholder="Enter Your 10-Digit Contact Number"
                      onChange={ChangeContact}
                      value={Contact}
                      maxLength={10}
                      required
                    />
                    {contactTouched && !isContactValid && (
                      <small className="text-danger d-block mt-1 ps-1 fw-bold">
                        <i className="fa fa-exclamation-circle me-1"></i>
                        Contact number must be exactly 10 digits.
                      </small>
                    )}
                    {Contact && isContactValid && (
                      <small className="text-success d-block mt-1 ps-1 fw-bold">
                        <i className="fa fa-check-circle me-1"></i>
                        Valid 10-digit phone number.
                      </small>
                    )}
                  </div>

                  {/* ID Proof Selection */}
                  <div className="mb-3">
                    <label className="fw-bold text-dark mb-2">Select Government ID Type:</label>
                    <select
                      className="w-100 form-control border-1 py-3 bg-white"
                      onChange={ChangeEvidence}
                      value={evidence}
                    >
                      <option value="aadhar">Aadhar Card</option>
                      <option value="voter">Voter ID Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="dl">Driving Licence</option>
                    </select>
                  </div>

                  {/* Dynamic Regex Info Box */}
                  <div className="p-3 mb-3 bg-white rounded border border-primary-subtle shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-primary px-3 py-2 fs-6">
                        <i className="fa fa-id-card me-1"></i> {currentIdConfig.label} Validation Rules
                      </span>
                      <span className="badge bg-dark font-monospace px-2 py-1 fs-6">
                        Regex: {currentIdConfig.regexDisplay}
                      </span>
                    </div>
                    <div className="small text-secondary">
                      <div>
                        <strong>Allowed Characters:</strong> {currentIdConfig.allowedChars}
                      </div>
                      <div>
                        <strong>Format Hint:</strong> {currentIdConfig.hint}
                      </div>
                      <div>
                        <strong>Example:</strong>{" "}
                        <code className="text-primary font-monospace fs-6">{currentIdConfig.example}</code>
                      </div>
                    </div>
                  </div>

                  {/* Government ID Input */}
                  <div className="mb-4">
                    <div className="position-relative">
                      <input
                        type="text"
                        className={`w-100 form-control border-0 py-3 ${govtIdTouched && !isGovtIdValid
                            ? "border border-danger text-danger"
                            : GovtID && isGovtIdValid
                              ? "border border-success text-success"
                              : ""
                          }`}
                        placeholder={currentIdConfig.placeholder}
                        onChange={ChangeGovtID}
                        value={GovtID}
                        maxLength={currentIdConfig.maxLength}
                        required
                      />
                      {GovtID && (
                        <span
                          className="position-absolute end-0 top-50 translate-middle-y me-3"
                          style={{ pointerEvents: "none" }}
                        >
                          {isGovtIdValid ? (
                            <i className="fa fa-check-circle text-success fs-5"></i>
                          ) : (
                            <i className="fa fa-times-circle text-danger fs-5"></i>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Dynamic Error / Success Message */}
                    {govtIdTouched && !isGovtIdValid && (
                      <small className="text-danger d-block mt-1 ps-1 fw-bold">
                        <i className="fa fa-exclamation-circle me-1"></i>
                        {currentIdConfig.errorMessage}
                      </small>
                    )}
                    {GovtID && isGovtIdValid && (
                      <small className="text-success d-block mt-1 ps-1 fw-bold">
                        <i className="fa fa-check-circle me-1"></i>
                        Valid {currentIdConfig.label} format!
                      </small>
                    )}
                  </div>

                  <div className="mb-4">
                    <textarea
                      className="w-100 form-control border-0"
                      rows={4}
                      placeholder="Your Address"
                      onChange={ChangeAddress}
                      value={Address}
                      required
                    />
                  </div>

                  <button
                    className="w-100 btn form-control border-secondary py-3 bg-white text-primary fw-bold"
                    type="submit"
                  >
                    Submit Registration
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}
    </>
  )
}