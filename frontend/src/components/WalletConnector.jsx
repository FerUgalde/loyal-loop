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

function WalletConnector () {
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
      if (address) setAccount(address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div className="wallet-connector">
      {/* Main heading for the wallet connection section */}
      <h2>Connect Your Wallet</h2>
      
      {/* Conditional rendering based on wallet connection status */}
      {account ? (
        // Display connected account information
        <div>
          <p>Connected Account: {account}</p>
        </div>
      ) : (
        // Display connection button when no wallet is connected
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
      
      {/* User guidance and instructions */}
      <p>
        Please connect your wallet to interact with the LoyalLoop platform.
      </p>
      <p>
        Ensure you have a wallet extension like MetaMask installed in your browser.
      </p>
    </div>
  );
}

export default WalletConnector;