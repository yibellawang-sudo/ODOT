import React from "react";
import { useNavigate } from "react-router-dom";
import startImg from "../images/onboarding-removebg-preview.png"; 

function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="body">
      <p>! trigger warning !</p>
      <h1 className="App-header">odot</h1>

      <button className="button" onClick={() => navigate("./onboarding")}>
        start!
      </button>

      {/* Image button */}
      <button onClick={() => navigate("./onboarding")}>
        <img 
          src={startImg} 
          alt="Button" 
          style={{ width: "120px", cursor: "pointer" }}
        />
      </button>
    </div>
  );
}

export default StartScreen;
