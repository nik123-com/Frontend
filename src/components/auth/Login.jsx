import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../server/auth";
import { HashLoader } from "react-spinners";

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
    return captchaInput === captchaText;
  }

  useEffect(() => {
  generateCaptcha();
  }, []);

  //Form Submition

  const handleForm = (e) => {
    e.preventDefault();

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
          toast.error("User not Found");
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
            zIndex: 9999,
          }}
        >
          <HashLoader size={50} color={"green"} />
        </div>
      )}

      <br />

      <div className="container-fluid contact py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 bg-light rounded">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
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
                      className="card shadow"
                      style={{
                        borderRadius: 12,
                        padding: 20,
                        display:"flex",
                        textAlign: "center",
                        width: 300,
                        margin:"10px"
                      }}> 
                      <canvas
                        id="captchaCanvas"
                        width={200}
                        height={50}
                        style={{
                          border: "1px solid #ccc",
                          marginBottom: 10,
                          display:"flex"
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm mb-2"
                        onClick={generateCaptcha}
                      >
                        Refresh
                      </button>

                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter Captcha"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                      />
                    </div>
                  <div className="mb-3  d-flex me-2" style={{gap:"30px"}}>
                    <Link to="/forgot-password">Forgot Password</Link>
                    <Link to="/customerReg">Register</Link>
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