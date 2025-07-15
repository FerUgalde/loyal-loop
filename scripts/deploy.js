/**
 * LoyaltyToken Deployment Script
 * 
 * This script deploys the LoyaltyToken ERC-20 contract to the specified network.
 * The contract is deployed with an initial supply of 1,000 LOYAL tokens (hardcoded in contract).
 * 
 * New Features in this version:
 * - Added earnTokensForSelf function for public token earning
 * - Enhanced owner-only earnTokens function for business integration
 * - Improved error handling and validation
 * 
 * Usage:
 * - For localhost: npx hardhat run scripts/deploy.js --network localhost
 * - For testnet: npx hardhat run scripts/deploy.js --network sepolia
 */

const { ethers } = require("hardhat");

/**
 * Main deployment function
 * 
 * Deploys the LoyaltyToken contract with predefined initial supply
 * and logs the deployment address for frontend integration.
 * 
 * @async
 * @function main
 * @returns {Promise<void>} Promise that resolves when deployment is complete
 * @throws {Error} Throws error if deployment fails
 */
async function main() {
  console.log("Starting LoyaltyToken deployment...");
  
  // Get the contract factory for LoyaltyToken
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  
  // Deploy contract (no parameters needed - initial supply is set in constructor)
  console.log("Deploying contract with 1,000 LOYAL tokens (as defined in contract)...");
  const token = await LoyaltyToken.deploy();
  
  // Wait for the transaction to be mined
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  
  console.log("LoyaltyToken deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Token Name: LoyaltyToken");
  console.log("Token Symbol: LOYAL");
  console.log("Initial Supply: 1,000,000 LOYAL");
  console.log("Update your frontend CONTRACT_ADDRESS to:", contractAddress);
}

// Execute the deployment script
main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});