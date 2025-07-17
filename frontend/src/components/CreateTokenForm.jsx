/**
 * TokenManagementForm Component v2.0
 * 
 * Comprehensive token management interface for LoyalLoop ecosystem:
 * - Transfer tokens between addresses
 * - Check token balances
 * - Redeem tokens for rewards (burn mechanism)
 * - View token metrics and economics
 * 
 * This component implements the core token utility functions needed
 * for a complete loyalty token ecosystem with deflationary mechanics.
 * 
 * @component
 * @example
 * return (
 *   <TokenManagementForm />
 * )
 * 
 * @version 2.0.0
 * @author Fernanda
 */

import React, { useState, useEffect } from "react";
import { getBalance, transferTokens, redeemTokens, getTokenMetrics } from "../services/token";

function TokenManagementForm({ currentAccount }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load balance when account changes
  useEffect(() => {
    if (currentAccount) {
      loadBalance();
    } else {
      setBalance(null);
    }
  }, [currentAccount]);

  /**
   * Loads the current user's token balance
   */
  const loadBalance = async () => {
    if (!currentAccount) return;
    
    try {
      const bal = await getBalance(currentAccount);
      setBalance(bal);
    } catch (err) {
      console.error("Error loading balance:", err);
    }
  };

  /**
   * Handles manual balance refresh
   */
  const handleBalance = async () => {
    if (!currentAccount) {
      setStatus("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const bal = await getBalance(currentAccount);
      setBalance(bal);
      setStatus(`Balance updated: ${bal} LOYAL`);
    } catch (err) {
      setStatus("Error fetching balance");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles token transfer between addresses
   */
  const handleTransfer = async () => {
    if (!recipient || !amount) {
      setStatus("Please fill in both recipient and amount");
      return;
    }

    setIsLoading(true);
    try {
      const hash = await transferTokens(recipient, amount);
      setStatus(`✅ Tokens sent successfully! Transaction: ${hash}`);
      setRecipient("");
      setAmount("");
      // Refresh balance after transfer
      await loadBalance();
    } catch(err) {
      setStatus(`❌ Transfer failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches token economics metrics
   */
  const handleMetrics = async () => {
    setIsLoading(true);
    try {
      const tokenMetrics = await getTokenMetrics();
      setMetrics(tokenMetrics);
      setStatus(`Metrics updated successfully`);
    } catch (err) {
      setStatus("❌ Error fetching metrics");
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
      <h2 style={{ color: "white" }}>⚙️ Token Management</h2>
      
      {/* Token Transfer Section */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        marginBottom: "20px"
      }}>
        <h3 style={{ color: "white" }}>📤 Send Tokens</h3>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
            Recipient Address
          </label>
          <input 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
            placeholder="0x..." 
            disabled={isLoading}
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "4px", 
              border: "1px solid #555",
              backgroundColor: "#3a3f47",
              color: "white",
              marginBottom: "10px"
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
            Amount (LOYAL tokens)
          </label>
          <input 
            type="number"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="e.g., 10.5" 
            disabled={isLoading}
            min="0"
            step="0.01"
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "4px", 
              border: "1px solid #555",
              backgroundColor: "#3a3f47",
              color: "white"
            }}
          />
        </div>
        <button 
          onClick={handleTransfer} 
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: recipient && amount ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: recipient && amount ? "pointer" : "not-allowed",
            fontSize: "16px"
          }}
        >
          {isLoading ? "Sending..." : "💸 Send Tokens"}
        </button>
      </div>

      {/* Balance Section */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        marginBottom: "20px"
      }}>
        <h3 style={{ color: "white" }}>💰 Check Balance</h3>
        <button 
          onClick={handleBalance} 
          disabled={isLoading || !currentAccount}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: currentAccount ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: currentAccount ? "pointer" : "not-allowed",
            fontSize: "16px",
            marginBottom: "15px"
          }}
        >
          {isLoading ? "Loading..." : currentAccount ? "🔍 Check My Balance" : "❌ Wallet Not Connected"}
        </button>
        {balance && (
          <div style={{ 
            padding: "15px",
            backgroundColor: "#2d5a3d",
            borderRadius: "6px",
            border: "1px solid #4caf50",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "1.3em", fontWeight: "bold", color: "white" }}>
              {balance} LOYAL
            </div>
            <div style={{ fontSize: "0.9em", color: "#ccc" }}>Your current balance</div>
          </div>
        )}
      </div>

      {/* Token Economics Section */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        marginBottom: "20px"
      }}>
        <h3 style={{ color: "white" }}>📊 Token Economics</h3>
        <button 
          onClick={handleMetrics} 
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "15px"
          }}
        >
          {isLoading ? "Loading..." : "📈 Refresh Metrics"}
        </button>
        {metrics && (
          <div style={{ 
            padding: "15px", 
            backgroundColor: "#3a3f47",
            borderRadius: "8px",
            border: "1px solid #555"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#4caf50" }}>
                  {parseFloat(metrics.totalMinted).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9em", color: "#ccc" }}>Total Minted</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#f44336" }}>
                  {parseFloat(metrics.totalBurned).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9em", color: "#ccc" }}>Total Burned</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#2196f3" }}>
                  {parseFloat(metrics.currentSupply).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9em", color: "#ccc" }}>Current Supply</div>
              </div>
            </div>
            <div style={{ marginTop: "10px", fontSize: "0.8em", color: "#87ceeb", textAlign: "center" }}>
              Deflation Rate: {metrics.totalBurned > 0 ? 
                ((parseFloat(metrics.totalBurned) / parseFloat(metrics.totalMinted)) * 100).toFixed(2) : 0}%
            </div>
          </div>
        )}
      </div>

      {/* Status Display */}
      {status && (
        <div style={{ 
          padding: "12px", 
          backgroundColor: status.includes("✅") ? "#2d5a3d" : 
                          status.includes("❌") ? "#5a2d2d" : "#2d3a5a",
          border: `1px solid ${status.includes("✅") ? "#4caf50" : 
                                status.includes("❌") ? "#f44336" : "#2196f3"}`,
          borderRadius: "6px",
          fontSize: "0.9em",
          color: "white"
        }}>
          {status}
        </div>
      )}
    </div>
  );
};
export default TokenManagementForm;