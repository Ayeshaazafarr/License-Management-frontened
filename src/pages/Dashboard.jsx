import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [licenses, setLicenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] =
    useState(false);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getTodayString = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  const getStartOfWeekString = () => {
    const date = new Date();

    const day = date.getDay();

    const daysFromMonday =
      day === 0 ? 6 : day - 1;

    date.setDate(
      date.getDate() - daysFromMonday
    );

    return date.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(
    getStartOfWeekString()
  );

  const [endDate, setEndDate] = useState(
    getTodayString()
  );

  const [selectedPeriod, setSelectedPeriod] =
    useState("This Week");

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        api.get("/api/licenses"),
        api.get("/api/employees"),
        api.get("/api/license-assignments"),
        api.get("/api/renewal-history"),
        api.get("/api/audit-logs"),
      ]);

      const [
        licensesResult,
        employeesResult,
        assignmentsResult,
        renewalsResult,
        auditResult,
      ] = results;

      // LICENSES
      if (licensesResult.status === "fulfilled") {
        const data = licensesResult.value.data;

        setLicenses(
          Array.isArray(data) ? data : []
        );
      } else {
        console.error(
          "Failed to load licenses:",
          licensesResult.reason
        );

        setLicenses([]);
      }

      // EMPLOYEES
      if (employeesResult.status === "fulfilled") {
        const data = employeesResult.value.data;

        setEmployees(
          Array.isArray(data) ? data : []
        );
      } else {
        console.error(
          "Failed to load employees:",
          employeesResult.reason
        );

        setEmployees([]);
      }

      // ASSIGNMENTS
      if (assignmentsResult.status === "fulfilled") {
        const data = assignmentsResult.value.data;

        setAssignments(
          Array.isArray(data) ? data : []
        );
      } else {
        console.error(
          "Failed to load assignments:",
          assignmentsResult.reason
        );

        setAssignments([]);
      }

      // RENEWALS
      if (renewalsResult.status === "fulfilled") {
        const data = renewalsResult.value.data;

        setRenewals(
          Array.isArray(data) ? data : []
        );
      } else {
        console.error(
          "Failed to load renewals:",
          renewalsResult.reason
        );

        setRenewals([]);
      }

      // AUDIT LOGS
      if (auditResult.status === "fulfilled") {
        const data = auditResult.value.data;

        setAuditLogs(
          Array.isArray(data) ? data : []
        );
      } else {
        console.error(
          "Failed to load audit logs:",
          auditResult.reason
        );

        setAuditLogs([]);
      }
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // PERIOD BUTTONS
  // =========================================================

  const setDateRange = (period) => {
    const today = new Date();

    let start = new Date(today);
    const end = new Date(today);

    if (period === "week") {
      const day = today.getDay();

      const daysFromMonday =
        day === 0 ? 6 : day - 1;

      start.setDate(
        today.getDate() - daysFromMonday
      );

      setSelectedPeriod("This Week");
    }

    if (period === "month") {
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      setSelectedPeriod("This Month");
    }

    if (period === "90") {
      start = new Date(today);

      start.setDate(
        today.getDate() - 89
      );

      setSelectedPeriod("Last 90 Days");
    }

    setStartDate(
      start.toISOString().split("T")[0]
    );

    setEndDate(
      end.toISOString().split("T")[0]
    );
  };

  // =========================================================
  // DATE CHECK
  // =========================================================

  const isDateInSelectedPeriod = (value) => {
    if (!value) {
      return false;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);

    end.setHours(
      23,
      59,
      59,
      999
    );

    return (
      date >= start &&
      date <= end
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // DAYS UNTIL
  // =========================================================

  const daysUntil = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const target = new Date(dateValue);
    const current = new Date();

    if (
      Number.isNaN(target.getTime()) ||
      Number.isNaN(current.getTime())
    ) {
      return null;
    }

    target.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    return Math.ceil(
      (target.getTime() -
        current.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  // =========================================================
  // LICENSE STATISTICS
  // =========================================================

  const totalLicenses =
    licenses.length;

  const activeLicenses =
    licenses.filter(
      (license) =>
        String(
          license.status || ""
        ).toUpperCase() === "ACTIVE"
    ).length;

  const expiredLicenses =
    licenses.filter((license) => {
      const status = String(
        license.status || ""
      ).toUpperCase();

      if (status === "EXPIRED") {
        return true;
      }

      const days = daysUntil(
        license.expiryDate
      );

      return (
        days !== null &&
        days < 0
      );
    }).length;

  const expiringSoon =
    licenses.filter((license) => {
      const days = daysUntil(
        license.expiryDate
      );

      return (
        days !== null &&
        days >= 0 &&
        days <= 30 &&
        String(
          license.status || ""
        ).toUpperCase() !== "EXPIRED"
      );
    }).length;

  const assignmentCount =
    assignments.length;

  // =========================================================
  // STATUS %
  // =========================================================

  const statusPercent = (value) => {
    if (!totalLicenses) {
      return "0.0";
    }

    return (
      (value / totalLicenses) *
      100
    ).toFixed(1);
  };

  // =========================================================
  // GLOBAL PROJECT SEARCH
  // =========================================================

  const globalSearchResults = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const results = [];

    // -------------------------------------------------------
    // LICENSES
    // -------------------------------------------------------

    licenses.forEach((license) => {
      const softwareName =
        license.software?.softwareName || "";

      const vendorName =
        license.software?.vendor?.vendorName || "";

      const licenseKey =
        license.licenseKey || "";

      const status =
        license.status || "";

      const expiryDate =
        license.expiryDate || "";

      const searchableText = [
        softwareName,
        vendorName,
        licenseKey,
        status,
        expiryDate,
        license.licenseId,
      ]
        .join(" ")
        .toLowerCase();

      if (
        searchableText.includes(query)
      ) {
        results.push({
          type: "License",
          id: license.licenseId,
          title:
            softwareName ||
            "Unknown Software",
          subtitle:
            licenseKey ||
            `License #${license.licenseId}`,
          details:
            vendorName
              ? `Vendor: ${vendorName}`
              : `Status: ${status || "Unknown"}`,
          status:
            status || "Unknown",
        });
      }
    });

    // -------------------------------------------------------
    // EMPLOYEES
    // -------------------------------------------------------

    employees.forEach((employee) => {
      const firstName =
        employee.firstName || "";

      const lastName =
        employee.lastName || "";

      const fullName =
        `${firstName} ${lastName}`.trim();

      const email =
        employee.email || "";

      const designation =
        employee.designation || "";

      const department =
        employee.department?.departmentName ||
        employee.departmentName ||
        "";

      const employeeId =
        employee.employeeId || "";

      const searchableText = [
        fullName,
        firstName,
        lastName,
        email,
        designation,
        department,
        employeeId,
        employee.isActive
          ? "active"
          : "inactive",
      ]
        .join(" ")
        .toLowerCase();

      if (
        searchableText.includes(query)
      ) {
        results.push({
          type: "Employee",
          id: employee.employeeId,
          title:
            fullName ||
            `Employee #${employee.employeeId}`,
          subtitle:
            email || "No email",
          details:
            department ||
            designation ||
            "Employee",
          status:
            employee.isActive
              ? "Active"
              : "Inactive",
        });
      }
    });

    // -------------------------------------------------------
    // ASSIGNMENTS
    // -------------------------------------------------------

    assignments.forEach((assignment) => {
      const employee =
        assignment.employee;

      const license =
        assignment.license;

      const software =
        license?.software;

      const employeeName =
        `${employee?.firstName || ""} ${
          employee?.lastName || ""
        }`.trim();

      const softwareName =
        software?.softwareName || "";

      const licenseKey =
        license?.licenseKey || "";

      const remarks =
        assignment.remarks || "";

      const assignedDate =
        assignment.assignedDate || "";

      const searchableText = [
        employeeName,
        employee?.email || "",
        softwareName,
        licenseKey,
        remarks,
        assignedDate,
        assignment.assignmentId,
      ]
        .join(" ")
        .toLowerCase();

      if (
        searchableText.includes(query)
      ) {
        results.push({
          type: "Assignment",
          id:
            assignment.assignmentId,
          title:
            employeeName ||
            "Unknown Employee",
          subtitle:
            softwareName ||
            "Unknown Software",
          details:
            licenseKey ||
            remarks ||
            "License Assignment",
          status:
            "Assigned",
        });
      }
    });

    // -------------------------------------------------------
    // RENEWALS
    // -------------------------------------------------------

    renewals.forEach((renewal) => {
      const softwareName =
        renewal.license?.software
          ?.softwareName || "";

      const vendorName =
        renewal.license?.software
          ?.vendor?.vendorName || "";

      const licenseKey =
        renewal.license?.licenseKey || "";

      const renewedBy =
        renewal.renewedBy?.username ||
        renewal.renewedBy?.email ||
        "";

      const remarks =
        renewal.remarks || "";

      const renewalDate =
        renewal.renewalDate || "";

      const searchableText = [
        softwareName,
        vendorName,
        licenseKey,
        renewedBy,
        remarks,
        renewalDate,
        renewal.previousExpiryDate || "",
        renewal.newExpiryDate || "",
        renewal.renewalId,
      ]
        .join(" ")
        .toLowerCase();

      if (
        searchableText.includes(query)
      ) {
        results.push({
          type: "Renewal",
          id:
            renewal.renewalId,
          title:
            softwareName ||
            "License Renewal",
          subtitle:
            licenseKey ||
            "No license key",
          details:
            renewedBy
              ? `Renewed by: ${renewedBy}`
              : formatDate(
                  renewal.renewalDate
                ),
          status:
            "Renewed",
        });
      }
    });

    // -------------------------------------------------------
    // AUDIT LOGS
    // -------------------------------------------------------

    auditLogs.forEach((activity) => {
      const action =
        activity.action || "";

      const entityName =
        activity.entityName || "";

      const entityType =
        activity.entityType || "";

      const username =
        activity.user?.username ||
        activity.user?.email ||
        "";

      const description =
        activity.description ||
        activity.details ||
        "";

      const actionTime =
        activity.actionTime ||
        activity.createdAt ||
        "";

      const searchableText = [
        action,
        entityName,
        entityType,
        username,
        description,
        actionTime,
        activity.auditId,
      ]
        .join(" ")
        .toLowerCase();

      if (
        searchableText.includes(query)
      ) {
        results.push({
          type: "Activity",
          id:
            activity.auditId,
          title:
            entityName ||
            entityType ||
            "System Activity",
          subtitle:
            action ||
            "Activity",
          details:
            username
              ? `By: ${username}`
              : formatDate(actionTime),
          status:
            "Activity",
        });
      }
    });

    return results;
  }, [
    search,
    licenses,
    employees,
    assignments,
    renewals,
    auditLogs,
  ]);

  // =========================================================
  // VENDOR STATISTICS
  // =========================================================

  const vendorStats =
    useMemo(() => {
      const map = {};

      licenses.forEach(
        (license) => {
          const vendor =
            license.software?.vendor
              ?.vendorName;

          if (!vendor) {
            return;
          }

          map[vendor] =
            (map[vendor] || 0) + 1;
        }
      );

      return Object.entries(map)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 5)
        .map(
          ([name, count]) => ({
            name,
            count,
            percentage:
              totalLicenses > 0
                ? (
                    (count /
                      totalLicenses) *
                    100
                  ).toFixed(1)
                : "0.0",
          })
        );
    }, [
      licenses,
      totalLicenses,
    ]);

  // =========================================================
  // PERIOD AUDIT LOGS
  // =========================================================

  const periodAuditLogs =
    useMemo(() => {
      return auditLogs.filter(
        (item) =>
          isDateInSelectedPeriod(
            item.actionTime ||
              item.createdAt ||
              item.updatedAt
          )
      );
    }, [
      auditLogs,
      startDate,
      endDate,
    ]);

  // =========================================================
  // PERIOD RENEWALS
  // =========================================================

  const periodRenewals =
    useMemo(() => {
      return renewals.filter(
        (renewal) =>
          isDateInSelectedPeriod(
            renewal.renewalDate ||
              renewal.createdAt ||
              renewal.updatedAt
          )
      );
    }, [
      renewals,
      startDate,
      endDate,
    ]);

  // =========================================================
  // PERIOD ASSIGNMENTS
  // =========================================================

  const periodAssignments =
    useMemo(() => {
      return assignments.filter(
        (assignment) =>
          isDateInSelectedPeriod(
            assignment.assignedDate ||
              assignment.assignedAt ||
              assignment.createdAt ||
              assignment.updatedAt
          )
      );
    }, [
      assignments,
      startDate,
      endDate,
    ]);

  // =========================================================
  // RECENT RENEWALS
  // =========================================================

  const recentRenewals =
    useMemo(() => {
      return [...renewals]
        .sort(
          (a, b) =>
            new Date(
              b.renewalDate ||
                b.createdAt
            ) -
            new Date(
              a.renewalDate ||
                a.createdAt
            )
        )
        .slice(0, 4);
    }, [renewals]);

  // =========================================================
  // RECENT ACTIVITIES
  // =========================================================

  const recentActivities =
    useMemo(() => {
      return [...auditLogs]
        .sort(
          (a, b) =>
            new Date(
              b.actionTime ||
                b.createdAt
            ) -
            new Date(
              a.actionTime ||
                a.createdAt
            )
        )
        .slice(0, 5);
    }, [auditLogs]);

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const notificationCount =
    expiringSoon +
    expiredLicenses;

  // =========================================================
  // DONUT
  // =========================================================

  const donutStyle = {
    background: `conic-gradient(
      #22c55e 0% ${statusPercent(
        activeLicenses
      )}%,
      #f59e0b ${statusPercent(
        activeLicenses
      )}% ${statusPercent(
        activeLicenses +
          expiringSoon
      )}%,
      #ef4444 ${statusPercent(
        activeLicenses +
          expiringSoon
      )}% ${statusPercent(
        activeLicenses +
          expiringSoon +
          expiredLicenses
      )}%,
      #cbd5e1 ${statusPercent(
        activeLicenses +
          expiringSoon +
          expiredLicenses
      )}% 100%
    )`,
  };

  // =========================================================
  // ACTIVITY TEXT
  // =========================================================

  const activityText = (
    activity
  ) => {
    const action =
      activity.action;

    const entity =
      activity.entityName ||
      activity.entityType ||
      "Record";

    const user =
      activity.user?.username ||
      activity.user?.email;

    if (user && action) {
      return `${user} ${String(
        action
      ).toLowerCase()} ${entity}`;
    }

    if (action) {
      return `${String(
        action
      ).toLowerCase()} ${entity}`;
    }

    return entity;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="dashboard-topbar">

        <div className="dashboard-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search anything in your project..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="search-clear-button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>


        <div className="dashboard-top-actions">

          <div className="notification-wrapper">

            <button
              className="top-icon-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              aria-label="Notifications"
            >
              🔔

              {notificationCount >
                0 && (
                <span className="notification-count">
                  {notificationCount}
                </span>
              )}
            </button>


            {showNotifications && (
              <div className="notification-panel">

                <div className="notification-panel-header">

                  <strong>
                    Notifications
                  </strong>

                  <button
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                  >
                    ×
                  </button>

                </div>


                {expiringSoon >
                  0 && (
                  <div className="notification-item warning">

                    <span>●</span>

                    <div>
                      <strong>
                        Licenses expiring soon
                      </strong>

                      <p>
                        {expiringSoon}{" "}
                        license
                        {expiringSoon !==
                        1
                          ? "s are"
                          : " is"}{" "}
                        expiring within
                        30 days.
                      </p>
                    </div>

                  </div>
                )}


                {expiredLicenses >
                  0 && (
                  <div className="notification-item danger">

                    <span>●</span>

                    <div>
                      <strong>
                        Expired licenses
                      </strong>

                      <p>
                        {expiredLicenses}{" "}
                        license
                        {expiredLicenses !==
                        1
                          ? "s have"
                          : " has"}{" "}
                        expired.
                      </p>
                    </div>

                  </div>
                )}


                {notificationCount ===
                  0 && (
                  <div className="notification-empty">
                    No current license
                    alerts.
                  </div>
                )}

              </div>
            )}

          </div>


          <button
            className="top-icon-button"
            title="Help"
          >
            ?
          </button>


          <button
            className="top-icon-button"
            title="Refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            ↻
          </button>

        </div>

      </div>


      <div className="dashboard-content">

        {/* ===================================================
            GLOBAL SEARCH RESULTS
        =================================================== */}

        {search.trim() && (
          <section className="search-results-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Search Results
                </h2>

                <p>
                  Search across licenses,
                  employees, assignments,
                  renewals and activities.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                Clear
              </button>

            </div>


            <p className="search-result-count">
              Found{" "}
              <strong>
                {globalSearchResults.length}
              </strong>{" "}
              matching record
              {globalSearchResults.length !==
              1
                ? "s"
                : ""}
              .
            </p>


            {globalSearchResults.length >
            0 ? (

              <div className="search-results-list">

                {globalSearchResults
                  .slice(0, 25)
                  .map((result, index) => (

                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      className="search-result-row"
                    >

                      <div className="search-result-main">

                        <div className="search-result-type">
                          {result.type}
                        </div>

                        <strong>
                          {result.title}
                        </strong>

                        <span>
                          {result.subtitle}
                        </span>

                        <small>
                          {result.details}
                        </small>

                      </div>


                      <span
                        className={`search-result-status ${String(
                          result.status ||
                            ""
                        )
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {result.status}
                      </span>

                    </div>

                  ))}

              </div>

            ) : (

              <div className="empty-dashboard">
                No matching records found
                anywhere in the project.
              </div>

            )}

            {globalSearchResults.length >
              25 && (
              <div className="search-more-message">
                Showing first 25 results.
              </div>
            )}

          </section>
        )}


        {/* ===================================================
            NORMAL DASHBOARD
        =================================================== */}

        {!search.trim() && (
          <>

            {/* HEADING */}

            <div className="dashboard-heading">

              <div>

                <h1>
                  Dashboard
                </h1>

                <p>
                  Overview of your license
                  management system.
                </p>

              </div>


              <div className="dashboard-date-controls">

                <div className="quick-periods">

                  <button
                    type="button"
                    className={
                      selectedPeriod ===
                      "This Week"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDateRange(
                        "week"
                      )
                    }
                  >
                    This Week
                  </button>


                  <button
                    type="button"
                    className={
                      selectedPeriod ===
                      "This Month"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDateRange(
                        "month"
                      )
                    }
                  >
                    This Month
                  </button>


                  <button
                    type="button"
                    className={
                      selectedPeriod ===
                      "Last 90 Days"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDateRange("90")
                    }
                  >
                    90 Days
                  </button>

                </div>


                <div className="date-range">

                  <span>▣</span>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(
                        event.target.value
                      );

                      setSelectedPeriod(
                        "Selected period"
                      );
                    }}
                  />

                  <span>—</span>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(
                        event.target.value
                      );

                      setSelectedPeriod(
                        "Selected period"
                      );
                    }}
                  />

                </div>


                <button
                  type="button"
                  className="refresh-button"
                  onClick={
                    handleRefresh
                  }
                  disabled={refreshing}
                >
                  ↻{" "}
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </button>

              </div>

            </div>


            {/* STAT CARDS */}

            <div className="dashboard-cards">

              <div className="stat-card">

                <div className="stat-icon blue">
                  ▦
                </div>

                <div>
                  <span>
                    Total Licenses
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : totalLicenses}
                  </strong>

                  <small className="neutral">
                    Current database
                    records
                  </small>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon green">
                  ✓
                </div>

                <div>
                  <span>
                    Active Licenses
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : activeLicenses}
                  </strong>

                  <small className="neutral">
                    Current license
                    status
                  </small>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon orange">
                  ◷
                </div>

                <div>
                  <span>
                    Expiring Soon
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : expiringSoon}
                  </strong>

                  <small className="neutral">
                    Within 30 days
                  </small>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon red">
                  !
                </div>

                <div>
                  <span>
                    Expired Licenses
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : expiredLicenses}
                  </strong>

                  <small className="neutral">
                    Based on expiry
                    dates
                  </small>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon purple">
                  ♟
                </div>

                <div>
                  <span>
                    Total Employees
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : employees.length}
                  </strong>

                  <small className="neutral">
                    Current database
                    records
                  </small>
                </div>

              </div>

            </div>


            {/* STATUS + PERIOD */}

            <div className="dashboard-grid">

              <section className="dashboard-panel status-panel">

                <div className="panel-header">

                  <h2>
                    License Status Overview
                  </h2>

                  <span className="panel-period">
                    {selectedPeriod}
                  </span>

                </div>


                <div className="status-content">

                  <div
                    className="donut-chart"
                    style={donutStyle}
                  >

                    <div className="donut-center">

                      <strong>
                        {totalLicenses}
                      </strong>

                      <span>
                        Total
                      </span>

                    </div>

                  </div>


                  <div className="status-legend">

                    <div>
                      <span>
                        <i className="dot green-dot"></i>
                        Active
                      </span>

                      <strong>
                        {activeLicenses} (
                        {statusPercent(
                          activeLicenses
                        )}
                        %)
                      </strong>
                    </div>


                    <div>
                      <span>
                        <i className="dot orange-dot"></i>
                        Expiring Soon
                      </span>

                      <strong>
                        {expiringSoon} (
                        {statusPercent(
                          expiringSoon
                        )}
                        %)
                      </strong>
                    </div>


                    <div>
                      <span>
                        <i className="dot red-dot"></i>
                        Expired
                      </span>

                      <strong>
                        {expiredLicenses} (
                        {statusPercent(
                          expiredLicenses
                        )}
                        %)
                      </strong>
                    </div>


                    <div>
                      <span>
                        <i className="dot gray-dot"></i>
                        Other
                      </span>

                      <strong>
                        {Math.max(
                          0,
                          totalLicenses -
                            activeLicenses -
                            expiringSoon -
                            expiredLicenses
                        )}{" "}
                        (
                        {statusPercent(
                          Math.max(
                            0,
                            totalLicenses -
                              activeLicenses -
                              expiringSoon -
                              expiredLicenses
                          )
                        )}
                        %)
                      </strong>
                    </div>

                  </div>

                </div>

              </section>


              <section className="dashboard-panel period-panel">

                <div className="panel-header">

                  <h2>
                    Selected Period Activity
                  </h2>

                  <span className="panel-period">
                    {selectedPeriod}
                  </span>

                </div>


                <div className="period-stats">

                  <div className="period-stat">
                    <span>
                      Audit Activities
                    </span>

                    <strong>
                      {periodAuditLogs.length}
                    </strong>
                  </div>


                  <div className="period-stat">
                    <span>
                      Renewals
                    </span>

                    <strong>
                      {periodRenewals.length}
                    </strong>
                  </div>


                  <div className="period-stat">
                    <span>
                      Assignments
                    </span>

                    <strong>
                      {periodAssignments.length}
                    </strong>
                  </div>


                  <div className="period-stat">
                    <span>
                      Total Assignments
                    </span>

                    <strong>
                      {assignmentCount}
                    </strong>
                  </div>

                </div>


                <div className="data-note">
                  Values are calculated
                  from records returned
                  by the database APIs.
                </div>

              </section>

            </div>


            {/* LOWER GRID */}

            <div className="dashboard-lower-grid">

              {/* VENDORS */}

              <section className="dashboard-panel">

                <div className="panel-header">

                  <h2>
                    Top Vendors by Licenses
                  </h2>

                  <a href="/vendors">
                    View All
                  </a>

                </div>


                <div className="vendor-list">

                  {vendorStats.length ===
                  0 ? (
                    <div className="empty-dashboard">
                      No vendor data
                      available.
                    </div>
                  ) : (
                    vendorStats.map(
                      (vendor) => (
                        <div
                          className="vendor-row"
                          key={
                            vendor.name
                          }
                        >

                          <span
                            title={
                              vendor.name
                            }
                          >
                            {vendor.name}
                          </span>

                          <div className="vendor-bar">

                            <div
                              style={{
                                width: `${vendor.percentage}%`,
                              }}
                            ></div>

                          </div>

                          <strong>
                            {vendor.count}{" "}
                            <small>
                              (
                              {
                                vendor.percentage
                              }
                              %)
                            </small>
                          </strong>

                        </div>
                      )
                    )
                  )}

                </div>

              </section>


              {/* RECENT RENEWALS */}

              <section className="dashboard-panel">

                <div className="panel-header">

                  <h2>
                    Recent Renewals
                  </h2>

                  <a href="/renewals">
                    View All
                  </a>

                </div>


                <div className="renewal-list">

                  {recentRenewals.length ===
                  0 ? (
                    <div className="empty-dashboard">
                      No renewal history
                      available.
                    </div>
                  ) : (
                    recentRenewals.map(
                      (renewal) => {

                        const software =
                          renewal.license
                            ?.software
                            ?.softwareName ||
                          "License";

                        const remaining =
                          daysUntil(
                            renewal.newExpiryDate
                          );

                        return (
                          <div
                            className="renewal-row"
                            key={
                              renewal.renewalId ||
                              `${software}-${renewal.renewalDate}`
                            }
                          >

                            <div className="software-logo">
                              {software
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="renewal-info">

                              <strong>
                                {software}
                              </strong>

                              <span>
                                Renewal on{" "}
                                {formatDate(
                                  renewal.renewalDate
                                )}
                              </span>

                            </div>

                            <span className="renewal-badge">

                              {remaining !==
                              null
                                ? remaining >=
                                  0
                                  ? `${remaining} days left`
                                  : "Expired"
                                : "No expiry data"}

                            </span>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

              </section>


              {/* RECENT ACTIVITIES */}

              <section className="dashboard-panel">

                <div className="panel-header">

                  <h2>
                    Recent Activities
                  </h2>

                  <a href="/audit-log">
                    View All
                  </a>

                </div>


                <div className="activity-list">

                  {recentActivities.length ===
                  0 ? (
                    <div className="empty-dashboard">
                      No recent activity
                      available.
                    </div>
                  ) : (
                    recentActivities.map(
                      (activity) => (
                        <div
                          className="activity-row"
                          key={
                            activity.auditId ||
                            `${activity.action}-${activity.actionTime}`
                          }
                        >

                          <div className="activity-icon">

                            {activity.action ===
                            "ASSIGN"
                              ? "↔"
                              : activity.action ===
                                "UPDATE"
                              ? "✎"
                              : activity.action ===
                                "CREATE"
                              ? "+"
                              : "●"}

                          </div>


                          <div className="activity-info">

                            <strong>
                              {activityText(
                                activity
                              )}
                            </strong>

                            <span>
                              {formatDate(
                                activity.actionTime ||
                                  activity.createdAt
                              )}
                            </span>

                          </div>


                          <span className="activity-dot"></span>

                        </div>
                      )
                    )
                  )}

                </div>

              </section>

            </div>


            {/* DATA SUMMARY */}

            <section className="data-summary-panel">

              <div className="data-summary-icon">
                ✓
              </div>

              <div className="data-summary-text">

                <strong>
                  Database Data
                </strong>

                <span>
                  Dashboard values are
                  calculated from records
                  returned by your backend
                  APIs.
                </span>

              </div>


              <div className="data-summary-values">

                <div>
                  <span>
                    Licenses
                  </span>

                  <strong>
                    {totalLicenses}
                  </strong>
                </div>


                <div>
                  <span>
                    Employees
                  </span>

                  <strong>
                    {employees.length}
                  </strong>
                </div>


                <div>
                  <span>
                    Assignments
                  </span>

                  <strong>
                    {assignments.length}
                  </strong>
                </div>


                <div>
                  <span>
                    Renewals
                  </span>

                  <strong>
                    {renewals.length}
                  </strong>
                </div>


                <div>
                  <span>
                    Activities
                  </span>

                  <strong>
                    {auditLogs.length}
                  </strong>
                </div>

              </div>

            </section>

          </>
        )}

      </div>

    </div>
  );
}

export default Dashboard;