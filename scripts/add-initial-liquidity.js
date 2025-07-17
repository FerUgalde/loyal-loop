const { ethers } = require("hardhat");

async function main() {
  console.log("💧 Adding Initial Liquidity to DEX...\n");

  // Contract addresses - Updated with new deployment
  const TOKEN_ADDRESS = "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575";
  const DEX_ADDRESS = "0xCD8a1C3ba11CF5ECfa6267617243239504a98d90";

  try {
    // Get signers
    const [owner] = await ethers.getSigners();
    console.log("👤 Using account:", owner.address);

    // Get contract instances
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
    
    const token = LoyaltyToken.attach(TOKEN_ADDRESS);
    const dex = SimpleDEX.attach(DEX_ADDRESS);

    // Check current balances
    const ownerTokenBalance = await token.balanceOf(owner.address);
    const ownerEthBalance = await ethers.provider.getBalance(owner.address);

    // Get current balances as strings for easier calculation
    const loyalBalance = ethers.formatEther(ownerTokenBalance);
    const ethBalance = ethers.formatEther(ownerEthBalance);
    
    console.log("💰 Current Balances:");
    console.log(`   ETH: ${ethBalance} ETH`);
    console.log(`   LOYAL: ${loyalBalance} LOYAL\n`);

    // Define initial liquidity amounts
    let ethAmount = "0.5"; // 0.5 ETH
    let tokenAmount = "500"; // 500 LOYAL tokens
    
    // Adjust amounts based on available balance
    if (parseFloat(loyalBalance) < parseFloat(tokenAmount)) {
      console.log(`⚠️  Insufficient LOYAL balance for initial amount of ${tokenAmount} LOYAL`);
      
      // Use 80% of available tokens to leave some for other operations
      tokenAmount = (parseFloat(loyalBalance) * 0.8).toFixed(2);
      
      // Adjust ETH proportionally to maintain rate (1000 LOYAL per ETH)
      ethAmount = (parseFloat(tokenAmount) / 1000).toFixed(4);
      
      console.log(`📊 Auto-adjusting liquidity amounts:`);
      console.log(`   Adjusted LOYAL Amount: ${tokenAmount} LOYAL`);
      console.log(`   Adjusted ETH Amount: ${ethAmount} ETH\n`);
    }
    
    // Convert to Wei
    const ethAmountWei = ethers.parseEther(ethAmount);
    const tokenAmountWei = ethers.parseEther(tokenAmount);
    
    console.log("🎯 Adding Liquidity:");
    console.log(`   ETH Amount: ${ethAmount} ETH`);
    console.log(`   LOYAL Amount: ${tokenAmount} LOYAL\n`);

    // Check if we have enough balance
    if (parseFloat(ethBalance) < parseFloat(ethAmount)) {
      throw new Error(`Insufficient ETH balance. Need ${ethAmount} ETH`);
    }
    if (parseFloat(loyalBalance) < parseFloat(tokenAmount)) {
      throw new Error(`Insufficient LOYAL balance. Need ${tokenAmount} LOYAL`);
    }

    // Step 1: Approve DEX to spend tokens
    console.log("📝 Step 1: Approving DEX to spend LOYAL tokens...");
    const approveTx = await token.approve(DEX_ADDRESS, tokenAmountWei);
    await approveTx.wait();
    console.log("✅ Approval successful!\n");

    // Step 2: Add liquidity to DEX
    console.log("💧 Step 2: Adding liquidity to DEX...");
    const addLiquidityTx = await dex.addLiquidity(tokenAmountWei, {
      value: ethAmountWei
    });
    await addLiquidityTx.wait();
    console.log("✅ Liquidity added successfully!\n");

    // Check new DEX status
    console.log("📊 New DEX Status:");
    const status = await dex.getDEXStatus();
    const ethLiquidity = ethers.formatEther(status[0]);
    const tokenLiquidity = ethers.formatEther(status[1]);
    const exchangeRate = ethers.formatEther(status[2]);
    const feePercentage = Number(status[3]) / 100;

    console.log(`   ETH Liquidity: ${ethLiquidity} ETH`);
    console.log(`   LOYAL Liquidity: ${tokenLiquidity} LOYAL`);
    console.log(`   Exchange Rate: ${exchangeRate} LOYAL per ETH`);
    console.log(`   Fee: ${feePercentage}%\n`);

    console.log("🎉 DEX is now ready for trading!");
    console.log("💡 You can now use the DEX Trading tab to swap tokens.");

  } catch (error) {
    console.error("❌ Error adding liquidity:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Make sure you have enough ETH for gas fees and liquidity.");
    } else if (error.message.includes("ERC20InsufficientAllowance")) {
      console.log("\n💡 Token approval failed. Try running the script again.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
