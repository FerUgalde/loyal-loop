/**
 * BusinessDashboard Component v2.0
 * 
 * Comprehensive business management dashboard for LoyalLoop platform.
 * Provides token metrics, analytics, and business management tools.
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getTokenMetrics } from "../services/token";
import { getDEXStatus, addLiquidity } from "../services/dex";
import { TrendingUp, DollarSign, BarChart3, Droplets, RefreshCw, ExternalLink } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">📊 Business Analytics</h3>
          <p className="text-gray-600">Manage your loyalty token ecosystem and analyze performance</p>
        </div>
        <button
          onClick={loadBusinessMetrics}
          className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Supply Card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Token Supply</p>
              <p className="text-2xl font-bold text-primary">
                {parseFloat(metrics.totalSupply).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">LOYAL Tokens</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div>Minted: {parseFloat(metrics.totalMinted).toFixed(2)}</div>
            <div>Burned: {parseFloat(metrics.totalBurned).toFixed(2)}</div>
          </div>
        </div>

        {/* DEX Liquidity Card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">DEX Liquidity</p>
              <p className="text-2xl font-bold text-secondary">
                {parseFloat(dexMetrics.ethLiquidity).toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 mt-1">ETH</p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-full">
              <Droplets className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div>LOYAL: {parseFloat(dexMetrics.tokenLiquidity).toFixed(2)}</div>
            <div>Rate: {parseFloat(dexMetrics.exchangeRate).toFixed(0)} LOYAL/ETH</div>
          </div>
        </div>

        {/* Token Economics Card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Economics</p>
              <p className="text-2xl font-bold text-subprimary">
                {metrics.emissionRate}
              </p>
              <p className="text-xs text-gray-500 mt-1">Emission Rate</p>
            </div>
            <div className="bg-subprimary/10 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-subprimary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div>Unit Value: {metrics.unitValue}</div>
            <div>DEX Fee: {dexMetrics.feePercentage}%</div>
          </div>
        </div>

        {/* Business Health Card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Health Score</p>
              <p className="text-2xl font-bold text-subsecondary">
                {parseFloat(dexMetrics.ethLiquidity) > 0 && parseFloat(metrics.totalSupply) > 0 && currentAccount ? "🟢" : "🔴"}
              </p>
              <p className="text-xs text-gray-500 mt-1">System Status</p>
            </div>
            <div className="bg-subsecondary/10 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-subsecondary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div>Liquidity: {parseFloat(dexMetrics.ethLiquidity) > 0 ? "🟢 Active" : "🔴 Low"}</div>
            <div>Tokens: {parseFloat(metrics.totalSupply) > 0 ? "🟢 Available" : "🔴 None"}</div>
            <div>Status: {currentAccount ? "🟢 Connected" : "🔴 Offline"}</div>
          </div>
        </div>
      </div>

      {/* Liquidity Management Section */}
      <div className="card-elegant p-6">
        <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
          <Droplets size={20} />
          Liquidity Management
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          Add liquidity to enable token trading. Both ETH and LOYAL tokens are required.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input-elegant w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input-elegant w-full"
            />
          </div>
        </div>

        <button
          onClick={handleAddLiquidity}
          disabled={isLoading || !currentAccount}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            currentAccount ? 'btn-primary' : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          <Droplets size={16} />
          {isLoading ? "Processing..." : "Add Liquidity"}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="card-elegant p-6">
        <h4 className="text-lg font-semibold text-primary mb-4">⚡ Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={loadBusinessMetrics}
            className="btn-primary py-3 px-4 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
          
          <button
            onClick={() => window.open("https://etherscan.io", "_blank")}
            className="btn-secondary py-3 px-4 flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            View on Explorer
          </button>
        </div>
      </div>

      {/* Status Display */}
      {status && (
        <div className={`p-4 rounded-lg text-center font-medium ${
          status.includes("Successfully") || status.includes("success") 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </div>
      )}

      {/* Account Info */}
      {currentAccount && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-700 text-sm text-center">
            <strong className="text-primary">Business Account:</strong> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
