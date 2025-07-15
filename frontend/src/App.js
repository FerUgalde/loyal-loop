import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import TokenManagementForm from './components/CreateTokenForm';
import EarnTokensForm from './components/EarnTokensForm';
import './App.css';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  return (
    <div className="App App-header">
      <img src={""} className="App-logo" alt="LoyalLoop" />
      <h1>LoyalLoop</h1>
      <WalletConnector onAccountChange={setCurrentAccount} />
      <TokenManagementForm />
      <hr/>
      <EarnTokensForm currentAccount={currentAccount} />
      <hr/>
      <p>
        Welcome to LoyalLoop, your gateway to seamless loyalty rewards.
      </p>
    </div>
  );
}

export default App;
