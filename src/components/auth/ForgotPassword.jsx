import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error(error);
      toast.error('Internal server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 mb-5 pt-5 pb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 rounded-4 p-4">
            <h2 className="text-center mb-4" style={{ color: 'var(--primary-color)' }}>Forgot Password</h2>
            <p className="text-center text-muted mb-4">Enter your registered email to receive a password reset link.</p>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group mb-4">
                <label htmlFor="email" className="form-label fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg bg-light"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                disabled={loading}
                style={{ borderRadius: '10px', backgroundColor: 'var(--primary-color, #0d6efd)' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
            <div className="text-center mt-4">
              <a href="/Login" className="text-decoration-none fw-bold" style={{ color: 'var(--primary-color, #0d6efd)' }}>
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
