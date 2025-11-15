import React from "react";
import { useParams, useNavigate } from "react-router-dom";

function WorkflowScreen() {
  const { option } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>{option}</h1>
      <p>This is the workflow screen for {option}.</p>
      <button onClick={() => navigate("/onboarding")} style={{ marginTop: "20px" }}>
        Back to Onboarding
      </button>
    </div>
  );
}

export default WorkflowScreen;
