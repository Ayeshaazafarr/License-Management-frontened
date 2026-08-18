
import { useEffect, useState } from "react";
import api from "../../services/api";


function SoftwareForm({
  software,
  onClose,
  onSoftwareAdded,
  onSoftwareUpdated,
}) {

  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    softwareName: software?.softwareName || "",
    version: software?.version || "",
    category: software?.category || "",
    licenseType: software?.licenseType || "",
    description: software?.description || "",
    vendorId: software?.vendor?.vendorId
      ? String(software.vendor.vendorId)
      : "",
  });

  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // FETCH VENDORS
  // =========================

  const fetchVendors = async () => {
    try {

      setVendorLoading(true);

      const response = await api.get("/api/vendors");

      setVendors(response.data);

    } catch (err) {

      console.error(
        "Failed to fetch vendors:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load vendors."
      );

    } finally {

      setVendorLoading(false);

    }
  };


  // =========================
  // LOAD VENDORS
  // =========================

  useEffect(() => {
    fetchVendors();
  }, []);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    // =========================
    // VALIDATION
    // =========================

    if (!formData.softwareName.trim()) {

      setError(
        "Software name is required."
      );

      return;
    }

    if (!formData.vendorId) {

      setError(
        "Please select a vendor."
      );

      return;
    }


    try {

      setLoading(true);


      // =========================
      // DATA SENT TO BACKEND
      // =========================

      const data = {
        softwareName: formData.softwareName,
        version: formData.version,
        category: formData.category,
        licenseType: formData.licenseType,
        description: formData.description,
        vendorId: Number(formData.vendorId),
      };


      // =========================
      // UPDATE
      // =========================

      if (software) {

        const response = await api.put(
          `/api/software/${software.softwareId}`,
          data
        );

        console.log(
          "Software updated:",
          response.data
        );

        await onSoftwareUpdated();

      }

      // =========================
      // CREATE
      // =========================

      else {

        const response = await api.post(
          "/api/software",
          data
        );

        console.log(
          "Software created:",
          response.data
        );

        await onSoftwareAdded();

      }

    } catch (err) {

      console.error(
        "Software save error:",
        err
      );


      if (err.response) {

        setError(
          err.response.data?.message ||
            "Unable to save software."
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


  return (

    <div className="software-modal-overlay">

      <div className="software-modal">


        {/* HEADER */}

        <div className="software-modal-header">

          <h2>
            {software
              ? "Edit Software"
              : "Add Software"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="software-form-error">
            {error}
          </div>

        )}


        {/* FORM */}

        <form onSubmit={handleSubmit}>


          {/* SOFTWARE NAME */}

          <div className="form-group">

            <label>
              Software Name *
            </label>

            <input
              type="text"
              name="softwareName"
              value={formData.softwareName}
              onChange={handleChange}
              placeholder="e.g. Microsoft Office"
              disabled={loading}
            />

          </div>


          {/* VERSION */}

          <div className="form-group">

            <label>
              Version
            </label>

            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="e.g. 2025"
              disabled={loading}
            />

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Office"
              disabled={loading}
            />

          </div>


          {/* LICENSE TYPE */}

          <div className="form-group">

            <label>
              License Type
            </label>

            <input
              type="text"
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              placeholder="e.g. Subscription"
              disabled={loading}
            />

          </div>


          {/* VENDOR */}

          <div className="form-group">

            <label>
              Vendor *
            </label>

            <select
              name="vendorId"
              value={formData.vendorId}
              onChange={handleChange}
              disabled={
                loading || vendorLoading
              }
            >

              <option value="">
                {vendorLoading
                  ? "Loading vendors..."
                  : "Select a vendor"}
              </option>

              {vendors.map((vendor) => (

                <option
                  key={vendor.vendorId}
                  value={vendor.vendorId}
                >
                  {vendor.vendorName}
                </option>

              ))}

            </select>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Software description"
              rows="4"
              disabled={loading}
            />

          </div>


          {/* BUTTONS */}

          <div className="software-form-actions">

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
                loading || vendorLoading
              }
            >
              {loading
                ? "Saving..."
                : software
                  ? "Update Software"
                  : "Save Software"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default SoftwareForm;

