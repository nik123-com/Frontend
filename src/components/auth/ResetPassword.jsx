import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { baseUrl } from '../endpoints';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Both password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/resetPassword/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error(error);
      toast.error('Internal server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <br /><br /><br />
    <div className="container mt-5 mb-5 pt-5 pb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 rounded-4 p-4">
            <h2 className="text-center mb-4" style={{ color: 'var(--primary-color, #0d6efd)' }}>Reset Password</h2>
            <p className="text-center text-muted mb-4">Enter your new password below.</p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group mb-3">
                <label htmlFor="newPassword" className="form-label fw-bold">New Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg bg-light"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-bold">Confirm Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg bg-light"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
