import React from "react";
import VendorBargainingSection from "./VendorBargainingSection";

export default function VendorBargaining() {
  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">AI Bargaining & Price-Supply Deals</h3>
          <p className="text-muted mb-0">
            Autonomous customer price negotiations monitored and regulated by real-time inventory levels and margin floors.
          </p>
        </div>
      </div>

      <VendorBargainingSection />
    </div>
  );
}
