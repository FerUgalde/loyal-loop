// token.js
import { ethers } from "ethers";
import LoyaltyToken from "../abi/LoyaltyToken.json";
import { CONTRACT_ADDRESSES, TOKEN_CONFIG, logConfig } from "../config/contracts.js";

// Initialize configuration logging
logConfig();

export async function getTokenContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.loyaltyToken, LoyaltyToken.abi, signer);
}

export async function getBalance(address) {
  // Validate address format
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }
  
  const contract = await getTokenContract();
  const balance = await contract.balanceOf(address);
  return ethers.formatUnits(balance, 18);
}

export async function transferTokens(to, amount) {
  // Validate address format
  if (!ethers.isAddress(to)) {
    throw new Error("Invalid recipient address. Please use a valid Ethereum address (0x...)");
  }
  
  const contract = await getTokenContract();
  const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
  await tx.wait();
  return tx.hash;
}

/**
 * Approve a spender to use tokens on behalf of the user
 * @param {string} spenderAddress - Address that will be approved to spend tokens
 * @param {string} amount - Amount of tokens to approve (in token units)
 * @returns {Promise<string>} Transaction hash
 */
export async function approveTokens(spenderAddress, amount) {
  if (!ethers.isAddress(spenderAddress)) {
    throw new Error("Invalid spender address");
  }
  
  const contract = await getTokenContract();
  const tokenValue = ethers.parseUnits(amount, 18);
  const tx = await contract.approve(spenderAddress, tokenValue);
  await tx.wait();
  return tx.hash;
}

/**
 * Check the allowance for a spender
 * @param {string} ownerAddress - Owner of the tokens
 * @param {string} spenderAddress - Address that is approved to spend
 * @returns {Promise<string>} Allowance amount in token units
 */
export async function getAllowance(ownerAddress, spenderAddress) {
  if (!ethers.isAddress(ownerAddress) || !ethers.isAddress(spenderAddress)) {
    throw new Error("Invalid addresses");
  }
  
  const contract = await getTokenContract();
  const allowance = await contract.allowance(ownerAddress, spenderAddress);
  return ethers.formatUnits(allowance, 18);
}

//-----------------------------------------------------------------------------------------///
/**
 * Get the total supply of tokens
 */
export async function getTotalSupply() {
  const contract = await getTokenContract();
  const supply = await contract.totalSupply();
  return ethers.formatUnits(supply, 18);
}

/**
 * Get the owner/deployer of the contract (who has all initial tokens)
 */
export async function getOwner() {
  const contract = await getTokenContract();
  // Get the actual owner from the contract
  return await contract.owner();
}

/**
 * Mint tokens to a specific address (only if you're the owner)
 */
export async function mintTokens(to, amount) {
  if (!ethers.isAddress(to)) {
    throw new Error("Invalid recipient address");
  }
  
  const contract = await getTokenContract();
  // Note: Your current contract doesn't have a mint function
  // You'd need to add one to the Solidity contract
  const tx = await contract.mint(to, ethers.parseUnits(amount, 18));
  await tx.wait();
  return tx.hash;
}

/**
 * Creates a discount coupon by burning tokens
 * @param {string} tokenAmount - Amount of tokens to burn
 * @param {number} discountPercent - Discount percentage (1-100)
 * @param {string} businessType - Type of business
 * @param {number} validityDays - Number of days coupon is valid
 * @returns {Promise<Object>} Object with transaction hash and coupon ID
 */
export async function createCoupon(tokenAmount, discountPercent, businessType, validityDays) {
  // Validate inputs
  if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
    throw new Error("Invalid token amount");
  }
  if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
    throw new Error("Discount must be between 1-100%");
  }
  if (!validityDays || validityDays < 1 || validityDays > 365) {
    throw new Error("Validity must be between 1-365 days");
  }
  
  const contract = await getTokenContract();
  const tx = await contract.createCoupon(
    ethers.parseUnits(tokenAmount, 18),
    discountPercent,
    businessType || "general",
    validityDays
  );
  
  const receipt = await tx.wait();
  
  // Extract coupon ID from events
  const couponCreatedEvent = receipt.logs.find(log => {
    try {
      const parsedLog = contract.interface.parseLog(log);
      return parsedLog.name === "CouponCreated";
    } catch {
      return false;
    }
  });
  
  let couponId = null;
  if (couponCreatedEvent) {
    const parsedLog = contract.interface.parseLog(couponCreatedEvent);
    couponId = parsedLog.args.couponId.toString();
  }
  
  return { hash: tx.hash, couponId };
}

/**
 * Gets user's coupons
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<Array>} Array of coupon objects
 */
export async function getUserCoupons(userAddress) {
  if (!ethers.isAddress(userAddress)) {
    throw new Error("Invalid user address");
  }
  
  const contract = await getTokenContract();
  const couponIds = await contract.getUserCoupons(userAddress);
  
  // Get details for each coupon
  const coupons = [];
  for (const couponId of couponIds) {
    try {
      const details = await contract.getCouponDetails(couponId);
      const isValid = await contract.isCouponValid(couponId);
      
      coupons.push({
        id: details.id.toString(),
        discountPercent: details.discountPercent.toString(),
        tokensBurned: ethers.formatUnits(details.tokensBurned, 18),
        expiryTime: new Date(Number(details.expiryTime) * 1000),
        isUsed: details.isUsed,
        businessType: details.businessType,
        isValid: isValid
      });
    } catch (error) {
      console.error(`Error fetching coupon ${couponId}:`, error);
    }
  }
  
  return coupons;
}

/**
 * Uses a coupon (marks it as used)
 * @param {string} couponId - ID of the coupon to use
 * @returns {Promise<string>} Transaction hash
 */
export async function applyCoupon(couponId) {
  if (!couponId) {
    throw new Error("Coupon ID is required");
  }
  
  const contract = await getTokenContract();
  const tx = await contract.useCoupon(couponId);
  await tx.wait();
  return tx.hash;
}

/**
 * Redeems tokens for rewards (burns them from circulation)
 * @param {string} amount - Amount of tokens to redeem
 * @returns {Promise<string>} Transaction hash
 */
export async function redeemTokens(amount) {
  // This function now redirects to createCoupon with default values
  throw new Error("Use createCoupon() instead of redeemTokens() for better rewards");
}

/**
 * Get token economics metrics
 * @param {Object} provider - Optional ethers provider (for compatibility)
 * @returns {Promise<Object>} Object with comprehensive token metrics
 */
export async function getTokenMetrics(provider = null) {
  try {
    const contract = await getTokenContract();
    
    // Get metrics from contract
    const [totalMinted, totalBurned, currentSupply] = await contract.getTokenMetrics();
    const emissionRate = await contract.emissionRate();
    const unitValue = await contract.unitValue();
    
    return {
      success: true,
      totalSupply: ethers.formatUnits(currentSupply, 18),
      totalMinted: ethers.formatUnits(totalMinted, 18),
      totalBurned: ethers.formatUnits(totalBurned, 18),
      emissionRate: emissionRate.toString(),
      unitValue: ethers.formatUnits(unitValue, 18)
    };
  } catch (error) {
    console.error("Error getting token metrics:", error);
    return {
      success: false,
      error: error.message,
      totalSupply: "0",
      totalMinted: "0", 
      totalBurned: "0",
      emissionRate: "0",
      unitValue: "0"
    };
  }
}

/**
 * Debug function to check contract state and balances
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<Object>} Debug information
 */
export async function debugTokenState(userAddress) {
  try {
    const contract = await getTokenContract();
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get contract info
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    
    // Get user balance
    const userBalance = await contract.balanceOf(userAddress);
    
    // Get owner balance
    const ownerBalance = await contract.balanceOf(owner);
    
    // Get token metrics
    const emissionRate = await contract.emissionRate();
    const unitValue = await contract.unitValue();
    
    console.log("🔍 Token Contract Debug Info:");
    console.log("- Contract Address:", CONTRACT_ADDRESSES.loyaltyToken);
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Total Supply:", ethers.formatEther(totalSupply));
    console.log("- Owner:", owner);
    console.log("- User Address:", userAddress);
    console.log("- User Balance:", ethers.formatEther(userBalance));
    console.log("- Owner Balance:", ethers.formatEther(ownerBalance));
    console.log("- Emission Rate:", emissionRate.toString());
    console.log("- Unit Value:", unitValue.toString());
    
    return {
      contractAddress: CONTRACT_ADDRESSES.loyaltyToken,
      name,
      symbol,
      totalSupply: ethers.formatEther(totalSupply),
      owner,
      userAddress,
      userBalance: ethers.formatEther(userBalance),
      ownerBalance: ethers.formatEther(ownerBalance),
      emissionRate: emissionRate.toString(),
      unitValue: unitValue.toString()
    };
  } catch (error) {
    console.error("❌ Debug error:", error);
    return { error: error.message };
  }
}

//-----------------------------------------------------------------------------------------///