/**
 * WalletConnector Component
 * 
 * A React component that provides wallet connection functionality for the LoyalLoop platform.
 * This component allows users to connect their MetaMask wallet to interact with the Ethereum blockchain.
 * 
 * Features:
 * - Connect to MetaMask wallet
 * - Display connected account address
 * - Handle connection errors gracefully
 * - Provide user guidance for wallet setup
 * 
 * @component
 * @example
 * return (
 *   <WalletConnector />
 * )
 */

import React, { useState } from "react";
import { connectWallet } from "../services/wallet";

function WalletConnector ({ onAccountChange }) {
  // State to store the connected wallet address
  const [account, setAccount] = useState(null);

  /**
   * Handles wallet connection process
   * Calls the connectWallet service and updates the account state
   * 
   * @async
   * @function handleConnect
   * @returns {Promise<void>} Promise that resolves when connection attempt is complete
   * @throws {Error} Logs error to console if wallet connection fails
   */
  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      if (address) {
        setAccount(address);
        // Notify parent component about account change
        if (onAccountChange) {
          onAccountChange(address);
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div style={{ 
      padding: "20px",
      backgroundColor: "#3a3f47",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #555",
      color: "white",
      textAlign: "center"
    }}>
      {/* Main heading for the wallet connection section */}
      <h2 style={{ color: "white" }}>🔗 Connect Your Wallet</h2>
      
      {/* Conditional rendering based on wallet connection status */}
      {account ? (
        // Display connected account information
        <div style={{ 
          padding: "15px",
          backgroundColor: "#2d5a3d",
          borderRadius: "8px",
          border: "1px solid #4caf50",
          marginTop: "15px"
        }}>
          <div style={{ fontSize: "1.1em", fontWeight: "bold", color: "white", marginBottom: "5px" }}>
            ✅ Wallet Connected
          </div>
          <div style={{ fontSize: "0.9em", color: "#ccc", wordBreak: "break-all" }}>
            {account}
          </div>
        </div>
      ) : (
        <div>
          {/* Display connection button when no wallet is connected */}
          <button 
            onClick={handleConnect}
            style={{
              padding: "15px 30px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "20px",
              fontWeight: "bold"
            }}
          >
            🦊 Connect MetaMask
          </button>
          
          {/* User guidance and instructions */}
          <div style={{ 
            backgroundColor: "#2d3138",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #555"
          }}>
            <p style={{ color: "#ccc", margin: "0 0 10px 0" }}>
              Please connect your wallet to interact with the LoyalLoop platform.
            </p>
            <p style={{ color: "#87ceeb", margin: "0", fontSize: "0.9em" }}>
              💡 Ensure you have MetaMask installed in your browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletConnector;