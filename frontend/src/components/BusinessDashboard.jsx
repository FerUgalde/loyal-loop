/**
 * BusinessDashboard Component v1.0
 * 
 * Comprehensive business management dashboard for PYMEs (Small and Medium Enterprises).
 * Provides tools for managing the loyalty token ecosystem from a business perspective.
 * 
 * Features:
 * - Token emission and supply management
 * - DEX liquidity management (owner functions)
 * - Business analytics and metrics
 * - Coupon system management
 * - Customer engagement tools
 * - Revenue and token economics tracking
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.currentAccount - Connected wallet address
 * 
 * @example
 * return (
 *   <BusinessDashboard currentAccount={walletAddress} />
 * )
 * 
 * @version 1.0.0
 * @author Fernanda
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getTokenMetrics } from "../services/token";
import { getDEXStatus, addLiquidity } from "../services/dex";

/**
 * BusinessDashboard functional component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.currentAccount - Current connected wallet address
 * @returns {JSX.Element} The rendered component
 */
const BusinessDashboard = ({ currentAccount }) => {
  // Dashboard state
  const [metrics, setMetrics] = useState({
    totalSupply: "0",
    totalMinted: "0",
    totalBurned: "0",
    emissionRate: "0",
    unitValue: "0"
  });
  
  const [dexMetrics, setDexMetrics] = useState({
    ethLiquidity: "0",
    tokenLiquidity: "0",
    exchangeRate: "0",
    feePercentage: "0"
  });
  
  const [liquidityForm, setLiquidityForm] = useState({
    ethAmount: "",
    tokenAmount: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  /**
   * Load business metrics and analytics
   */
  const loadBusinessMetrics = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Load token metrics
      const tokenMetrics = await getTokenMetrics(provider);
      if (tokenMetrics.success) {
        setMetrics(tokenMetrics);
      }
      
      // Load DEX metrics
      const dexStatus = await getDEXStatus(provider);
      if (dexStatus.success) {
        setDexMetrics(dexStatus);
      }
    } catch (error) {
      console.error("Error loading business metrics:", error);
    }
  };

  /**
   * Handle adding liquidity to DEX
   */
  const handleAddLiquidity = async () => {
    if (!window.ethereum || !currentAccount) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!liquidityForm.ethAmount || !liquidityForm.tokenAmount) {
      setStatus("Please enter both ETH and token amounts");
      return;
    }

    setIsLoading(true);
    setStatus("Adding liquidity...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await addLiquidity(
        liquidityForm.ethAmount,
        liquidityForm.tokenAmount,
        signer
      );

      if (result.success) {
        setStatus(result.message);
        setLiquidityForm({ ethAmount: "", tokenAmount: "" });
        // Refresh metrics
        await loadBusinessMetrics();
      } else {
        setStatus(`Failed to add liquidity: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load metrics on component mount
  useEffect(() => {
    loadBusinessMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(loadBusinessMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      padding: "20px",
      backgroundColor: "#3a3f47",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #555",
      color: "white"
    }}>
      <h2 style={{ color: "white" }}>🏢 Business Dashboard</h2>
      <p style={{ color: "#ccc", marginBottom: "20px" }}>
        Manage your loyalty token ecosystem and analyze business performance
      </p>

      {/* Business Overview Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "15px",
        marginBottom: "25px"
      }}>
        {/* Token Supply Card */}
        <div style={{ 
          backgroundColor: "#2d5a3d", 
          padding: "15px", 
          borderRadius: "8px",
          border: "1px solid #4caf50",
          color: "white"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#87ceeb" }}>💰 Token Supply</h4>
          <div style={{ fontSize: "0.9em", color: "#ccc" }}>
            <div>Total: {parseFloat(metrics.totalSupply).toFixed(2)} LOYAL</div>
            <div>Minted: {parseFloat(metrics.totalMinted).toFixed(2)} LOYAL</div>
            <div>Burned: {parseFloat(metrics.totalBurned).toFixed(2)} LOYAL</div>
          </div>
        </div>

        {/* DEX Liquidity Card */}
        <div style={{ 
          backgroundColor: "#2d3a5a", 
          padding: "15px", 
          borderRadius: "8px",
          border: "1px solid #2196f3",
          color: "white"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#87ceeb" }}>🏦 DEX Liquidity</h4>
          <div style={{ fontSize: "0.9em", color: "#ccc" }}>
            <div>ETH: {parseFloat(dexMetrics.ethLiquidity).toFixed(4)} ETH</div>
            <div>LOYAL: {parseFloat(dexMetrics.tokenLiquidity).toFixed(2)} LOYAL</div>
            <div>Rate: {parseFloat(dexMetrics.exchangeRate).toFixed(0)} LOYAL/ETH</div>
          </div>
        </div>

        {/* Token Economics Card */}
        <div style={{ 
          backgroundColor: "#5a4a2d", 
          padding: "15px", 
          borderRadius: "8px",
          border: "1px solid #ffb74d",
          color: "white"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#87ceeb" }}>📊 Economics</h4>
          <div style={{ fontSize: "0.9em", color: "#ccc" }}>
            <div>Emission Rate: {metrics.emissionRate}</div>
            <div>Unit Value: {metrics.unitValue}</div>
            <div>DEX Fee: {dexMetrics.feePercentage}%</div>
          </div>
        </div>

        {/* Business Health Card */}
        <div style={{ 
          backgroundColor: "#4a2d5a", 
          padding: "15px", 
          borderRadius: "8px",
          border: "1px solid #ce93d8",
          color: "white"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#87ceeb" }}>❤️ Health Score</h4>
          <div style={{ fontSize: "0.9em", color: "#ccc" }}>
            <div>Liquidity: {parseFloat(dexMetrics.ethLiquidity) > 0 ? "🟢 Active" : "🔴 Low"}</div>
            <div>Tokens: {parseFloat(metrics.totalSupply) > 0 ? "🟢 Available" : "🔴 None"}</div>
            <div>Status: {currentAccount ? "🟢 Connected" : "🔴 Offline"}</div>
          </div>
        </div>
      </div>

      {/* Liquidity Management Section */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        marginBottom: "20px",
        color: "white"
      }}>
        <h3 style={{ color: "white" }}>💧 Liquidity Management</h3>
        <p style={{ color: "#ccc", fontSize: "0.9em", marginBottom: "15px" }}>
          Add liquidity to enable token trading. Both ETH and LOYAL tokens are required.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
              ETH Amount
            </label>
            <input
              type="number"
              placeholder="0.1"
              value={liquidityForm.ethAmount}
              onChange={(e) => setLiquidityForm({...liquidityForm, ethAmount: e.target.value})}
              disabled={isLoading}
              min="0"
              step="0.01"
              style={{ 
                width: "100%", 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #555",
                backgroundColor: "#3a3f47",
                color: "white"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
              LOYAL Amount
            </label>
            <input
              type="number"
              placeholder="100"
              value={liquidityForm.tokenAmount}
              onChange={(e) => setLiquidityForm({...liquidityForm, tokenAmount: e.target.value})}
              disabled={isLoading}
              min="0"
              step="1"
              style={{ 
                width: "100%", 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #555",
                backgroundColor: "#3a3f47",
                color: "white"
              }}
            />
          </div>
        </div>

        <button
          onClick={handleAddLiquidity}
          disabled={isLoading || !currentAccount}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: currentAccount ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: currentAccount ? "pointer" : "not-allowed"
          }}
        >
          {isLoading ? "Processing..." : "💧 Add Liquidity"}
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        color: "white"
      }}>
        <h3 style={{ color: "white" }}>⚡ Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          <button
            onClick={loadBusinessMetrics}
            style={{
              padding: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔄 Refresh Data
          </button>
          
          <button
            onClick={() => window.open("https://etherscan.io", "_blank")}
            style={{
              padding: "10px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔍 View on Explorer
          </button>
        </div>
      </div>

      {/* Status Display */}
      {status && (
        <div style={{ 
          marginTop: "15px", 
          padding: "12px", 
          backgroundColor: status.includes("Successfully") || status.includes("success") ? "#2d5a3d" : "#5a2d2d",
          border: `1px solid ${status.includes("Successfully") || status.includes("success") ? "#4caf50" : "#f44336"}`,
          borderRadius: "4px",
          color: "white"
        }}>
          {status}
        </div>
      )}

      {/* Account Info */}
      {currentAccount && (
        <div style={{ 
          marginTop: "15px", 
          padding: "10px", 
          backgroundColor: "#2d3138", 
          borderRadius: "4px",
          fontSize: "0.9em",
          color: "white",
          border: "1px solid #555"
        }}>
          <strong style={{ color: "#87ceeb" }}>Business Account:</strong> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
