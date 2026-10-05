import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../server/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const ChangeEmail = (e) => setEmail(e.target.value);
  const ChangePassword = (e) => setPassword(e.target.value);

  // Form Submission
  const handleForm = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please Fill your email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please Enter Password");
      return;
    }

    let data = { email, password };

    setLoading(true);

    login(data)
      .then((res) => {
        if (res.data.success) {
          sessionStorage.setItem("userId", res.data.data.userId);
          sessionStorage.setItem("userId.name", res.data.data.name);
          sessionStorage.setItem("email", res.data.data.email);
          sessionStorage.setItem("userType", res.data.data.userType);
          sessionStorage.setItem("token", res.data.token);
          sessionStorage.setItem("isLogin", true);

          toast.success("Login Successfully");

          if (res.data.data.userType == 1) {
            nav("/admin");
          } else if (res.data.data.userType == 3) {
            nav("/vendor");
          } else {
            nav("/");
          }
        } else {
          toast.error(res.data.massage || res.data.message || "User not Found");
        }
      })
      .catch(() => {
        toast.error("Server is not Running");
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
    <div
      className="container-fluid py-2 py-md-3"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        <div
          className="p-4 p-md-5 shadow-sm"
          style={{ backgroundColor: "#f4f6f8", borderRadius: "18px" }}
        >
          <div className="mx-auto" style={{ maxWidth: "750px" }}>
            {/* Logo */}
            <div className="text-center mb-3">
              <img
                src="/assets/img/Logo.png"
                alt="Aventra Logo"
                style={{ height: "50px", objectFit: "contain" }}
              />
            </div>

            {/* Title */}
            <h1
              className="text-center fw-bold mb-4"
              style={{ color: "#78c214", fontSize: "38px", letterSpacing: "-0.5px" }}
            >
              Login
            </h1>

            <form onSubmit={handleForm}>
              {/* Email Input */}
              <div className="position-relative mb-3">
                <input
                  type="email"
                  className="form-control shadow-sm border-0 py-3 px-4 w-100"
                  placeholder="Enter Your Email "
                  onChange={ChangeEmail}
                  value={email}
                  required
                  style={{
                    borderRadius: "10px",
                    fontSize: "15px",
                    paddingRight: "50px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
                  }}
                />
                <span
                  className="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center"
                  style={{ pointerEvents: "none" }}
                >
                  {/* <i className="fa-solid fa-envelope" style={{ color: "#00a884", fontSize: "16px" }}></i> */}
                </span>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <input
                  type="password"
                  className="form-control shadow-sm border-0 py-3 px-4 w-100"
                  placeholder="Enter Your Password"
                  onChange={ChangePassword}
                  value={password}
                  required
                  style={{
                    borderRadius: "10px",
                    fontSize: "15px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
                  }}
                />
              </div>

              {/* Forgot Password Link */}
              <div className="d-flex justify-content-end mb-3">
                <Link
                  to="/forgot-password"
                  className="fw-semibold text-decoration-none"
                  style={{ color: "#78c214", fontSize: "15px" }}
                >
                  Forgot Password
                </Link>
              </div>

              {/* Login Button */}
              <button
                className="w-100 btn py-3 text-white fw-bold shadow-sm mb-3"
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#78c214",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <hr style={{ borderColor: "#e5e7eb", margin: "25px 0 20px 0" }} />

            {/* Footer Link */}
            <div className="text-center d-flex flex-column gap-2" style={{ fontSize: "15px", color: "#6b7280" }}>
              <div>
                Don't have an account?{" "}
                <Link
                  to="/customerReg"
                  className="fw-bold text-decoration-none"
                  style={{ color: "#78c214" }}
                >
                  Register as Customer
                </Link>
              </div>
              <div>
                Want to sell with us?{" "}
                <Link
                  to="/vendor/register"
                  className="fw-bold text-decoration-none"
                  style={{ color: "#78c214" }}
                >
                  Become a Vendor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
