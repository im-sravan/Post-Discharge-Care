import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import "./index.css";
import Icon from "./components/Icon";

import HospitalLogin from "./pages/hospital/HospitalLogin";
import HospitalRegister from "./pages/hospital/HospitalRegister";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import AddPatient from "./pages/hospital/AddPatient";
import EditPatient from "./pages/hospital/EditPatient";

import PatientLogin from "./pages/patient/PatientLogin";
import PatientDashboard from "./pages/patient/PatientDashboard";

import FamilyLogin from "./pages/family/FamilyLogin";
import FamilyDashboard from "./pages/family/FamilyDashboard";

import CareTerms from "./pages/CareTerms";

// =====================================================
// SPLASH SCREEN
// =====================================================

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">

        <div className="logo-mark">
          <span></span>
          <span></span>
        </div>

        <h1>Post-Discharge Care</h1>

        <p>
          Connecting care beyond the hospital
        </p>

        <div className="loading-line">
          <div></div>
        </div>

      </div>
    </div>
  );
}

// =====================================================
// LANDING PAGE
// =====================================================

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      <header className="landing-header">

        <div className="brand">

          <div className="brand-icon">
            <span></span>
            <span></span>
          </div>

          <div>
            <h2>Post-Discharge</h2>
            <p>Care</p>
          </div>

        </div>

      </header>

      <main className="landing-main">

        <section className="hero-section">

          <div className="hero-text">

            <span className="small-heading">
              POST-DISCHARGE CARE
            </span>

            <h1>
              Better care,
              <br />
              <span>after discharge.</span>
            </h1>

          </div>

          <div className="portal-section">

            <h3>
              Choose your portal
            </h3>

            <div className="portal-grid">

              {/* HOSPITAL */}

              <button
                className="portal-card"
                type="button"
                onClick={() =>
                  navigate(
                    "/hospital/login"
                  )
                }
              >

                <div className="portal-icon hospital-icon">
                  <Icon name="hospital" size={26} />
                </div>

                <div className="portal-info">

                  <h4>
                    Hospital
                  </h4>

                  <p>
                    Manage patients and
                    post-discharge care
                  </p>

                </div>

                <span className="arrow">
                  →
                </span>

              </button>

              {/* PATIENT */}

              <button
                type="button"
                className="portal-card"
                onClick={() =>
                  navigate(
                    "/patient/login"
                  )
                }
              >

                <div className="portal-icon patient-icon">
                  <Icon name="user" size={26} />
                </div>

                <div className="portal-info">

                  <h4>
                    Patient
                  </h4>

                  <p>
                    View medicines and
                    recovery details
                  </p>

                </div>

                <span className="arrow">
                  →
                </span>

              </button>

              {/* FAMILY */}

              <button
                type="button"
                className="portal-card"
                onClick={() =>
                  navigate(
                    "/family/login"
                  )
                }
              >

                <div className="portal-icon family-icon">
                  <Icon name="users" size={26} />
                </div>

                <div className="portal-info">

                  <h4>
                    Family
                  </h4>

                  <p>
                    Stay informed about
                    your loved one's care
                  </p>

                </div>

                <span className="arrow">
                  →
                </span>

              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

// =====================================================
// HOSPITAL PROTECTED ROUTE
// =====================================================

function HospitalProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "hospitalToken"
    );

  return token ? (
    children
  ) : (
    <Navigate
      to="/hospital/login"
      replace
    />
  );
}

// =====================================================
// PATIENT TERMS PROTECTED ROUTE
// =====================================================

function PatientTermsRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "patientToken"
    );

  if (!token) {
    return (
      <Navigate
        to="/patient/login"
        replace
      />
    );
  }

  return children;
}

// =====================================================
// PATIENT PROTECTED ROUTE
// =====================================================

function PatientProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "patientToken"
    );

  const termsAccepted =
    localStorage.getItem(
      "patientTermsAccepted"
    ) === "true";

  if (!token) {
    return (
      <Navigate
        to="/patient/login"
        replace
      />
    );
  }

  if (!termsAccepted) {
    return (
      <Navigate
        to="/patient/terms"
        replace
      />
    );
  }

  return children;
}

// =====================================================
// FAMILY TERMS PROTECTED ROUTE
// =====================================================

function FamilyTermsRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "familyToken"
    );

  if (!token) {
    return (
      <Navigate
        to="/family/login"
        replace
      />
    );
  }

  return children;
}

// =====================================================
// FAMILY PROTECTED ROUTE
// =====================================================

function FamilyProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "familyToken"
    );

  const termsAccepted =
    localStorage.getItem(
      "familyTermsAccepted"
    ) === "true";

  if (!token) {
    return (
      <Navigate
        to="/family/login"
        replace
      />
    );
  }

  if (!termsAccepted) {
    return (
      <Navigate
        to="/family/terms"
        replace
      />
    );
  }

  return children;
}

// =====================================================
// APP
// =====================================================

function App() {
  const [showSplash, setShowSplash] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () => setShowSplash(false),
      2500
    );

    return () =>
      clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* =================================================
            HOSPITAL
        ================================================= */}

        <Route
          path="/hospital/login"
          element={<HospitalLogin />}
        />

        <Route
          path="/hospital/register"
          element={<HospitalRegister />}
        />

        <Route
          path="/hospital/dashboard"
          element={
            <HospitalProtectedRoute>
              <HospitalDashboard />
            </HospitalProtectedRoute>
          }
        />

        <Route
          path="/hospital/add-patient"
          element={
            <HospitalProtectedRoute>
              <AddPatient />
            </HospitalProtectedRoute>
          }
        />

        <Route
          path="/hospital/edit-patient/:id"
          element={
            <HospitalProtectedRoute>
              <EditPatient />
            </HospitalProtectedRoute>
          }
        />

        {/* =================================================
            PATIENT
        ================================================= */}

        <Route
          path="/patient/login"
          element={<PatientLogin />}
        />

        <Route
          path="/patient/terms"
          element={
            <PatientTermsRoute>
              <CareTerms portal="patient" />
            </PatientTermsRoute>
          }
        />

        <Route
          path="/patient/dashboard"
          element={
            <PatientProtectedRoute>
              <PatientDashboard />
            </PatientProtectedRoute>
          }
        />

        {/* =================================================
            FAMILY
        ================================================= */}

        <Route
          path="/family/login"
          element={<FamilyLogin />}
        />

        <Route
          path="/family/terms"
          element={
            <FamilyTermsRoute>
              <CareTerms portal="family" />
            </FamilyTermsRoute>
          }
        />

        <Route
          path="/family/dashboard"
          element={
            <FamilyProtectedRoute>
              <FamilyDashboard />
            </FamilyProtectedRoute>
          }
        />

        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;