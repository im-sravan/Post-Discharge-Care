import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function FamilyLogin() {
  const navigate = useNavigate();

  const [familyId, setFamilyId] = useState("");
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
        "http://localhost:5000/api/patients/family-login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            familyId,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid Family Access ID or password."
        );

        return;
      }

      // Start a fresh family consent session.
      localStorage.removeItem(
        "familyTermsAccepted"
      );

      localStorage.setItem(
        "familyToken",
        data.token
      );

      localStorage.setItem(
        "family",
        JSON.stringify(data.family)
      );

      // Terms must be accepted before dashboard access.
      navigate("/family/terms");
    } catch (error) {
      console.error(
        "Family login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

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
              FAMILY PORTAL
            </span>

            <h1>
              Stay informed
              <br />
              <span>about their care.</span>
            </h1>

            <p>
              Stay connected with your loved
              one's recovery, medicines and
              appointments.
            </p>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-card-header">
            <h2>Family Login</h2>

            <p>
              Sign in to view your linked
              patient's care.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="familyId">
                Family Access ID
              </label>

              <input
                id="familyId"
                type="text"
                placeholder="Enter Family Access ID"
                value={familyId}
                onChange={(e) =>
                  setFamilyId(e.target.value)
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

export default FamilyLogin;