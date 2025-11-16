import React from "react";
import { useNavigate } from "react-router-dom";
import startImg from "../images/onboarding-removebg-preview.png"; 
import logoImg from "../images/odotlogotrans.png"; 
import arrowsImg from "../images/arrows.PNG";
import starsImg from "../images/stars.PNG";
import vinesImg from "../images/vines.PNG";

function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="body" style={{ position: "relative", width: "100%", height: "100vh" }}>
      
      
      <img 
        src={starsImg} 
        alt="Stars" 
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "25%", 
          zIndex: 10
        }} 
      />
<img 
        src={starsImg} 
        alt="Stars" 
        style={{
          position: "absolute",
          top: "350px",
          left: "950px",
          width: "25%", 
          zIndex: 10
        }} 
      />
      {/* Header with logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "15px" }}>
        <h1 style={{ margin: 0, fontSize: "50px" }}>Welcome to</h1>
        <img src={logoImg} alt="odot logo" style={{ height: "100px", width: "auto" }} />
      </div>

      {/* Button with arrows overlay */}
      <div 
        style={{ position: "relative", width: "300px", cursor: "pointer" }} 
        onClick={() => navigate("/onboarding")}
      >
        <img 
          src={startImg} 
          alt="Start onboarding" 
          style={{ width: "100%", display: "block" }} 
        />

        <img 
          src={arrowsImg} 
          alt="arrows" 
          style={{
            position: "absolute",
            top: "50%",      
            left: "50%",     
            transform: "translate(-50%, -50%)", 
            pointerEvents: "none", 
            width: "190%"     
          }} 
        />
      </div>
    </div>
  );
}

export default StartScreen;
