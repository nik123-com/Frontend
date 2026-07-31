import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_profile } from "../../endpoints";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";

export default function VendorMaster() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("userType");

    if (!token || userType != 3) {
      toast.error("Access denied. Please log in with a Vendor account.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        baseUrl + vendor_profile,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setVendor(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load vendor profile.");
        if (res.data.status === 403 || res.data.status === 401) {
          navigate("/login");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Vendor authorization failed.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status"></div>
          <p className="mt-3 text-muted fw-semibold">Loading Vendor Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      <VendorSidebar vendor={vendor} />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <VendorHeader vendor={vendor} />
        <main className="p-4 flex-grow-1 overflow-auto">
          <Outlet context={{ vendor, reloadVendor: fetchProfile }} />
        </main>
      </div>
    </div>
  );
}
