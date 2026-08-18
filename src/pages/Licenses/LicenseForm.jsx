import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Licenses.css";

function LicenseForm({
  license,
  onClose,
  onLicenseAdded,
  onLicenseUpdated,
}) {
  const [softwareList, setSoftwareList] = useState([]);

  const [formData, setFormData] = useState({
    softwareId:
      license?.software?.softwareId ?? "",

    licenseKey:
      license?.licenseKey ?? "",

    purchaseDate:
      license?.purchaseDate ?? "",

    activationDate:
      license?.activationDate ?? "",

    expiryDate:
      license?.expiryDate ?? "",

    seatsPurchased:
      license?.seatsPurchased ?? "",

    cost:
      license?.cost ?? "",

    invoiceReference:
      license?.invoiceReference ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingSoftware, setLoadingSoftware] =
    useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD SOFTWARE
  // =====================================================

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        setLoadingSoftware(true);
        setError("");

        const response =
          await api.get("/api/software");

        setSoftwareList(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (err) {
        console.error(
          "Failed to fetch software:",
          err
        );

        if (err.response) {
          setError(
            err.response.data?.message ||
              err.response.data?.error ||
              "Unable to load software."
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
        setLoadingSoftware(false);
      }
    };

    fetchSoftware();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!formData.softwareId) {
      setError(
        "Please select software."
      );
      return;
    }

    if (!formData.licenseKey.trim()) {
      setError(
        "License key is required."
      );
      return;
    }

    if (!formData.purchaseDate) {
      setError(
        "Purchase date is required."
      );
      return;
    }

    if (!formData.expiryDate) {
      setError(
        "Expiry date is required."
      );
      return;
    }

    if (
      formData.activationDate &&
      formData.activationDate <
        formData.purchaseDate
    ) {
      setError(
        "Activation date cannot be before purchase date."
      );
      return;
    }

    if (
      formData.expiryDate <
        formData.purchaseDate
    ) {
      setError(
        "Expiry date cannot be before purchase date."
      );
      return;
    }

    if (
      formData.seatsPurchased !== "" &&
      Number(formData.seatsPurchased) < 1
    ) {
      setError(
        "Seats purchased must be at least 1."
      );
      return;
    }

    if (
      formData.cost !== "" &&
      Number(formData.cost) < 0
    ) {
      setError(
        "Cost cannot be negative."
      );
      return;
    }

    // ---------------------------------------------------
    // CREATE REQUEST DATA
    // ---------------------------------------------------

    const data = {
      softwareId:
        Number(formData.softwareId),

      licenseKey:
        formData.licenseKey.trim(),

      purchaseDate:
        formData.purchaseDate,

      activationDate:
        formData.activationDate || null,

      expiryDate:
        formData.expiryDate,

      seatsPurchased:
        formData.seatsPurchased === ""
          ? null
          : Number(formData.seatsPurchased),

      cost:
        formData.cost === ""
          ? null
          : Number(formData.cost),

      invoiceReference:
        formData.invoiceReference.trim() ||
        null,
    };

    // ===================================================
    // SAVE
    // ===================================================

    try {
      setLoading(true);

      console.log(
        "Sending license data:",
        data
      );

      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      if (license) {
        const response =
          await api.put(
            `/api/licenses/${license.licenseId}`,
            data
          );

        console.log(
          "License updated:",
          response.data
        );

        await onLicenseUpdated();

      }

      // -------------------------------------------------
      // CREATE
      // -------------------------------------------------

      else {
        const response =
          await api.post(
            "/api/licenses",
            data
          );

        console.log(
          "License created:",
          response.data
        );

        await onLicenseAdded();
      }

    } catch (err) {
      console.error(
        "License save error:",
        err
      );

      // -------------------------------------------------
      // BACKEND ERROR
      // -------------------------------------------------

      if (err.response) {

        console.error(
          "Backend response:",
          err.response.data
        );

        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to save license."
        );

      }

      // -------------------------------------------------
      // SERVER NOT REACHABLE
      // -------------------------------------------------

      else if (err.request) {

        setError(
          "Unable to connect to the server."
        );

      }

      // -------------------------------------------------
      // OTHER ERROR
      // -------------------------------------------------

      else {

        setError(
          "Something went wrong."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="license-modal-overlay">

      <div className="license-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="license-modal-header">

          <h2>
            {license
              ? "Edit License"
              : "Add License"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="license-form-error">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* SOFTWARE */}

          <div className="form-group">

            <label htmlFor="softwareId">
              Software *
            </label>

            <select
              id="softwareId"
              name="softwareId"
              value={formData.softwareId}
              onChange={handleChange}
              disabled={
                loading ||
                loadingSoftware
              }
            >

              <option value="">
                {loadingSoftware
                  ? "Loading software..."
                  : "Select software"}
              </option>

              {softwareList.map(
                (software) => (

                  <option
                    key={software.softwareId}
                    value={software.softwareId}
                  >
                    {software.softwareName}

                    {software.version
                      ? ` - ${software.version}`
                      : ""}
                  </option>

                )
              )}

            </select>

          </div>

          {/* LICENSE KEY */}

          <div className="form-group">

            <label htmlFor="licenseKey">
              License Key *
            </label>

            <input
              id="licenseKey"
              type="text"
              name="licenseKey"
              value={formData.licenseKey}
              onChange={handleChange}
              disabled={loading}
            />

          </div>

          {/* PURCHASE DATE */}

          <div className="form-group">

            <label htmlFor="purchaseDate">
              Purchase Date *
            </label>

            <input
              id="purchaseDate"
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              disabled={loading}
            />

          </div>

          {/* ACTIVATION DATE */}

          <div className="form-group">

            <label htmlFor="activationDate">
              Activation Date
            </label>

            <input
              id="activationDate"
              type="date"
              name="activationDate"
              value={formData.activationDate}
              onChange={handleChange}
              disabled={loading}
            />

          </div>

          {/* EXPIRY DATE */}

          <div className="form-group">

            <label htmlFor="expiryDate">
              Expiry Date *
            </label>

            <input
              id="expiryDate"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              disabled={loading}
            />

          </div>

          {/* SEATS */}

          <div className="form-group">

            <label htmlFor="seatsPurchased">
              Seats Purchased
            </label>

            <input
              id="seatsPurchased"
              type="number"
              name="seatsPurchased"
              value={formData.seatsPurchased}
              onChange={handleChange}
              min="1"
              disabled={loading}
            />

          </div>

          {/* COST */}

          <div className="form-group">

            <label htmlFor="cost">
              Cost
            </label>

            <input
              id="cost"
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
            />

          </div>

          {/* INVOICE */}

          <div className="form-group">

            <label htmlFor="invoiceReference">
              Invoice Reference
            </label>

            <input
              id="invoiceReference"
              type="text"
              name="invoiceReference"
              value={
                formData.invoiceReference
              }
              onChange={handleChange}
              disabled={loading}
            />

          </div>

          {/* =================================================
              AUTOMATIC STATUS INFORMATION
          ================================================= */}

          {formData.expiryDate && (
            <div className="automatic-status-info">

              <strong>
                Status is calculated automatically
              </strong>

              <span>
                The license status will be determined
                from the expiry date.
              </span>

            </div>
          )}

          {/* ACTIONS */}

          <div className="license-form-actions">

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
                loadingSoftware
              }
            >
              {loading
                ? "Saving..."
                : license
                  ? "Update License"
                  : "Save License"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default LicenseForm;