import React from "react";
import { useParams } from "react-router-dom";
import Dashboard from "./dashboard";

function WorkflowScreen() {
  const { option } = useParams();

  if (option === "screentime usage") {
    return <Dashboard />;
  }

  return (
    <div className="body">
      <h2>{option}</h2>
      <p>Coming soon...</p>
    </div>
  );
}

export default WorkflowScreen;