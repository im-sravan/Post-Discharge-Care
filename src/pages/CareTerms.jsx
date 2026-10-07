import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
function CareTerms({ portal }) {
  const navigate = useNavigate();
  const isPatient = portal === "patient";
  const tokenKey = isPatient
    ? "patientToken"
    : "familyToken";
  const userKey = isPatient
    ? "patient"
    : "family";
  const termsKey = isPatient
    ? "patientTermsAccepted"
    : "familyTermsAccepted";
  const loginPath = isPatient
    ? "/patient/login"
    : "/family/login";
  const dashboardPath = isPatient
    ? "/patient/dashboard"
    : "/family/dashboard";
  const portalName = isPatient
    ? "Patient"
    : "Family";
  const [accepted, setAccepted] = useState(false);
  const handleAccept = () => {
    if (!accepted) {
      return;
    }
    localStorage.setItem(termsKey, "true");
    navigate(dashboardPath, {
      replace: true,
    });
  };
  const handleBackToLogin = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    localStorage.removeItem(termsKey);
    navigate(loginPath, {
      replace: true,
    });
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4FBFB",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #D8EDEC",
          boxShadow: "0 12px 40px rgba(8, 127, 123, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "32px 36px 26px",
            borderBottom: "1px solid #E8F8F7",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#E8F8F7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  width: "18px",
                  height: "6px",
                  background: "#08A29E",
                  borderRadius: "5px",
                  transform: "rotate(-45deg)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  width: "18px",
                  height: "6px",
                  background: "#087F7B",
                  borderRadius: "5px",
                  transform: "rotate(45deg)",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#12343B",
                }}
              >
                Post-Discharge Care
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#607D83",
                  marginTop: "2px",
                }}
              >
                Connecting care beyond the hospital
              </div>
            </div>
          </div>
          <span
            style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              color: "#08A29E",
              marginBottom: "8px",
            }}
          >
            {portalName.toUpperCase()} PORTAL
          </span>
          <h1
            style={{
              margin: "0",
              fontSize: "30px",
              lineHeight: "1.25",
              color: "#12343B",
            }}
          >
            Terms & Conditions
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: "#607D83",
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            Please read and accept these terms before
            accessing your post-discharge care dashboard.
          </p>
        </div>
        {/* TERMS CONTENT */}
        <div
          style={{
            padding: "30px 36px",
            maxHeight: "58vh",
            overflowY: "auto",
          }}
        >
          <section style={{ marginBottom: "25px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                color: "#12343B",
              }}
            >
              1. Purpose of the Platform
            </h2>
            <p
              style={{
                margin: 0,
                color: "#607D83",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Post-Discharge Care is designed to help patients
              and their families stay informed about post-discharge
              care information provided by the hospital, including
              medicines, diet instructions, recovery instructions
              and upcoming appointments.
            </p>
          </section>
          <section style={{ marginBottom: "25px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                color: "#12343B",
              }}
            >
              2. Patient and Family Responsibilities
            </h2>
            <p
              style={{
                margin: 0,
                color: "#607D83",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              You are responsible for keeping your login
              credentials confidential and using only the account
              assigned to you. Do not share your Patient ID,
              Family Access ID or password with unauthorized
              persons.
            </p>
          </section>
          <section style={{ marginBottom: "25px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                color: "#12343B",
              }}
            >
              3. Medical Information
            </h2>
            <p
              style={{
                margin: 0,
                color: "#607D83",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Information displayed on this platform is based
              on the care information entered by the hospital.
              The platform does not independently diagnose
              medical conditions or replace professional medical
              advice.
            </p>
          </section>
          {/* EMERGENCY SECTION */}
          <section
            style={{
              marginBottom: "25px",
              padding: "20px",
              borderRadius: "14px",
              background: "#FFF7F7",
              border: "1px solid #F1D6D6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "9px",
              }}
            >
              <Icon
                name="alert"
                size={20}
                style={{ color: "#8B3030", flexShrink: 0 }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#8B3030",
                }}
              >
                4. Emergency Alert — Responsible Use
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 10px",
                color: "#6D4A4A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              The Emergency Alert feature is intended only for
              genuine situations that require immediate attention
              from the hospital.
            </p>
            <p
              style={{
                margin: "0 0 10px",
                color: "#6D4A4A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Do not use this feature for testing, jokes, false
              alarms, unnecessary requests or any situation that
              does not require emergency assistance.
            </p>
            <p
              style={{
                margin: "0 0 10px",
                color: "#6D4A4A",
                fontSize: "14px",
                lineHeight: "1.7",
                fontWeight: "600",
              }}
            >
              Intentional or repeated misuse of the Emergency
              Alert feature may result in serious action being
              taken by the hospital, including investigation and
              restriction of access to the platform.
            </p>
            <p
              style={{
                margin: 0,
                color: "#6D4A4A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              If you are experiencing a life-threatening
              emergency, contact the appropriate emergency
              medical service immediately. The Emergency Alert
              feature should not be considered a replacement for
              emergency medical services.
            </p>
          </section>
          <section style={{ marginBottom: "25px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                color: "#12343B",
              }}
            >
              5. Privacy and Account Access
            </h2>
            <p
              style={{
                margin: 0,
                color: "#607D83",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Your care information is intended to be accessible
              only through the appropriate hospital, patient or
              linked family account. You should immediately report
              any suspected unauthorized access to the hospital.
            </p>
          </section>
          <section style={{ marginBottom: "25px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                color: "#12343B",
              }}
            >
              6. Platform Limitations
            </h2>
            <p
              style={{
                margin: 0,
                color: "#607D83",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              This platform is intended to support communication
              and coordination of post-discharge care. It should
              not be used as a substitute for professional medical
              consultation, diagnosis or emergency medical care.
            </p>
          </section>
          <div
            style={{
              padding: "18px",
              background: "#F4FBFB",
              borderRadius: "14px",
              border: "1px solid #D8EDEC",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) =>
                  setAccepted(e.target.checked)
                }
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#08A29E",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "#12343B",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  fontWeight: "600",
                }}
              >
                I have read and understood the Terms &
                Conditions and agree to use the Post-Discharge
                Care platform responsibly, including the
                Emergency Alert feature.
              </span>
            </label>
          </div>
        </div>
        {/* FOOTER */}
        <div
          style={{
            padding: "22px 36px",
            borderTop: "1px solid #E8F8F7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            background: "#FFFFFF",
          }}
        >
          <button
            type="button"
            onClick={handleBackToLogin}
            style={{
              border: "none",
              background: "transparent",
              color: "#607D83",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ← Back to Login
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!accepted}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "13px 24px",
              background: accepted
                ? "#08A29E"
                : "#B9D8D6",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "700",
              cursor: accepted
                ? "pointer"
                : "not-allowed",
              transition: "all 0.2s ease",
            }}
          >
            Accept & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
export default CareTerms;