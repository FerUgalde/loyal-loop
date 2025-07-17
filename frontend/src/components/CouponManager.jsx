/**
 * CouponManager Component
 * 
 * Comprehensive coupon management interface for LoyalLoop ecosystem:
 * - Create discount coupons by burning tokens
 * - View active and expired coupons
 * - Use coupons for discounts
 * - Track coupon history and validity
 * 
 * This component implements the core reward redemption system with
 * deflationary token economics through coupon creation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.currentAccount - The connected wallet address
 * 
 * @example
 * return (
 *   <CouponManager currentAccount={walletAddress} />
 * )
 * 
 * @version 3.0.0
 * @author Fernanda
 */

import React, { useState, useEffect } from "react";
import { createCoupon, getUserCoupons, applyCoupon, getBalance } from "../services/token";

function CouponManager({ currentAccount }) {
  // State for creating coupons
  const [tokenAmount, setTokenAmount] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [businessType, setBusinessType] = useState("restaurant");
  const [validityDays, setValidityDays] = useState("30");
  
  // State for managing coupons
  const [coupons, setCoupons] = useState([]);
  const [userBalance, setUserBalance] = useState("0");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load user's coupons and balance when account changes
   */
  useEffect(() => {
    if (currentAccount) {
      loadUserData();
    }
  }, [currentAccount]);

  /**
   * Auto-refresh balance every 10 seconds when component is visible
   */
  useEffect(() => {
    if (!currentAccount) return;

    const interval = setInterval(() => {
      loadUserData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [currentAccount]);

  /**
   * Refresh data when component becomes visible
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentAccount) {
        loadUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentAccount]);

  /**
   * Loads user's balance and coupons
   */
  const loadUserData = async () => {
    if (!currentAccount) return;
    
    try {
      const [balance, userCoupons] = await Promise.all([
        getBalance(currentAccount),
        getUserCoupons(currentAccount)
      ]);
      
      setUserBalance(balance);
      setCoupons(userCoupons);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  /**
   * Handles coupon creation
   */
  const handleCreateCoupon = async () => {
    if (!currentAccount) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!tokenAmount || !discountPercent) {
      setStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setStatus("Creating coupon...");

    try {
      const result = await createCoupon(
        tokenAmount,
        parseInt(discountPercent),
        businessType,
        parseInt(validityDays)
      );

      setStatus(`🎫 Coupon created successfully! ID: ${result.couponId}, Transaction: ${result.hash}`);
      
      // Clear form
      setTokenAmount("");
      setDiscountPercent("");
      
      // Refresh user data
      await loadUserData();
    } catch (error) {
      setStatus(`❌ Failed to create coupon: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles coupon usage
   */
  const handleUseCoupon = async (couponId) => {
    setIsLoading(true);
    setStatus(`Using coupon ${couponId}...`);

    try {
      const hash = await applyCoupon(couponId);
      setStatus(`✅ Coupon used successfully! Transaction: ${hash}`);
      
      // Refresh coupons
      await loadUserData();
    } catch (error) {
      setStatus(`❌ Failed to use coupon: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculates recommended token amount for discount
   */
  const getRecommendedTokens = (discount) => {
    // Simple formula: 1 token per 1% discount
    return discount || 0;
  };

  /**
   * Debug function to check balance discrepancy
   */
  const debugBalance = async () => {
    if (!currentAccount) return;
    
    try {
      const freshBalance = await getBalance(currentAccount);
      console.log("🔍 Balance Debug:");
      console.log("- Current stored balance:", userBalance);
      console.log("- Fresh balance from contract:", freshBalance);
      console.log("- Address being checked:", currentAccount);
      
      if (freshBalance !== userBalance) {
        console.log("⚠️ Balance mismatch detected, updating...");
        setUserBalance(freshBalance);
      }
    } catch (error) {
      console.error("Debug balance error:", error);
    }
  };

  /**
   * Calculate fee and total required tokens for coupon creation
   */
  const calculateFeeAndTotal = (tokens) => {
    if (!tokens || tokens === "") return { fee: 0, total: 0 };
    
    const tokenNum = parseFloat(tokens);
    const fee = Math.max(Math.ceil(tokenNum * 0.01), tokenNum > 0 ? 1 : 0); // 1% fee, minimum 1 token
    const total = tokenNum + fee;
    
    return { fee, total };
  };

  //-----------------------------------------------------------------------------------------///

  return (
    <div style={{ 
      padding: "20px",
      backgroundColor: "#3a3f47",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #555",
      color: "white"
    }}>
      <h2 style={{ color: "white" }}>🎫 Coupon & Rewards System</h2>
      
      {/* User Balance Display */}
      {currentAccount && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "15px", 
          backgroundColor: "#2d3138",
          borderRadius: "8px",
          border: "1px solid #555",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <strong>💰 Your Balance: {parseFloat(userBalance).toFixed(2)} LOYAL</strong>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={debugBalance}
              style={{
                padding: "6px 12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85em"
              }}
              title="Debug balance (check console)"
            >
              🔧 Debug
            </button>
            <button
              onClick={loadUserData}
              style={{
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85em"
              }}
              title="Refresh balance and coupons"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Create Coupon Section */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        marginBottom: "20px",
        color: "white"
      }}>
        <h3 style={{ color: "white" }}>✨ Create Discount Coupon</h3>
        <p style={{ fontSize: "0.9em", color: "#ccc", marginBottom: "15px" }}>
          Burn LOYAL tokens to create discount coupons. This reduces token supply (deflationary).
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "white", fontWeight: "bold" }}>
              Tokens to Burn:
            </label>
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => {
                const value = e.target.value;
                setTokenAmount(value);
                setDiscountPercent(value);
              }}
              placeholder="e.g., 10"
              disabled={isLoading}
              min="1"
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
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "white", fontWeight: "bold" }}>
              Discount %:
            </label>
            <input
              type="number"
              value={discountPercent}
              placeholder="e.g., 15"
              disabled={isLoading}
              min="1"
              max="100"
              readOnly="true"
              style={{ 
                width: "100%", 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #555",
                backgroundColor: "#3a3f47",
                color: "white",
                cursor: "not-allowed"
              }}
            />
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "white", fontWeight: "bold" }}>
              Business Type:
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={isLoading}
              style={{ 
                width: "100%", 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #555",
                backgroundColor: "#3a3f47",
                color: "white"
              }}
            >
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="services">Services</option>
              <option value="entertainment">Entertainment</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "white", fontWeight: "bold" }}>
              Valid for (days):
            </label>
            <select
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              disabled={isLoading}
              style={{ 
                width: "100%", 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #555",
                backgroundColor: "#3a3f47",
                color: "white"
              }}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>
        
        {tokenAmount && (
          <div style={{ 
            fontSize: "0.85em", 
            backgroundColor: "#2d4a3d", 
            padding: "10px", 
            borderRadius: "6px",
            border: "1px solid #4caf50",
            marginBottom: "15px"
          }}>
            <div style={{ color: "#87ceeb", marginBottom: "5px" }}>
              � <strong>Cost Breakdown:</strong>
            </div>
            <div style={{ color: "#ccc" }}>
              • Tokens to burn: {tokenAmount} LOYAL
            </div>
            <div style={{ color: "#ccc" }}>
              • Service fee (1%): {calculateFeeAndTotal(tokenAmount).fee} LOYAL
            </div>
            <div style={{ color: "#87ceeb", fontWeight: "bold", marginTop: "5px" }}>
              • <strong>Total required: {calculateFeeAndTotal(tokenAmount).total} LOYAL</strong>
            </div>
            {parseFloat(userBalance) < calculateFeeAndTotal(tokenAmount).total && (
              <div style={{ color: "#ff6b6b", marginTop: "5px" }}>
                ⚠️ Insufficient balance! You need {(calculateFeeAndTotal(tokenAmount).total - parseFloat(userBalance)).toFixed(2)} more LOYAL tokens.
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={handleCreateCoupon}
          disabled={
            isLoading || 
            !currentAccount || 
            !tokenAmount || 
            !discountPercent ||
            (tokenAmount && parseFloat(userBalance) < calculateFeeAndTotal(tokenAmount).total)
          }
          style={{
            padding: "12px 20px",
            backgroundColor: (
              currentAccount && 
              tokenAmount && 
              discountPercent && 
              !(tokenAmount && parseFloat(userBalance) < calculateFeeAndTotal(tokenAmount).total)
            ) ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: (
              isLoading || 
              !currentAccount || 
              (tokenAmount && parseFloat(userBalance) < calculateFeeAndTotal(tokenAmount).total)
            ) ? "not-allowed" : "pointer",
            fontSize: "16px",
            width: "100%"
          }}
        >
          {isLoading ? "Creating..." : "🔥 Burn Tokens & Create Coupon"}
        </button>
      </div>

      <hr style={{ margin: "30px 0", border: "1px solid #555" }} />

      {/* User Coupons Section */}
      <div style={{ 
        backgroundColor: "#2d3138", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #555",
        color: "white"
      }}>
        <h3 style={{ color: "white" }}>🎟️ Your Coupons ({coupons.length})</h3>
        
        {coupons.length === 0 ? (
          <p style={{ color: "#ccc", fontStyle: "italic" }}>
            No coupons yet. Create your first coupon above!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                style={{
                  padding: "15px",
                  border: `2px solid ${coupon.isValid ? "#28a745" : "#6c757d"}`,
                  borderRadius: "8px",
                  backgroundColor: coupon.isUsed ? "#3a3f47" : "#2d5a3d",
                  color: "white"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "white" }}>
                      {coupon.discountPercent}% OFF
                    </div>
                    <div style={{ fontSize: "0.9em", color: "#ccc" }}>
                      Coupon ID: #{coupon.id} | {coupon.businessType}
                    </div>
                    <div style={{ fontSize: "0.8em", color: "#ccc" }}>
                      Cost: {parseFloat(coupon.tokensBurned).toFixed(2)} LOYAL | 
                      Expires: {coupon.expiryTime.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    {coupon.isUsed ? (
                      <span style={{ 
                        padding: "5px 10px", 
                        backgroundColor: "#6c757d", 
                        color: "white", 
                        borderRadius: "3px",
                        fontSize: "0.8em"
                      }}>
                        USED
                      </span>
                    ) : coupon.isValid ? (
                      <button
                        onClick={() => handleUseCoupon(coupon.id)}
                        disabled={isLoading}
                        style={{
                          padding: "5px 15px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "0.9em"
                        }}
                      >
                        Use Coupon
                      </button>
                    ) : (
                      <span style={{ 
                        padding: "5px 10px", 
                        backgroundColor: "#dc3545", 
                        color: "white", 
                        borderRadius: "3px",
                        fontSize: "0.8em"
                      }}>
                        EXPIRED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Display */}
      {status && (
        <div style={{ 
          marginTop: "20px", 
          padding: "12px", 
          backgroundColor: status.includes("✅") || status.includes("🎫") ? "#2d5a3d" : 
                          status.includes("❌") ? "#5a2d2d" : "#2d3a5a",
          border: `1px solid ${status.includes("✅") || status.includes("🎫") ? "#4caf50" : 
                                status.includes("❌") ? "#f44336" : "#2196f3"}`,
          borderRadius: "6px",
          fontSize: "0.9em",
          color: "white"
        }}>
          {status}
        </div>
      )}
      
      {/* Refresh Button */}
      <button
        onClick={loadUserData}
        disabled={isLoading || !currentAccount}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          backgroundColor: currentAccount ? "#17a2b8" : "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: currentAccount ? "pointer" : "not-allowed",
          width: "100%"
        }}
      >
        🔄 Refresh Data
      </button>
    </div>
  );
}

export default CouponManager;
