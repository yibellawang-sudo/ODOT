import React from "react";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const navigate = useNavigate();
  const options = ["screentime usage", "notes & goals", "todos"];

  return (
    <div className="onboard-body">
      <p onClick={() => navigate("/")} className="navButton">
        ←
      </p>
      
        <h2>odot</h2>
        <div className="buttonDiv">
        {options.map((opt) => (
          <button
            key={opt}
            className = "large-button"
            onClick={() => navigate(`/workflow/${opt}`)}
          >
            {opt}
          </button>
        ))}
        </div>
      </div>
     
   
  );
}

export default Onboarding;
