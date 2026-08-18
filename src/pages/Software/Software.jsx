
import { useEffect, useState } from "react";
import api from "../../services/api";
import SoftwareForm from "./SoftwareForm";
import "./Software.css";

function Software() {
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState(null);

  // =========================
  // FETCH SOFTWARE
  // =========================

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/software");

      setSoftware(response.data);
    } catch (err) {
      console.error("Failed to fetch software:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to load software."
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
  // LOAD SOFTWARE
  // =========================

  useEffect(() => {
    fetchSoftware();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAddSoftware = () => {
    setEditingSoftware(null);
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEditSoftware = (item) => {
    setEditingSoftware(item);
    setShowForm(true);
  };

  // =========================
  // CLOSE
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSoftware(null);
  };

  // =========================
  // AFTER ADD
  // =========================

  const handleSoftwareAdded = async () => {
    await fetchSoftware();
    handleCloseForm();
  };

  // =========================
  // AFTER UPDATE
  // =========================

  const handleSoftwareUpdated = async () => {
    await fetchSoftware();
    handleCloseForm();
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteSoftware = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.softwareName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/software/${item.softwareId}`
      );

      await fetchSoftware();
    } catch (err) {
      console.error(
        "Failed to delete software:",
        err
      );

      if (err.response) {
        alert(
          err.response.data?.message ||
            "Unable to delete software."
        );
      } else {
        alert("Unable to delete software.");
      }
    }
  };

  return (
    <div className="software-page">

      {/* HEADER */}

      <div className="software-header">

        <div>
          <h1>Software</h1>

          <p>
            Manage your software applications and vendors.
          </p>
        </div>

        <button
          className="add-software-button"
          onClick={handleAddSoftware}
        >
          + Add Software
        </button>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="software-message">
          Loading software...
        </div>
      )}


      {/* ERROR */}

      {error && !loading && (
        <div className="software-error">

          <p>{error}</p>

          <button onClick={fetchSoftware}>
            Try Again
          </button>

        </div>
      )}


      {/* DATA */}

      {!loading && !error && (
        <>

          <div className="software-summary">
            Total Software:{" "}
            <strong>{software.length}</strong>
          </div>


          <div className="software-table-container">

            <table className="software-table">

              <thead>

                <tr>
                  <th>Software Name</th>
                  <th>Version</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>License Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {software.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="empty-message"
                    >
                      No software found.
                    </td>
                  </tr>

                ) : (

                  software.map((item) => (

                    <tr
                      key={item.softwareId}
                    >

                      <td>
                        <strong>
                          {item.softwareName}
                        </strong>
                      </td>

                      <td>
                        {item.version || "—"}
                      </td>

                      <td>
                        {item.category || "—"}
                      </td>

                      <td>
                        {item.vendor?.vendorName || "—"}
                      </td>

                      <td>
                        {item.licenseType || "—"}
                      </td>

                      <td>
                        {item.description || "—"}
                      </td>

                      <td>

                        <button
                          className="action-button"
                          onClick={() =>
                            handleEditSoftware(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="action-button delete"
                          onClick={() =>
                            handleDeleteSoftware(item)
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


      {/* FORM */}

      {showForm && (

        <SoftwareForm
          software={editingSoftware}

          onClose={handleCloseForm}

          onSoftwareAdded={handleSoftwareAdded}

          onSoftwareUpdated={handleSoftwareUpdated}
        />

      )}

    </div>
  );
}

export default Software;
