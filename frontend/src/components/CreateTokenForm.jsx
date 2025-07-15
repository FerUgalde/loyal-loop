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

import React, { useState } from "react";
import { getBalance, transferTokens, redeemTokens, getTokenMetrics } from "../services/token";

function TokenManagementForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setStatus(`Tokens sent successfully! Transaction: ${hash}`);
      setRecipient("");
      setAmount("");
    } catch(err) {
      setStatus(`Transfer failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles token redemption (burning for rewards)
   */
  const handleRedeem = async () => {
    if (!redeemAmount) {
      setStatus("Please enter amount to redeem");
      return;
    }

    setIsLoading(true);
    try {
      const hash = await redeemTokens(redeemAmount);
      setStatus(`Tokens redeemed successfully! ${redeemAmount} LOYAL burned. Transaction: ${hash}`);
      setRedeemAmount("");
      // Refresh balance and metrics
      handleBalance();
      handleMetrics();
    } catch(err) {
      setStatus(`Redemption failed: ${err.message}`);
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
      setStatus("Error fetching metrics");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Checks current user's token balance
   */
  const handleBalance = async () => {
    setIsLoading(true);
    try {
      const [account] = await window.ethereum.request({ method: "eth_accounts" });
      const bal = await getBalance(account);
      setBalance(bal);
      setStatus(`Balance updated: ${bal} LOYAL`);
    } catch (err) {
      setStatus("Error fetching balance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="token-management-form">
      <h2>Token Management</h2>
      
      {/* Token Transfer Section */}
      <div className="transfer-section">
        <h3>Send Tokens</h3>
        <input 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
          placeholder="Recipient Address (0x...)" 
          disabled={isLoading}
        />
        <input 
          type="number"
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount (LOYAL tokens)" 
          disabled={isLoading}
          min="0"
          step="0.01"
        />
        <button onClick={handleTransfer} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Tokens"}
        </button>
      </div>

      <hr />

      {/* Balance Section */}
      <div className="balance-section">
        <h3>Check Balance</h3>
        <button onClick={handleBalance} disabled={isLoading}>
          {isLoading ? "Loading..." : "Check My Balance"}
        </button>
        {balance && (
          <div className="balance-display">
            <p><strong>Balance: {balance} LOYAL</strong></p>
          </div>
        )}
      </div>

      <hr />

      {/* Token Redemption Section (Future Feature) */}
      <div className="redeem-section">
        <h3>Redeem for Rewards</h3>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Burn tokens to get discounts and rewards (deflationary mechanism)
        </p>
        <input 
          type="number"
          value={redeemAmount} 
          onChange={(e) => setRedeemAmount(e.target.value)} 
          placeholder="Tokens to redeem" 
          disabled={isLoading}
          min="0"
          step="0.01"
        />
        <button onClick={handleRedeem} disabled={isLoading}>
          {isLoading ? "Processing..." : "Redeem Tokens"}
        </button>
        <p style={{ fontSize: "0.8em", color: "#888" }}>
          Note: Redeemed tokens are permanently burned (removed from circulation)
        </p>
      </div>

      <hr />

      {/* Token Economics Section */}
      <div className="metrics-section">
        <h3>Token Economics</h3>
        <button onClick={handleMetrics} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh Metrics"}
        </button>
        {metrics && (
          <div className="metrics-display" style={{ 
            marginTop: "10px", 
            padding: "15px", 
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#28a745" }}>
                  {parseFloat(metrics.totalMinted).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>Total Minted</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#dc3545" }}>
                  {parseFloat(metrics.totalBurned).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>Total Burned</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#007bff" }}>
                  {parseFloat(metrics.currentSupply).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>Current Supply</div>
              </div>
            </div>
            <div style={{ marginTop: "10px", fontSize: "0.8em", color: "#888", textAlign: "center" }}>
              Deflation Rate: {metrics.totalBurned > 0 ? 
                ((parseFloat(metrics.totalBurned) / parseFloat(metrics.totalMinted)) * 100).toFixed(2) : 0}%
            </div>
          </div>
        )}
      </div>

      {/* Status Display */}
      {status && (
        <div style={{ 
          marginTop: "15px", 
          padding: "10px", 
          backgroundColor: status.includes("✅") ? "#d4edda" : 
                          status.includes("❌") ? "#f8d7da" : "#d1ecf1",
          border: `1px solid ${status.includes("✅") ? "#c3e6cb" : 
                                status.includes("❌") ? "#f5c6cb" : "#bee5eb"}`,
          borderRadius: "4px",
          fontSize: "0.9em"
        }}>
          {status}
        </div>
      )}
    </div>
  );
};
export default TokenManagementForm;