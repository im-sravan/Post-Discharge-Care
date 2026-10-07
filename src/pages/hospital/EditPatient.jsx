import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPatientPassword, setShowPatientPassword] =
    useState(false);

  const [showFamilyPassword, setShowFamilyPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    issue: "",
    dischargeDate: "",
    careEndDate: "",
    patientId: "",
    patientPassword: "",
    familyId: "",
    familyPassword: "",
    diet: "",
    instructions: "",
  });

  const [medicines, setMedicines] = useState([]);

  const [appointment, setAppointment] = useState({
    doctor: "",
    date: "",
    time: "",
    instructions: "",
  });

  // =====================================================
  // FETCH PATIENT
  // =====================================================

  useEffect(() => {
    const fetchPatient = async () => {
      const token = localStorage.getItem(
        "hospitalToken"
      );

      if (!token) {
        navigate("/hospital/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/patients/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("hospitalToken");
          localStorage.removeItem("hospital");

          navigate("/hospital/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch patient."
          );
        }

        const patient = data.patient;

        setFormData({
          name: patient.name || "",
          issue: patient.issue || "",
          dischargeDate:
            patient.dischargeDate || "",
          careEndDate:
            patient.careEndDate || "",
          patientId: patient.patientId || "",
          patientPassword: "",
          familyId: patient.familyId || "",
          familyPassword: "",
          diet: patient.diet || "",
          instructions:
            patient.instructions || "",
        });

        setMedicines(
          (patient.medicines || []).map(
            (medicine) => ({
              name: medicine.name || "",
              dosage: medicine.dosage || "",
              time: medicine.time || "",
              duration: medicine.duration || "",
            })
          )
        );

        setAppointment({
          doctor:
            patient.appointment?.doctor || "",
          date:
            patient.appointment?.date || "",
          time:
            patient.appointment?.time || "",
          instructions:
            patient.appointment?.instructions ||
            "",
        });
      } catch (error) {
        console.error(
          "Fetch patient error:",
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

    fetchPatient();
  }, [id, navigate]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // MEDICINE CHANGE
  // =====================================================

  const handleMedicineChange = (
    index,
    field,
    value
  ) => {
    setMedicines((current) =>
      current.map((medicine, medicineIndex) =>
        medicineIndex === index
          ? {
              ...medicine,
              [field]: value,
            }
          : medicine
      )
    );
  };

  // =====================================================
  // ADD MEDICINE
  // =====================================================

  const addMedicine = () => {
    setMedicines((current) => [
      ...current,
      {
        name: "",
        dosage: "",
        time: "",
        duration: "",
      },
    ]);
  };

  // =====================================================
  // REMOVE MEDICINE
  // =====================================================

  const removeMedicine = (index) => {
    setMedicines((current) =>
      current.filter(
        (_, medicineIndex) =>
          medicineIndex !== index
      )
    );
  };

  // =====================================================
  // APPOINTMENT CHANGE
  // =====================================================

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;

    setAppointment((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PATIENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem(
      "hospitalToken"
    );

    if (!token) {
      navigate("/hospital/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const patientData = {
        name: formData.name,
        issue: formData.issue,
        dischargeDate: formData.dischargeDate,
        careEndDate: formData.careEndDate,

        patientId: formData.patientId,
        familyId: formData.familyId,

        medicines,

        diet: formData.diet,
        instructions: formData.instructions,

        appointment,
      };

      // Only send new passwords if entered.
      if (
        formData.patientPassword.trim()
      ) {
        patientData.patientPassword =
          formData.patientPassword;
      }

      if (
        formData.familyPassword.trim()
      ) {
        patientData.familyPassword =
          formData.familyPassword;
      }

      const response = await fetch(
        `http://localhost:5000/api/patients/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patientData),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "hospitalToken"
        );
        localStorage.removeItem("hospital");

        navigate("/hospital/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update patient."
        );
      }

      setSuccess(
        "Patient updated successfully."
      );

      setTimeout(() => {
        navigate("/hospital/dashboard");
      }, 1200);
    } catch (error) {
      console.error(
        "Update patient error:",
        error
      );

      setError(
        error.message ||
          "Unable to update patient."
      );
    } finally {
      setSaving(false);
    }
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
            <p>Loading patient details...</p>
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
            className="sidebar-nav-item"
            onClick={() =>
              navigate("/hospital/dashboard")
            }
          >
            <Icon name="grid" />
            Dashboard
          </button>

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() =>
              navigate("/hospital/add-patient")
            }
          >
            <Icon name="plus" />
            Add Patient
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="logout-button"
            onClick={() => {
              localStorage.removeItem(
                "hospitalToken"
              );
              localStorage.removeItem("hospital");

              navigate("/hospital/login");
            }}
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
        <header className="dashboard-header">
          <div>
            <span className="small-heading">
              PATIENT MANAGEMENT
            </span>

            <h1>Edit Patient</h1>

            <p>
              Update post-discharge care
              information.
            </p>
          </div>

          <button
            type="button"
            className="secondary-dashboard-button"
            onClick={() =>
              navigate("/hospital/dashboard")
            }
          >
            ← Back to Dashboard
          </button>
        </header>

        <form
          className="patient-form-card"
          onSubmit={handleSubmit}
        >
          {/* =====================================================
              BASIC INFORMATION
          ===================================================== */}

          <div className="form-section">
            <div className="form-section-header">
              <h2>Patient Information</h2>
              <p>
                Update the patient's basic
                information.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Patient Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="issue">
                  Health Issue
                </label>

                <input
                  id="issue"
                  name="issue"
                  type="text"
                  value={formData.issue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dischargeDate">
                  Discharge Date
                </label>

                <input
                  id="dischargeDate"
                  name="dischargeDate"
                  type="date"
                  value={
                    formData.dischargeDate
                  }
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="careEndDate">
                  Care End Date
                </label>

                <input
                  id="careEndDate"
                  name="careEndDate"
                  type="date"
                  value={formData.careEndDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              LOGIN CREDENTIALS
          ===================================================== */}

          <div className="form-section">
            <div className="form-section-header">
              <h2>Portal Credentials</h2>
              <p>
                Update patient and family
                portal access.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="patientId">
                  Patient ID
                </label>

                <input
                  id="patientId"
                  name="patientId"
                  type="text"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientPassword">
                  New Patient Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="patientPassword"
                    name="patientPassword"
                    type={
                      showPatientPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Leave blank to keep current password"
                    value={
                      formData.patientPassword
                    }
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPatientPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPatientPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPatientPassword
                      ? <Icon name="eye-off" />
                      : <Icon name="eye" />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="familyId">
                  Family Access ID
                </label>

                <input
                  id="familyId"
                  name="familyId"
                  type="text"
                  value={formData.familyId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="familyPassword">
                  New Family Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="familyPassword"
                    name="familyPassword"
                    type={
                      showFamilyPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Leave blank to keep current password"
                    value={
                      formData.familyPassword
                    }
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowFamilyPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showFamilyPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showFamilyPassword
                      ? <Icon name="eye-off" />
                      : <Icon name="eye" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              MEDICINES
          ===================================================== */}

          <div className="form-section">
            <div className="form-section-header form-section-header-row">
              <div>
                <h2>Medicines</h2>
                <p>
                  Update prescribed medicines
                  and schedules.
                </p>
              </div>

              <button
                type="button"
                className="secondary-dashboard-button"
                onClick={addMedicine}
              >
                + Add Medicine
              </button>
            </div>

            {medicines.length === 0 ? (
              <div className="form-empty">
                No medicines added.
              </div>
            ) : (
              <div className="medicine-list">
                {medicines.map(
                  (medicine, index) => (
                    <div
                      className="medicine-form-row"
                      key={index}
                    >
                      <div className="form-group">
                        <label>
                          Medicine Name
                        </label>

                        <input
                          type="text"
                          value={
                            medicine.name
                          }
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Dosage
                        </label>

                        <input
                          type="text"
                          value={
                            medicine.dosage
                          }
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "dosage",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Time
                        </label>

                        <input
                          type="time"
                          value={
                            medicine.time
                          }
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "time",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Duration
                        </label>

                        <input
                          type="text"
                          value={
                            medicine.duration
                          }
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <button
                        type="button"
                        className="delete-medicine-button"
                        onClick={() =>
                          removeMedicine(index)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =====================================================
              DIET & INSTRUCTIONS
          ===================================================== */}

          <div className="form-section">
            <div className="form-section-header">
              <h2>Recovery Plan</h2>
              <p>
                Update diet and recovery
                instructions.
              </p>
            </div>

            <div className="form-grid single-column">
              <div className="form-group">
                <label htmlFor="diet">
                  Diet Plan
                </label>

                <textarea
                  id="diet"
                  name="diet"
                  rows="4"
                  value={formData.diet}
                  onChange={handleChange}
                  placeholder="Enter diet instructions"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="instructions">
                  Recovery Instructions
                </label>

                <textarea
                  id="instructions"
                  name="instructions"
                  rows="5"
                  value={
                    formData.instructions
                  }
                  onChange={handleChange}
                  placeholder="Enter recovery instructions"
                ></textarea>
              </div>
            </div>
          </div>

          {/* =====================================================
              APPOINTMENT
          ===================================================== */}

          <div className="form-section">
            <div className="form-section-header">
              <h2>Upcoming Appointment</h2>
              <p>
                Update the patient's next
                appointment.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="doctor">
                  Doctor
                </label>

                <input
                  id="doctor"
                  name="doctor"
                  type="text"
                  value={appointment.doctor}
                  onChange={
                    handleAppointmentChange
                  }
                  placeholder="Doctor name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentDate">
                  Date
                </label>

                <input
                  id="appointmentDate"
                  name="date"
                  type="date"
                  value={appointment.date}
                  onChange={
                    handleAppointmentChange
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentTime">
                  Time
                </label>

                <input
                  id="appointmentTime"
                  name="time"
                  type="time"
                  value={appointment.time}
                  onChange={
                    handleAppointmentChange
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentInstructions">
                  Instructions
                </label>

                <input
                  id="appointmentInstructions"
                  name="instructions"
                  type="text"
                  value={
                    appointment.instructions
                  }
                  onChange={
                    handleAppointmentChange
                  }
                  placeholder="Appointment instructions"
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              MESSAGES
          ===================================================== */}

          {error && (
            <div className="dashboard-error">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="form-success-message">
              {success}
            </div>
          )}

          {/* =====================================================
              ACTIONS
          ===================================================== */}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-dashboard-button"
              onClick={() =>
                navigate("/hospital/dashboard")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditPatient;