import { useEffect, useState } from "react";
import api from "../../services/api";
import AssignmentForm from "./AssignmentForm";
import "./Assignments.css";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // =========================
  // FETCH ASSIGNMENTS
  // =========================

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/license-assignments");

      setAssignments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Failed to fetch assignments:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to load assignments."
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
    fetchAssignments();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  // =========================
  // CLOSE
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  // =========================
  // AFTER ADD
  // =========================

  const handleAssignmentAdded = async () => {
    await fetchAssignments();
    handleCloseForm();
  };

  // =========================
  // AFTER UPDATE
  // =========================

  const handleAssignmentUpdated = async () => {
    await fetchAssignments();
    handleCloseForm();
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteAssignment = async (assignment) => {
    const employeeName =
      `${assignment.employee?.firstName || ""} ${
        assignment.employee?.lastName || ""
      }`.trim() || "this employee";

    const softwareName =
      assignment.license?.software?.softwareName ||
      "this software";

    const confirmed = window.confirm(
      `Are you sure you want to delete the assignment for ${employeeName} (${softwareName})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/license-assignments/${assignment.assignmentId}`
      );

      await fetchAssignments();
    } catch (err) {
      console.error(
        "Failed to delete assignment:",
        err
      );

      if (err.response) {
        alert(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to delete assignment."
        );
      } else if (err.request) {
        alert("Unable to connect to the server.");
      } else {
        alert("Unable to delete assignment.");
      }
    }
  };

  // =========================
  // HELPERS
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "assigned";

      case "REVOKED":
        return "revoked";

      case "EXPIRED":
        return "expired";

      case "ACTIVE":
        return "active";

      default:
        return "unknown";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================
  // SUMMARY
  // =========================

  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.status === "ASSIGNED"
  ).length;

  const revokedAssignments = assignments.filter(
    (assignment) =>
      assignment.status === "REVOKED"
  ).length;

  return (
    <div className="assignments-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="assignments-header">

        <div>
          <h1>License Assignments</h1>

          <p>
            Manage software licenses assigned
            to employees.
          </p>
        </div>

        <button
          type="button"
          className="add-assignment-button"
          onClick={handleAddAssignment}
        >
          + Assign License
        </button>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="assignments-message">
          Loading assignments...
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && !loading && (
        <div className="assignments-error">

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchAssignments}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =========================
          DATA
      ========================= */}

      {!loading && !error && (
        <>

          {/* SUMMARY */}

          <div className="assignments-summary">

            <div className="summary-card">
              <span>Total Assignments</span>
              <strong>{totalAssignments}</strong>
            </div>

            <div className="summary-card">
              <span>Active Assignments</span>
              <strong>{activeAssignments}</strong>
            </div>

            <div className="summary-card">
              <span>Revoked</span>
              <strong>{revokedAssignments}</strong>
            </div>

          </div>

          {/* TABLE */}

          <div className="assignments-table-container">

            <table className="assignments-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Software</th>
                  <th>License</th>
                  <th>Assigned Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {assignments.length === 0 ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="empty-message"
                    >
                      No license assignments found.
                    </td>
                  </tr>

                ) : (

                  assignments.map((assignment) => {

                    const employee =
                      assignment.employee;

                    const software =
                      assignment.license?.software;

                    return (
                      <tr
                        key={assignment.assignmentId}
                      >

                        {/* EMPLOYEE */}

                        <td>
                          <div className="assignment-employee">

                            <div className="assignment-avatar">
                              {employee?.firstName
                                ?.charAt(0)
                                .toUpperCase()}

                              {employee?.lastName
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {employee?.firstName || ""}
                                {" "}
                                {employee?.lastName || ""}
                              </strong>

                              <span>
                                ID #{employee?.employeeId || "—"}
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* DEPARTMENT */}

                        <td>
                          {employee
                            ?.department
                            ?.departmentName || "—"}
                        </td>

                        {/* SOFTWARE */}

                        <td>
                          <div className="software-cell">

                            <strong>
                              {software?.softwareName || "—"}
                            </strong>

                            {software?.version && (
                              <span>
                                v{software.version}
                              </span>
                            )}

                          </div>
                        </td>

                        {/* LICENSE */}

                        <td>
                          <div className="license-cell">

                            <strong>
                              {assignment.license
                                ?.licenseKey || "—"}
                            </strong>

                            {assignment.license
                              ?.licenseType && (
                              <span>
                                {assignment.license.licenseType}
                              </span>
                            )}

                          </div>
                        </td>

                        {/* ASSIGNED DATE */}

                        <td>
                          {formatDate(
                            assignment.assignedDate
                          )}
                        </td>

                        {/* EXPIRY DATE */}

                        <td>
                          {formatDate(
                            assignment.license
                              ?.expiryDate
                          )}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`assignment-status ${getStatusClass(
                              assignment.status
                            )}`}
                          >
                            {getStatusLabel(
                              assignment.status
                            )}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="assignment-actions-cell">

                          <button
                            type="button"
                            className="action-button"
                            onClick={() =>
                              handleEditAssignment(
                                assignment
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="action-button delete"
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment
                              )
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

      {/* =========================
          FORM
      ========================= */}

      {showForm && (
        <AssignmentForm
          assignment={editingAssignment}
          onClose={handleCloseForm}
          onAssignmentAdded={handleAssignmentAdded}
          onAssignmentUpdated={handleAssignmentUpdated}
        />
      )}

    </div>
  );
}

export default Assignments;