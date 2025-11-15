import React from "react";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const navigate = useNavigate();
  const options = ["Option 1", "Option 2", "Option 3"];

  return (
    <div style={{ display: "flex", padding: "50px" }}>
      <div style={{ width: "200px", marginRight: "50px" }}>
        <h2>Pick an Option</h2>
        {options.map((opt) => (
          <button
            key={opt}
            style={{ display: "block", margin: "20px 0", padding: "10px" }}
            onClick={() => navigate(`/workflow/${opt}`)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <p>Choose an option from the sidebar</p>
      </div>
    </div>
  );
}

export default Onboarding;
