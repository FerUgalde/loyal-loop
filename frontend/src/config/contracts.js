/**
 * Contract Configuration
 * 
 * Centralized configuration for all contract addresses and network settings.
 * This file reads from environment variables and provides fallbacks.
 * 
 * @module config
 * @version 1.0.0
 * @author Fernanda
 */

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID) || 31337,
  networkUrl: process.env.REACT_APP_NETWORK_URL || "http://127.0.0.1:8545",
  networkName: "Hardhat Local"
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  loyaltyToken: process.env.REACT_APP_LOYALTY_TOKEN_ADDRESS || "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575",
  simpleDEX: process.env.REACT_APP_DEX_CONTRACT_ADDRESS || "0xCD8a1C3ba11CF5ECfa6267617243239504a98d90"
};

// Application Settings
export const APP_CONFIG = {
  debug: process.env.REACT_APP_DEBUG === "true",
  autoRefreshInterval: parseInt(process.env.REACT_APP_AUTO_REFRESH_INTERVAL) || 30000,
  minEarnAmount: parseFloat(process.env.REACT_APP_MIN_EARN_AMOUNT) || 0.01
};

// DEX Settings
export const DEX_CONFIG = {
  defaultSlippage: parseFloat(process.env.REACT_APP_DEFAULT_SLIPPAGE) || 0.5,
  minLiquidityWarning: parseFloat(process.env.REACT_APP_MIN_LIQUIDITY_WARNING) || 0.01,
  feePercentage: 1 // 1% fee
};

// Token Settings
export const TOKEN_CONFIG = {
  decimals: 18,
  symbol: "LOYAL",
  name: "LoyalLoop Token",
  defaultEmissionRate: parseInt(process.env.REACT_APP_DEFAULT_EMISSION_RATE) || 1
};

/**
 * Validate contract addresses
 * @returns {boolean} True if all addresses are valid
 */
export function validateContractAddresses() {
  const { ethers } = require("ethers");
  
  try {
    const addresses = Object.values(CONTRACT_ADDRESSES);
    return addresses.every(address => ethers.isAddress(address));
  } catch (error) {
    console.error("Error validating contract addresses:", error);
    return false;
  }
}

/**
 * Get current configuration summary
 * @returns {Object} Configuration summary
 */
export function getConfigSummary() {
  return {
    network: NETWORK_CONFIG,
    contracts: CONTRACT_ADDRESSES,
    app: APP_CONFIG,
    dex: DEX_CONFIG,
    token: TOKEN_CONFIG,
    isValid: validateContractAddresses()
  };
}

/**
 * Log configuration to console (for debugging)
 */
export function logConfig() {
  if (APP_CONFIG.debug) {
    console.log("🔧 LoyalLoop Configuration:");
    console.log("- Network:", NETWORK_CONFIG);
    console.log("- Contracts:", CONTRACT_ADDRESSES);
    console.log("- Valid Addresses:", validateContractAddresses());
    console.log("- App Settings:", APP_CONFIG);
    console.log("- DEX Settings:", DEX_CONFIG);
    console.log("- Token Settings:", TOKEN_CONFIG);
  }
}

export default {
  NETWORK_CONFIG,
  CONTRACT_ADDRESSES,
  APP_CONFIG,
  DEX_CONFIG,
  TOKEN_CONFIG,
  validateContractAddresses,
  getConfigSummary,
  logConfig
};
