import React from "react";
import { useNavigate } from "react-router-dom";

function StartScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ fontSize: "60px", textAlign: "center", marginTop: "15px" }}>
      <h1>Welcome to ODOT</h1>
      <button
        style={{ fontSize: "120px", padding: "20px 40px", marginTop: "15px" }}
        onClick={() => navigate("/onboarding")}
      >
        Start Onboarding
      </button>
    </div>
  );
}

export default StartScreen;
