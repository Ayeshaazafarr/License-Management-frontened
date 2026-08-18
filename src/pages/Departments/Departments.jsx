import { useEffect, useState } from "react";
import api from "../../services/api";
import DepartmentForm from "./DepartmentForm";
import "./Departments.css";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  // =========================
  // FETCH DEPARTMENTS
  // =========================

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/departments");

      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to load departments."
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
    fetchDepartments();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  // =========================
  // AFTER ADD
  // =========================

  const handleDepartmentAdded = async () => {
    await fetchDepartments();
    handleCloseForm();
  };

  // =========================
  // AFTER UPDATE
  // =========================

  const handleDepartmentUpdated = async () => {
    await fetchDepartments();
    handleCloseForm();
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteDepartment = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.departmentName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/departments/${department.departmentId}`
      );

      await fetchDepartments();
    } catch (err) {
      console.error(
        "Failed to delete department:",
        err
      );

      if (err.response) {
        alert(
          err.response.data?.message ||
            "Unable to delete department."
        );
      } else {
        alert("Unable to delete department.");
      }
    }
  };

  return (
    <div className="departments-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="departments-header">

        <div>
          <h1>Departments</h1>

          <p>
            Manage your organization departments.
          </p>
        </div>

        <button
          className="add-department-button"
          onClick={handleAddDepartment}
        >
          + Add Department
        </button>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="departments-message">
          Loading departments...
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && !loading && (
        <div className="departments-error">

          <p>{error}</p>

          <button onClick={fetchDepartments}>
            Try Again
          </button>

        </div>
      )}

      {/* =========================
          DATA
      ========================= */}

      {!loading && !error && (
        <>

          <div className="departments-summary">
            Total Departments:{" "}
            <strong>{departments.length}</strong>
          </div>

          <div className="departments-table-container">

            <table className="departments-table">

              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {departments.length === 0 ? (

                  <tr>
                    <td
                      colSpan="3"
                      className="empty-message"
                    >
                      No departments found.
                    </td>
                  </tr>

                ) : (

                  departments.map((department) => (

                    <tr
                      key={department.departmentId}
                    >

                      <td>
                        <strong>
                          {department.departmentName}
                        </strong>
                      </td>

                      <td>
                        {department.description || "—"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="action-button"
                          onClick={() =>
                            handleEditDepartment(department)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="action-button delete"
                          onClick={() =>
                            handleDeleteDepartment(department)
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
        <DepartmentForm
          department={editingDepartment}
          onClose={handleCloseForm}
          onDepartmentAdded={handleDepartmentAdded}
          onDepartmentUpdated={handleDepartmentUpdated}
        />
      )}

    </div>
  );
}

export default Departments;