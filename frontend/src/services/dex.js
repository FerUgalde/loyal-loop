/**
 * DEX Service v1.0
 * 
 * Service module for interacting with the SimpleDEX contract.
 * Provides functions for token trading, liquidity management, and DEX status.
 * 
 *    // Check current allowance for the DEX contract
    const currentAllowance = await getAllowance(userAddress, CONTRACT_ADDRESSES.simpleDEX);
    const allowanceInWei = ethers.parseEther(currentAllowance);
    
    // If allowance is insufficient, approve the DEX to spend tokens
    if (allowanceInWei < tokenValue) {
      console.log(`Approving DEX to spend ${tokenAmount} LOYAL tokens...`);
      await approveTokens(CONTRACT_ADDRESSES.simpleDEX, tokenAmount);
      console.log("Approval successful");
    }
 * - ETH ↔ LOYAL token swaps
 * - Swap calculation and preview
 * - Liquidity information
 * - Exchange rate and fee tracking
 * 
 * @module dex
 * @version 1.0.0
 * @author Fernanda
 */

import { ethers } from "ethers";
import SimpleDEX from "../abi/SimpleDEX.json";
import { approveTokens, getAllowance } from "./token.js";
import { CONTRACT_ADDRESSES, DEX_CONFIG, logConfig } from "../config/contracts.js";

// Initialize configuration logging
logConfig();

/**
 * Get DEX contract instance
 * @param {ethers.Signer} signer - Wallet signer
 * @returns {ethers.Contract} SimpleDEX contract instance
 */
function getDEXContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.simpleDEX, SimpleDEX.abi, signer);
}

/**
 * Swap ETH for LOYAL tokens
 * @param {string} ethAmount - Amount of ETH to swap (in ETH units)
 * @param {ethers.Signer} signer - Wallet signer
 * @returns {Promise<Object>} Transaction result
 */
export async function swapEthForTokens(ethAmount, signer) {
  try {
    const dexContract = getDEXContract(signer);
    const ethValue = ethers.parseEther(ethAmount);
    
    // Execute swap
    const tx = await dexContract.swapEthForTokens({
      value: ethValue
    });
    
    await tx.wait();
    
    return {
      success: true,
      transaction: tx,
      message: `Successfully swapped ${ethAmount} ETH for LOYAL tokens`
    };
  } catch (error) {
    console.error("Error swapping ETH for tokens:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Swap LOYAL tokens for ETH
 * @param {string} tokenAmount - Amount of tokens to swap (in token units)
 * @param {ethers.Signer} signer - Wallet signer
 * @returns {Promise<Object>} Transaction result
 */
export async function swapTokensForEth(tokenAmount, signer) {
  try {
    const dexContract = getDEXContract(signer);
    const tokenValue = ethers.parseEther(tokenAmount);
    const userAddress = await signer.getAddress();
    
    console.log(`🔄 Starting swap: ${tokenAmount} LOYAL → ETH`);
    
    // Check current allowance
    const currentAllowance = await getAllowance(userAddress, CONTRACT_ADDRESSES.simpleDEX);
    const allowanceInWei = ethers.parseEther(currentAllowance);
    
    console.log(`📊 Current allowance: ${currentAllowance} LOYAL`);
    console.log(`📊 Required amount: ${tokenAmount} LOYAL`);
    
    // If allowance is insufficient, approve the DEX to spend tokens
    if (allowanceInWei < tokenValue) {
      console.log(`🔓 Insufficient allowance. Approving DEX to spend ${tokenAmount} LOYAL tokens...`);
      
      // Approve with a bit extra to account for any potential rounding issues
      const approveAmount = (parseFloat(tokenAmount) * 1.1).toString();
      await approveTokens(CONTRACT_ADDRESSES.simpleDEX, approveAmount);
      
      // Verify the approval went through
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const newAllowance = await getAllowance(userAddress, CONTRACT_ADDRESSES.simpleDEX);
      console.log(`✅ New allowance after approval: ${newAllowance} LOYAL`);
      
      if (parseFloat(newAllowance) < parseFloat(tokenAmount)) {
        throw new Error(`Approval failed. Current allowance: ${newAllowance}, Required: ${tokenAmount}`);
      }
    } else {
      console.log(`✅ Sufficient allowance available`);
    }
    
    // Execute swap
    console.log(`🔀 Executing swap transaction...`);
    const tx = await dexContract.swapTokensForEth(tokenValue);
    console.log(`⏳ Waiting for transaction confirmation...`);
    await tx.wait();
    console.log(`✅ Swap completed successfully!`);
    
    return {
      success: true,
      transaction: tx,
      message: `Successfully swapped ${tokenAmount} LOYAL tokens for ETH`
    };
  } catch (error) {
    console.error("Error swapping tokens for ETH:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current DEX status and liquidity information
 * @param {ethers.Provider} provider - Ethereum provider
 * @returns {Promise<Object>} DEX status information
 */
export async function getDEXStatus(provider) {
  try {
    const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.simpleDEX, SimpleDEX.abi, provider);
    const status = await dexContract.getDEXStatus();
    
    return {
      success: true,
      ethLiquidity: ethers.formatEther(status[0]),
      tokenLiquidity: ethers.formatEther(status[1]),
      exchangeRate: ethers.formatEther(status[2]),
      feePercentage: Number(status[3]) / 100
    };
  } catch (error) {
    console.error("Error getting DEX status:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate swap output and fees
 * @param {string} inputAmount - Input amount
 * @param {boolean} ethToToken - Direction of swap (true for ETH->Token, false for Token->ETH)
 * @param {ethers.Provider} provider - Ethereum provider
 * @returns {Promise<Object>} Swap calculation result
 */
export async function calculateSwap(inputAmount, ethToToken, provider) {
  try {
    const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.simpleDEX, SimpleDEX.abi, provider);
    const inputValue = ethers.parseEther(inputAmount);
    
    const result = await dexContract.calculateSwap(inputValue, ethToToken);
    
    return {
      success: true,
      outputAmount: ethers.formatEther(result[0]),
      feeAmount: ethers.formatEther(result[1]),
      inputAmount: inputAmount
    };
  } catch (error) {
    console.error("Error calculating swap:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Add liquidity to the DEX
 * @param {string} ethAmount - Amount of ETH to add
 * @param {string} tokenAmount - Amount of tokens to add
 * @param {ethers.Signer} signer - Wallet signer
 * @returns {Promise<Object>} Transaction result
 */
export async function addLiquidity(ethAmount, tokenAmount, signer) {
  try {
    const dexContract = getDEXContract(signer);
    const ethValue = ethers.parseEther(ethAmount);
    const tokenValue = ethers.parseEther(tokenAmount);
    const userAddress = await signer.getAddress();
    
    console.log(`💧 Starting liquidity addition: ${ethAmount} ETH + ${tokenAmount} LOYAL`);
    
    // Check current allowance for the DEX contract
    const currentAllowance = await getAllowance(userAddress, CONTRACT_ADDRESSES.simpleDEX);
    const allowanceInWei = ethers.parseEther(currentAllowance);
    
    console.log(`📊 Current allowance: ${currentAllowance} LOYAL`);
    console.log(`📊 Required amount: ${tokenAmount} LOYAL`);
    
    // If allowance is insufficient, approve the DEX to spend tokens
    if (allowanceInWei < tokenValue) {
      console.log(`🔓 Insufficient allowance. Approving DEX to spend ${tokenAmount} LOYAL tokens for liquidity...`);
      
      // Approve with a bit extra to account for any potential rounding issues
      const approveAmount = (parseFloat(tokenAmount) * 1.1).toString();
      await approveTokens(CONTRACT_ADDRESSES.simpleDEX, approveAmount);
      
      // Verify the approval went through
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const newAllowance = await getAllowance(userAddress, CONTRACT_ADDRESSES.simpleDEX);
      console.log(`✅ New allowance after approval: ${newAllowance} LOYAL`);
      
      if (parseFloat(newAllowance) < parseFloat(tokenAmount)) {
        throw new Error(`Approval failed. Current allowance: ${newAllowance}, Required: ${tokenAmount}`);
      }
    } else {
      console.log(`✅ Sufficient allowance available`);
    }
    
    // Add liquidity
    console.log(`💧 Executing add liquidity transaction...`);
    const tx = await dexContract.addLiquidity(tokenValue, {
      value: ethValue
    });
    
    console.log(`⏳ Waiting for transaction confirmation...`);
    await tx.wait();
    console.log(`✅ Liquidity added successfully!`);
    
    return {
      success: true,
      transaction: tx,
      message: `Successfully added ${ethAmount} ETH and ${tokenAmount} LOYAL as liquidity`
    };
  } catch (error) {
    console.error("Error adding liquidity:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get DEX contract address
 * @returns {string} DEX contract address
 */
export function getDEXAddress() {
  return CONTRACT_ADDRESSES.simpleDEX;
}
