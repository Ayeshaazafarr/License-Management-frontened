
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AuditLogs.css";

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/audit-logs");

      setAuditLogs(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to load audit logs."
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
    fetchAuditLogs();
  }, []);

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return dateTime;
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionClass = (action) => {
    switch (action) {
      case "CREATE":
        return "create";

      case "UPDATE":
        return "update";

      case "DELETE":
        return "delete";

      case "ASSIGN":
        return "assign";

      case "REVOKE":
        return "revoke";

      default:
        return "default";
    }
  };

  const getActionLabel = (action) => {
    if (!action) {
      return "Unknown";
    }

    return action
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const totalLogs = auditLogs.length;

  const uniqueUsers = new Set(
    auditLogs
      .map((log) => log.user?.username)
      .filter(Boolean)
  ).size;

  const uniqueEntities = new Set(
    auditLogs
      .map((log) => log.entityName)
      .filter(Boolean)
  ).size;

  return (
    <div className="audit-logs-page">

      {/* HEADER */}

      <div className="audit-logs-header">

        <div>
          <h1>Audit Log</h1>

          <p>
            Track important actions and changes
            made in the system.
          </p>
        </div>

        <button
          className="audit-refresh-button"
          onClick={fetchAuditLogs}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="audit-logs-message">
          Loading audit logs...
        </div>
      )}


      {/* ERROR */}

      {error && !loading && (
        <div className="audit-logs-error">

          <p>{error}</p>

          <button onClick={fetchAuditLogs}>
            Try Again
          </button>

        </div>
      )}


      {/* DATA */}

      {!loading && !error && (
        <>

          {/* SUMMARY */}

          <div className="audit-summary">

            <div className="audit-summary-card">
              <span>Total Events</span>
              <strong>{totalLogs}</strong>
            </div>

            <div className="audit-summary-card">
              <span>Users Involved</span>
              <strong>{uniqueUsers}</strong>
            </div>

            <div className="audit-summary-card">
              <span>Entities</span>
              <strong>{uniqueEntities}</strong>
            </div>

          </div>


          {/* TABLE */}

          <div className="audit-table-container">

            <table className="audit-table">

              <thead>

                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Record ID</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>

              </thead>

              <tbody>

                {auditLogs.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="audit-empty-message"
                    >
                      No audit logs found.
                    </td>
                  </tr>

                ) : (

                  auditLogs.map((log) => (

                    <tr key={log.auditId}>

                      {/* ACTION */}

                      <td>
                        <span
                          className={`audit-action ${getActionClass(
                            log.action
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>


                      {/* ENTITY */}

                      <td>
                        <strong>
                          {log.entityName || "—"}
                        </strong>
                      </td>


                      {/* RECORD */}

                      <td>
                        {log.recordId ?? "—"}
                      </td>


                      {/* USER */}

                      <td>

                        <div className="audit-user">

                          <div className="audit-user-avatar">
                            {log.user?.username
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </div>

                          <div className="audit-user-info">

                            <strong>
                              {log.user?.username || "—"}
                            </strong>

                            <span>
                              {log.user?.role?.roleName ||
                                "—"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* IP */}

                      <td>
                        {log.ipAddress || "—"}
                      </td>


                      {/* DATE */}

                      <td>
                        {formatDateTime(
                          log.actionTime
                        )}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </>
      )}

    </div>
  );
}

export default AuditLogs;
