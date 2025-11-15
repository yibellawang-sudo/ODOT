import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getData() {
      const result = await window.electronAPI.fetchAPI('https://jsonplaceholder.typicode.com/todos/1');
      setData(result);
    }
    getData();
  }, []);

  return (
    <div>
      <h1>Electron + React API Example</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
