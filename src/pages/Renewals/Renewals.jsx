import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Renewals.css";

function Renewals() {
  const [renewals, setRenewals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // FETCH RENEWALS
  // =========================

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/renewal-history"
        );

      console.log(
        "Renewal history:",
        response.data
      );

      setRenewals(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(
        "Failed to fetch renewal history:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to load renewal history."
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

  useEffect(() => {
    fetchRenewals();
  }, []);

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (
    amount
  ) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "—";
    }

    const number =
      Number(amount);

    if (Number.isNaN(number)) {
      return String(amount);
    }

    return number.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================
  // STATISTICS
  // =========================

  const totalRenewals =
    renewals.length;

  const totalRenewalCost =
    renewals.reduce(
      (total, renewal) =>
        total +
        Number(
          renewal.renewalCost || 0
        ),
      0
    );

  const latestRenewal =
    renewals.length > 0
      ? [...renewals].sort(
          (a, b) =>
            new Date(
              b.renewalDate ||
                b.createdAt
            ) -
            new Date(
              a.renewalDate ||
                a.createdAt
            )
        )[0]
      : null;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="renewals-page">

      {/* HEADER */}

      <div className="renewals-header">

        <div>

          <h1>
            Renewal History
          </h1>

          <p>
            Track software license
            renewals, expiry changes
            and renewal costs.
          </p>

        </div>


        <button
          className="refresh-renewals-button"
          onClick={fetchRenewals}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="renewals-message">
          Loading renewal history...
        </div>
      )}


      {/* ERROR */}

      {error && !loading && (
        <div className="renewals-error">

          <p>
            {error}
          </p>

          <button
            onClick={
              fetchRenewals
            }
          >
            Try Again
          </button>

        </div>
      )}


      {/* DATA */}

      {!loading &&
        !error && (
          <>

            {/* SUMMARY */}

            <div className="renewals-summary">

              <div className="renewal-summary-card">

                <span>
                  Total Renewals
                </span>

                <strong>
                  {totalRenewals}
                </strong>

              </div>


              <div className="renewal-summary-card">

                <span>
                  Total Renewal Cost
                </span>

                <strong>
                  {formatCurrency(
                    totalRenewalCost
                  )}
                </strong>

              </div>


              <div className="renewal-summary-card">

                <span>
                  Latest Renewal
                </span>

                <strong>
                  {latestRenewal
                    ? formatDate(
                        latestRenewal.renewalDate ||
                          latestRenewal.createdAt
                      )
                    : "—"}
                </strong>

              </div>

            </div>


            {/* TABLE */}

            <div className="renewals-table-container">

              <table className="renewals-table">

                <thead>

                  <tr>
                    <th>
                      Software
                    </th>

                    <th>
                      License Key
                    </th>

                    <th>
                      Previous Expiry
                    </th>

                    <th>
                      New Expiry
                    </th>

                    <th>
                      Renewal Date
                    </th>

                    <th>
                      Renewal Cost
                    </th>

                    <th>
                      Renewed By
                    </th>

                    <th>
                      Remarks
                    </th>
                  </tr>

                </thead>


                <tbody>

                  {renewals.length ===
                  0 ? (

                    <tr>

                      <td
                        colSpan="8"
                        className="empty-message"
                      >
                        No renewal history
                        found.
                      </td>

                    </tr>

                  ) : (

                    renewals.map(
                      (renewal) => {

                        const software =
                          renewal
                            .license
                            ?.software;

                        return (

                          <tr
                            key={
                              renewal.renewalId ||
                              `${renewal.renewalDate}-${renewal.license?.licenseId}`
                            }
                          >

                            {/* SOFTWARE */}

                            <td>

                              <div className="renewal-software">

                                <div className="renewal-software-icon">

                                  {software
                                    ?.softwareName
                                    ?.charAt(
                                      0
                                    )
                                    .toUpperCase() ||
                                    "S"}

                                </div>


                                <div>

                                  <strong>
                                    {software
                                      ?.softwareName ||
                                      "—"}
                                  </strong>


                                  {software?.version && (
                                    <span>
                                      v
                                      {
                                        software.version
                                      }
                                    </span>
                                  )}

                                </div>

                              </div>

                            </td>


                            {/* LICENSE */}

                            <td>

                              <span className="license-key">

                                {renewal
                                  .license
                                  ?.licenseKey ||
                                  "—"}

                              </span>

                            </td>


                            {/* PREVIOUS EXPIRY */}

                            <td>

                              <span className="expiry-date previous">

                                {formatDate(
                                  renewal.previousExpiryDate
                                )}

                              </span>

                            </td>


                            {/* NEW EXPIRY */}

                            <td>

                              <span className="expiry-date new">

                                {formatDate(
                                  renewal.newExpiryDate
                                )}

                              </span>

                            </td>


                            {/* RENEWAL DATE */}

                            <td>

                              {formatDate(
                                renewal.renewalDate ||
                                  renewal.createdAt
                              )}

                            </td>


                            {/* COST */}

                            <td>

                              <strong className="renewal-cost">

                                {formatCurrency(
                                  renewal.renewalCost
                                )}

                              </strong>

                            </td>


                            {/* RENEWED BY */}

                            <td>

                              <div className="renewed-by">

                                <div className="renewed-by-avatar">

                                  {renewal
                                    .renewedBy
                                    ?.username
                                    ?.charAt(
                                      0
                                    )
                                    .toUpperCase() ||
                                    "A"}

                                </div>


                                <div>

                                  <strong>

                                    {renewal
                                      .renewedBy
                                      ?.username ||
                                      "—"}

                                  </strong>


                                  <span>

                                    {renewal
                                      .renewedBy
                                      ?.role
                                      ?.roleName ||
                                      "—"}

                                  </span>

                                </div>

                              </div>

                            </td>


                            {/* REMARKS */}

                            <td>

                              <span className="renewal-remarks">

                                {renewal
                                  .remarks ||
                                  "—"}

                              </span>

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

    </div>
  );
}

export default Renewals;