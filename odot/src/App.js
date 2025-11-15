import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartScreen from "./components/StartScreen";
import Onboarding from "./components/Onboarding";
import WorkflowScreen from "./components/WorkflowScreen";
import "./App.css";
function App() {
  /*
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getData() {
      const result = await window.electronAPI.fetchAPI('https://ai.hackclub.com/proxy/v1/chat/completion');
      console.log(result)
      setData(result);
    }
    getData();
  }, []);
*/
  return (
    /*
    <div>
      <h1>YOUR screen time</h1>
     {JSON.stringify(data, null, 2)}
     <button>refresh</button>
    </div>
    */
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


function readFromFile() {

}

function makeRow(category, time) {
  return (
    <div className = "cRow">

    </div>
  )
}

export default App;