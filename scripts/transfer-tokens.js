const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Transferring LOYAL tokens to frontend wallet...\n");

  // Contract addresses
  const TOKEN_ADDRESS = "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575";
  
  // Frontend wallet address (from the error message)
  const FRONTEND_WALLET = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  
  try {
    // Get the owner account (has tokens)
    const [owner] = await ethers.getSigners();
    console.log("👤 Using owner account:", owner.address);

    // Get contract instance
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    const token = LoyaltyToken.attach(TOKEN_ADDRESS);

    // Check current balances
    const ownerBalance = await token.balanceOf(owner.address);
    const frontendBalance = await token.balanceOf(FRONTEND_WALLET);
    
    console.log("💰 Current Balances:");
    console.log(`   Owner (${owner.address}): ${ethers.formatEther(ownerBalance)} LOYAL`);
    console.log(`   Frontend (${FRONTEND_WALLET}): ${ethers.formatEther(frontendBalance)} LOYAL\n`);

    // Transfer amount - let's give the frontend wallet 100 LOYAL tokens
    const transferAmount = ethers.parseEther("100");
    
    console.log("🔄 Transferring 100 LOYAL tokens to frontend wallet...");
    
    // Transfer tokens
    const transferTx = await token.transfer(FRONTEND_WALLET, transferAmount);
    await transferTx.wait();
    
    console.log("✅ Transfer successful!\n");

    // Check new balances
    const newOwnerBalance = await token.balanceOf(owner.address);
    const newFrontendBalance = await token.balanceOf(FRONTEND_WALLET);
    
    console.log("💰 New Balances:");
    console.log(`   Owner (${owner.address}): ${ethers.formatEther(newOwnerBalance)} LOYAL`);
    console.log(`   Frontend (${FRONTEND_WALLET}): ${ethers.formatEther(newFrontendBalance)} LOYAL\n`);

    console.log("🎉 Frontend wallet now has LOYAL tokens!");
    console.log("💡 You can now use the Business Dashboard to add liquidity.");

  } catch (error) {
    console.error("❌ Error transferring tokens:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
