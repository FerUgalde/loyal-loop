# ERC-20 Token Integration Documentation

## Overview
This document outlines the integration of ERC-20 token logic into the LoyaltyDex frontend application. The integration allows users to interact with the LoyaltyToken smart contract through a web interface.

## Recent Modifications

### 1. Smart Contract Deployment (`scripts/deploy.js`)

**Purpose**: Deploy the LoyaltyToken ERC-20 contract to the blockchain network.

**Key Features**:
- Deploys contract with 1,000,000 initial LOYAL tokens
- Supports both localhost and testnet deployment
- Provides clear deployment feedback and contract address

**Usage**:
```bash
# Local deployment
npx hardhat node  # Start local node first
npx hardhat run scripts/deploy.js --network localhost

# Testnet deployment
npx hardhat run scripts/deploy.js --network sepolia
```

**Current Deployment**:
- **Contract Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Network**: Hardhat Localhost (Chain ID: 31337)
- **Initial Supply**: 1,000,000 LOYAL tokens

### 2. Token Service (`frontend/src/services/token.js`)

**Purpose**: Provides utility functions for interacting with the LoyaltyToken contract.

**Key Functions**:

#### `getTokenContract()`
- Creates contract instance with ethers.js v6
- Returns contract connected to user's signer
- Async function due to ethers v6 requirements

#### `getBalance(address)`
- Retrieves LOYAL token balance for specified address
- Includes address validation
- Returns formatted balance (18 decimals)

#### `transferTokens(to, amount)`
- Transfers LOYAL tokens between addresses
- Validates recipient address format
- Handles transaction confirmation

#### `getTotalSupply()`
- Returns total supply of LOYAL tokens
- Useful for displaying contract statistics

**Ethers v6 Compatibility Updates**:
- `Web3Provider` → `BrowserProvider`
- `ethers.utils.formatUnits` → `ethers.formatUnits`
- `ethers.utils.parseUnits` → `ethers.parseUnits`
- Added `await` for async `getSigner()` calls

### 3. Wallet Connection (`frontend/src/services/wallet.js`)

**Purpose**: Manages MetaMask wallet connection for token interactions.

**Key Features**:
- MetaMask detection and connection
- Account address retrieval
- Error handling for missing wallet extensions
- Ethers v6 compatibility

**Integration Points**:
- Used by token service for transaction signing
- Provides account context for balance checks
- Enables user authentication for transfers

### 4. UI Components

#### WalletConnector (`frontend/src/components/WalletConnector.jsx`)
**Features**:
- Connect/disconnect wallet functionality
- Display connected account address
- User guidance for wallet setup
- Comprehensive JSDoc documentation

#### CreateTokenForm (`frontend/src/components/CreateTokenForm.jsx`)
**Features**:
- Token transfer interface
- Balance checking functionality
- Real-time transaction status
- Input validation and error handling

**Form Fields**:
- Recipient address input
- Transfer amount input
- Balance display
- Transaction status feedback

## Technical Requirements

### Prerequisites
- **Node.js**: v16+ recommended
- **MetaMask**: Browser extension installed
- **Hardhat**: For local blockchain development
- **React**: v18+ for frontend components

### Dependencies
```json
{
  "ethers": "^6.15.0",
  "hardhat": "^2.25.0",
  "@openzeppelin/contracts": "^5.3.0",
  "react": "^19.1.0"
}
```

### Network Configuration
```javascript
// Hardhat Local Network
{
  "name": "Hardhat Local",
  "rpc": "http://127.0.0.1:8545/",
  "chainId": 31337,
  "currency": "ETH"
}
```

## Setup Instructions

### 1. Smart Contract Setup
```bash
# Compile contracts
npx hardhat compile

# Start local node
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Frontend Setup
```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm start
```

### 3. MetaMask Configuration
1. **Add Local Network**:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337

2. **Import Test Account**:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has all initial LOYAL tokens

3. **Add LOYAL Token**:
   - Contract Address: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
   - Symbol: LOYAL
   - Decimals: 18

## Common Issues & Solutions

### 1. ENS Error on Local Network
**Problem**: `network does not support ENS` error
**Solution**: Use only Ethereum addresses (0x...), not ENS names

### 2. Insufficient Token Balance
**Problem**: Transfer fails with insufficient balance
**Solution**: Ensure sender account has LOYAL tokens (not just ETH)

### 3. Contract Address Mismatch
**Problem**: Cannot connect to deployed contract
**Solution**: Update `CONTRACT_ADDRESS` in `token.js` after deployment

### 4. Ethers v6 Compatibility
**Problem**: Functions not found or deprecated warnings
**Solution**: Use updated ethers v6 syntax (see token.js for examples)

## Security Considerations

### Development Environment
- ⚠️ **Never use test private keys on mainnet**
- ⚠️ **Local test accounts are publicly known**
- ⚠️ **Always use environment variables for production keys**

### Production Deployment
- Use hardware wallets or secure key management
- Implement proper access controls
- Add transaction confirmation prompts
- Validate all user inputs

## Future Enhancements

### Planned Features
1. **Token Minting**: Add mint functionality for authorized users
2. **Token Burning**: Implement token burning mechanism
3. **Allowance System**: Add approve/transferFrom functionality
4. **Transaction History**: Display past transactions
5. **Multi-network Support**: Support multiple blockchain networks

### Code Improvements
1. **Error Boundaries**: Add React error boundaries
2. **Loading States**: Improve user feedback during transactions
3. **Input Validation**: Enhanced form validation
4. **Testing**: Add comprehensive unit and integration tests

## API Reference

### Token Service Functions
```javascript
// Get contract instance
const contract = await getTokenContract();

// Check balance
const balance = await getBalance(address);

// Transfer tokens
const txHash = await transferTokens(recipient, amount);

// Get total supply
const supply = await getTotalSupply();
```

### Wallet Service Functions
```javascript
// Connect wallet
const address = await connectWallet();
```

## Support & Troubleshooting

For issues related to:
- **Smart Contract**: Check Hardhat console output
- **Frontend**: Check browser developer console
- **MetaMask**: Ensure correct network and account selection
- **Transactions**: Verify sufficient ETH for gas fees

---

**Last Updated**: July 15, 2025  
**Version**: 1.0.0  
**Author**: Fernanda
