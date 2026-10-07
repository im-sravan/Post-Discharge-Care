import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function PatientLogin() {
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/patients/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            patientId,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid Patient ID or password."
        );

        return;
      }

      // Start a fresh patient consent session.
      localStorage.removeItem(
        "patientTermsAccepted"
      );

      localStorage.setItem(
        "patientToken",
        data.token
      );

      localStorage.setItem(
        "patient",
        JSON.stringify(data.patient)
      );

      // Terms must be accepted before dashboard access.
      navigate("/patient/terms");
    } catch (error) {
      console.error(
        "Patient login error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="auth-intro">
          <div className="auth-logo">
            <div className="brand-icon">
              <span></span>
              <span></span>
            </div>

            <div>
              <h2>Post-Discharge</h2>
              <p>Care</p>
            </div>
          </div>

          <div className="auth-message">
            <span className="small-heading">
              PATIENT PORTAL
            </span>

            <h1>
              Stay connected
              <br />
              <span>to your recovery.</span>
            </h1>

            <p>
              Access your medicines, recovery
              instructions and upcoming
              appointments in one place.
            </p>
          </div>
        </div>

        {/* =====================================================
            LOGIN CARD
        ===================================================== */}

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Patient Login</h2>

            <p>
              Sign in to access your
              post-discharge care.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="patientId">
                Patient ID
              </label>

              <input
                id="patientId"
                type="text"
                placeholder="Enter Patient ID"
                value={patientId}
                onChange={(e) =>
                  setPatientId(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <Icon
                    name={
                      showPassword
                        ? "eye-off"
                        : "eye"
                    }
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <Link
            to="/"
            className="back-link"
          >
            ← Back to portals
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;