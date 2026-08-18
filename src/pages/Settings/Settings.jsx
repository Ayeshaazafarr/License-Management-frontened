import {
  useEffect,
  useState,
} from "react";

import api from "../../services/api";

import "./Settings.css";

function Settings() {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");

  const [error, setError] = useState("");


  // =========================================================
  // LOAD CURRENT USER
  // =========================================================

  useEffect(() => {

    const loadUser = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/auth/me"
        );

        const currentUser = response.data;

        setUser(currentUser);

        setProfile({
          username:
            currentUser?.username || "",

          email:
            currentUser?.email || "",
        });

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

      } catch (err) {

        console.error(
          "Failed to load user:",
          err
        );

        try {

          const storedUser =
            localStorage.getItem("user");

          if (storedUser) {

            const localUser =
              JSON.parse(storedUser);

            setUser(localUser);

            setProfile({
              username:
                localUser?.username || "",

              email:
                localUser?.email || "",
            });

            return;
          }

        } catch (localError) {

          console.error(
            "Failed to read local user:",
            localError
          );
        }

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load user information."
        );

      } finally {

        setLoading(false);
      }
    };

    loadUser();

  }, []);


  // =========================================================
  // ROLE
  // =========================================================

  const roleName =
    typeof user?.role === "string"
      ? user.role
      : user?.role?.roleName || "Viewer";

  const role =
    String(roleName).toUpperCase();

  const isViewer =
    role === "VIEWER";


  // =========================================================
  // PROFILE CHANGE
  // =========================================================

  const handleProfileChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setProfileMessage("");
  };


  // =========================================================
  // PASSWORD CHANGE
  // =========================================================

  const handlePasswordChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setPasswordMessage("");
  };


  // =========================================================
  // PROFILE SAVE
  // =========================================================

  const handleProfileSubmit = async (e) => {

    e.preventDefault();

    setProfileMessage("");
    setError("");

    if (isViewer) {

      setError(
        "Viewer accounts are read-only and cannot edit their profile."
      );

      return;
    }

    if (!profile.username.trim()) {

      setError(
        "Username is required."
      );

      return;
    }

    if (!profile.email.trim()) {

      setError(
        "Email is required."
      );

      return;
    }

    try {

      const userId =
        user?.userId;

      if (!userId) {

        setError(
          "User information is unavailable."
        );

        return;
      }

      const response =
        await api.put(
          `/api/users/${userId}`,
          {
            username:
              profile.username.trim(),

            email:
              profile.email.trim(),
          }
        );

      const updatedUser = {
        ...user,

        username:
          response.data?.username ||
          profile.username.trim(),

        email:
          response.data?.email ||
          profile.email.trim(),
      };

      setUser(updatedUser);

      setProfile({
        username:
          updatedUser.username || "",

        email:
          updatedUser.email || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfileMessage(
        "Profile updated successfully."
      );

    } catch (err) {

      console.error(
        "Failed to update profile:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update profile."
      );
    }
  };


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handlePasswordSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setPasswordMessage("");

    if (isViewer) {

      setError(
        "Viewer accounts are read-only and cannot change their password."
      );

      return;
    }

    if (!passwordData.currentPassword) {

      setError(
        "Current password is required."
      );

      return;
    }

    if (!passwordData.newPassword) {

      setError(
        "New password is required."
      );

      return;
    }

    if (
      passwordData.newPassword.length < 6
    ) {

      setError(
        "New password must be at least 6 characters."
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {

      setError(
        "New password and confirm password do not match."
      );

      return;
    }

    try {

      // -------------------------------------------------------
      // CHECK TOKEN
      // -------------------------------------------------------
const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");       
      if (!token) {

        setError(
          "You are not logged in. Please log in again."
        );

        return;
      }

      console.log(
        "JWT token exists:",
        true
      );


      // -------------------------------------------------------
      // CHANGE PASSWORD
      // -------------------------------------------------------

      const response =
        await api.put(
          "/api/auth/change-password",
          {
            currentPassword:
              passwordData.currentPassword,

            newPassword:
              passwordData.newPassword,
          }
        );


      console.log(
        "Password change response:",
        response.data
      );


      // -------------------------------------------------------
      // CLEAR FORM
      // -------------------------------------------------------

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });


      setPasswordMessage(
        "Password changed successfully."
      );

    } catch (err) {

      console.error(
        "Failed to change password:",
        err
      );

      if (
        err.response?.status === 401
      ) {

        setError(
          "Authentication failed. Please log in again."
        );

        return;
      }

      if (
        err.response?.status === 403
      ) {

        setError(
          "Access forbidden. Your authentication token was not accepted."
        );

        return;
      }

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        "Unable to change password."
      );
    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    sessionStorage.clear();

    window.location.href =
      "/login";
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="settings-page">

        <div className="settings-message">
          Loading settings...
        </div>

      </div>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="settings-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account and application settings.
          </p>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="settings-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =====================================================
          PROFILE
      ===================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              Profile
            </h2>

            <p>
              Your account information.
            </p>

          </div>

          <div className="settings-avatar">

            {profile.username
              ?.charAt(0)
              .toUpperCase() || "U"}

          </div>

        </div>


        <form
          className="settings-form"
          onSubmit={handleProfileSubmit}
        >

          <div className="settings-grid">

            <div className="settings-form-group">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={
                  profile.username
                }
                onChange={
                  handleProfileChange
                }
                readOnly={isViewer}
              />

            </div>


            <div className="settings-form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={
                  profile.email
                }
                onChange={
                  handleProfileChange
                }
                readOnly={isViewer}
              />

            </div>

          </div>


          <div className="settings-readonly-row">

            <div>

              <span>
                Role
              </span>

              <strong>
                {roleName}
              </strong>

            </div>

          </div>


          {!isViewer && (

            <div className="settings-actions">

              <button
                type="submit"
                className="settings-primary-button"
              >
                Save Profile
              </button>

            </div>

          )}

        </form>


        {profileMessage && (

          <div className="settings-success">
            {profileMessage}
          </div>

        )}

      </div>


      {/* =====================================================
          PASSWORD
      ===================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              Change Password
            </h2>

            <p>
              Update your account password.
            </p>

          </div>

        </div>


        {isViewer ? (

          <div className="settings-message">

            Viewer accounts are read-only.

          </div>

        ) : (

          <form
            className="settings-form"
            onSubmit={
              handlePasswordSubmit
            }
          >

            <div className="settings-grid">


              <div className="settings-form-group full">

                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                />

              </div>


              <div className="settings-form-group">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter new password"
                />

              </div>


              <div className="settings-form-group">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                />

              </div>

            </div>


            <div className="settings-actions">

              <button
                type="submit"
                className="settings-primary-button"
              >
                Change Password
              </button>

            </div>

          </form>

        )}


        {passwordMessage && (

          <div className="settings-success">
            {passwordMessage}
          </div>

        )}

      </div>


      {/* =====================================================
          SESSION
      ===================================================== */}

      <div className="settings-card danger-card">

        <div className="settings-card-header">

          <div>

            <h2>
              Session
            </h2>

            <p>
              Sign out of your License Management account.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="settings-danger-button"
          onClick={handleLogout}
        >
          Sign Out
        </button>

      </div>

    </div>
  );
}

export default Settings;