import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function HospitalRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: "",
    branch: "",
    area: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [id]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/hospitals/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Hospital registration failed.");
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowSuccess(false);

    navigate("/hospital/login");
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
              HOSPITAL REGISTRATION
            </span>

            <h1>
              Bring your
              <br />
              <span>care online.</span>
            </h1>

            <p>
              Register your hospital to securely
              manage patients and their post-discharge
              care journey.
            </p>

          </div>

        </div>


        {/* Registration Card */}
        <div className="auth-card">

          <div className="auth-card-header">

            <h2>Register Hospital</h2>

            <p>
              Create your hospital account.
            </p>

          </div>


          <form onSubmit={handleRegister}>

            {/* Hospital Name */}
            <div className="form-group">

              <label htmlFor="hospitalName">
                Hospital Name
              </label>

              <input
                id="hospitalName"
                type="text"
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={handleChange}
                required
              />

            </div>


            {/* Branch + Area */}
            <div className="form-row">

              <div className="form-group">

                <label htmlFor="branch">
                  Branch
                </label>

                <input
                  id="branch"
                  type="text"
                  placeholder="Branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="area">
                  Area
                </label>

                <input
                  id="area"
                  type="text"
                  placeholder="Area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Email */}
            <div className="form-group">

              <label htmlFor="email">
                Hospital Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter hospital email"
                value={formData.email}
                onChange={handleChange}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
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


            {/* Register */}
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Register Hospital"}
            </button>

          </form>


          <div className="auth-divider">
            <span>Already registered?</span>
          </div>


          <Link
            to="/hospital/login"
            className="secondary-button"
          >
            Go to Login
          </Link>


          <Link
            to="/"
            className="back-link"
          >
            ← Back to portals
          </Link>

        </div>

      </div>


      {/* Success Popup */}
      {showSuccess && (

        <div className="success-overlay">

          <div className="success-popup">

            <div className="success-icon">
              <Icon name="check" size={28} />
            </div>

            <h2>
              Registration Successful
            </h2>

            <p>
              Your hospital has been registered
              successfully.
            </p>

            <button
              className="primary-button"
              onClick={handleContinue}
            >
              Continue to Login
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default HospitalRegister;