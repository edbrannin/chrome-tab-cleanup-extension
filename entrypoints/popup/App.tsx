import wxtLogo from '/wxt.svg';
import { useState } from 'react';

import reactLogo from '@/assets/react.svg';

import './App.css';

function App() {
  const url = browser.runtime.getURL("/sorter.html");

  return (
    <>
      <h1>Tab Cleanup</h1>
      <div className="card">
        <a href={url} target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
      </div>
      <div className="card">
        <p>
          Edit <code>entrypoint/popup/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
