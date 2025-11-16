import React from "react";
import { useNavigate } from "react-router-dom";
import startImg from "../images/onboarding-removebg-preview.png"; 
import logoImg from "../images/odotlogotrans.png"; 

function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="body">
      <h1 className="App-header">Welcome to</h1>
      <img src={logoImg} alt="logo" />

      <button
        onClick={() => navigate("/onboarding")}
        aria-label="Start onboarding"
        style={{
          border: "none",
          padding: 0,
          margin: 0,
          background: "none",
          cursor: "pointer",
          display: "block", // removes inline button spacing
        }}
      >
        <img 
          src={startImg} 
          alt="Start onboarding" 
          style={{ width: "300px", display: "block" }} 
        />
      </button>
    </div>
  );
}

export default StartScreen;
