/**
 * LoyalLoop Ecosystem Deployment Script
 * 
 * This script deploys the complete LoyalLoop ecosystem including:
 * - LoyaltyToken ERC-20 contract 
 * - SimpleDEX contract for token trading
 * 
 * Features:
 * - Configurable emission rate and unit value for token earning
 * - DEX with ETH/LOYAL token swaps
 * - Liquidity management system
 * - Fee-based trading mechanism
 * 
 * Usage:
 * - For localhost: npx hardhat run scripts/deploy.js --network localhost
 * - For testnet: npx hardhat run scripts/deploy.js --network sepolia
 */

const { ethers } = require("hardhat");

/**
 * Main deployment function
 * 
 * Deploys the LoyaltyToken and SimpleDEX contracts with proper configuration
 * and logs the deployment addresses for frontend integration.
 * 
 * @async
 * @function main
 * @returns {Promise<Object>} Promise that resolves with contract addresses
 * @throws {Error} Throws error if deployment fails
 */
async function main() {
  console.log("🚀 Starting LoyalLoop ecosystem deployment...");
  
  // Deploy LoyaltyToken first
  console.log("\n📦 Step 1: Deploying LoyaltyToken...");
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  
  // Deploy contract (no constructor parameters needed)
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  
  const tokenAddress = await loyaltyToken.getAddress();
  console.log("✅ LoyaltyToken deployed at:", tokenAddress);
  
  // Deploy SimpleDEX
  console.log("\n📦 Step 2: Deploying SimpleDEX...");
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  
  // Constructor parameters for SimpleDEX
  const exchangeRate = ethers.parseEther("1000"); // 1000 LOYAL per ETH
  const feePercentage = 100; // 1% fee
  
  const simpleDEX = await SimpleDEX.deploy(tokenAddress, exchangeRate, feePercentage);
  await simpleDEX.waitForDeployment();
  
  const dexAddress = await simpleDEX.getAddress();
  console.log("✅ SimpleDEX deployed at:", dexAddress);
  
  // Verify deployments
  console.log("\n🔍 Verifying deployments...");
  
  // LoyaltyToken verification
  const name = await loyaltyToken.name();
  const symbol = await loyaltyToken.symbol();
  const totalSupply = await loyaltyToken.totalSupply();
  const tokenOwner = await loyaltyToken.owner();
  
  console.log("📊 LoyaltyToken verification:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", ethers.formatEther(totalSupply), "LOYAL");
  console.log("   Owner:", tokenOwner);
  
  // SimpleDEX verification
  const dexStatus = await simpleDEX.getDEXStatus();
  const dexOwner = await simpleDEX.owner();
  
  console.log("\n📊 SimpleDEX verification:");
  console.log("   Token Address:", await simpleDEX.loyalToken());
  console.log("   Exchange Rate:", ethers.formatEther(dexStatus[2]), "LOYAL per ETH");
  console.log("   Fee Percentage:", Number(dexStatus[3]) / 100, "%");
  console.log("   ETH Liquidity:", ethers.formatEther(dexStatus[0]), "ETH");
  console.log("   Token Liquidity:", ethers.formatEther(dexStatus[1]), "LOYAL");
  console.log("   Owner:", dexOwner);
  
  console.log("\n🎉 LoyalLoop ecosystem deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("   LoyaltyToken:", tokenAddress);
  console.log("   SimpleDEX:", dexAddress);
  
  console.log("\n📝 Next steps:");
  console.log("   1. Update frontend with new contract addresses");
  console.log("   2. Update ABIs in frontend/src/abi/");
  console.log("   3. Add initial liquidity to DEX");
  console.log("   4. Test contract functions");
  
  return {
    loyaltyToken: tokenAddress,
    simpleDEX: dexAddress
  };
}

// Execute the deployment script
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});