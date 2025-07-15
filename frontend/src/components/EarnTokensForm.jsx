/**
 * EarnTokensForm Component v2.0
 * 
 * Allows users to simulate purchases and earn LOYAL tokens based on spending.
 * This component interfaces with the LoyaltyToken contract's earnTokensForSelf function.
 * 
 * Version 2.0 Features:
 * - Uses public earnTokensForSelf() function (no owner restriction)
 * - Enhanced UX with loading states and detailed feedback
 * - Input validation and error handling
 * - Token calculation preview and explanations
 * - Visual feedback for success/error states
 * - Account integration and display
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.currentAccount - The connected wallet address
 * 
 * @example
 * return (
 *   <EarnTokensForm currentAccount={walletAddress} />
 * )
 * 
 * @version 2.0.0
 * @author Fernanda
 */

import { useState } from "react";
import { ethers } from "ethers";
import LoyaltyToken from "../abi/LoyaltyToken.json";

// Update this address to your deployed contract address
const CONTRACT_ADDRESS = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";

/**
 * EarnTokensForm functional component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.currentAccount - Current connected wallet address
 * @returns {JSX.Element} The rendered component
 */
const EarnTokensForm = ({ currentAccount }) => {
  // State to store the amount spent by the customer
  const [amountSpent, setAmountSpent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  /**
   * Handles the earn tokens process
   * Calls the contract's earnTokens function to mint tokens based on spending
   * 
   * @async
   * @function handleEarn
   * @returns {Promise<void>} Promise that resolves when earning process is complete
   */
  const handleEarn = async () => {
    // Validate inputs
    if (!window.ethereum || !currentAccount) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!amountSpent || parseFloat(amountSpent) <= 0) {
      setStatus("Please enter a valid amount spent");
      return;
    }

    setIsLoading(true);
    setStatus("Processing...");

    try {
      // Connect to the contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, LoyaltyToken.abi, signer);

      // Call earnTokensForSelf function (allows any user to earn tokens)
      const tx = await contract.earnTokensForSelf(ethers.parseUnits(amountSpent, 0));
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Calculate expected tokens (based on contract logic)
      // tokens = (amountSpent / unitValue) * emissionRate
      // With default values: unitValue=3, emissionRate=1
      const expectedTokens = Math.floor(parseFloat(amountSpent) / 3) * 1;
      
      setStatus(`Successfully earned ~${expectedTokens} LOYAL tokens! Transaction: ${tx.hash}`);
      setAmountSpent(""); // Clear the input
    } catch (err) {
      console.error("Error earning tokens:", err);
      setStatus(`Failed to earn tokens: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Form header */}
      <h2>Simulate Purchase & Earn Tokens</h2>
      
      {/* Input for amount spent */}
      <div>
        <input 
          type="number" 
          placeholder="Amount Spent (units)" 
          value={amountSpent} 
          onChange={(e) => setAmountSpent(e.target.value)}
          disabled={isLoading}
          min="0"
          step="1"
        />
      </div>
      
      {/* Earn tokens button */}
      <button 
        onClick={handleEarn}
        disabled={isLoading || !currentAccount}
      >
        {isLoading ? "Processing..." : "Earn Tokens"}
      </button>
      
      {/* Information about token calculation */}
      <div style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
        <p>Token calculation: (Amount ÷ 3) × 1 = Tokens earned</p>
        <p>Example: Spend 9 units → Get 3 LOYAL tokens</p>
      </div>
      
      {/* Status display */}
      {status && (
        <div style={{ 
          marginTop: "10px", 
          padding: "10px", 
          backgroundColor: status.includes("Successfully") ? "#d4edda" : "#f8d7da",
          border: `1px solid ${status.includes("Successfully") ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "4px"
        }}>
          {status}
        </div>
      )}
      
      {/* Account info */}
      {currentAccount && (
        <div style={{ marginTop: "10px", fontSize: "0.8em", color: "#888" }}>
          Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default EarnTokensForm;