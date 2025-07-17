# 📖 LoyalLoop Integration Guide

## Table of Contents
1. [Frontend Integration](#frontend-integration)
2. [Smart Contract Integration](#smart-contract-integration)
3. [API Reference](#api-reference)
4. [Configuration Guide](#configuration-guide)
5. [Troubleshooting](#troubleshooting)

## Frontend Integration

### Component Architecture

The LoyalLoop frontend is built with React and consists of three main interface components:

#### 1. Customer Interface (`src/components/`)
- **EarnTokensForm.jsx**: Token earning functionality
- **CouponManager.jsx**: Coupon creation and management
- **WalletConnector.jsx**: MetaMask integration

#### 2. Business Dashboard (`src/components/BusinessDashboard.jsx`)
- Real-time token metrics and analytics
- DEX liquidity management
- Revenue tracking and reporting

#### 3. DEX Trading (`src/components/TokenSwapForm.jsx`)
- ETH ↔ LOYAL token swapping
- Liquidity provision interface
- Real-time pricing and slippage protection

### Service Layer (`src/services/`)

#### Token Service (`token.js`)
```javascript
// Core token operations
import { getBalance, approveTokens, createCoupon, getUserCoupons } from '../services/token';

// Example: Check user balance
const balance = await getBalance(userAddress);

// Example: Create discount coupon
const result = await createCoupon(tokenAmount, discountPercent, businessType, validityDays);
```

#### DEX Service (`dex.js`)
```javascript
// DEX operations
import { swapEthForTokens, swapTokensForEth, addLiquidity, getDEXStatus } from '../services/dex';

// Example: Swap ETH for LOYAL
const swapResult = await swapEthForTokens(ethAmount, signer);

// Example: Add liquidity
const liquidityResult = await addLiquidity(ethAmount, tokenAmount, signer);
```

#### Wallet Service (`wallet.js`)
```javascript
// Wallet connection and management
import { connectWallet, switchNetwork, getProvider } from '../services/wallet';

// Example: Connect MetaMask
const account = await connectWallet();
```

### Configuration (`src/config/contracts.js`)

```javascript
// Contract addresses are loaded from environment variables
export const CONTRACT_ADDRESSES = {
  loyaltyToken: process.env.REACT_APP_LOYALTY_TOKEN_ADDRESS,
  simpleDEX: process.env.REACT_APP_DEX_CONTRACT_ADDRESS,
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID),
  networkUrl: process.env.REACT_APP_NETWORK_URL,
};
```

## Smart Contract Integration

### LoyaltyToken Contract

#### Core Functions

```solidity
// Token earning (for businesses)
function earnTokensForSelf(address customer, uint256 amountSpent) external onlyOwner

// Coupon creation (burns tokens + 1% fee)
function createCoupon(
    uint256 tokensToBurn,
    uint256 discountPercent,
    string memory businessType,
    uint256 validityDays
) external returns (uint256 couponId)

// Coupon management
function getCouponDetails(uint256 couponId) external view returns (CouponDetails memory)
function isCouponValid(uint256 couponId) external view returns (bool)
function applyCoupon(uint256 couponId) external
```

#### Integration Example

```javascript
// Using ethers.js
const loyaltyToken = new ethers.Contract(tokenAddress, LoyaltyTokenABI, signer);

// Award tokens to customer
await loyaltyToken.earnTokensForSelf(customerAddress, amountSpent);

// Create discount coupon
const tx = await loyaltyToken.createCoupon(
    ethers.parseEther("10"), // 10 tokens to burn
    15,                      // 15% discount
    "restaurant",           // business type
    30                      // 30 days validity
);
```

### SimpleDEX Contract

#### Core Functions

```solidity
// Token swapping
function swapEthForTokens() external payable
function swapTokensForEth(uint256 tokenAmount) external

// Liquidity management
function addLiquidity(uint256 tokenAmount) external payable
function removeLiquidity(uint256 ethAmount, uint256 tokenAmount) external onlyOwner

// Information queries
function getDEXStatus() external view returns (uint256, uint256, uint256, uint256)
function calculateSwap(uint256 inputAmount, bool ethToToken) external view returns (uint256, uint256)
```

#### Integration Example

```javascript
// Using ethers.js
const simpleDEX = new ethers.Contract(dexAddress, SimpleDEXABI, signer);

// Swap ETH for LOYAL tokens
await simpleDEX.swapEthForTokens({ value: ethers.parseEther("0.1") });

// Add liquidity (requires token approval first)
await loyaltyToken.approve(dexAddress, ethers.parseEther("100"));
await simpleDEX.addLiquidity(ethers.parseEther("100"), { value: ethers.parseEther("0.1") });
```

## API Reference

### Token Service Methods

#### `getBalance(address: string): Promise<string>`
Get LOYAL token balance for an address.

#### `approveTokens(spenderAddress: string, amount: string): Promise<string>`
Approve a spender to use tokens on behalf of the user.

#### `createCoupon(tokenAmount: string, discountPercent: number, businessType: string, validityDays: number): Promise<Object>`
Create a discount coupon by burning tokens.

#### `getUserCoupons(userAddress: string): Promise<Array>`
Get all coupons owned by a user.

#### `applyCoupon(couponId: string): Promise<string>`
Mark a coupon as used.

### DEX Service Methods

#### `swapEthForTokens(ethAmount: string, signer: Signer): Promise<Object>`
Swap ETH for LOYAL tokens.

#### `swapTokensForEth(tokenAmount: string, signer: Signer): Promise<Object>`
Swap LOYAL tokens for ETH.

#### `addLiquidity(ethAmount: string, tokenAmount: string, signer: Signer): Promise<Object>`
Add liquidity to the DEX pool.

#### `getDEXStatus(provider: Provider): Promise<Object>`
Get current DEX liquidity and status information.

#### `calculateSwap(inputAmount: string, ethToToken: boolean, provider: Provider): Promise<Object>`
Calculate output amount and fees for a potential swap.

## Configuration Guide

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# Network Configuration
REACT_APP_NETWORK_URL=http://127.0.0.1:8545
REACT_APP_CHAIN_ID=31337

# Contract Addresses
REACT_APP_LOYALTY_TOKEN_ADDRESS=0x...
REACT_APP_DEX_CONTRACT_ADDRESS=0x...

# Application Settings
REACT_APP_DEBUG=true
REACT_APP_AUTO_REFRESH_INTERVAL=30000

# DEX Settings
REACT_APP_DEFAULT_SLIPPAGE=0.5
REACT_APP_MIN_LIQUIDITY_WARNING=0.01

# Token Settings
REACT_APP_MIN_EARN_AMOUNT=0.01
REACT_APP_DEFAULT_EMISSION_RATE=1
```

### Network Configuration

For different networks, update the configuration:

```javascript
// Mainnet
const MAINNET_CONFIG = {
  chainId: 1,
  networkUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
  blockExplorer: "https://etherscan.io"
};

// Goerli Testnet
const GOERLI_CONFIG = {
  chainId: 5,
  networkUrl: "https://goerli.infura.io/v3/YOUR_PROJECT_ID",
  blockExplorer: "https://goerli.etherscan.io"
};
```

### MetaMask Configuration

Add network programmatically:

```javascript
const addNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x7A69', // 31337 in hex
        chainName: 'Hardhat Local',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['http://127.0.0.1:8545'],
        blockExplorerUrls: null
      }]
    });
  } catch (error) {
    console.error('Error adding network:', error);
  }
};
```

## Troubleshooting

### Common Issues

#### 1. "Could not decode result data" Error
**Cause**: Contract ABI mismatch or incorrect contract address.
**Solution**: 
- Verify contract addresses in `.env`
- Update ABIs after redeployment
- Check network connection

```bash
# Copy updated ABIs
cp artifacts/contracts/LoyaltyToken.sol/LoyaltyToken.json frontend/src/abi/
cp artifacts/contracts/SimpleDEX.sol/SimpleDEX.json frontend/src/abi/
```

#### 2. "Execution Reverted" on Token Swaps
**Cause**: Insufficient token allowance or balance.
**Solution**:
- Check token balance
- Verify allowance for DEX contract
- Ensure sufficient ETH for gas

```javascript
// Check allowance
const allowance = await getAllowance(userAddress, dexAddress);
console.log('Current allowance:', allowance);

// Approve if needed
if (parseFloat(allowance) < parseFloat(tokenAmount)) {
  await approveTokens(dexAddress, tokenAmount);
}
```

#### 3. MetaMask Connection Issues
**Cause**: Wrong network or account not connected.
**Solution**:
- Switch to correct network (Chain ID: 31337)
- Refresh page and reconnect wallet
- Import test account private keys

#### 4. DEX Liquidity Errors
**Cause**: Insufficient liquidity in DEX pool.
**Solution**:
- Add initial liquidity using scripts
- Check DEX status before operations

```bash
# Add initial liquidity
npx hardhat run scripts/add-initial-liquidity.js --network localhost

# Check DEX status
npx hardhat run scripts/check-dex-status.js --network localhost
```

### Debugging Tools

#### Console Logging
Enable debug mode in `.env`:
```env
REACT_APP_DEBUG=true
```

#### Contract Verification
```bash
# Verify contract deployment
npx hardhat run verify-dex-contract.js --network localhost

# Debug liquidity operations
npx hardhat run debug-addliquidity.js --network localhost
```

#### Frontend Debugging
```javascript
// Add to browser console
window.ethereum.request({ method: 'eth_accounts' }); // Check connected accounts
window.ethereum.request({ method: 'eth_chainId' });  // Check current network
```

### Performance Optimization

#### 1. Reduce API Calls
- Implement proper caching
- Use event listeners for real-time updates
- Batch multiple queries

#### 2. Gas Optimization
- Use appropriate gas limits
- Implement gas estimation
- Provide user feedback on transaction costs

#### 3. User Experience
- Show loading states
- Implement retry mechanisms
- Provide clear error messages

### Best Practices

1. **Always validate inputs** before sending transactions
2. **Handle errors gracefully** with user-friendly messages
3. **Implement proper loading states** for async operations
4. **Use allowance pattern** for token operations
5. **Verify transaction success** before updating UI
6. **Implement proper error boundaries** in React components
7. **Log important operations** for debugging

### Support and Resources

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Keep this guide updated with changes
- **Code Examples**: Check `scripts/` folder for reference implementations
- **Testing**: Use `test/` folder for contract testing examples

---

For more detailed technical documentation, see individual component files and smart contract source code.
