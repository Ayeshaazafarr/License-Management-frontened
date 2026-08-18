import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Employees.css";

function EmployeeForm({
  employee,
  onClose,
  onEmployeeAdded,
  onEmployeeUpdated,
}) {
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    designation: employee?.designation || "",
    departmentId: employee?.department?.departmentId
      ? String(employee.department.departmentId)
      : "",
    hireDate: employee?.hireDate || "",
    isActive:
      employee?.isActive !== undefined
        ? employee.isActive
        : true,
  });

  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] =
    useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH DEPARTMENTS
  // =========================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setError("");

        const response = await api.get(
          "/api/departments"
        );

        setDepartments(response.data || []);
      } catch (err) {
        console.error(
          "Failed to fetch departments:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to load departments."
        );
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!formData.hireDate) {
      setError("Hire date is required.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),

        department: {
          departmentId: Number(
            formData.departmentId
          ),
        },

        hireDate: formData.hireDate,
        isActive: formData.isActive,
      };

      // =========================
      // UPDATE
      // =========================

      if (employee) {
        const response = await api.put(
          `/api/employees/${employee.employeeId}`,
          data
        );

        console.log(
          "Employee updated:",
          response.data
        );

        await onEmployeeUpdated();
      }

      // =========================
      // CREATE
      // =========================

      else {
        const response = await api.post(
          "/api/employees",
          data
        );

        console.log(
          "Employee created:",
          response.data
        );

        await onEmployeeAdded();
      }

    } catch (err) {
      console.error(
        "Employee save error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to save employee."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-modal-overlay">

      <div className="employee-modal">

        {/* HEADER */}

        <div className="employee-modal-header">

          <div>

            <h2>
              {employee
                ? "Edit Employee"
                : "Add Employee"}
            </h2>

            <p>
              {employee
                ? "Update employee information."
                : "Add a new employee to your organization."}
            </p>

          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="employee-form-error">
            {error}
          </div>
        )}


        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* PERSONAL */}

          <div className="form-section">

            <div className="form-section-title">
              Personal Information
            </div>

            <div className="employee-form-grid">

              <div className="form-group">

                <label htmlFor="firstName">
                  First Name *
                </label>

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Ali"
                  autoComplete="given-name"
                  disabled={loading}
                />

              </div>


              <div className="form-group">

                <label htmlFor="lastName">
                  Last Name *
                </label>

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Khan"
                  autoComplete="family-name"
                  disabled={loading}
                />

              </div>


              <div className="form-group">

                <label htmlFor="email">
                  Email *
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ali@company.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>


              <div className="form-group">

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 03001234567"
                  autoComplete="tel"
                  disabled={loading}
                />

              </div>

            </div>

          </div>


          {/* EMPLOYMENT */}

          <div className="form-section">

            <div className="form-section-title">
              Employment Information
            </div>

            <div className="employee-form-grid">

              <div className="form-group">

                <label htmlFor="designation">
                  Designation
                </label>

                <input
                  id="designation"
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  disabled={loading}
                />

              </div>


              <div className="form-group">

                <label htmlFor="departmentId">
                  Department *
                </label>

                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={
                    loading ||
                    departmentsLoading
                  }
                >

                  <option value="">
                    {departmentsLoading
                      ? "Loading departments..."
                      : "Select department"}
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={
                          department.departmentId
                        }
                        value={
                          department.departmentId
                        }
                      >
                        {department.departmentName}
                      </option>
                    )
                  )}

                </select>

              </div>


              <div className="form-group">

                <label htmlFor="hireDate">
                  Hire Date *
                </label>

                <input
                  id="hireDate"
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>

          </div>


          {/* STATUS */}

          <div className="employee-status-section">

            <div>

              <strong>
                Employee Status
              </strong>

              <span>
                Control whether this employee
                is currently active.
              </span>

            </div>

            <label className="status-toggle">

              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
              />

              <span className="status-toggle-slider"></span>

              <span className="status-toggle-label">
                {formData.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </label>

          </div>


          {/* ACTIONS */}

          <div className="employee-form-actions">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                departmentsLoading
              }
            >
              {loading
                ? "Saving..."
                : employee
                  ? "Update Employee"
                  : "Save Employee"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EmployeeForm;