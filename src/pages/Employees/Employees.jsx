import { useEffect, useState } from "react";
import api from "../../services/api";
import EmployeeForm from "./EmployeeForm";
import "./Employees.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // =========================
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/employees");

      setEmployees(response.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to load employees."
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // =========================
  // CLOSE
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  // =========================
  // AFTER ADD
  // =========================

  const handleEmployeeAdded = async () => {
    await fetchEmployees();
    handleCloseForm();
  };

  // =========================
  // AFTER UPDATE
  // =========================

  const handleEmployeeUpdated = async () => {
    await fetchEmployees();
    handleCloseForm();
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteEmployee = async (employee) => {
    const fullName =
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

    const confirmed = window.confirm(
      `Are you sure you want to delete ${fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/employees/${employee.employeeId}`
      );

      await fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);

      if (err.response) {
        alert(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to delete employee."
        );
      } else if (err.request) {
        alert("Unable to connect to the server.");
      } else {
        alert("Unable to delete employee.");
      }
    }
  };

  return (
    <div className="employees-page">

      {/* HEADER */}

      <div className="employees-header">

        <div>
          <h1>Employees</h1>

          <p>
            Manage employees and their organizational details.
          </p>
        </div>

        <button
          type="button"
          className="add-employee-button"
          onClick={handleAddEmployee}
        >
          + Add Employee
        </button>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="employees-message">
          Loading employees...
        </div>
      )}


      {/* ERROR */}

      {error && !loading && (
        <div className="employees-error">

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchEmployees}
          >
            Try Again
          </button>

        </div>
      )}


      {/* DATA */}

      {!loading && !error && (
        <>

          <div className="employees-summary">
            <span>Total Employees</span>

            <strong>
              {employees.length}
            </strong>
          </div>


          <div className="employees-table-container">

            <table className="employees-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>


              <tbody>

                {employees.length === 0 ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="empty-message"
                    >
                      No employees found.
                    </td>
                  </tr>

                ) : (

                  employees.map((employee) => {

                    const initials =
                      `${employee.firstName?.charAt(0) || ""}${employee.lastName?.charAt(0) || ""}`
                        .toUpperCase();

                    return (
                      <tr
                        key={employee.employeeId}
                      >

                        {/* EMPLOYEE */}

                        <td>

                          <div className="employee-name">

                            <div className="employee-avatar">
                              {initials}
                            </div>

                            <div className="employee-name-info">

                              <strong>
                                {employee.firstName}{" "}
                                {employee.lastName}
                              </strong>

                              <span>
                                ID #{employee.employeeId}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* DEPARTMENT */}

                        <td>
                          {employee.department?.departmentName || "—"}
                        </td>


                        {/* DESIGNATION */}

                        <td>
                          {employee.designation || "—"}
                        </td>


                        {/* EMAIL */}

                        <td>
                          {employee.email || "—"}
                        </td>


                        {/* PHONE */}

                        <td>
                          {employee.phone || "—"}
                        </td>


                        {/* HIRE DATE */}

                        <td>
                          {employee.hireDate || "—"}
                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`employee-status ${
                              employee.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {employee.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="employee-actions-cell">

                          <button
                            type="button"
                            className="action-button"
                            onClick={() =>
                              handleEditEmployee(employee)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="action-button delete"
                            onClick={() =>
                              handleDeleteEmployee(employee)
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </>
      )}


      {/* FORM */}

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleCloseForm}
          onEmployeeAdded={handleEmployeeAdded}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

    </div>
  );
}

export default Employees;