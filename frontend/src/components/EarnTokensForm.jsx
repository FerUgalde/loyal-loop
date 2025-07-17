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
    <div className="space-y-4">
      {/* Form header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🛒 Simulate Purchase & Earn Tokens</h3>
        <p className="text-gray-600 text-sm">
          Simulate a purchase to earn LOYAL tokens. Tokens are calculated based on amount spent.
        </p>
      </div>
      
      {/* Input for amount spent */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="input-elegant w-full"
        />
      </div>
      
      {/* Earn tokens button */}
      <button 
        onClick={handleEarn}
        disabled={isLoading || !currentAccount}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          currentAccount ? 'btn-primary' : 'bg-gray-400 text-white cursor-not-allowed'
        }`}
      >
        {isLoading ? "Processing..." : "💰 Earn Tokens"}
      </button>
      
      {/* Information about token calculation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-medium mb-2">💡 How it works:</h4>
        <div className="text-blue-700 text-sm space-y-1">
          <p>• <strong className="text-primary">Minimum spend: 3 units</strong> (to earn at least 1 token)</p>
          <p>• You earn <strong>1 LOYAL token per 3 units spent</strong></p>
          <p>• Token calculation: <code className="bg-blue-100 px-1 rounded">Math.floor(amount / 3)</code></p>
          <p>• Tokens minted directly to your wallet</p>
        </div>
      </div>

      {/* Calculation preview */}
      {amountSpent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-green-800 font-medium mb-2">📊 Your calculation:</h4>
          <div className="text-green-700 text-sm">
            <p><strong>Amount spent:</strong> {amountSpent} units</p>
            <p><strong>Tokens to earn:</strong> {Math.floor(amountSpent / 3)} LOYAL</p>
          </div>
        </div>
      )}

      {/* Account status */}
      {currentAccount && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-700 text-sm text-center">
            <strong className="text-secondary">Connected:</strong> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
          </p>
        </div>
      )}

      {/* Status message */}
      {status && (
        <div className={`p-4 rounded-lg text-center font-medium ${
          status.includes('✅') ? 'bg-green-100 text-green-800' : 
          status.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {/* Debug button */}
      <button 
        onClick={() => debugTokenState(currentAccount)}
        disabled={!currentAccount}
        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        🔍 Debug Token State
      </button>
    </div>
  );
};

export default EarnTokensForm;