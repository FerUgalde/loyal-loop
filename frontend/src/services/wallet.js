/**
 * Wallet Service
 * 
 * Provides utilities for connecting to and interacting with Ethereum wallets.
 * This service uses ethers.js v6 to communicate with MetaMask and other web3 wallets.
 * 
 * @module wallet
 */

import { ethers } from "ethers";

/**
 * Connects to the user's Ethereum wallet (MetaMask)
 * 
 * This function checks for the presence of MetaMask, requests account access,
 * and returns the user's wallet address.
 * 
 * @async
 * @function connectWallet
 * @returns {Promise<string|null>} The connected wallet address, or null if connection failed
 * @throws {Error} Throws error if wallet connection fails
 * 
 * @example
 * const address = await connectWallet();
 * if (address) {
 *   console.log('Connected to:', address);
 * }
 */
export async function connectWallet() {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    alert("Please install MetaMask wallet extension.");
    return null;
  }
  
  // Create a new provider instance using ethers v6 BrowserProvider
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Request account access from the user
  await provider.send("eth_requestAccounts", []);
  
  // Get the signer (account) from the provider
  const signer = await provider.getSigner();
  
  // Get and return the wallet address
  const address = await signer.getAddress();
  return address;
}