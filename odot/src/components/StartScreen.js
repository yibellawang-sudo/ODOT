import React from "react";
import { useNavigate } from "react-router-dom";
import startImg from "../images/onboarding-removebg-preview.png"; 
import logoImg from "../images/odotlogotrans.png"; 

function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="body">
      
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
        <h1 style={{ margin: 0, fontSize: "50px" }}>
          Welcome to
        </h1>
        <img 
          src={logoImg} 
          alt="odot logo" 
          style={{ height: "600px", width: "auto" }} 
        />
      </div>

     
      <button
        onClick={() => navigate("/onboarding")}
        style={{
          border: "none",
          padding: 0,
          margin: 0,
          background: "none",
          cursor: "pointer",
          display: "inline-block",
          width: "300px",
          height: "auto",
        }}
      >
        <img 
          src={startImg} 
          alt="Start onboarding" 
          style={{ width: "100%", display: "block" }} 
        />
      </button>
    </div>
  );
}

export default StartScreen;
