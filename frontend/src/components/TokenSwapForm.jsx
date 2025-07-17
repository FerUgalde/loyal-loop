/**
 * TokenSwapForm Component v1.0
 * 
 * DEX trading interface for swapping between ETH and LOYAL tokens.
 * Provides real-time swap calculations, liquidity information, and trading functionality.
 * 
 * Features:
 * - Bidirectional swaps (ETH ↔ LOYAL)
 * - Real-time swap preview with fees
 * - Live liquidity and exchange rate display
 * - Input validation and error handling
 * - Responsive design with clear UX
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.currentAccount - Connected wallet address
 * 
 * @example
 * return (
 *   <TokenSwapForm currentAccount={walletAddress} />
 * )
 * 
 * @version 1.0.0
 * @author Fernanda
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
  swapEthForTokens, 
  swapTokensForEth, 
  getDEXStatus, 
  calculateSwap 
} from "../services/dex";

/**
 * TokenSwapForm functional component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.currentAccount - Current connected wallet address
 * @returns {JSX.Element} The rendered component
 */
const TokenSwapForm = ({ currentAccount }) => {
  // Form state
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isEthToToken, setIsEthToToken] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  
  // DEX status
  const [dexStatus, setDexStatus] = useState({
    ethLiquidity: "0",
    tokenLiquidity: "0", 
    exchangeRate: "0",
    feePercentage: "0"
  });
  
  // Swap calculation
  const [swapPreview, setSwapPreview] = useState({
    outputAmount: "0",
    feeAmount: "0"
  });

  /**
   * Load DEX status and liquidity information
   */
  const loadDEXStatus = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const status = await getDEXStatus(provider);
      
      if (status.success) {
        setDexStatus(status);
      }
    } catch (error) {
      console.error("Error loading DEX status:", error);
    }
  };

  /**
   * Calculate swap preview when input changes
   */
  const calculateSwapPreview = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setSwapPreview({ outputAmount: "0", feeAmount: "0" });
      setOutputAmount("");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const calculation = await calculateSwap(inputAmount, isEthToToken, provider);
      
      if (calculation.success) {
        setSwapPreview({
          outputAmount: calculation.outputAmount,
          feeAmount: calculation.feeAmount
        });
        setOutputAmount(calculation.outputAmount);
      }
    } catch (error) {
      console.error("Error calculating swap:", error);
    }
  };

  /**
   * Handle token swap execution
   */
  const handleSwap = async () => {
    if (!window.ethereum || !currentAccount) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setStatus("Processing swap...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      let result;
      if (isEthToToken) {
        result = await swapEthForTokens(inputAmount, signer);
      } else {
        result = await swapTokensForEth(inputAmount, signer);
      }

      if (result.success) {
        setStatus(result.message);
        setInputAmount("");
        setOutputAmount("");
        // Refresh DEX status
        await loadDEXStatus();
      } else {
        setStatus(`Swap failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error executing swap:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle swap direction
   */
  const toggleSwapDirection = () => {
    setIsEthToToken(!isEthToToken);
    setInputAmount("");
    setOutputAmount("");
    setSwapPreview({ outputAmount: "0", feeAmount: "0" });
  };

  // Load DEX status on component mount
  useEffect(() => {
    loadDEXStatus();
  }, []);

  // Calculate swap preview when input or direction changes
  useEffect(() => {
    calculateSwapPreview();
  }, [inputAmount, isEthToToken]);

  return (
    <div style={{ 
      border: "1px solid #555", 
      borderRadius: "8px", 
      padding: "20px", 
      marginBottom: "20px",
      backgroundColor: "#3a3f47",
      color: "white"
    }}>
      <h2 style={{ color: "white" }}>🔄 Token Swap (DEX)</h2>
      
      {/* DEX Status Display */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "12px", 
        borderRadius: "6px", 
        marginBottom: "15px",
        fontSize: "0.9em",
        border: "1px solid #555",
        color: "#ccc"
      }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#87ceeb" }}>📊 DEX Status</h4>
        <div>💧 ETH Liquidity: {parseFloat(dexStatus.ethLiquidity).toFixed(4)} ETH</div>
        <div>🪙 LOYAL Liquidity: {parseFloat(dexStatus.tokenLiquidity).toFixed(2)} LOYAL</div>
        <div>📈 Exchange Rate: {parseFloat(dexStatus.exchangeRate).toFixed(0)} LOYAL/ETH</div>
        <div>💸 Trading Fee: {dexStatus.feePercentage}%</div>
        
        {/* Liquidity Warning */}
        {(parseFloat(dexStatus.ethLiquidity) === 0 || parseFloat(dexStatus.tokenLiquidity) === 0) && (
          <div style={{ 
            marginTop: "8px", 
            padding: "8px", 
            backgroundColor: "#5a2d2d", 
            border: "1px solid #f44336",
            borderRadius: "4px",
            color: "#ffcdd2"
          }}>
            ⚠️ <strong>No Liquidity!</strong> Trading is disabled. Add liquidity in Business Dashboard first.
          </div>
        )}
        
        {/* Refresh Button */}
        <button
          onClick={loadDEXStatus}
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.8em",
            cursor: "pointer"
          }}
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Swap Interface */}
      <div style={{ marginBottom: "15px" }}>
        {/* Input Section */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
            From: {isEthToToken ? "ETH" : "LOYAL"}
          </label>
          <input
            type="number"
            placeholder={`Amount in ${isEthToToken ? "ETH" : "LOYAL"}`}
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            disabled={isLoading}
            min="0"
            step="0.001"
            style={{ 
              width: "100%", 
              padding: "8px", 
              borderRadius: "4px", 
              border: "1px solid #555",
              backgroundColor: "#2d3138",
              color: "white"
            }}
          />
        </div>

        {/* Swap Direction Button */}
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <button
            onClick={toggleSwapDirection}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            ⇅ Swap Direction
          </button>
        </div>

        {/* Output Section */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
            To: {isEthToToken ? "LOYAL" : "ETH"}
          </label>
          <input
            type="text"
            placeholder="Output amount"
            value={outputAmount}
            disabled={true}
            style={{ 
              width: "100%", 
              padding: "8px", 
              borderRadius: "4px", 
              border: "1px solid #555",
              backgroundColor: "#1e2127",
              color: "#aaa"
            }}
          />
        </div>

        {/* Swap Preview */}
        {parseFloat(swapPreview.outputAmount) > 0 && (
          <div style={{ 
            backgroundColor: "#3a3f47", 
            padding: "8px", 
            borderRadius: "4px", 
            fontSize: "0.9em",
            marginBottom: "10px",
            border: "1px solid #555",
            color: "#ccc"
          }}>
            <div>💰 You'll receive: ~{parseFloat(swapPreview.outputAmount).toFixed(6)} {isEthToToken ? "LOYAL" : "ETH"}</div>
            <div>💸 Trading fee: ~{parseFloat(swapPreview.feeAmount).toFixed(6)} {isEthToToken ? "LOYAL" : "ETH"}</div>
          </div>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={
          isLoading || 
          !currentAccount || 
          !inputAmount || 
          parseFloat(dexStatus.ethLiquidity) === 0 || 
          parseFloat(dexStatus.tokenLiquidity) === 0
        }
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: 
            currentAccount && 
            inputAmount && 
            parseFloat(dexStatus.ethLiquidity) > 0 && 
            parseFloat(dexStatus.tokenLiquidity) > 0 
              ? "#28a745" 
              : "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: 
            currentAccount && 
            inputAmount && 
            parseFloat(dexStatus.ethLiquidity) > 0 && 
            parseFloat(dexStatus.tokenLiquidity) > 0 
              ? "pointer" 
              : "not-allowed"
        }}
      >
        {isLoading ? "Processing..." : 
         !currentAccount ? "Connect Wallet" :
         parseFloat(dexStatus.ethLiquidity) === 0 || parseFloat(dexStatus.tokenLiquidity) === 0 ? "No Liquidity" :
         `Swap ${isEthToToken ? "ETH → LOYAL" : "LOYAL → ETH"}`}
      </button>

      {/* Status Display */}
      {status && (
        <div style={{ 
          marginTop: "15px", 
          padding: "10px", 
          backgroundColor: status.includes("Successfully") ? "#2d5a3d" : "#5a2d2d",
          border: `1px solid ${status.includes("Successfully") ? "#4caf50" : "#f44336"}`,
          borderRadius: "4px",
          fontSize: "0.9em",
          color: "white"
        }}>
          {status}
        </div>
      )}

      {/* Account info */}
      {currentAccount && (
        <div style={{ marginTop: "10px", fontSize: "0.8em", color: "#aaa" }}>
          Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default TokenSwapForm;