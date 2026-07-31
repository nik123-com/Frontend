import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_invoice } from "../endpoints";

export default function VendorInvoice({ orderId, onClose }) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("invoice"); // 'invoice' | 'packing_slip'

  useEffect(() => {
    if (orderId) {
      const token = sessionStorage.getItem("token");
      axios
        .post(baseUrl + vendor_invoice, { orderId }, { headers: { Authorization: token } })
        .then((res) => {
          if (res.data.success) {
            setInvoiceData(res.data.data);
          } else {
            toast.error(res.data.message || "Failed to load invoice");
          }
        })
        .catch(() => toast.error("Error loading invoice"))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-4 text-center">
            <div className="spinner-border text-primary mx-auto" role="status"></div>
            <p className="mt-2 text-muted">Generating Invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal d-block bg-dark bg-opacity-75 overflow-auto" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          {/* Action Bar (Hidden when printing) */}
          <div className="modal-header bg-light d-print-none">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${viewType === "invoice" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewType("invoice")}
              >
                Tax Invoice
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewType === "packing_slip" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewType("packing_slip")}
              >
                Packing Slip
              </button>
            </div>
            <div>
              <button onClick={handlePrint} className="btn btn-sm btn-success me-2">
                <i className="fa-solid fa-print me-1"></i> Print / Save PDF
              </button>
              <button onClick={onClose} className="btn-close"></button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="modal-body p-4 p-md-5 bg-white text-dark">
            {viewType === "invoice" ? (
              <div>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                  <div>
                    <h2 className="fw-bold text-primary mb-1">{invoiceData?.vendor?.businessName}</h2>
                    <p className="mb-0 text-muted fs-7">{invoiceData?.vendor?.address}</p>
                    <p className="mb-0 text-muted fs-7">
                      Email: {invoiceData?.vendor?.email} | Phone: {invoiceData?.vendor?.phone}
                    </p>
                    {invoiceData?.vendor?.gstNumber && (
                      <p className="mb-0 fw-bold fs-7">GSTIN: {invoiceData?.vendor?.gstNumber}</p>
                    )}
                  </div>
                  <div className="text-end">
                    <h3 className="fw-bold text-dark mb-1">TAX INVOICE</h3>
                    <p className="mb-0 fw-bold">#{invoiceData?.invoiceNo}</p>
                    <p className="mb-0 text-muted fs-7">
                      Date: {new Date(invoiceData?.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Billed To / Shipping Address */}
                <div className="row mb-4">
                  <div className="col-6">
                    <h6 className="fw-bold text-uppercase text-muted fs-7">Customer Details</h6>
                    <p className="fw-bold mb-1">{invoiceData?.customer?.name}</p>
                    <p className="mb-0 text-muted fs-7">{invoiceData?.customer?.email}</p>
                    <p className="mb-0 text-muted fs-7">{invoiceData?.customer?.contact}</p>
                  </div>
                  <div className="col-6 text-end">
                    <h6 className="fw-bold text-uppercase text-muted fs-7">Shipping Address</h6>
                    <p className="mb-0 text-dark fs-7">
                      {invoiceData?.customer?.address?.addressLine1 || "Delivery Location"}
                    </p>
                    <p className="mb-0 text-dark fs-7">
                      {invoiceData?.customer?.address?.city}, {invoiceData?.customer?.address?.state} -{" "}
                      {invoiceData?.customer?.address?.pincode}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="table table-bordered align-middle mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Item Description</th>
                      <th>SKU</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData?.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="fw-bold">{item.name}</td>
                        <td><code>{item.sku}</code></td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">₹{item.price.toLocaleString()}</td>
                        <td className="text-end fw-bold">₹{item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="d-flex justify-content-end mb-4">
                  <div style={{ width: "250px" }}>
                    <div className="d-flex justify-content-between py-1">
                      <span>Subtotal:</span>
                      <span className="fw-bold">₹{invoiceData?.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-top border-2 fw-bold text-dark fs-5">
                      <span>Total Amount:</span>
                      <span>₹{invoiceData?.subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="border-top pt-3 text-center text-muted fs-7">
                  Thank you for shopping with {invoiceData?.vendor?.businessName}! Computer generated tax invoice.
                </div>
              </div>
            ) : (
              /* Packing Slip View */
              <div>
                <div className="text-center border-bottom pb-3 mb-4">
                  <h3 className="fw-bold text-dark mb-0">PACKING SLIP</h3>
                  <p className="text-muted mb-0">Order #{invoiceData?.invoiceNo}</p>
                </div>

                <div className="p-3 bg-light rounded-3 mb-4">
                  <h6 className="fw-bold text-uppercase mb-2">Ship To:</h6>
                  <p className="fw-bold mb-1">{invoiceData?.customer?.name}</p>
                  <p className="mb-0">{invoiceData?.customer?.address?.addressLine1}</p>
                  <p className="mb-0">
                    {invoiceData?.customer?.address?.city}, {invoiceData?.customer?.address?.state} -{" "}
                    {invoiceData?.customer?.address?.pincode}
                  </p>
                  <p className="mb-0 text-muted mt-2">Phone: {invoiceData?.customer?.contact}</p>
                </div>

                <table className="table table-bordered mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th className="text-center">Quantity to Pack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData?.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{item.name}</td>
                        <td><code>{item.sku}</code></td>
                        <td className="text-center fw-bold fs-5">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-top pt-3 d-flex justify-content-between text-muted fs-7">
                  <span>Packed By: ____________________</span>
                  <span>Checked By: ____________________</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
