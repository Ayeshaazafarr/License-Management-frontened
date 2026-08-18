import { useState } from "react";
import api from "../../services/api";
import "./Departments.css";

function DepartmentForm({
  department,
  onClose,
  onDepartmentAdded,
  onDepartmentUpdated,
}) {
  const [formData, setFormData] = useState({
    departmentName: department?.departmentName || "",
    description: department?.description || "",
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

    if (!formData.departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        departmentName: formData.departmentName.trim(),
        description: formData.description.trim(),
      };

      // =========================
      // UPDATE
      // =========================

      if (department) {
        const response = await api.put(
          `/api/departments/${department.departmentId}`,
          data
        );

        console.log(
          "Department updated:",
          response.data
        );

        await onDepartmentUpdated();
      }

      // =========================
      // CREATE
      // =========================

      else {
        const response = await api.post(
          "/api/departments",
          data
        );

        console.log(
          "Department created:",
          response.data
        );

        await onDepartmentAdded();
      }

    } catch (err) {
      console.error(
        "Department save error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to save department."
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
    <div className="department-modal-overlay">

      <div className="department-modal">

        {/* =========================
            HEADER
        ========================= */}

        <div className="department-modal-header">

          <h2>
            {department
              ? "Edit Department"
              : "Add Department"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="department-form-error">
            {error}
          </div>
        )}

        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleSubmit}>

          {/* DEPARTMENT NAME */}

          <div className="form-group">

            <label>
              Department Name *
            </label>

            <input
              type="text"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              placeholder="e.g. Information Technology"
              disabled={loading}
              autoFocus
            />

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the department"
              rows="4"
              disabled={loading}
            />

          </div>

          {/* BUTTONS */}

          <div className="department-form-actions">

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
                : department
                  ? "Update Department"
                  : "Save Department"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default DepartmentForm;