import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartScreen from "./components/StartScreen";
import Onboarding from "./components/Onboarding";
import WorkflowScreen from "./components/WorkflowScreen";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/workflow/:option" element={<WorkflowScreen />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
