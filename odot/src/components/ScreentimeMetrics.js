import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ScreentimeMetrics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getData() {
      const result = await window.electronAPI.readInFile();
      const decoder = new TextDecoder("utf-8");
      const jsonString = decoder.decode(result);

      const jsonObject = JSON.parse(jsonString);

      console.log(jsonObject);
      setData(jsonObject);
    }
    getData();
  }, []);
  return (
    <div className = "screentime-viewer">
      <p onClick={() => navigate(-1)} className="navButton">
        ←
      </p>
      {data == null ? <p>loading...</p> : exportToday(data)}
      <div className = "aiViewer">

      </div>
    </div>
  );
}

function exportToday(data) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
    let totalSec = 0;
    for (const dataPt of data) {
        console.log(dataPt)
        totalSec += dataPt.seconds;
    }
    console.log(totalSec)
    let totalHrs = Math.floor(totalSec/3600)
    let totalMin = Math.floor((totalSec - (Math.floor(totalSec/3600)*3600))/60)
  return (
    <>
      <h1>today</h1>
      <div className = "timeRowDiv">
        <h2 className= "left-header">{totalHrs} hrs and {totalMin} min today</h2>
      {data

        .filter((dataPt) => {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

           const dataTimeMs = dataPt.date * 1000; // convert seconds to ms
    return dataTimeMs >= startOfToday.getTime() && dataTimeMs <= endOfToday.getTime();
        })

        .map((dataPt, idx) => {
          return exportRow(dataPt.name, dataPt.seconds, idx)
        })}
        </div>
    </>
  );
  
}

function exportRow(name, time, idx) {
  return (
   
    <div className="timeRow" key={idx}>
      <p>{name}</p>
      <p>{Math.floor(time/60)} minutes</p>
    </div>
  );
}

function  





export default ScreentimeMetrics;
