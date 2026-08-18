import { useEffect, useState } from "react";
import api from "../../services/api";
import VendorForm from "./VendorForm";
import "./Vendors.css";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // =========================
  // FETCH VENDORS
  // =========================

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/vendors");

      setVendors(response.data);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to load vendors."
        );
      } else if (err.request) {
        setError("Unable to connect to the server.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD WHEN PAGE OPENS
  // =========================

  useEffect(() => {
    fetchVendors();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  // =========================
  // AFTER ADD
  // =========================

  const handleVendorAdded = async () => {
    await fetchVendors();
    handleCloseForm();
  };

  // =========================
  // AFTER UPDATE
  // =========================

  const handleVendorUpdated = async () => {
    await fetchVendors();
    handleCloseForm();
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteVendor = async (vendor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vendor.vendorName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/vendors/${vendor.vendorId}`
      );

      await fetchVendors();
    } catch (err) {
      console.error(
        "Failed to delete vendor:",
        err
      );

      if (err.response) {
        alert(
          err.response.data?.message ||
            "Unable to delete vendor."
        );
      } else {
        alert("Unable to delete vendor.");
      }
    }
  };

  return (
    <div className="vendors-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="vendors-header">

        <div>
          <h1>Vendors</h1>

          <p>
            Manage your software vendors.
          </p>
        </div>

        <button
          className="add-vendor-button"
          onClick={handleAddVendor}
        >
          + Add Vendor
        </button>

      </div>


      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="vendors-message">
          Loading vendors...
        </div>
      )}


      {/* =========================
          ERROR
      ========================= */}

      {error && !loading && (
        <div className="vendors-error">

          <p>{error}</p>

          <button onClick={fetchVendors}>
            Try Again
          </button>

        </div>
      )}


      {/* =========================
          DATA
      ========================= */}

      {!loading && !error && (
        <>

          <div className="vendors-summary">
            Total Vendors:{" "}
            <strong>{vendors.length}</strong>
          </div>


          <div className="vendors-table-container">

            <table className="vendors-table">

              <thead>

                <tr>
                  <th>Vendor Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {vendors.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="empty-message"
                    >
                      No vendors found.
                    </td>
                  </tr>

                ) : (

                  vendors.map((vendor) => (

                    <tr
                      key={vendor.vendorId}
                    >

                      <td>
                        <strong>
                          {vendor.vendorName}
                        </strong>
                      </td>

                      <td>
                        {vendor.contactPerson || "—"}
                      </td>

                      <td>
                        {vendor.email || "—"}
                      </td>

                      <td>
                        {vendor.phone || "—"}
                      </td>

                      <td>
                        {vendor.address || "—"}
                      </td>

                      <td>

                        <button
                          className="action-button"
                          onClick={() =>
                            handleEditVendor(vendor)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="action-button delete"
                          onClick={() =>
                            handleDeleteVendor(vendor)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </>

      )}


      {/* =========================
          FORM
      ========================= */}

      {showForm && (

        <VendorForm
          vendor={editingVendor}

          onClose={handleCloseForm}

          onVendorAdded={handleVendorAdded}

          onVendorUpdated={handleVendorUpdated}
        />

      )}

    </div>
  );
}

export default Vendors;