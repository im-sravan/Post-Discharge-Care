import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function HospitalLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://post-discharge-care.onrender.com/api/hospitals/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid hospital email or password."
        );
        return;
      }

      localStorage.setItem("hospitalToken", data.token);

      localStorage.setItem(
        "hospital",
        JSON.stringify(data.hospital)
      );

      navigate("/hospital/dashboard");
    } catch (error) {
      console.error("Hospital login error:", error);

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

        {/* Left Side */}
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
              HOSPITAL PORTAL
            </span>

            <h1>
              Manage care
              <br />
              <span>beyond discharge.</span>
            </h1>

            <p>
              Manage your discharged patients,
              care plans and emergency alerts from
              one secure platform.
            </p>

          </div>

        </div>

        {/* Login Card */}
        <div className="auth-card">

          <div className="auth-card-header">

            <h2>Hospital Login</h2>

            <p>
              Sign in to access your hospital dashboard.
            </p>

          </div>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="form-group">

              <label htmlFor="email">
                Hospital Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter hospital email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            {/* Password */}
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
                  <Icon name={showPassword ? "eye-off" : "eye"} />
                </button>

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Login */}
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

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <Link
            to="/hospital/register"
            className="secondary-button"
          >
            Register Hospital
          </Link>

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

export default HospitalLogin;