import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";





function HospitalDashboard() {

  const navigate = useNavigate();



  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  const [emergencyLoading, setEmergencyLoading] = useState(true);

  const [hospital, setHospital] = useState(null);



  useEffect(() => {

  fetchEmergencyAlerts();



  const interval = setInterval(

    fetchEmergencyAlerts,

    5000

  );



  return () => clearInterval(interval);

}, []);

  // =====================================================

  // LOAD LOGGED-IN HOSPITAL

  // =====================================================



  useEffect(() => {

    const savedHospital = localStorage.getItem("hospital");



    if (savedHospital) {

      try {

        setHospital(JSON.parse(savedHospital));

      } catch (error) {

        console.error("Hospital data error:", error);

      }

    }

  }, []);



  // =====================================================

  // FETCH ONLY LOGGED-IN HOSPITAL'S PATIENTS

  // =====================================================



  useEffect(() => {

    const fetchPatients = async () => {

      const token = localStorage.getItem("hospitalToken");



      if (!token) {

        navigate("/hospital/login");

        return;

      }



      try {

        setLoading(true);

        setError("");



        const response = await fetch(

          "http://localhost:5000/api/patients",

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

            data.message || "Unable to fetch patients."

          );

        }



        setPatients(data.patients || []);

      } catch (error) {

        console.error("Fetch patients error:", error);



        setError(

          error.message ||

            "Unable to connect to the server."

        );

      } finally {

        setLoading(false);

      }

    };



    fetchPatients();

  }, [navigate]);



  // =====================================================

  // DELETE PATIENT

  // =====================================================



  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(

      "Are you sure you want to delete this patient?"

    );



    if (!confirmDelete) {

      return;

    }



    const token = localStorage.getItem("hospitalToken");



    try {

      const response = await fetch(

        `http://localhost:5000/api/patients/${id}`,

        {

          method: "DELETE",

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

          data.message || "Unable to delete patient."

        );

      }



      setPatients((currentPatients) =>

        currentPatients.filter(

          (patient) => patient._id !== id

        )

      );

    } catch (error) {

      console.error("Delete patient error:", error);



      alert(

        error.message || "Unable to delete patient."

      );

    }

  };

const fetchEmergencyAlerts = async () => {

  try {

    const token = localStorage.getItem("hospitalToken");



    if (!token) return;



    const response = await fetch(

      "http://localhost:5000/api/emergency/hospital",

      {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );



    const data = await response.json();



    if (!response.ok) {

      console.error(

        "Emergency fetch failed:",

        data.message

      );

      return;

    }



    setEmergencyAlerts(data.alerts || []);

  } catch (error) {

    console.error(

      "Emergency alerts error:",

      error

    );

  } finally {

    setEmergencyLoading(false);

  }

};



const updateEmergencyStatus = async (

  alertId,

  status

) => {

  try {

    const token =

      localStorage.getItem("hospitalToken");



    const response = await fetch(

      `http://localhost:5000/api/emergency/hospital/${alertId}/status`,

      {

        method: "PUT",



        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },



        body: JSON.stringify({

          status,

        }),

      }

    );



    const data = await response.json();



    if (!response.ok) {

      alert(

        data.message ||

          "Unable to update emergency status."

      );

      return;

    }



    setEmergencyAlerts((currentAlerts) =>

      currentAlerts.map((alert) =>

        String(alert._id) === String(alertId)

          ? data.alert

          : alert

      )

    );

  } catch (error) {

    console.error(

      "Emergency status update error:",

      error

    );



    alert(

      "Unable to update emergency status."

    );

  }

};

  // =====================================================

  // LOGOUT

  // =====================================================



  const handleLogout = () => {

    localStorage.removeItem("hospitalToken");

    localStorage.removeItem("hospital");



    navigate("/hospital/login");

  };



  // =====================================================

  // REFRESH PATIENTS

  // =====================================================



  const handleRefresh = async () => {

    const token = localStorage.getItem("hospitalToken");



    if (!token) {

      navigate("/hospital/login");

      return;

    }



    try {

      setLoading(true);

      setError("");



      const response = await fetch(

        "http://localhost:5000/api/patients",

        {

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

          data.message || "Unable to fetch patients."

        );

      }



      setPatients(data.patients || []);

    } catch (error) {

      console.error("Refresh patients error:", error);



      setError(

        error.message ||

          "Unable to connect to the server."

      );

    } finally {

      setLoading(false);

    }

  };



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

            className="sidebar-nav-item active"

            type="button"

          >

<Icon name="grid" />

            Dashboard

          </button>



          <button

            className="sidebar-nav-item"

            type="button"

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

            className="logout-button"

            type="button"

            onClick={handleLogout}

          >

<Icon name="logout" />

            Logout

          </button>

        </div>

      </aside>



      {/* =====================================================

          MAIN CONTENT

      ===================================================== */}



      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <span className="small-heading">

              HOSPITAL PORTAL

            </span>



            <h1>

              Welcome,{" "}

              {hospital?.hospitalName ||

                "Hospital"}

            </h1>



            <p>

              Manage your patients and

              post-discharge care.

            </p>

          </div>



          <div className="header-actions">

            <button

              type="button"

              className="secondary-dashboard-button"

              onClick={handleRefresh}

            >

<Icon name="refresh" /> Refresh

            </button>

          </div>

        </header>



        {/* =====================================================

            SUMMARY CARDS

        ===================================================== */}



        <section className="dashboard-stats">

          <div className="stat-card">

<div className="stat-icon"><Icon name="users" size={24} /></div>



            <div>

              <span>Total Patients</span>

              <strong>{patients.length}</strong>

            </div>

          </div>



          <div className="stat-card">

<div className="stat-icon"><Icon name="clipboard" size={24} /></div>



            <div>

              <span>Active Care Plans</span>

              <strong>{patients.length}</strong>

            </div>

          </div>



          <div className="stat-card">

<div className="stat-icon"><Icon name="alert" size={24} /></div>



            <div>

              <span>Emergency Alerts</span>

              <strong>

                {

emergencyAlerts.filter(

                    (alert) =>

                      alert.status !== "Resolved"

                  ).length

                }

              </strong>

            </div>

          </div>

        </section>



        {/* =====================================================

            PATIENTS

        ===================================================== */}



        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>Current Patients</h2>

              <p>

                Patients currently under

                post-discharge care.

              </p>

            </div>

          </div>



          {loading ? (

            <div className="empty-state">

              <div className="loading-spinner"></div>

              <p>Loading patients...</p>

            </div>

          ) : error ? (

            <div className="dashboard-error">

              <p>{error}</p>



              <button

                type="button"

                className="primary-button"

                onClick={handleRefresh}

              >

                Try Again

              </button>

            </div>

          ) : patients.length === 0 ? (

            <div className="empty-state">

<div className="empty-icon"><Icon name="users" size={28} /></div>



              <h3>No patients yet</h3>



              <p>

                Add your first patient to begin

                managing post-discharge care.

              </p>



              <button

                type="button"

                className="primary-button"

                onClick={() =>

                  navigate("/hospital/add-patient")

                }

              >

                + Add Patient

              </button>

            </div>

          ) : (

            <div className="patient-table-wrapper">

              <table className="patient-table">

                <thead>

                  <tr>

                    <th>Patient</th>

                    <th>Issue</th>

                    <th>Discharge Date</th>

                    <th>Care End Date</th>

                    <th>Patient ID</th>

                    <th>Actions</th>

                  </tr>

                </thead>



                <tbody>

                  {patients.map((patient) => (

                    <tr key={patient._id}>

                      <td>

                        <div className="patient-name-cell">

                          <div className="patient-avatar">

                            {patient.name

                              ?.charAt(0)

                              ?.toUpperCase() || "P"}

                          </div>



                          <div>

                            <strong>

                              {patient.name}

                            </strong>



                            <span>

                              {patient.patientId}

                            </span>

                          </div>

                        </div>

                      </td>



                      <td>

                        {patient.issue}

                      </td>



                      <td>

                        {patient.dischargeDate}

                      </td>



                      <td>

                        {patient.careEndDate}

                      </td>



                      <td>

                        <span className="patient-id-badge">

                          {patient.patientId}

                        </span>

                      </td>



                      <td>

                        <div className="table-actions">

                          <button

                            type="button"

                            className="edit-action"

                            onClick={() =>

                              navigate(

                                `/hospital/edit-patient/${patient._id}`

                              )

                            }

                          >

                            Edit

                          </button>



                          <button

                            type="button"

                            className="delete-action"

                            onClick={() =>

                              handleDelete(

                                patient._id

                              )

                            }

                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>



        {/* =====================================================

            EMERGENCY ALERTS

        ===================================================== */}



        <section className="dashboard-section emergency-section">

          <div className="section-header">

            <div>

              <h2>Emergency Alerts</h2>

              <p>

                Respond to emergency requests

                from patients and families.

              </p>

            </div>

          </div>



{emergencyAlerts.length === 0 ? (

            <div className="empty-state compact-empty">

<div className="empty-icon"><Icon name="check" size={28} /></div>



              <h3>No emergency alerts</h3>



              <p>

                There are currently no emergency

                requests.

              </p>

            </div>

          ) : (

            <div className="emergency-list">

{emergencyAlerts.map((alert) => (

                <div

                  className="emergency-card"

                  key={alert._id}

                >

                  <div className="emergency-card-info">

                    <div className="emergency-icon">

<Icon name="alert" size={24} />

                    </div>



                    <div>

                      <h3>

                        {alert.patientName ||

                          "Patient"}

                      </h3>



                      <p>

                        {alert.message ||

                          "Emergency assistance requested."}

                      </p>



                      <span>

                        {alert.createdAt

                          ? new Date(

                              alert.createdAt

                            ).toLocaleString()

                          : ""}

                      </span>

                    </div>

                  </div>



                  <div className="emergency-card-actions">

                    <span

                      className={`emergency-status ${String(

                        alert.status

                      ).toLowerCase()}`}

                    >

                      {alert.status}

                    </span>



                    {alert.status ===

                      "Pending" && (

                      <button

                        type="button"

                        className="acknowledge-button"

                        onClick={() =>

                          updateEmergencyStatus(

                            alert._id,

                            "Acknowledged"

                          )

                        }

                      >

                        Acknowledge

                      </button>

                    )}



                    {alert.status ===

                      "Acknowledged" && (

                      <button

                        type="button"

                        className="resolve-button"

                        onClick={() =>

                          updateEmergencyStatus(

                            alert._id,

                            "Resolved"

                          )

                        }

                      >

                        Resolve

                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>

  );

}



export default HospitalDashboard;