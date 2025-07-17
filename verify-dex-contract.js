const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying DEX Contract Deployment...\n");

  const DEX_ADDRESS = "0xCD8a1C3ba11CF5ECfa6267617243239504a98d90";
  const TOKEN_ADDRESS = "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575";

  try {
    // Get network and provider info
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check if there's code at the DEX address
    const dexCode = await ethers.provider.getCode(DEX_ADDRESS);
    console.log(`📦 Code at DEX address ${DEX_ADDRESS}:`);
    console.log(`   Length: ${dexCode.length} characters`);
    console.log(`   Has code: ${dexCode !== "0x"}`);
    
    if (dexCode === "0x") {
      console.log("❌ No contract deployed at DEX address!");
      console.log("\n💡 Possible solutions:");
      console.log("   1. Re-run deployment: npx hardhat run scripts/deploy.js --network localhost");
      console.log("   2. Check if Hardhat node is running on the correct network");
      return;
    }

    // Try to get the contract factory and attach
    console.log("\n🔧 Testing contract interaction...");
    
    try {
      const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
      const dex = SimpleDEX.attach(DEX_ADDRESS);
      
      // Try to call a simple view function
      console.log("📞 Testing getDEXStatus()...");
      const status = await dex.getDEXStatus();
      console.log("✅ getDEXStatus() works!");
      
      const ethLiquidity = ethers.formatEther(status[0]);
      const tokenLiquidity = ethers.formatEther(status[1]);
      const exchangeRate = ethers.formatEther(status[2]);
      const feePercentage = Number(status[3]) / 100;

      console.log(`   ETH Liquidity: ${ethLiquidity} ETH`);
      console.log(`   LOYAL Liquidity: ${tokenLiquidity} LOYAL`);
      console.log(`   Exchange Rate: ${exchangeRate} LOYAL per ETH`);
      console.log(`   Fee: ${feePercentage}%`);
      
    } catch (error) {
      console.log("❌ Error calling getDEXStatus():", error.message);
    }

    // Try to check the owner
    try {
      const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
      const dex = SimpleDEX.attach(DEX_ADDRESS);
      
      console.log("\n📞 Testing owner()...");
      const owner = await dex.owner();
      console.log(`✅ Contract owner: ${owner}`);
      
    } catch (error) {
      console.log("❌ Error calling owner():", error.message);
    }

    // Test with a different signer
    console.log("\n👥 Testing with different signers...");
    const signers = await ethers.getSigners();
    
    for (let i = 0; i < Math.min(3, signers.length); i++) {
      const signer = signers[i];
      console.log(`\n🧪 Testing with signer ${i}: ${signer.address}`);
      
      try {
        const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
        const dex = SimpleDEX.attach(DEX_ADDRESS).connect(signer);
        
        const status = await dex.getDEXStatus();
        console.log(`✅ Signer ${i} can call getDEXStatus()`);
        
        // Check token balance
        const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
        const token = LoyaltyToken.attach(TOKEN_ADDRESS);
        const balance = await token.balanceOf(signer.address);
        const balanceFormatted = ethers.formatEther(balance);
        console.log(`   LOYAL balance: ${balanceFormatted} LOYAL`);
        
        if (parseFloat(balanceFormatted) > 0) {
          console.log(`   ✅ Signer ${i} has tokens, can potentially add liquidity`);
        } else {
          console.log(`   ⚠️  Signer ${i} has no tokens`);
        }
        
      } catch (error) {
        console.log(`❌ Signer ${i} error:`, error.message);
      }
    }

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
