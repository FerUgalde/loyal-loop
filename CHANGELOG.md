# CHANGELOG

All notable changes to the LoyalLoop project will be documented in this file.

## [2.0.0] - 2025-07-15

### Added
- **Public Token Earning**: New `earnTokensForSelf()` function allows any user to earn tokens
- **Enhanced Access Control**: Dual function system (public + owner-only)
- **Improved Frontend UX**: Loading states, status messages, and visual feedback
- **Wallet State Management**: Centralized account state management across components
- **Input Validation**: Enhanced form validation and error handling
- **Token Calculation Preview**: Real-time calculation display for users
- **Comprehensive Documentation**: Updated technical documentation and migration guides

### Changed
- **EarnTokensForm Component**: Migrated from `earnTokens()` to `earnTokensForSelf()`
- **WalletConnector Component**: Added props support for account change notifications
- **App Component**: Implemented centralized state management for wallet accounts
- **Deploy Script**: Enhanced logging and deployment feedback
- **Contract Documentation**: Added comprehensive NatSpec documentation

### Fixed
- **Error Handling**: Improved error messages and user feedback

### Security
- **Owner Validation**: Maintained owner-only functions for business operations
- **Input Validation**: Added validation for token earning amounts
- **Error Boundaries**: Improved error handling and validation

## [1.0.0] - 2025-07-14

### Added
- **Initial Release**: Basic ERC-20 LoyaltyToken contract
- **Owner-Only Token Earning**: `earnTokens()` function for business integration
- **Frontend Integration**: Basic React components for wallet connection and token transfers
- **Hardhat Development Environment**: Local blockchain setup and deployment scripts
- **MetaMask Integration**: Wallet connection and transaction signing
- **Basic Documentation**: README and setup instructions

### Contract Features
- ERC-20 standard compliance
- 1,000 LOYAL tokens initial supply
- Configurable emission rate and unit value
- Owner-controlled token minting

### Frontend Features
- Wallet connection interface
- Token transfer functionality
- Balance checking
- Basic error handling

