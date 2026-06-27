import { useState } from "react";
import { changePassword } from "../server/auth";

const ChangePassword = () => {
  const [old, setOld] = useState("");
  const [newpass, setNewpass] = useState("");
  const [confirm, setConfirm] = useState("");

  const ChangeOld = (e) => {
    setOld(e.target.value);
  };

  const ChangeNew = (e) => {
    setNewpass(e.target.value);
  };

  const ChangeConfirm = (e) => {
    setConfirm(e.target.value);
  };

  const changed = () => {
    if (!old || !newpass || !confirm) {
      alert("All fields are required");
      return;
    }

    if (newpass !== confirm) {
      alert("New Password and Confirm Password do not match");
      return;
    }

    alert("Password Changed Successfully");
    
    changePassword
    console.log({
      oldPassword: old,
      newPassword: newpass,
    });
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
            <div
              className="bg-white shadow p-5"
              style={{ width: "500px", borderRadius: "8px" }}
            >
              <h2 className="mb-3">Change Password</h2>


              <div className="mb-3">
                <input
                  type="password"
                  value={old}
                  onChange={ChangeOld}
                  className="form-control"
                  placeholder="Old Password"
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  value={newpass}
                  onChange={ChangeNew}
                  className="form-control"
                  placeholder="New Password"
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  value={confirm}
                  onChange={ChangeConfirm}
                  className="form-control"
                  placeholder="Confirm Password"
                />
              </div>

              <div className="d-flex gap-3 mb-4">
                <button
                  onClick={changed}
                  className="btn btn-warning text-white"
                >
                  Change Password
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChangePassword;