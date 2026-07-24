import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../server/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // CAPTCHA STATE
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const nav = useNavigate();

  const ChangeEmail = (e) => setEmail(e.target.value);
  const ChangePassword = (e) => setPassword(e.target.value);

  // ================= CAPTCHA LOGIC =================

  function randomText() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  }

  function drawCaptcha(text) {
    const canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = randomColor();
      ctx.beginPath();
      ctx.moveTo(Math.random() * 180, Math.random() * 60);
      ctx.lineTo(Math.random() * 180, Math.random() * 60);
      ctx.stroke();
    }

    ctx.font = "28px Arial";
    ctx.textBaseline = "middle";

    for (let i = 0; i < text.length; i++) {
      let x = 20 + i * 25;
      let y = 30 + (Math.random() * 10 - 5);
      let angle = Math.random() * 0.5 - 0.25;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = randomDarkColor();
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = randomColor();
      ctx.beginPath();
      ctx.arc(Math.random() * 180, Math.random() * 60, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function randomColor() {
    return `rgb(${rand(0, 255)},${rand(0, 255)},${rand(0, 255)})`;
  }

  function randomDarkColor() {
    return `rgb(${rand(0, 150)},${rand(0, 150)},${rand(0, 150)})`;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function generateCaptcha() {
    const newCaptcha = randomText();
    setCaptchaText(newCaptcha);
    drawCaptcha(newCaptcha);
  }

  function validateCaptcha() {
    return captchaInput.trim().toUpperCase() === captchaText.toUpperCase();
  }

  useEffect(() => {
  generateCaptcha();
  }, []);

  //Form Submition

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
    if (!captchaInput.trim()) {
      toast.error("Please enter captcha to proceed");
      return;
    }
    if (!validateCaptcha()) {
      toast.error("Wrong Captcha");
      generateCaptcha();
      setPassword("");
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

  // ================= UI =================

  return (
    <>
      <br />

      <div className="container-fluid contact py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 bg-light rounded">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                  <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "80px", marginBottom: "15px" }} />
                  <h1 className="text-primary">Login Page</h1>
                </div>
              </div>

              <div className="col-lg-7 mx-auto">
                <form onSubmit={handleForm}>
                  <input
                    type="email"
                    className="w-100 p-3 form-control border-0 py-3 mb-4"
                    placeholder="Enter Your Email"
                    onChange={ChangeEmail}
                    value={email}
                    required
                  />

                  <input
                    type="password"
                    className="w-100 form-control border-0 py-3 mb-4"
                    placeholder="Enter Your Password"
                    onChange={ChangePassword}
                    value={password}
                    required
                  />
                     <div
                      className="card shadow-sm p-3 mb-4 mx-auto"
                      style={{
                        borderRadius: 12,
                        maxWidth: "100%",
                        width: "320px",
                        alignItems: "center"
                      }}> 
                      <canvas
                        id="captchaCanvas"
                        width={200}
                        height={50}
                        className="rounded border mb-2 mw-100"
                        style={{
                          display: "block"
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm mb-2 rounded-pill px-3"
                        onClick={generateCaptcha}
                      >
                        Refresh Captcha
                      </button>

                      <input
                        type="text"
                        className="form-control text-center"
                        placeholder="Enter Captcha"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                      />
                    </div>
                  <div className="mb-3 d-flex justify-content-between flex-wrap gap-2">
                    <Link to="/forgot-password" className="text-success small fw-medium">Forgot Password?</Link>
                    <Link to="/customerReg" className="text-success small fw-medium">New User? Register</Link>
                  </div>
                  

                  <button
                    className="w-100 btn form-control border-primary py-3 bg-primary mt-1 text-light"
                    type="submit"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}