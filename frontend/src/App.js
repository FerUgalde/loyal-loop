import React from 'react';
import WalletConnector from './components/WalletConnector';
import './App.css';

function App() {
  return (
    <div className="App App-header">
      <img src={""} className="App-logo" alt="LoyalLoop" />
      <h1>LoyalLoop</h1>
      <WalletConnector />
      <p>
        Welcome to LoyalLoop, your gateway to seamless loyalty rewards.
      </p>
    </div>
  );
}

export default App;
