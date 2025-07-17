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
    <div className="card-elegant p-6 max-w-md mx-auto">
      {/* Main heading for the wallet connection section */}
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center justify-center">
        🔗 Connect Your Wallet
      </h2>
      
      {/* Conditional rendering based on wallet connection status */}
      {account ? (
        // Display connected account information
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold mb-2 flex items-center justify-center">
            ✅ Wallet Connected
          </div>
          <div className="text-green-600 text-sm break-all text-center">
            {account}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Display connection button when no wallet is connected */}
          <button 
            onClick={handleConnect}
            className="btn-primary w-full flex items-center justify-center"
          >
            🦊 Connect MetaMask
          </button>
          
          {/* User guidance and instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-2 text-sm">
              Please connect your wallet to interact with the LoyalLoop platform.
            </p>
            <p className="text-blue-600 text-xs flex items-center justify-center">
              💡 Ensure you have MetaMask installed in your browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletConnector;