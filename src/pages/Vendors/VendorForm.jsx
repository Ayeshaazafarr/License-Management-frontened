import { useState } from "react";
import api from "../../services/api";
import "./Vendors.css";

function VendorForm({
  vendor,
  onClose,
  onVendorAdded,
  onVendorUpdated,
}) {
  const [formData, setFormData] = useState({
    vendorName: vendor?.vendorName || "",
    contactPerson: vendor?.contactPerson || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    address: vendor?.address || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.vendorName.trim()) {
      setError("Vendor name is required.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        vendorName: formData.vendorName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      // =========================
      // UPDATE
      // =========================

      if (vendor) {
        const response = await api.put(
          `/api/vendors/${vendor.vendorId}`,
          data
        );

        console.log("Vendor updated:", response.data);

        await onVendorUpdated();
      }

      // =========================
      // CREATE
      // =========================

      else {
        const response = await api.post(
          "/api/vendors",
          data
        );

        console.log("Vendor created:", response.data);

        await onVendorAdded();
      }

    } catch (err) {
      console.error("Vendor save error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Unable to save vendor."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server."
        );
      } else {
        setError(
          "Something went wrong."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-modal-overlay">

      <div className="vendor-modal">

        {/* HEADER */}

        <div className="vendor-modal-header">

          <h2>
            {vendor
              ? "Edit Vendor"
              : "Add Vendor"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="vendor-form-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* VENDOR NAME */}

          <div className="form-group">

            <label>
              Vendor Name *
            </label>

            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              placeholder="e.g. Microsoft"
              disabled={loading}
            />

          </div>

          {/* CONTACT PERSON */}

          <div className="form-group">

            <label>
              Contact Person
            </label>

            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
              disabled={loading}
            />

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. jane@example.com"
              disabled={loading}
            />

          </div>

          {/* PHONE */}

          <div className="form-group">

            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1-555-0100"
              disabled={loading}
            />

          </div>

          {/* ADDRESS */}

          <div className="form-group">

            <label>
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Vendor address"
              rows="3"
              disabled={loading}
            />

          </div>

          {/* BUTTONS */}

          <div className="vendor-form-actions">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : vendor
                  ? "Update Vendor"
                  : "Save Vendor"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default VendorForm;