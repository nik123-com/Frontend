import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "b991fb51-796c-456e-9fbd-d6c361f504ce",
          from_name: formData.name,
          subject: formData.subject || "New Contact Message - Aventra",
          ...formData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Thank you for reaching out! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(result.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Contact Us</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Contact</li>
        </ol>
      </div>
      {/* Single Page Header End */}

      {/* Contact Start */}
      <div className="container-fluid contact py-5">
        <div className="container py-5">
          <div className="p-5 bg-light rounded shadow-sm">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                  <h1 className="text-primary fw-bold">Get in Touch</h1>
                  <p className="mb-4 text-muted">
                    Have any questions, feedback, or need assistance with your orders?
                    Our friendly Aventra customer support team is here to assist you 24/7.
                  </p>
                </div>
              </div>

              {/* Google Map */}
              <div className="col-lg-12">
                <div className="h-100 rounded overflow-hidden shadow-sm">
                  <iframe
                    className="rounded w-100"
                    style={{ height: 400, border: 0 }}
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13636.565980068837!2d75.568469!3d31.310574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5a3a1f81cfcb%3A0xe54e38605ee7a303!2sModel%20Town%2C%20Jalandhar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    loading="lazy"
                    title="Aventra Location - Model Town, Jalandhar"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Contact Form */}
              <div className="col-lg-7">
                <div className="bg-white p-4 rounded shadow-sm h-100">
                  <h4 className="mb-4 text-dark fw-bold">Send Us A Message</h4>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control border py-3 px-3 rounded"
                        placeholder="Your Full Name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control border py-3 px-3 rounded"
                        placeholder="Your Email Address"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-control border py-3 px-3 rounded"
                        placeholder="Subject / Topic (e.g. Order Inquiry, Support)"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-control border px-3 py-3 rounded"
                        rows={5}
                        placeholder="Write your message here..."
                        required
                      ></textarea>
                    </div>

                    <button
                      className="w-100 btn btn-primary py-3 text-white fw-bold rounded shadow-sm"
                      type="submit"
                      disabled={isSubmitting}
                      style={{ transition: "all 0.3s ease" }}
                    >
                      {isSubmitting ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending Message...
                        </span>
                      ) : (
                        <span>
                          <i className="fas fa-paper-plane me-2"></i>
                          Send Message
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Information Cards */}
              <div className="col-lg-5">
                <div className="d-flex flex-column gap-3 h-100 justify-content-between">
                  {/* Address */}
                  <a
                    href="https://maps.app.goo.gl/J85uiPMzs2s3Vfu1A"
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none text-dark"
                  >
                    <div className="d-flex p-4 rounded bg-white shadow-sm align-items-center h-100" style={{ transition: "transform 0.2s ease" }}>
                      <div
                        className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3 flex-shrink-0"
                        style={{ width: "55px", height: "55px" }}
                      >
                        <i className="fas fa-map-marker-alt fa-lg text-white" />
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-dark">Our Store Location</h5>
                        <p className="mb-0 text-muted">123 Model Town, Jalandhar, Punjab</p>
                      </div>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:admin@gmail.com"
                    className="text-decoration-none text-dark"
                  >
                    <div className="d-flex p-4 rounded bg-white shadow-sm align-items-center h-100" style={{ transition: "transform 0.2s ease" }}>
                      <div
                        className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3 flex-shrink-0"
                        style={{ width: "55px", height: "55px" }}
                      >
                        <i className="fas fa-envelope fa-lg text-white" />
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-dark">Mail Us</h5>
                        <p className="mb-0 text-muted">admin@gmail.com</p>
                      </div>
                    </div>
                  </a>

                  {/* Phone */}
                  <a
                    href="tel:+012345678910"
                    className="text-decoration-none text-dark"
                  >
                    <div className="d-flex p-4 rounded bg-white shadow-sm align-items-center h-100" style={{ transition: "transform 0.2s ease" }}>
                      <div
                        className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3 flex-shrink-0"
                        style={{ width: "55px", height: "55px" }}
                      >
                        <i className="fa fa-phone-alt fa-lg text-white" />
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-dark">Call Us</h5>
                        <p className="mb-0 text-muted">+0123 4567 8910 / Mon - Sat, 9am - 8pm</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}
    </>
  );
}