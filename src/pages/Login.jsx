import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (
      !email.trim() ||
      !password
    ) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      // =====================================================
      // CALL BACKEND LOGIN API
      // =====================================================

      const response =
        await axios.post(
          "http://localhost:8081/api/auth/login",
          {
            email:
              email.trim(),

            password,
          }
        );


      console.log(
        "LOGIN RESPONSE:",
        response.data
      );


      // =====================================================
      // GET JWT
      // =====================================================

      const token =
        response.data?.token;


      console.log(
        "JWT TOKEN:",
        token
      );


      if (!token) {

        setError(
          "Login successful, but the server did not return a token."
        );

        return;
      }


      // =====================================================
      // CLEAR OLD TOKENS
      // =====================================================

      localStorage.removeItem(
        "token"
      );

      sessionStorage.removeItem(
        "token"
      );


      // =====================================================
      // SAVE TOKEN
      //
      // Remember Me:
      // localStorage
      //
      // Normal login:
      // sessionStorage
      // =====================================================

      if (rememberMe) {

        localStorage.setItem(
          "token",
          token
        );

        console.log(
          "JWT saved to LOCAL STORAGE"
        );

      } else {

        sessionStorage.setItem(
          "token",
          token
        );

        console.log(
          "JWT saved to SESSION STORAGE"
        );
      }


      // =====================================================
      // SAVE USER
      // =====================================================

      const user = {

        
         

        username:
          response.data?.username,

        

        role:
          response.data?.role,
      };


      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "Local token:",
        localStorage.getItem("token")
      );

      console.log(
        "Session token:",
        sessionStorage.getItem("token")
      );

      console.log(
        "Stored user:",
        localStorage.getItem("user")
      );


      // =====================================================
      // GO TO DASHBOARD
      // =====================================================

      window.location.href =
        "/dashboard";


    } catch (err) {

      console.error(
        "Login error:",
        err
      );


      if (err.response) {

        setError(
          err.response.data?.message ||
          err.response.data?.error ||
          "Invalid email or password."
        );

      } else if (err.request) {

        setError(
          "Unable to connect to the server. Make sure your backend is running."
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


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="login-page">


      <div className="login-visual">

        <div className="visual-content">


          <div className="brand">

            <div className="brand-icon">
              ✓
            </div>

            <span>
              LICENSE
              <br />
              MANAGEMENT
            </span>

          </div>


          <div className="lock-illustration">


            <div className="laptop">

              <div className="laptop-screen">

                <div className="screen-line"></div>

                <div className="screen-line short"></div>

                <div className="screen-line"></div>

              </div>

              <div className="laptop-base"></div>

            </div>


            <div className="shield">

              <div className="lock-icon">
                🔒
              </div>

            </div>


          </div>


          <h1>
            License Management
          </h1>


          <p>
            Manage your software licenses,
            vendors, employees and renewals
            in one place.
          </p>


        </div>

      </div>


      <div className="login-section">


        <div className="login-card">


          <div className="welcome">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to continue to
              License Management System
            </p>

          </div>


          <form
            onSubmit={handleLogin}
          >


            {error && (

              <div className="login-error">
                {error}
              </div>

            )}


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">


              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  disabled={loading}
                >
                  Forgot Password?
                </button>

              </div>


              <div className="password-input">

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

                <span className="eye-icon">
                  ◉
                </span>

              </div>

            </div>


            {/* REMEMBER ME */}

            <div className="remember-row">

              <label className="remember">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* LOGIN */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Signing In..."
                : "Sign In"}

            </button>


            {/* SSO */}

            <button
              type="button"
              className="alternative-login"
              disabled={loading}
            >
              Sign in with SSO / OTP
            </button>


          </form>


          <div className="login-footer">

            © 2026 License Management System

          </div>


        </div>

      </div>

    </div>
  );
}

export default Login;