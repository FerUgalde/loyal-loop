// token.js
import { ethers } from "ethers";
import LoyaltyToken from "../abi/LoyaltyToken.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export async function getTokenContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, LoyaltyToken.abi, signer);
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
  // The owner is the one who deployed and has all tokens initially
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.listAccounts();
  return accounts[0].address; // First account is usually the deployer
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