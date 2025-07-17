const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking DEX Status...\n");

  // Contract addresses
  const TOKEN_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
  const DEX_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";

  try {
    // Get contract instances
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
    
    const token = LoyaltyToken.attach(TOKEN_ADDRESS);
    const dex = SimpleDEX.attach(DEX_ADDRESS);

    // Get DEX status
    const status = await dex.getDEXStatus();
    const ethLiquidity = ethers.formatEther(status[0]);
    const tokenLiquidity = ethers.formatEther(status[1]);
    const exchangeRate = ethers.formatEther(status[2]);
    const feePercentage = Number(status[3]) / 100;

    console.log("📊 DEX Status:");
    console.log(`   ETH Liquidity: ${ethLiquidity} ETH`);
    console.log(`   LOYAL Liquidity: ${tokenLiquidity} LOYAL`);
    console.log(`   Exchange Rate: ${exchangeRate} LOYAL per ETH`);
    console.log(`   Fee: ${feePercentage}%\n`);

    // Check if DEX has enough liquidity for trading
    if (parseFloat(ethLiquidity) === 0 || parseFloat(tokenLiquidity) === 0) {
      console.log("❌ DEX has no liquidity! Trading will fail.");
      console.log("💡 You need to add liquidity first using the Business Dashboard.\n");
      
      // Get owner info
      const [owner] = await ethers.getSigners();
      const ownerBalance = await token.balanceOf(owner.address);
      const ownerEth = await ethers.provider.getBalance(owner.address);
      
      console.log("👤 Owner Info:");
      console.log(`   Address: ${owner.address}`);
      console.log(`   ETH Balance: ${ethers.formatEther(ownerEth)} ETH`);
      console.log(`   LOYAL Balance: ${ethers.formatEther(ownerBalance)} LOYAL\n`);
      
      console.log("🚀 Suggested next steps:");
      console.log("1. Go to Business Dashboard tab");
      console.log("2. Use 'Add Liquidity' section");
      console.log("3. Add some ETH and LOYAL tokens (e.g., 0.1 ETH + 100 LOYAL)");
      console.log("4. Then try trading in DEX Trading tab");
    } else {
      console.log("✅ DEX has liquidity! Trading should work.");
      
      // Test a small swap calculation
      try {
        const testAmount = ethers.parseEther("0.01"); // 0.01 ETH
        const swapResult = await dex.calculateSwap(testAmount, true); // ETH to LOYAL
        const outputAmount = ethers.formatEther(swapResult[0]);
        const feeAmount = ethers.formatEther(swapResult[1]);
        
        console.log("\n🧪 Test Swap (0.01 ETH → LOYAL):");
        console.log(`   Output: ${outputAmount} LOYAL`);
        console.log(`   Fee: ${feeAmount} LOYAL`);
      } catch (error) {
        console.log("\n❌ Swap calculation failed:", error.message);
      }
    }

  } catch (error) {
    console.error("❌ Error checking DEX:", error.message);
    
    if (error.message.includes("call revert exception")) {
      console.log("\n💡 This might mean:");
      console.log("1. Contracts are not deployed");
      console.log("2. Wrong contract addresses");
      console.log("3. Network mismatch");
      console.log("\nRun: npx hardhat run scripts/deploy.js --network localhost");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
