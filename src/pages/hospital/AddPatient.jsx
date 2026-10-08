import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function AddPatient() {
  const navigate = useNavigate();

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
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentInstructions: "",
  });

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      time: "",
      duration: "",
    },
  ]);

  const [showPatientPassword, setShowPatientPassword] =
    useState(false);

  const [showFamilyPassword, setShowFamilyPassword] =
    useState(false);

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

  const handleMedicineChange = (index, field, value) => {
    setMedicines((currentMedicines) =>
      currentMedicines.map((medicine, medicineIndex) =>
        medicineIndex === index
          ? {
              ...medicine,
              [field]: value,
            }
          : medicine
      )
    );
  };

  const addMedicine = () => {
    setMedicines((currentMedicines) => [
      ...currentMedicines,
      {
        name: "",
        dosage: "",
        time: "",
        duration: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    setMedicines((currentMedicines) =>
      currentMedicines.filter(
        (_, medicineIndex) => medicineIndex !== index
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("hospitalToken");

    if (!token) {
      setError(
        "Hospital session expired. Please login again."
      );
      return;
    }

    setLoading(true);

    try {
      const cleanedMedicines = medicines.filter(
        (medicine) =>
          medicine.name.trim() ||
          medicine.dosage.trim() ||
          medicine.time ||
          medicine.duration.trim()
      );

      const appointment =
        formData.doctor ||
        formData.appointmentDate ||
        formData.appointmentTime ||
        formData.appointmentInstructions
          ? {
              doctor: formData.doctor,
              date: formData.appointmentDate,
              time: formData.appointmentTime,
              instructions:
                formData.appointmentInstructions,
            }
          : null;

      const patientData = {
        name: formData.name,
        issue: formData.issue,
        dischargeDate: formData.dischargeDate,
        careEndDate: formData.careEndDate,

        patientId: formData.patientId,
        patientPassword: formData.patientPassword,

        familyId: formData.familyId,
        familyPassword: formData.familyPassword,

        medicines: cleanedMedicines,

        diet: formData.diet,
        instructions: formData.instructions,

        appointment,
      };

      const response = await fetch(
        "https://post-discharge-care.onrender.com/api/patients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patientData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to add patient."
        );
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Add patient error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowSuccess(false);
    navigate("/hospital/dashboard");
  };

  return (
    <div className="add-patient-page">

      <div className="add-patient-container">

        {/* Header */}
        <div className="add-patient-header">

          <div>
            <span className="dashboard-label">
              HOSPITAL PORTAL
            </span>

            <h1>Add Patient</h1>

            <p>
              Create a patient's post-discharge care
              profile.
            </p>
          </div>

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() =>
              navigate("/hospital/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>


        {/* Form */}
        <form
          className="add-patient-form"
          onSubmit={handleSubmit}
        >

          {/* Patient Information */}
          <section className="form-section">

            <div className="form-section-header">
              <h2>Patient Information</h2>
              <p>
                Enter the patient's basic information.
              </p>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="name">
                  Patient Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter patient name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="issue">
                  Medical Issue
                </label>

                <input
                  id="issue"
                  type="text"
                  placeholder="Enter medical issue"
                  value={formData.issue}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="dischargeDate">
                  Discharge Date
                </label>

                <input
                  id="dischargeDate"
                  type="date"
                  value={formData.dischargeDate}
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
                  type="date"
                  value={formData.careEndDate}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

          </section>


          {/* Patient Access */}
          <section className="form-section">

            <div className="form-section-header">
              <h2>Patient Access</h2>
              <p>
                Create credentials for the patient portal.
              </p>
            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="patientId">
                  Patient ID
                </label>

                <input
                  id="patientId"
                  type="text"
                  placeholder="e.g. PAT1004"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="patientPassword">
                  Patient Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="patientPassword"
                    type={
                      showPatientPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create password"
                    value={formData.patientPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPatientPassword(
                        (current) => !current
                      )
                    }
                  >
                    {showPatientPassword
                      ? <Icon name="eye-off" />
                      : <Icon name="eye" />}
                  </button>

                </div>

              </div>

            </div>

          </section>


          {/* Family Access */}
          <section className="form-section">

            <div className="form-section-header">
              <h2>Family Access</h2>
              <p>
                Create credentials for the linked family
                member.
              </p>
            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="familyId">
                  Family Access ID
                </label>

                <input
                  id="familyId"
                  type="text"
                  placeholder="e.g. FAM1004"
                  value={formData.familyId}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="familyPassword">
                  Family Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="familyPassword"
                    type={
                      showFamilyPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create password"
                    value={formData.familyPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowFamilyPassword(
                        (current) => !current
                      )
                    }
                  >
                    {showFamilyPassword
                      ? <Icon name="eye-off" />
                      : <Icon name="eye" />}
                  </button>

                </div>

              </div>

            </div>

          </section>


          {/* Medicines */}
          <section className="form-section">

            <div className="form-section-header medicine-header">

              <div>
                <h2>Medicines</h2>
                <p>
                  Add medicines prescribed after discharge.
                </p>
              </div>

              <button
                type="button"
                className="add-medicine-button"
                onClick={addMedicine}
              >
                <Icon name="plus" size={18} />
                Add Medicine
              </button>

            </div>

            <div className="medicine-list">

              {medicines.map((medicine, index) => (

                <div
                  className="medicine-row"
                  key={index}
                >

                  <div className="form-group">
                    <label>
                      Medicine Name
                    </label>

                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Dosage
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. 500 mg"
                      value={medicine.dosage}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "dosage",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Time
                    </label>

                    <input
                      type="time"
                      value={medicine.time}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "time",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Duration
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. 5 days"
                      value={medicine.duration}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {medicines.length > 1 && (
                    <button
                      type="button"
                      className="remove-medicine-button"
                      onClick={() =>
                        removeMedicine(index)
                      }
                    >
                      Remove
                    </button>
                  )}

                </div>

              ))}

            </div>

          </section>


          {/* Diet */}
          <section className="form-section">

            <div className="form-section-header">
              <h2>Diet Plan</h2>
              <p>
                Provide dietary instructions for recovery.
              </p>
            </div>

            <div className="form-group">

              <label htmlFor="diet">
                Diet Instructions
              </label>

              <textarea
                id="diet"
                rows="4"
                placeholder="Enter diet instructions"
                value={formData.diet}
                onChange={handleChange}
              />

            </div>

          </section>


          {/* Recovery Instructions */}
          <section className="form-section">

            <div className="form-section-header">
              <h2>Recovery Instructions</h2>
              <p>
                Add important instructions for the patient's
                recovery.
              </p>
            </div>

            <div className="form-group">

              <label htmlFor="instructions">
                Recovery Instructions
              </label>

              <textarea
                id="instructions"
                rows="5"
                placeholder="Enter recovery instructions"
                value={formData.instructions}
                onChange={handleChange}
              />

            </div>

          </section>


          {/* Appointment */}
          <section className="form-section">

            <div className="form-section-header">
              <h2>Follow-up Appointment</h2>
              <p>
                Add the patient's upcoming follow-up
                appointment.
              </p>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="doctor">
                  Doctor
                </label>

                <input
                  id="doctor"
                  type="text"
                  placeholder="Doctor name"
                  value={formData.doctor}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentDate">
                  Appointment Date
                </label>

                <input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="appointmentTime">
                  Appointment Time
                </label>

                <input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentInstructions">
                  Appointment Instructions
                </label>

                <input
                  id="appointmentInstructions"
                  type="text"
                  placeholder="e.g. Bring medical reports"
                  value={
                    formData.appointmentInstructions
                  }
                  onChange={handleChange}
                />
              </div>

            </div>

          </section>


          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* Actions */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/hospital/dashboard")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving Patient..."
                : "Save Patient"}
            </button>

          </div>

        </form>

      </div>


      {/* Success Popup */}
      {showSuccess && (

        <div className="success-overlay">

          <div className="success-popup">

            <div className="success-icon">
              <Icon name="check" size={28} />
            </div>

            <h2>
              Patient Added Successfully
            </h2>

            <p>
              The patient's post-discharge care profile
              has been saved successfully.
            </p>

            <button
              className="primary-button"
              onClick={handleContinue}
            >
              Continue to Dashboard
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default AddPatient;