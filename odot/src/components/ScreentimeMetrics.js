import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

function ScreentimeMetrics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getData() {
      const result = await window.electronAPI.readInFile();
      console.log(result)
      setData(result);
    }
    getData();
  }, []);
  return (
    
    <h1>hello</h1>
     
   
  );
}

export default ScreentimeMetrics;

