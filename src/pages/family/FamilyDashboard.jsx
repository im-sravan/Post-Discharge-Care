import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function FamilyDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [emergencyMessage, setEmergencyMessage] =
    useState("");

  const [showEmergency, setShowEmergency] =
    useState(false);

  const [sendingEmergency, setSendingEmergency] =
    useState(false);


  // =====================================================
  // FETCH LINKED PATIENT
  // =====================================================

  const fetchPatient = async () => {
    const token =
      localStorage.getItem("familyToken");

    if (!token) {
      navigate("/family/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/patients/family/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // Unauthorized
      if (response.status === 401) {
        localStorage.removeItem("familyToken");
        localStorage.removeItem("family");

        navigate("/family/login");

        return;
      }

      // Care period ended
      if (response.status === 403) {
        localStorage.removeItem("familyToken");
        localStorage.removeItem("family");

        setError(
          data.message ||
            "The patient's post-discharge care period has ended."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch patient."
        );
      }

      setPatient(data.patient);
    } catch (error) {
      console.error(
        "Fetch family patient error:",
        error
      );

      throw error;
    }
  };


  // =====================================================
  // FETCH EMERGENCY ALERTS
  // =====================================================

  const fetchAlerts = async () => {
    const token =
      localStorage.getItem("familyToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/emergency/family",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("familyToken");
        localStorage.removeItem("family");

        navigate("/family/login");

        return;
      }

      if (response.status === 403) {
        setError(
          data.message ||
            "The patient's post-discharge care period has ended."
        );

        return;
      }

      if (response.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error(
        "Fetch family alerts error:",
        error
      );
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchPatient();
        await fetchAlerts();
      } catch (error) {
        console.error(
          "Family dashboard error:",
          error
        );

        setError(
          error.message ||
            "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  // =====================================================
  // AUTO REFRESH PATIENT + MEDICINE STATUS
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPatient();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  // =====================================================
  // AUTO REFRESH EMERGENCY STATUS
  // =====================================================

  useEffect(() => {
    const interval = setInterval(
      fetchAlerts,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);


  // =====================================================
  // SEND FAMILY EMERGENCY
  // =====================================================

  const handleEmergency = async () => {
    const token =
      localStorage.getItem("familyToken");

    if (!token) {
      navigate("/family/login");
      return;
    }

    try {
      setSendingEmergency(true);

      const response = await fetch(
        "http://localhost:5000/api/emergency/family",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message:
              emergencyMessage.trim() ||
              "Emergency assistance requested by family.",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("familyToken");
        localStorage.removeItem("family");

        navigate("/family/login");

        return;
      }

      if (response.status === 403) {
        setError(
          data.message ||
            "The patient's post-discharge care period has ended."
        );

        setShowEmergency(false);

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send emergency alert."
        );
      }

      setEmergencyMessage("");
      setShowEmergency(false);

      await fetchAlerts();

      alert(
        "Emergency alert sent to the hospital."
      );
    } catch (error) {
      console.error(
        "Family emergency error:",
        error
      );

      alert(
        error.message ||
          "Unable to send emergency alert."
      );
    } finally {
      setSendingEmergency(false);
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "familyToken"
    );

    localStorage.removeItem("family");

    navigate("/family/login");
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <main
          className="dashboard-main"
          style={{
            marginLeft: 0,
            width: "100%",
          }}
        >
          <div className="empty-state">
            <div className="loading-spinner"></div>

            <p>
              Loading care information...
            </p>
          </div>
        </main>
      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-page">
        <main
          className="dashboard-main"
          style={{
            marginLeft: 0,
            width: "100%",
          }}
        >
          <div className="dashboard-error">
            <p>{error}</p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/family/login")
              }
            >
              Back to Login
            </button>
          </div>
        </main>
      </div>
    );
  }


  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            <span></span>
            <span></span>
          </div>

          <div>
            <h2>Post-Discharge</h2>
            <p>Care</p>
          </div>

        </div>


        <nav className="sidebar-nav">

          <button
            className="sidebar-nav-item active"
            type="button"
          >
            <Icon name="grid" />
            Family Care
          </button>

          <button
            className="sidebar-nav-item"
            type="button"
            disabled
          >
            <Icon name="message" />
            <div className="sidebar-nav-label">
              <span>Live Chat Bot</span>
              <small>Coming soon</small>
            </div>
          </button>

        </nav>


        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <Icon name="logout" />
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <span className="small-heading">
              FAMILY PORTAL
            </span>

            <h1>
              {patient?.name}'s Care
            </h1>

            <p>
              Stay informed about your
              family member's recovery.
            </p>

          </div>


          <div className="header-actions">

            <span className="patient-id-badge">
              Family Access
            </span>

          </div>

        </header>


        {/* EMERGENCY */}

        <section className="patient-emergency-section">

          <div className="patient-emergency-content">

            <div className="patient-emergency-icon">
              <Icon name="alert" size={26} />
            </div>

            <div className="patient-emergency-text">

              <h2>
                Emergency Assistance
              </h2>

              <p>
                Send an emergency alert to
                the hospital care team.
              </p>

            </div>

            <button
              className="patient-emergency-button"
              onClick={() =>
                setShowEmergency(
                  (current) => !current
                )
              }
            >
              <Icon name="alert" /> Emergency
            </button>

          </div>


          {showEmergency && (
            <div className="patient-emergency-form">

              <label>
                What happened{" "}
                <span>(optional)</span>
              </label>

              <textarea
                rows="3"
                placeholder="Describe the emergency..."
                value={emergencyMessage}
                onChange={(e) =>
                  setEmergencyMessage(
                    e.target.value
                  )
                }
              />

              <div className="patient-emergency-actions">

                <button
                  className="secondary-dashboard-button"
                  onClick={() =>
                    setShowEmergency(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="patient-send-emergency-button"
                  onClick={handleEmergency}
                  disabled={sendingEmergency}
                >
                  {sendingEmergency
                    ? "Sending..."
                    : "Send Emergency Alert"}
                </button>

              </div>

            </div>
          )}

        </section>


        {/* ALERT STATUS */}

        {alerts.length > 0 && (
          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Emergency Status
                </h2>

                <p>
                  Track emergency requests
                  sent for this patient.
                </p>

              </div>

            </div>


            <div className="patient-alert-list">

              {alerts.map((alert) => (

                <div
                  className="patient-alert-card"
                  key={alert._id}
                >

                  <div className="patient-alert-info">

                    <div className="patient-alert-icon">
                      <Icon name="alert" size={22} />
                    </div>

                    <div>

                      <h3>
                        Emergency Request
                      </h3>

                      <p>
                        {alert.message}
                      </p>

                      <span>
                        {new Date(
                          alert.createdAt
                        ).toLocaleString()}
                      </span>

                    </div>

                  </div>


                  <span
                    className={`emergency-status ${alert.status.toLowerCase()}`}
                  >
                    {alert.status}
                  </span>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* PATIENT SUMMARY */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon">
              <Icon name="calendar" size={24} />
            </div>

            <div>

              <span>
                Discharge Date
              </span>

              <strong>
                {patient?.dischargeDate ||
                  "-"}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <Icon name="heart" size={24} />
            </div>

            <div>

              <span>
                Care Until
              </span>

              <strong>
                {patient?.careEndDate ||
                  "-"}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <Icon name="pill" size={24} />
            </div>

            <div>

              <span>
                Medicines
              </span>

              <strong>
                {patient?.medicines
                  ?.length || 0}
              </strong>

            </div>

          </div>

        </section>


        {/* MEDICINES */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Medicines
              </h2>

              <p>
                Current prescribed
                medicines.
              </p>

            </div>

          </div>


          {patient?.medicines?.length ? (

            <div className="patient-medicine-list">

              {patient.medicines.map(
                (medicine, index) => (

                  <div
                    className="patient-medicine-card"
                    key={index}
                  >

                    <div className="medicine-main">

                      <div className="medicine-icon">
                        <Icon name="pill" size={24} />
                      </div>

                      <div>

                        <h3>
                          {medicine.name}
                        </h3>

                        <p>
                          {medicine.dosage}
                        </p>

                      </div>

                    </div>


                    <div className="medicine-schedule">

                      <span>
                        Time
                      </span>

                      <strong>
                        {medicine.time}
                      </strong>

                    </div>


                    <div className="medicine-schedule">

                      <span>
                        Duration
                      </span>

                      <strong>
                        {medicine.duration}
                      </strong>

                    </div>


                    {/* MEDICINE STATUS */}

                    <div className="medicine-schedule">

                      <span>
                        Status
                      </span>

                      <strong
                        style={{
                          color: medicine.taken
                            ? "#08A29E"
                            : "#607D83",
                          fontWeight: 700,
                        }}
                      >
                        {medicine.taken ? (
                          <>
                            <Icon name="check" size={16} /> Taken
                            {medicine.takenAt
                              ? ` at ${medicine.takenAt}`
                              : ""}
                          </>
                        ) : (
                          "Not taken yet"
                        )}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="empty-state compact-empty">

              <h3>
                No medicines prescribed
              </h3>

            </div>

          )}

        </section>


        {/* DIET + INSTRUCTIONS */}

        <div className="patient-info-grid">

          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Diet Plan
                </h2>

              </div>

            </div>


            <div className="patient-text-card">

              <p>
                {patient?.diet ||
                  "No diet instructions available."}
              </p>

            </div>

          </section>


          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Recovery Instructions
                </h2>

              </div>

            </div>


            <div className="patient-text-card">

              <p>
                {patient?.instructions ||
                  "No recovery instructions available."}
              </p>

            </div>

          </section>

        </div>


        {/* APPOINTMENT */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Upcoming Appointment
              </h2>

            </div>

          </div>


          {patient?.appointment ? (

            <div className="patient-appointment-card">

              <div className="appointment-icon">
                <Icon name="calendar" size={24} />
              </div>

              <div className="appointment-info">

                <h3>
                  {patient.appointment
                    .doctor ||
                    "Doctor Appointment"}
                </h3>

                <p>
                  {patient.appointment
                    .date ||
                    "Date not specified"}

                  {" · "}

                  {patient.appointment
                    .time ||
                    "Time not specified"}
                </p>


                {patient.appointment
                  .instructions && (

                  <span>
                    {
                      patient.appointment
                        .instructions
                    }
                  </span>

                )}

              </div>

            </div>

          ) : (

            <div className="empty-state compact-empty">

              <h3>
                No upcoming appointment
              </h3>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default FamilyDashboard;