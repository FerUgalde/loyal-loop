const { ethers } = require("hardhat");

async function main() {
  console.log("Adding initial liquidity to DEX...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Contract addresses
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const dexAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Connect to contracts
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = LoyaltyToken.attach(tokenAddress);
  
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const simpleDEX = SimpleDEX.attach(dexAddress);
  
  // Check balances
  const tokenBalance = await loyaltyToken.balanceOf(deployer.address);
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  
  console.log("Token balance:", ethers.formatEther(tokenBalance));
  console.log("ETH balance:", ethers.formatEther(ethBalance));
  
  // Approve DEX to spend tokens
  const tokenAmount = ethers.parseEther("1000"); // 1000 LOYAL
  const ethAmount = ethers.parseEther("1"); // 1 ETH
  
  console.log("Approving DEX to spend tokens...");
  const approveTx = await loyaltyToken.approve(dexAddress, tokenAmount);
  await approveTx.wait();
  console.log("Approval successful");
  
  // Add liquidity
  console.log("Adding liquidity...");
  const liquidityTx = await simpleDEX.addLiquidity(tokenAmount, {
    value: ethAmount
  });
  await liquidityTx.wait();
  console.log("Liquidity added successfully!");
  
  // Check DEX status
  const status = await simpleDEX.getDEXStatus();
  console.log("DEX Status:");
  console.log("- ETH Liquidity:", ethers.formatEther(status[0]));
  console.log("- Token Liquidity:", ethers.formatEther(status[1]));
  console.log("- Exchange Rate:", ethers.formatEther(status[2]), "LOYAL per ETH");
  console.log("- Fee:", Number(status[3]) / 100, "%");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
