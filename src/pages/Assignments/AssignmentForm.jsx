import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Assignments.css";

function AssignmentForm({
  assignment,
  onClose,
  onAssignmentAdded,
  onAssignmentUpdated,
}) {
  const [employees, setEmployees] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: assignment?.employee?.employeeId
      ? String(assignment.employee.employeeId)
      : "",

    licenseId: assignment?.license?.licenseId
      ? String(assignment.license.licenseId)
      : "",

    assignedDate:
      assignment?.assignedDate ||
      new Date().toISOString().split("T")[0],

    remarks: assignment?.remarks || "",
  });

  // =========================
  // FETCH FORM DATA
  // =========================

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [
        employeesResponse,
        licensesResponse,
        assignmentsResponse,
      ] = await Promise.all([
        api.get("/api/employees"),
        api.get("/api/licenses"),
        api.get("/api/license-assignments"),
      ]);

      setEmployees(
        Array.isArray(employeesResponse.data)
          ? employeesResponse.data
          : []
      );

      setLicenses(
        Array.isArray(licensesResponse.data)
          ? licensesResponse.data
          : []
      );

      setAssignments(
        Array.isArray(assignmentsResponse.data)
          ? assignmentsResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load assignment form data:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load employees, licenses and assignments."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================
  // CHECK DUPLICATE
  // =========================

  const isDuplicateAssignment = (
    employeeId,
    licenseId
  ) => {
    return assignments.some((existingAssignment) => {
      const existingEmployeeId =
        existingAssignment.employee?.employeeId;

      const existingLicenseId =
        existingAssignment.license?.licenseId;

      const sameEmployee =
        Number(existingEmployeeId) ===
        Number(employeeId);

      const sameLicense =
        Number(existingLicenseId) ===
        Number(licenseId);

      const isActiveAssignment =
        String(
          existingAssignment.status || ""
        ).toUpperCase() !== "REVOKED";

      const isCurrentAssignment =
        assignment &&
        existingAssignment.assignmentId ===
          assignment.assignmentId;

      return (
        sameEmployee &&
        sameLicense &&
        isActiveAssignment &&
        !isCurrentAssignment
      );
    });
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!formData.licenseId) {
      setError("Please select a license.");
      return;
    }

    if (!formData.assignedDate) {
      setError("Assigned date is required.");
      return;
    }

    // =========================
    // DUPLICATE CHECK
    // =========================

    if (
      isDuplicateAssignment(
        formData.employeeId,
        formData.licenseId
      )
    ) {
      setError(
        "This employee already has this license assigned."
      );
      return;
    }

    try {
      setLoading(true);

      const data = {
        employee: {
          employeeId: Number(formData.employeeId),
        },

        license: {
          licenseId: Number(formData.licenseId),
        },

        assignedDate: formData.assignedDate,

        remarks: formData.remarks.trim(),
      };

      // =========================
      // UPDATE
      // =========================

      if (assignment) {
        const response = await api.put(
          `/api/license-assignments/${assignment.assignmentId}`,
          data
        );

        console.log(
          "Assignment updated:",
          response.data
        );

        await onAssignmentUpdated();
      }

      // =========================
      // CREATE
      // =========================

      else {
        const response = await api.post(
          "/api/license-assignments",
          data
        );

        console.log(
          "Assignment created:",
          response.data
        );

        await onAssignmentAdded();
      }
    } catch (err) {
      console.error(
        "Assignment save error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to save assignment."
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

  // =========================
  // SELECTED EMPLOYEE
  // =========================

  const selectedEmployee = employees.find(
    (employee) =>
      String(employee.employeeId) ===
      formData.employeeId
  );

  // =========================
  // AVAILABLE LICENSES
  // =========================

  const availableLicenses = licenses.filter(
    (license) => {
      if (!license) {
        return false;
      }

      // =========================
      // EDIT MODE
      // =========================
      //
      // Always keep the license that is
      // currently assigned visible while editing.
      //

      if (
        assignment &&
        Number(license.licenseId) ===
          Number(
            assignment.license?.licenseId
          )
      ) {
        return true;
      }

      // =========================
      // ONLY ACTIVE LICENSES
      // =========================

      if (
        String(
          license.status || ""
        ).toUpperCase() !== "ACTIVE"
      ) {
        return false;
      }

      // If employee hasn't been selected,
      // show all active licenses.
      if (!formData.employeeId) {
        return true;
      }

      // =========================
      // DUPLICATE CHECK
      // =========================

      const alreadyAssigned =
        isDuplicateAssignment(
          formData.employeeId,
          license.licenseId
        );

      return !alreadyAssigned;
    }
  );

  return (
    <div className="assignment-modal-overlay">
      <div className="assignment-modal">

        {/* =========================
            HEADER
        ========================= */}

        <div className="assignment-modal-header">
          <div>
            <h2>
              {assignment
                ? "Edit License Assignment"
                : "Assign License"}
            </h2>

            <p>
              {assignment
                ? "Update this license assignment."
                : "Assign an available software license to an employee."}
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

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="assignment-form-error">
            {error}
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loadingData ? (
          <div className="assignment-form-loading">
            Loading employees and licenses...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* =========================
                ASSIGNMENT DETAILS
            ========================= */}

            <div className="form-section">

              <div className="form-section-title">
                Assignment Details
              </div>

              {/* =========================
                  EMPLOYEE
              ========================= */}

              <div className="form-group">
                <label htmlFor="employeeId">
                  Employee *
                </label>

                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees
                    .filter(
                      (employee) =>
                        employee.isActive ||
                        (
                          assignment &&
                          Number(
                            employee.employeeId
                          ) ===
                            Number(
                              assignment
                                .employee
                                ?.employeeId
                            )
                        )
                    )
                    .map((employee) => (
                      <option
                        key={employee.employeeId}
                        value={employee.employeeId}
                      >
                        {employee.firstName}{" "}
                        {employee.lastName}
                        {" — "}
                        {employee.department
                          ?.departmentName ||
                          "No department"}
                      </option>
                    ))}
                </select>

                {selectedEmployee && (
                  <small className="form-help">
                    {selectedEmployee.email}

                    {selectedEmployee.designation && (
                      <>
                        {" • "}
                        {selectedEmployee.designation}
                      </>
                    )}
                  </small>
                )}
              </div>

              {/* =========================
                  LICENSE
              ========================= */}

              <div className="form-group">
                <label htmlFor="licenseId">
                  License *
                </label>

                <select
                  id="licenseId"
                  name="licenseId"
                  value={formData.licenseId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">
                    Select available license
                  </option>

                  {availableLicenses.map(
                    (license) => {
                      const software =
                        license.software;

                      return (
                        <option
                          key={
                            license.licenseId
                          }
                          value={
                            license.licenseId
                          }
                        >
                          {software
                            ?.softwareName ||
                            "Unknown Software"}

                          {" — "}

                          {license.licenseKey ||
                            `License #${license.licenseId}`}
                        </option>
                      );
                    }
                  )}
                </select>

                {availableLicenses.length ===
                  0 && (
                  <small className="form-help form-help-warning">
                    {formData.employeeId
                      ? "No available licenses for this employee."
                      : "No active licenses are currently available."}
                  </small>
                )}
              </div>

              {/* =========================
                  ASSIGNED DATE
              ========================= */}

              <div className="form-group">
                <label htmlFor="assignedDate">
                  Assigned Date *
                </label>

                <input
                  id="assignedDate"
                  type="date"
                  name="assignedDate"
                  value={
                    formData.assignedDate
                  }
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* =========================
                  REMARKS
              ========================= */}

              <div className="form-group">
                <label htmlFor="remarks">
                  Remarks
                </label>

                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Add any relevant notes about this assignment..."
                  rows="4"
                  disabled={loading}
                />
              </div>

            </div>

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="assignment-form-actions">

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
                  availableLicenses.length === 0
                }
              >
                {loading
                  ? "Saving..."
                  : assignment
                    ? "Update Assignment"
                    : "Assign License"}
              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default AssignmentForm;