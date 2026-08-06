import { useState } from "react";
import Swal from "sweetalert2";
import { changePassword } from "../server/auth";

const ChangePassword = () => {
  const savedEmail = sessionStorage.getItem("email") || "";
  const [email, setEmail] = useState(savedEmail);
  const [old, setOld] = useState("");
  const [newpass, setNewpass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const changed = async (e) => {
    if (e) e.preventDefault();

    if (!email || !old || !newpass || !confirm) {
      Swal.fire({
        title: "Validation Error",
        text: "All fields (Email, Old Password, New Password, Confirm Password) are required.",
        icon: "warning",
        confirmButtonColor: "#81c408"
      });
      return;
    }

    if (newpass !== confirm) {
      Swal.fire({
        title: "Password Mismatch",
        text: "New Password and Confirm Password do not match.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({
        email: email,
        oldPassword: old,
        newPassword: newpass,
        confirmPassword: confirm,
      });

      if (res.data && res.data.success) {
        Swal.fire({
          title: "Success!",
          text: res.data.message || "Password Changed Successfully",
          icon: "success",
          confirmButtonColor: "#81c408"
        });
        setOld("");
        setNewpass("");
        setConfirm("");
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || "Failed to change password",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.message || "Internal server error",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <br /><br /><br /><br />
      <div className="container-fluid vh-100 p-0">
        <div className="row g-0 h-100">

          <div
            className="col-md-6 d-flex flex-column justify-content-center align-items-center text-center text-white"
            style={{
              background:
                "linear-gradient(rgba(31,62,151,0.85), rgba(31,62,151,0.85)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            
            <div
              className="bg-white text-dark p-4 rounded shadow"
              style={{ maxWidth: "320px" }}
            >
              <h3 className="text-warning fw-bold">
                WELCOME TO Aventra 
              </h3>

              <p className="mt-3 text-secondary">
                A smart home grown web based ERP solution with all possible
                features ranging from Learning Management System to
                eGovernance.
              </p>
            </div>
          </div>

          <div
            className="col-md-6 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#f7f0f0" }}
          >
            <form
              onSubmit={changed}
              className="bg-white shadow p-5"
              style={{ width: "500px", borderRadius: "8px" }}
            >
              <h2 className="mb-3">Change Password</h2>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter Registered Email"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Current Password</label>
                <input
                  type="password"
                  value={old}
                  onChange={(e) => setOld(e.target.value)}
                  className="form-control"
                  placeholder="Old Password"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">New Password</label>
                <input
                  type="password"
                  value={newpass}
                  onChange={(e) => setNewpass(e.target.value)}
                  className="form-control"
                  placeholder="New Password"
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="form-control"
                  placeholder="Confirm Password"
                />
              </div>

              <div className="d-flex gap-3 mb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-warning text-white fw-bold px-4"
                >
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChangePassword;