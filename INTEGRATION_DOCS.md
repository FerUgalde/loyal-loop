# ERC-20 Token Integration Documentation v2.0

## Overview
This document outlines the integration of ERC-20 token logic into the LoyaltyDex frontend application. The integration allows users to interact with the LoyaltyToken smart contract through a web interface.

## Version 2.0 Updates

### New Features Added
- **Public Token Earning**: Users can now earn tokens directly without owner permission
- **Enhanced Access Control**: Dual function system for different use cases
- **Improved Error Handling**: Better validation and user feedback
- **Wallet Integration**: Seamless account switching and state management

## Recent Modifications

### 1. Smart Contract Updates (`contracts/LoyaltyToken.sol`)

#### New Function: `earnTokensForSelf(uint256 amountSpent)`
**Purpose**: Allows any user to earn tokens for themselves by simulating purchases.

**Key Features**:
- Public access (no owner restriction)
- Input validation for amount spent
- Automatic token calculation and minting
- Suitable for testing and user-driven scenarios

**Usage Example**:
```solidity
// User spends 9 units, gets 3 tokens (9 ÷ 3 × 1 = 3)
contract.earnTokensForSelf(9);
```

#### Enhanced Function: `earnTokens(address customer, uint256 amountSpent)`
**Purpose**: Owner-only function for business integration and customer token allocation.

**Key Features**:
- Owner-only access control
- Can mint tokens for any customer
- Business integration ready
- Audit trail through Transfer events

### 2. Frontend Component Updates

#### Enhanced EarnTokensForm (`frontend/src/components/EarnTokensForm.jsx`)
**New Features**:
- **Function Migration**: Now uses `earnTokensForSelf()` for public access
- **Improved UX**: Loading states, status messages, and calculation previews
- **Enhanced Validation**: Input validation and error handling
- **Visual Feedback**: Success/error styling and transaction hashes
- **Account Integration**: Displays connected wallet information

**Key Improvements**:
```javascript
// Updated function call
const tx = await contract.earnTokensForSelf(ethers.parseUnits(amountSpent, 0));

// Enhanced user feedback
setStatus(`Successfully earned ~${expectedTokens} LOYAL tokens! Transaction: ${tx.hash}`);
```

#### Updated WalletConnector (`frontend/src/components/WalletConnector.jsx`)
**New Features**:
- **Props Integration**: Accepts `onAccountChange` callback
- **State Management**: Notifies parent components of account changes
- **Seamless Integration**: Enables wallet switching without app restart

### 3. Application State Management (`frontend/src/App.js`)

#### New State Flow
**Features**:
- **Centralized Account State**: Single source of truth for connected wallet
- **Component Communication**: WalletConnector → App → EarnTokensForm
- **Automatic Updates**: Real-time account switching support

**Implementation**:
```javascript
const [currentAccount, setCurrentAccount] = useState(null);

// Pass account to components that need it
<EarnTokensForm currentAccount={currentAccount} />
<WalletConnector onAccountChange={setCurrentAccount} />
```

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

## Technical Implementation Details

### 1. Access Control Strategy

#### Dual Function Approach
The contract now implements two earning mechanisms:

**Public Function** (`earnTokensForSelf`):
- Any user can call
- Self-minting only
- Perfect for demos and testing
- Immediate user feedback

**Owner Function** (`earnTokens`):
- Owner-only access
- Can mint for any address
- Business integration ready
- Audit and control features

### 2. Frontend Integration Patterns

#### Component Communication Flow
```
WalletConnector → App.js → EarnTokensForm
     ↓              ↓            ↓
 Connect Wallet → Store State → Use Account
```

#### State Management Best Practices
```javascript
// Good: Centralized state
const [currentAccount, setCurrentAccount] = useState(null);

// Avoid: Duplicated state in multiple components
```

#### Error Handling Pattern
```javascript
try {
  const tx = await contract.earnTokensForSelf(amount);
  await tx.wait();
  setStatus("Success message with transaction hash");
} catch (error) {
  setStatus(`Error: ${error.message}`);
}
```

### . Security Considerations

#### Development vs Production

**Development (Current)**:
- Public `earnTokensForSelf()` for testing
- Known test accounts and private keys
- Local blockchain environment

**Production Recommendations**:
- Remove or restrict `earnTokensForSelf()`
- Implement proper business logic validation
- Add spending verification mechanisms
- Implement rate limiting and caps

---Maybe---
### 5. Deployment Checklist

When deploying the updated contract:

1. **Pre-deployment**:
   - [ ] Compile contracts: `npx hardhat compile`
   - [ ] Run tests if available
   - [ ] Backup current deployment addresses

2. **Deployment**:
   - [ ] Deploy: `npx hardhat run scripts/deploy.js --network localhost`
   - [ ] Save new contract address
   - [ ] Copy updated ABI

3. **Frontend Updates**:
   - [ ] Update `CONTRACT_ADDRESS` in components
   - [ ] Update ABI file in `frontend/src/abi/`
   - [ ] Test wallet connection and token earning
   - [ ] Verify transaction confirmations

4. **Testing**:
   - [ ] Connect wallet successfully
   - [ ] Earn tokens with public function
   - [ ] Transfer tokens between accounts
   - [ ] Check balance updates

## Version Comparison

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Token Earning | Owner-only | Public + Owner |
| Access Control | Basic | Enhanced |
| Frontend UX | Basic | Improved |
| Error Handling | Limited | Comprehensive |
| Documentation | Basic | Complete |
| Wallet Integration | Simple | Advanced |

## Migration Guide

### From v1.0 to v2.0

1. **Contract Changes**:
   ```solidity
   // Old (v1.0) - Owner only
   function earnTokens(address customer, uint256 amountSpent) external onlyOwner
   
   // New (v2.0) - Added public function
   function earnTokensForSelf(uint256 amountSpent) external
   ```

2. **Frontend Changes**:
   ```javascript
   // Old (v1.0)
   const tx = await contract.earnTokens(currentAccount, amount);
   
   // New (v2.0)
   const tx = await contract.earnTokensForSelf(amount);
   ```

3. **Component Structure**:
   ```javascript
   // Old (v1.0) - Simple components
   <EarnTokensForm />
   
   // New (v2.0) - Props-based communication
   <EarnTokensForm currentAccount={currentAccount} />
   ```

---

**Last Updated**: July 15, 2025  
**Version**: 2.0.0 - Public Token Earning  
**Author**: Fernanda
