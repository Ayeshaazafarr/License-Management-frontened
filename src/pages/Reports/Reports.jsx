import { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

const API_BASE = "/api";

function Reports() {
  const [reportType, setReportType] = useState("inventory");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [licenses, setLicenses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [renewals, setRenewals] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    setGenerated(false);
  }, [reportType]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dateStr.slice(0, 10);
  };

  const formatCurrency = (value) => {
    return "$" + (Number(value) || 0).toLocaleString();
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (reportType === "inventory" || reportType === "expiring" || reportType === "cost") {
        const res = await axios.get(`${API_BASE}/licenses`);
        setLicenses(res.data || []);
      }

      if (reportType === "assignment") {
        const res = await axios.get(`${API_BASE}/license-assignments`);
        setAssignments(res.data || []);
      }

      if (reportType === "renewal") {
        const res = await axios.get(`${API_BASE}/renewal-history`);
        setRenewals(res.data || []);
      }

      setGenerated(true);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError("Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const isInRange = (dateStr) => {
    if (!dateStr) return true;
    if (dateFrom && dateStr < dateFrom) return false;
    if (dateTo && dateStr > dateTo) return false;
    return true;
  };

  const getFilteredLicenses = () => {
    return licenses.filter((l) => isInRange(l.purchaseDate));
  };

  const getFilteredAssignments = () => {
    return assignments.filter((a) => isInRange(a.assignedDate));
  };

  const getFilteredRenewals = () => {
    return renewals.filter((r) => isInRange(r.renewalDate));
  };

  const getExpiringLicenses = () => {
    return licenses.filter((l) => {
      const days = daysUntil(l.expiryDate);
      return days !== null && days <= 90;
    });
  };

  const handleExportCsv = (columns, rows) => {
    if (rows.length === 0) return;

    let csv = columns.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell ?? ""}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTable = (columns, rows) => {
    if (rows.length === 0) {
      return <p className="reports-empty">No records found.</p>;
    }

    return (
      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell ?? "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInventoryReport = () => {
    const filtered = getFilteredLicenses();
    const active = filtered.filter((l) => l.status === "Active").length;
    const expired = filtered.filter((l) => l.status === "Expired").length;

    const columns = ["Software", "Vendor", "License Key", "Expiry", "Seats", "Cost", "Status"];
    const rows = filtered.map((l) => [
      l.softwareName,
      l.vendorName,
      l.licenseKey,
      formatDate(l.expiryDate),
      l.seats,
      formatCurrency(l.cost),
      l.status,
    ]);

    return (
      <>
        <div className="reports-summary">
          <div className="reports-summary-box">
            <span className="reports-summary-value">{filtered.length}</span>
            <span className="reports-summary-label">Total Licenses</span>
          </div>
          <div className="reports-summary-box">
            <span className="reports-summary-value">{active}</span>
            <span className="reports-summary-label">Active</span>
          </div>
          <div className="reports-summary-box">
            <span className="reports-summary-value">{expired}</span>
            <span className="reports-summary-label">Expired</span>
          </div>
        </div>
        {renderTable(columns, rows)}
        {rows.length > 0 && (
          <div className="reports-export">
            <button onClick={handlePrint} className="reports-secondary-button">Print</button>
            <button onClick={() => handleExportCsv(columns, rows)} className="reports-secondary-button">
              Export CSV
            </button>
          </div>
        )}
      </>
    );
  };

  const renderAssignmentReport = () => {
    const filtered = getFilteredAssignments();
    const columns = ["Employee", "Department", "Software", "License Key", "Assigned", "Status"];
    const rows = filtered.map((a) => [
      a.employeeName,
      a.departmentName,
      a.softwareName,
      a.licenseKey,
      formatDate(a.assignedDate),
      a.status,
    ]);

    return (
      <>
        {renderTable(columns, rows)}
        {rows.length > 0 && (
          <div className="reports-export">
            <button onClick={handlePrint} className="reports-secondary-button">Print</button>
            <button onClick={() => handleExportCsv(columns, rows)} className="reports-secondary-button">
              Export CSV
            </button>
          </div>
        )}
      </>
    );
  };

  const renderRenewalReport = () => {
    const filtered = getFilteredRenewals();
    const columns = ["Software", "License Key", "Previous Expiry", "New Expiry", "Cost", "Renewed By"];
    const rows = filtered.map((r) => [
      r.softwareName,
      r.licenseKey,
      formatDate(r.previousExpiryDate),
      formatDate(r.newExpiryDate),
      formatCurrency(r.renewalCost),
      r.renewedBy,
    ]);

    return (
      <>
        {renderTable(columns, rows)}
        {rows.length > 0 && (
          <div className="reports-export">
            <button onClick={handlePrint} className="reports-secondary-button">Print</button>
            <button onClick={() => handleExportCsv(columns, rows)} className="reports-secondary-button">
              Export CSV
            </button>
          </div>
        )}
      </>
    );
  };

  const renderExpiringReport = () => {
    const filtered = getExpiringLicenses();
    const columns = ["Software", "Vendor", "License Key", "Expiry", "Days Left"];
    const rows = filtered.map((l) => [
      l.softwareName,
      l.vendorName,
      l.licenseKey,
      formatDate(l.expiryDate),
      daysUntil(l.expiryDate),
    ]);

    return (
      <>
        {renderTable(columns, rows)}
        {rows.length > 0 && (
          <div className="reports-export">
            <button onClick={handlePrint} className="reports-secondary-button">Print</button>
            <button onClick={() => handleExportCsv(columns, rows)} className="reports-secondary-button">
              Export CSV
            </button>
          </div>
        )}
      </>
    );
  };

  const renderCostReport = () => {
    const filtered = getFilteredLicenses();
    const totalCost = filtered.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

    const columns = ["Software", "Vendor", "Cost", "Purchased", "Expiry"];
    const rows = filtered.map((l) => [
      l.softwareName,
      l.vendorName,
      formatCurrency(l.cost),
      formatDate(l.purchaseDate),
      formatDate(l.expiryDate),
    ]);

    return (
      <>
        <div className="reports-summary">
          <div className="reports-summary-box">
            <span className="reports-summary-value">{formatCurrency(totalCost)}</span>
            <span className="reports-summary-label">Total Cost</span>
          </div>
        </div>
        {renderTable(columns, rows)}
        {rows.length > 0 && (
          <div className="reports-export">
            <button onClick={handlePrint} className="reports-secondary-button">Print</button>
            <button onClick={() => handleExportCsv(columns, rows)} className="reports-secondary-button">
              Export CSV
            </button>
          </div>
        )}
      </>
    );
  };

  const renderReport = () => {
    if (!generated) {
      return <p className="reports-empty">Select a report type and click Generate Report.</p>;
    }

    if (reportType === "inventory") return renderInventoryReport();
    if (reportType === "assignment") return renderAssignmentReport();
    if (reportType === "renewal") return renderRenewalReport();
    if (reportType === "expiring") return renderExpiringReport();
    if (reportType === "cost") return renderCostReport();

    return null;
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports</h1>
        <p>Generate and view license management reports.</p>
      </div>

      {error && <div className="reports-error">{error}</div>}

      <form className="reports-filters" onSubmit={handleGenerate}>
        <div className="reports-form-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="inventory">License Inventory</option>
            <option value="assignment">License Assignment</option>
            <option value="renewal">Renewal Report</option>
            <option value="expiring">Expiring Licenses</option>
            <option value="cost">Cost Report</option>
          </select>
        </div>

        <div className="reports-form-group">
          <label>Date From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div className="reports-form-group">
          <label>Date To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <button type="submit" className="reports-primary-button" disabled={loading}>
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </form>

      <div className="reports-card">{renderReport()}</div>
    </div>
  );
}

export default Reports;