import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import TokenManagementForm from './components/CreateTokenForm';
import EarnTokensForm from './components/EarnTokensForm';
import TokenSwapForm from './components/TokenSwapForm';
import BusinessDashboard from './components/BusinessDashboard';
import CouponManager from './components/CouponManager';
import './App.css';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('customer');

  const tabStyle = (tabName) => ({
    padding: "10px 20px",
    backgroundColor: activeTab === tabName ? "#007bff" : "#3a3f47",
    color: "white",
    border: "1px solid #555",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
    marginRight: "5px"
  });

  return (
    <div className="App App-header" style={{ backgroundColor: '#282c34', color: 'white', minHeight: '100vh' }}>
      <h1>🔄 LoyalLoop</h1>
      <p style={{ color: "#ccc", marginBottom: "20px" }}>
        Complete loyalty token system with DEX trading and business management
      </p>
      
      <WalletConnector onAccountChange={setCurrentAccount} />
      
      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        marginTop: "20px", 
        marginBottom: "0",
        borderBottom: "1px solid #555" 
      }}>
        <button 
          style={tabStyle('customer')}
          onClick={() => setActiveTab('customer')}
        >
          👤 Customer View
        </button>
        <button 
          style={tabStyle('trading')}
          onClick={() => setActiveTab('trading')}
        >
          🔄 DEX Trading
        </button>
        <button 
          style={tabStyle('business')}
          onClick={() => setActiveTab('business')}
        >
          🏢 Business Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ 
        border: "1px solid #555", 
        borderTop: "none",
        padding: "20px",
        backgroundColor: "#2d3138",
        color: "white",
        borderRadius: "0 0 8px 8px",
        minHeight: "400px",
        width: "100%"
      }}>
        {activeTab === 'customer' && (
          <div className='App'>
            <h2 style={{ color: "white" }}>👤 Customer Interface</h2>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>
              Earn tokens, manage your balance, and use coupons
            </p>
            
            <EarnTokensForm currentAccount={currentAccount} />
            <TokenManagementForm currentAccount={currentAccount} />
            <CouponManager currentAccount={currentAccount} />
          </div>
        )}

        {activeTab === 'trading' && (
          <div>
            <h2 style={{ color: "white" }}>🔄 DEX Trading Interface</h2>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>
              Trade LOYAL tokens for ETH and vice versa
            </p>
            
            <TokenSwapForm currentAccount={currentAccount} />
          </div>
        )}

        {activeTab === 'business' && (
          <div>
            <h2 style={{ color: "white" }}>🏢 Business Management</h2>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>
              Manage your loyalty program and analyze performance
            </p>
            
            <BusinessDashboard currentAccount={currentAccount} />
          </div>
        )}
      </div>

      <hr style={{ margin: "40px 0" }} />
      
      {/* Footer Information */}
      <div style={{ 
        textAlign: "center", 
        fontSize: "0.9em", 
        color: "#ccc",
        backgroundColor: "#2d3138",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #555"
      }}>
        <h3 style={{ color: "white" }}>🎉 LoyalLoop Ecosystem Features</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "15px",
          textAlign: "left"
        }}>
          <div>
            <h4 style={{ color: "#87ceeb" }}>👤 For Customers:</h4>
            <ul style={{ color: "#ccc" }}>
              <li>Earn LOYAL tokens by spending</li>
              <li>Redeem tokens for discounts</li>
              <li>Create and use digital coupons</li>
              <li>Trade tokens on DEX</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#87ceeb" }}>🏢 For Businesses:</h4>
            <ul style={{ color: "#ccc" }}>
              <li>Manage token emission</li>
              <li>Control liquidity pools</li>
              <li>Analytics dashboard</li>
              <li>Customer engagement tools</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#87ceeb" }}>🔄 DEX Features:</h4>
            <ul style={{ color: "#ccc" }}>
              <li>ETH ↔ LOYAL swaps</li>
              <li>Real-time pricing</li>
              <li>Low trading fees (1%)</li>
              <li>Liquidity management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
