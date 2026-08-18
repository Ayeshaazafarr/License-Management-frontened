import { useEffect, useState } from "react";
import api from "../../services/api";
import LicenseForm from "./LicenseForm";
import { getLicenseStatus } from "../../utils/licenseStatus";
import "./Licenses.css";
function Licenses() {

  const [licenses, setLicenses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingLicense, setEditingLicense] =
    useState(null);


  // =====================================================
  // FETCH LICENSES
  // =====================================================

  const fetchLicenses = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/licenses"
        );

      setLicenses(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    }

    catch (err) {

      console.error(
        "Failed to fetch licenses:",
        err
      );

      if (err.response) {

        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to load licenses."
        );

      }

      else if (err.request) {

        setError(
          "Unable to connect to the server."
        );

      }

      else {

        setError(
          "Something went wrong."
        );
      }

    }

    finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD PAGE
  // =====================================================

  useEffect(() => {

    fetchLicenses();

  }, []);


  // =====================================================
  // ADD
  // =====================================================

  const handleAddLicense = () => {

    setEditingLicense(null);
    setShowForm(true);

  };


  // =====================================================
  // EDIT
  // =====================================================

  const handleEditLicense = (
    license
  ) => {

    setEditingLicense(license);
    setShowForm(true);

  };


  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleCloseForm = () => {

    setShowForm(false);
    setEditingLicense(null);

  };


  // =====================================================
  // AFTER ADD
  // =====================================================

  const handleLicenseAdded =
    async () => {

      await fetchLicenses();

      handleCloseForm();

    };


  // =====================================================
  // AFTER UPDATE
  // =====================================================

  const handleLicenseUpdated =
    async () => {

      await fetchLicenses();

      handleCloseForm();

    };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteLicense =
    async (license) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete license ${license.licenseKey}?`
        );

      if (!confirmed) {
        return;
      }

      try {

        await api.delete(
          `/api/licenses/${license.licenseId}`
        );

        await fetchLicenses();

      }

      catch (err) {

        console.error(
          "Failed to delete license:",
          err
        );

        if (err.response) {

          setError(
            err.response.data?.message ||
              err.response.data?.error ||
              "Unable to delete license."
          );

        }

        else if (err.request) {

          setError(
            "Unable to connect to the server."
          );

        }

        else {

          setError(
            "Unable to delete license."
          );
        }
      }
    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="licenses-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="licenses-header">

        <div>

          <h1>
            Licenses
          </h1>

          <p>
            Manage your software licenses.
          </p>

        </div>

        <button
          className="add-license-button"
          onClick={
            handleAddLicense
          }
        >
          + Add License
        </button>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="licenses-message">
          Loading licenses...
        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loading && (

        <div className="licenses-error">

          <p>
            {error}
          </p>

          <button
            onClick={fetchLicenses}
          >
            Try Again
          </button>

        </div>

      )}


      {/* =================================================
          DATA
      ================================================= */}

      {!loading &&
        !error && (

          <>

            {/* SUMMARY */}

            <div className="licenses-summary">

              Total Licenses:{" "}

              <strong>
                {licenses.length}
              </strong>

            </div>


            {/* TABLE */}

            <div className="licenses-table-container">

              <table className="licenses-table">

                <thead>

                  <tr>

                    <th>
                      Software
                    </th>

                    <th>
                      License Key
                    </th>

                    <th>
                      Purchase Date
                    </th>

                    <th>
                      Expiry Date
                    </th>

                    <th>
                      Seats
                    </th>

                    <th>
                      Cost
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Invoice
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {licenses.length === 0 ? (

                    <tr>

                      <td
                        colSpan="9"
                        className="empty-message"
                      >
                        No licenses found.
                      </td>

                    </tr>

                  ) : (

                    licenses.map(
                      (license) => {

                        const status =
                          getLicenseStatus(
                            license.expiryDate
                          );

                        return (

                          <tr
                            key={
                              license.licenseId
                            }
                          >

                            {/* SOFTWARE */}

                            <td>

                              <strong>
                                {
                                  license
                                    .software
                                    ?.softwareName ||
                                  "—"
                                }
                              </strong>

                            </td>


                            {/* LICENSE KEY */}

                            <td>
                              {
                                license.licenseKey ||
                                "—"
                              }
                            </td>


                            {/* PURCHASE DATE */}

                            <td>
                              {
                                license.purchaseDate ||
                                "—"
                              }
                            </td>


                            {/* EXPIRY DATE */}

                            <td>

                              <div className="expiry-date-wrapper">

                                <span>
                                  {
                                    license.expiryDate ||
                                    "—"
                                  }
                                </span>

                                {status.daysRemaining !==
                                  null && (

                                  <small
                                    className={
                                      status.daysRemaining <
                                      0
                                        ? "expiry-overdue"
                                        : status.daysRemaining <=
                                            30
                                          ? "expiry-warning"
                                          : "expiry-normal"
                                    }
                                  >

                                    {status.daysRemaining <
                                    0

                                      ? `Expired ${Math.abs(
                                          status.daysRemaining
                                        )} day${
                                          Math.abs(
                                            status.daysRemaining
                                          ) === 1
                                            ? ""
                                            : "s"
                                        } ago`

                                      : status.daysRemaining ===
                                          0

                                        ? "Expires today"

                                        : `${status.daysRemaining} day${
                                            status.daysRemaining ===
                                            1
                                              ? ""
                                              : "s"
                                          } remaining`}

                                  </small>

                                )}

                              </div>

                            </td>


                            {/* SEATS */}

                            <td>
                              {
                                license.seatsPurchased ??
                                "—"
                              }
                            </td>


                            {/* COST */}

                            <td>

                              {license.cost !=
                              null

                                ? `$${Number(
                                    license.cost
                                  ).toLocaleString()}`

                                : "—"}

                            </td>


                            {/* STATUS */}

                            <td>

                              <div className="license-status-wrapper">

                                <span
                                  className={`license-status ${status.className}`}
                                >
                                  {
                                    status.label
                                  }
                                </span>

                                {status.daysRemaining !==
                                  null && (

                                  <small className="license-days-remaining">

                                    {status.daysRemaining >
                                    0

                                      ? `${status.daysRemaining} day${
                                          status.daysRemaining ===
                                          1
                                            ? ""
                                            : "s"
                                        } remaining`

                                      : status.daysRemaining ===
                                          0

                                        ? "Expires today"

                                        : `Expired ${Math.abs(
                                            status.daysRemaining
                                          )} day${
                                            Math.abs(
                                              status.daysRemaining
                                            ) === 1
                                              ? ""
                                              : "s"
                                          } ago`}

                                  </small>

                                )}

                              </div>

                            </td>


                            {/* INVOICE */}

                            <td>
                              {
                                license.invoiceReference ||
                                "—"
                              }
                            </td>


                            {/* ACTIONS */}

                            <td>

                              <button
                                className="action-button"
                                onClick={() =>
                                  handleEditLicense(
                                    license
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="action-button delete"
                                onClick={() =>
                                  handleDeleteLicense(
                                    license
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        );
                      }
                    )

                  )}

                </tbody>

              </table>

            </div>

          </>

        )}


      {/* =================================================
          LICENSE FORM
      ================================================= */}

      {showForm && (

        <LicenseForm
          license={
            editingLicense
          }

          onClose={
            handleCloseForm
          }

          onLicenseAdded={
            handleLicenseAdded
          }

          onLicenseUpdated={
            handleLicenseUpdated
          }
        />

      )}

    </div>

  );
}

export default Licenses;