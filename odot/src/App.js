import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getData() {
      const result = await window.electronAPI.fetchAPI('https://ai.hackclub.com/proxy/v1/chat/completion');
      console.log(result)
      setData(result);
    }
    getData();
  }, []);

  return (
    <div>
      <h1>Electron + React API Example</h1>
     {JSON.stringify(data, null, 2)}
    </div>
  );
}

export default App;
