import React from "react";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const navigate = useNavigate();
  const options = [{name: "screentime usage", key: "ScreentimeMetrics"},
    {name: "notes & goals", key: "notesGoalsUI"}, {name: "todos", key: "todos"}];

  return (
    <div className="onboard-body">
      <p onClick={() => navigate("/")} className="navButton">
        ←
      </p>
      
        <h2>odot</h2>
        <div className="buttonDiv">
          
        {options.map((opt) => (
          <button
            key={opt.key}
            className = "large-button"
            onClick={() => navigate(`/${opt.key}`)}
          >
            {opt.name}
          </button>
        ))}
        </div>
      </div>
     
   
  );
}

export default Onboarding;
