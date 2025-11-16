import React from "react";
import { useNavigate } from "react-router-dom";
import startImg from "../images/onboarding-removebg-preview.png"; 
import logoImg from "../images/odotlogotrans.png"; 
function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="body">
      
      <h1 className="App-header">Welcome to</h1>
<img src={logoImg} alt="logo"/>
      <button className="button" onClick={() => navigate("./onboarding")}>
        start!
      </button>

      <button onClick={() => navigate("./onboarding")}>
        <img 
          src={startImg} 
          alt="Button" 
          style={{ width: "300px", cursor: "pointer" }}
        />
      </button>
    </div>
  );
}

export default StartScreen;
