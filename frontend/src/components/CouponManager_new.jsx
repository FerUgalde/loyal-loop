/**
 * CouponManager Component v3.0
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
      setStatus("❌ Please connect your wallet first");
      return;
    }

    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setStatus("❌ Please enter a valid token amount");
      return;
    }

    if (parseFloat(userBalance) < parseFloat(tokenAmount)) {
      setStatus("❌ Insufficient balance to create coupon");
      return;
    }

    setIsLoading(true);
    setStatus("🔄 Creating coupon...");

    try {
      const result = await createCoupon(
        tokenAmount,
        discountPercent,
        businessType,
        validityDays
      );

      setStatus(`✅ Coupon created successfully! ID: ${result.couponId}`);
      
      // Clear form
      setTokenAmount("");
      setDiscountPercent("");
      
      // Refresh data
      await loadUserData();

    } catch (error) {
      console.error("Error creating coupon:", error);
      setStatus(`❌ Failed to create coupon: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles coupon usage
   */
  const handleUseCoupon = async (couponId) => {
    if (!currentAccount) {
      setStatus("❌ Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setStatus("🔄 Using coupon...");

    try {
      await applyCoupon(couponId);
      setStatus(`✅ Coupon #${couponId} used successfully!`);
      
      // Refresh data
      await loadUserData();

    } catch (error) {
      console.error("Error using coupon:", error);
      setStatus(`❌ Failed to use coupon: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Debug balance function for troubleshooting
   */
  const debugBalance = async () => {
    if (!currentAccount) return;
    
    try {
      const balance = await getBalance(currentAccount);
      console.log("Debug Balance Check:", {
        account: currentAccount,
        balance: balance,
        timestamp: new Date().toISOString()
      });
      setStatus(`🔍 Debug: Balance is ${balance} LOYAL (check console for details)`);
    } catch (error) {
      console.error("Debug balance error:", error);
      setStatus(`❌ Debug failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Component Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🎫 Coupon & Rewards System</h3>
        <p className="text-gray-600 text-sm">
          Burn LOYAL tokens to create discount coupons and manage your rewards
        </p>
      </div>
      
      {/* User Balance Display */}
      {currentAccount && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-primary font-semibold text-lg">
              💰 Your Balance: {parseFloat(userBalance).toFixed(2)} LOYAL
            </p>
            <div className="flex gap-2">
              <button
                onClick={debugBalance}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                title="Debug balance (check console)"
              >
                🔧 Debug
              </button>
              <button
                onClick={loadUserData}
                className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-secondary/80 transition-colors"
                title="Refresh balance and coupons"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Coupon Form */}
      <div className="card-elegant p-6">
        <h4 className="text-lg font-semibold text-primary mb-3 flex items-center">
          ✨ Create Discount Coupon
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          Burn LOYAL tokens to create discount coupons. This reduces token supply (deflationary).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input-elegant w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount %:
            </label>
            <input
              type="number"
              value={discountPercent}
              placeholder="e.g., 15"
              disabled={isLoading}
              min="1"
              max="100"
              className="input-elegant w-full"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type:
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={isLoading}
              className="input-elegant w-full"
            >
              <option value="restaurant">🍽️ Restaurant</option>
              <option value="retail">🛍️ Retail</option>
              <option value="service">🔧 Service</option>
              <option value="entertainment">🎬 Entertainment</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid for (days):
            </label>
            <select
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              disabled={isLoading}
              className="input-elegant w-full"
            >
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        {/* Coupon Preview */}
        {tokenAmount && discountPercent && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <h5 className="text-primary font-medium mb-2">🎫 Coupon Preview</h5>
            <div className="text-gray-700 text-sm space-y-1">
              <p><strong>Discount:</strong> {discountPercent}% off</p>
              <p><strong>Cost:</strong> {tokenAmount} LOYAL tokens</p>
              <p><strong>Type:</strong> {businessType}</p>
              <p><strong>Expires:</strong> {validityDays} days from creation</p>
              <p className="text-xs text-primary">* A 1% fee will be applied to the token burn</p>
            </div>
          </div>
        )}

        <button
          onClick={handleCreateCoupon}
          disabled={isLoading || !currentAccount || !tokenAmount || !discountPercent || parseFloat(userBalance) < parseFloat(tokenAmount || 0)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            currentAccount && tokenAmount && discountPercent && parseFloat(userBalance) >= parseFloat(tokenAmount || 0)
              ? 'btn-primary' : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          {isLoading ? "🔄 Creating Coupon..." : 
           !currentAccount ? "Connect Wallet" : 
           !tokenAmount ? "Enter Token Amount" : 
           parseFloat(userBalance) < parseFloat(tokenAmount || 0) ? "Insufficient Balance" :
           "🎫 Create Coupon"}
        </button>
      </div>
      
      {/* User Coupons Section */}
      <div className="card-elegant p-6">
        <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
          🎟️ Your Coupons ({coupons.length})
        </h4>
        
        {coupons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 italic">
              No coupons yet. Create your first coupon above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  coupon.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
                } ${coupon.isUsed ? 'opacity-75' : ''}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <div className="text-xl font-bold text-primary mb-1">
                      {coupon.discountPercent}% OFF
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Coupon ID: #{coupon.id} | {coupon.businessType}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {coupon.createdAt} | Expires: {coupon.expiresAt}
                    </div>
                    <div className="text-xs mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        coupon.isUsed 
                          ? 'bg-gray-200 text-gray-600' 
                          : coupon.isValid 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-red-200 text-red-800'
                      }`}>
                        {coupon.isUsed ? '✅ Used' : coupon.isValid ? '🟢 Valid' : '❌ Expired'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Coupon Actions */}
                  <div className="flex gap-2">
                    {coupon.isValid && !coupon.isUsed && (
                      <button
                        onClick={() => handleUseCoupon(coupon.id)}
                        disabled={isLoading}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        💰 Use Coupon
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`LoyalLoop Coupon: ${coupon.discountPercent}% OFF - ID: ${coupon.id}`);
                        setStatus("✅ Coupon details copied to clipboard!");
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div className={`p-4 rounded-lg text-center font-medium ${
          status.includes('✅') ? 'bg-green-100 text-green-800' : 
          status.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {/* Account Status */}
      {currentAccount && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-700 text-sm text-center">
            <strong className="text-primary">Connected:</strong> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
          </p>
        </div>
      )}

      {/* Refresh All Data Button */}
      <button
        onClick={loadUserData}
        disabled={!currentAccount}
        className="w-full btn-secondary py-2 px-4 text-sm"
        title="Refresh balance and coupons"
      >
        🔄 Refresh All Data
      </button>
    </div>
  );
}

export default CouponManager;
