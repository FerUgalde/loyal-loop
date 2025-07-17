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
import { debugTokenState } from "../services/token";
import { CONTRACT_ADDRESSES } from "../config/contracts.js";

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

    if (parseFloat(amountSpent) < 3) {
      setStatus("Amount spent must be at least 3 units to earn tokens");
      return;
    }

    setIsLoading(true);
    setStatus("Processing...");

    try {
      // Connect to the contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.loyaltyToken, LoyaltyToken.abi, signer);

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
    <div style={{ 
      padding: "20px",
      backgroundColor: "#3a3f47",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #555",
      color: "white"
    }}>
      {/* Form header */}
      <h2 style={{ color: "white" }}>🛒 Simulate Purchase & Earn Tokens</h2>
      <p style={{ color: "#ccc", marginBottom: "20px" }}>
        Simulate a purchase to earn LOYAL tokens. Tokens are calculated based on amount spent.
      </p>
      
      {/* Input for amount spent */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
          Amount Spent (units)
        </label>
        <input 
          type="number" 
          placeholder="e.g., 15" 
          value={amountSpent} 
          onChange={(e) => setAmountSpent(e.target.value)}
          disabled={isLoading}
          min="0"
          step="1"
          style={{ 
            width: "100%", 
            padding: "10px", 
            borderRadius: "4px", 
            border: "1px solid #555",
            backgroundColor: "#2d3138",
            color: "white",
            fontSize: "16px"
          }}
        />
      </div>
      
      {/* Earn tokens button */}
      <button 
        onClick={handleEarn}
        disabled={isLoading || !currentAccount}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: currentAccount ? "#28a745" : "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: currentAccount ? "pointer" : "not-allowed",
          marginBottom: "15px"
        }}
      >
        {isLoading ? "Processing..." : "💰 Earn Tokens"}
      </button>
      
      {/* Information about token calculation */}
      <div style={{ 
        marginBottom: "15px", 
        padding: "15px",
        backgroundColor: "#2d3138",
        borderRadius: "6px",
        border: "1px solid #555"
      }}>
        <h4 style={{ color: "#87ceeb", marginBottom: "10px" }}>💡 How it works:</h4>
        <div style={{ fontSize: "0.9em", color: "#ccc" }}>
          <p>• <strong style={{ color: "#ffd700" }}>Minimum spend: 3 units</strong> (to earn at least 1 token)</p>
          <p>• Token calculation: (Amount ÷ 3) × 1 = Tokens earned</p>
          <p>• Example: Spend 9 units → Get 3 LOYAL tokens</p>
          <p>• Example: Spend 15 units → Get 5 LOYAL tokens</p>
        </div>
      </div>
      
      {/* Status display */}
      {status && (
        <div style={{ 
          marginBottom: "15px", 
          padding: "12px", 
          backgroundColor: status.includes("Successfully") ? "#2d5a3d" : "#5a2d2d",
          border: `1px solid ${status.includes("Successfully") ? "#4caf50" : "#f44336"}`,
          borderRadius: "6px",
          color: "white"
        }}>
          {status}
        </div>
      )}
      
      {/* Account info */}
      {currentAccount && (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#2d3138", 
          borderRadius: "4px",
          fontSize: "0.9em", 
          color: "white",
          border: "1px solid #555"
        }}>
          <strong style={{ color: "#87ceeb" }}>Connected:</strong> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
        </div>
      )}
      
      {/* Debug Button */}
      {currentAccount && (
        <button
          onClick={async () => {
            console.log("🔍 Running debug...");
            const debugInfo = await debugTokenState(currentAccount);
            console.log("Debug results:", debugInfo);
            setStatus(`Debug complete - check browser console for details. Your balance: ${debugInfo.userBalance} LOYAL`);
          }}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85em"
          }}
        >
          🔧 Debug Contract State
        </button>
      )}
    </div>
  );
};

export default EarnTokensForm;