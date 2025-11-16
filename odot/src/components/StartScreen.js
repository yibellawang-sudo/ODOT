import React from "react";
import { useNavigate } from "react-router-dom";

function StartScreen() {
  const navigate = useNavigate();
  console.log("hello")

  return (
    <div className = "body">
      <p> ! trigger warning ! </p>
      <h1 className = "App-header">odot</h1>
      <button
        className = "button"
        onClick={() => navigate("./onboarding")}>
        start!
      </button>
    </div>
  );
}

export default StartScreen;
