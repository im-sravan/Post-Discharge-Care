import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [takenMedicines, setTakenMedicines] =
    useState({});

  const [alerts, setAlerts] = useState([]);

  const [sendingEmergency, setSendingEmergency] =
    useState(false);

  const [emergencyMessage, setEmergencyMessage] =
    useState("");

  const [showEmergencyBox, setShowEmergencyBox] =
    useState(false);

  // =====================================================
  // FETCH PATIENT
  // =====================================================

  const fetchPatient = async () => {
    const token =
      localStorage.getItem(
        "patientToken"
      );

    if (!token) {
      navigate("/patient/login");
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/patients/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem(
        "patientToken"
      );

      localStorage.removeItem(
        "patient"
      );

      navigate("/patient/login");
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to fetch patient data."
      );
    }

    setPatient(data.patient);
  };

  // =====================================================
  // FETCH EMERGENCY ALERTS
  // =====================================================

  const fetchEmergencyAlerts = async () => {
    const token =
      localStorage.getItem(
        "patientToken"
      );

    if (!token) return;

    const response = await fetch(
      "http://localhost:5000/api/emergency/patient",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setAlerts(data.alerts || []);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchPatient();
        await fetchEmergencyAlerts();
      } catch (error) {
        console.error(
          "Patient dashboard error:",
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

    loadDashboard();
  }, []);

  // =====================================================
  // AUTO REFRESH EMERGENCY STATUS
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmergencyAlerts();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // MARK MEDICINE TAKEN
  // =====================================================

  const handleMedicineTaken = async (index) => {
  try {
    const token =
      localStorage.getItem("patientToken");

    if (!token) {
      navigate("/patient/login");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/patients/medicine/${index}/taken`,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem(
        "patientToken"
      );

      localStorage.removeItem("patient");

      navigate("/patient/login");
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to update medicine."
      );
    }

    setPatient((currentPatient) => {
      if (!currentPatient) {
        return currentPatient;
      }

      const updatedMedicines = [
        ...currentPatient.medicines,
      ];

      updatedMedicines[index] = {
        ...updatedMedicines[index],
        taken: data.medicine.taken,
      };

      return {
        ...currentPatient,
        medicines: updatedMedicines,
      };
    });
  } catch (error) {
    console.error(
      "Medicine taken error:",
      error
    );

    alert(
      error.message ||
        "Unable to update medicine."
    );
  }
};

  // =====================================================
  // SEND EMERGENCY
  // =====================================================

  const handleSendEmergency = async () => {
    const token =
      localStorage.getItem(
        "patientToken"
      );

    if (!token) {
      navigate("/patient/login");
      return;
    }

    try {
      setSendingEmergency(true);

      const response = await fetch(
        "http://localhost:5000/api/emergency/patient",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message:
              emergencyMessage.trim() ||
              "Emergency assistance requested.",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "patientToken"
        );

        navigate("/patient/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send emergency alert."
        );
      }

      setEmergencyMessage("");
      setShowEmergencyBox(false);

      await fetchEmergencyAlerts();

      alert(
        "Emergency alert sent to the hospital."
      );
    } catch (error) {
      console.error(
        "Emergency error:",
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
      "patientToken"
    );

    localStorage.removeItem(
      "patient"
    );

    navigate("/patient/login");
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
              Loading your care details...
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
              type="button"
              className="primary-button"
              onClick={() =>
                navigate("/patient/login")
              }
            >
              Back to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
            type="button"
            className="sidebar-nav-item active"
          >
            <Icon name="grid" />
            My Care
          </button>
          <button
            type="button"
            className="sidebar-nav-item"
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
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <span className="small-heading">
              PATIENT PORTAL
            </span>

            <h1>
              Welcome, {patient?.name}
            </h1>

            <p>
              How are you doing?
            </p>
          </div>

          <div className="header-actions">
            <span className="patient-id-badge">
              Patient ID:{" "}
              {patient?.patientId}
            </span>
          </div>
        </header>

        {/* =====================================================
            EMERGENCY
        ===================================================== */}

        <section className="patient-emergency-section">

          <div className="patient-emergency-content">

            <div className="patient-emergency-icon">
              <Icon name="alert" size={26} />
            </div>

            <div className="patient-emergency-text">
              <h2>Need Emergency Help?</h2>

              <p>
                Send an emergency alert directly
                to your hospital care team.
              </p>
            </div>

            <button
              type="button"
              className="patient-emergency-button"
              onClick={() =>
                setShowEmergencyBox(
                  (current) => !current
                )
              }
            >
              <Icon name="alert" /> Emergency
            </button>

          </div>

          {showEmergencyBox && (
            <div className="patient-emergency-form">

              <label htmlFor="emergencyMessage">
                What happened?{" "}
                <span>(optional)</span>
              </label>

              <textarea
                id="emergencyMessage"
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
                  type="button"
                  className="secondary-dashboard-button"
                  onClick={() =>
                    setShowEmergencyBox(false)
                  }
                  disabled={sendingEmergency}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="patient-send-emergency-button"
                  onClick={
                    handleSendEmergency
                  }
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

        {/* =====================================================
            EMERGENCY STATUS
        ===================================================== */}

        {alerts.length > 0 && (
          <section className="dashboard-section">

            <div className="section-header">
              <div>
                <h2>
                  Emergency Alerts
                </h2>

                <p>
                  Track the status of your
                  emergency requests.
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

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="dashboard-stats">

          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="calendar" size={24} />
            </div>

            <div>
              <span>Discharge Date</span>

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
              <span>Care Until</span>

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
              <span>Medicines</span>

              <strong>
                {patient?.medicines
                  ?.length || 0}
              </strong>
            </div>
          </div>

        </section>

        {/* =====================================================
            MEDICINES
        ===================================================== */}

        <section className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>My Medicines</h2>

              <p>
                Follow your prescribed
                medicine schedule.
              </p>
            </div>
          </div>

          {!patient?.medicines ||
          patient.medicines.length === 0 ? (
            <div className="empty-state compact-empty">

              <div className="empty-icon">
                <Icon name="check" size={26} />
              </div>

              <h3>
                No medicines prescribed
              </h3>

              <p>
                No medicine schedule is
                currently available.
              </p>

            </div>
          ) : (
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
                      <span>Time</span>

                      <strong>
                        {medicine.time}
                      </strong>
                    </div>

                    <div className="medicine-schedule">
                      <span>Duration</span>

                      <strong>
                        {medicine.duration}
                      </strong>
                    </div>

                    <button
  type="button"
  className={
    medicine.taken
      ? "medicine-taken-button"
      : "medicine-take-button"
  }
  onClick={() =>
    handleMedicineTaken(index)
  }
>
  {medicine.taken ? (
    <><Icon name="check" /> Taken</>
  ) : (
    "Mark Taken"
  )}
</button>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            DIET + INSTRUCTIONS
        ===================================================== */}

        <div className="patient-info-grid">

          <section className="dashboard-section">

            <div className="section-header">
              <div>
                <h2>Diet Plan</h2>

                <p>
                  Your post-discharge
                  nutrition guidance.
                </p>
              </div>
            </div>

            <div className="patient-text-card">

              {patient?.diet ? (
                <p>{patient.diet}</p>
              ) : (
                <p>
                  No diet instructions
                  available.
                </p>
              )}

            </div>

          </section>

          <section className="dashboard-section">

            <div className="section-header">
              <div>
                <h2>
                  Recovery Instructions
                </h2>

                <p>
                  Follow these instructions
                  during recovery.
                </p>
              </div>
            </div>

            <div className="patient-text-card">

              {patient?.instructions ? (
                <p>
                  {patient.instructions}
                </p>
              ) : (
                <p>
                  No recovery instructions
                  available.
                </p>
              )}

            </div>

          </section>

        </div>

        {/* =====================================================
            APPOINTMENT
        ===================================================== */}

        <section className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>
                Upcoming Appointment
              </h2>

              <p>
                Your next scheduled
                appointment.
              </p>
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
                    "Doctor appointment"}
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

              <div className="empty-icon">
                <Icon name="calendar" size={26} />
              </div>

              <h3>
                No upcoming appointment
              </h3>

              <p>
                No appointment has been
                scheduled yet.
              </p>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default PatientDashboard;