// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LoyaltyToken
 * @dev ERC20 token contract for a loyalty rewards system
 * 
 * This contract implements a loyalty token system where:
 * - Customers earn tokens based on their spending
 * - Token emission can be controlled by the owner
 * - Exchange rate between spending and tokens is configurable
 * 
 * Features:
 * - Standard ERC20 functionality (transfer, approve, etc.)
 * - Owner-controlled emission rate and unit value
 * - Automated token minting based on customer spending
 * - Initial supply of 1,000 LOYAL tokens to contract deployer
 */
contract LoyaltyToken is ERC20, Ownable {
    
    /// @dev Rate at which tokens are emitted per unit spent (tokens per unit)
    uint256 public emissionRate = 1;
    
    /// @dev Value in wei that equals one unit for token calculation (e.g., 3 wei = 1 unit)
    uint256 public unitValue = 3;
    
    /// @dev Total tokens ever minted (for tracking purposes)
    uint256 public totalMinted;
    
    /// @dev Total tokens burned (for deflationary tracking)
    uint256 public totalBurned;

    /**
     * @dev Contract constructor
     * @notice Initializes the loyalty token with name "LoyaltyToken" and symbol "LOYAL"
     * 
     * The constructor:
     * - Sets up the ERC20 token with name and symbol
     * - Mints 1,000 LOYAL tokens to the contract deployer
     * - Establishes the deployer as the contract owner
     */
    constructor() ERC20("LoyaltyToken", "LOYAL") Ownable(msg.sender) {
        // Mint initial supply of 1,000 tokens to the contract deployer
        uint256 initialSupply = 1000 * 10 ** decimals();
        _mint(msg.sender, initialSupply);
        totalMinted = initialSupply; // Track initial minting
    }

    /**
     * @dev Sets the emission rate for token rewards
     * @param _rate New emission rate (tokens per unit spent)
     * 
     * @notice Only the contract owner can modify the emission rate
     * @notice This affects how many tokens customers earn per unit spent
     * 
     * Example: If emission rate is 2, customers get 2 tokens per unit spent
     * 
     * Requirements:
     * - Caller must be the contract owner
     */
    function setEmissionRate(uint256 _rate) external onlyOwner {
        emissionRate = _rate;
    }

    /**
     * @dev Sets the unit value for token calculation
     * @param _unit New unit value in wei
     * 
     * @notice Only the contract owner can modify the unit value
     * @notice This determines how much spending equals one "unit" for token calculation
     * 
     * Example: If unit value is 100, then 100 wei of spending = 1 unit
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Consider adding a minimum value check to prevent division by zero
     */
    function setUnitValue(uint256 _unit) external onlyOwner {
        unitValue = _unit;
    }

    /**
     * @dev Mints loyalty tokens for customer based on their spending
     * @param customer Address of the customer who made the purchase
     * @param amountSpent Amount spent by the customer (in wei)
     * 
     * @notice Only the contract owner can mint tokens for customers
     * @notice Tokens are calculated as: (amountSpent / unitValue) * emissionRate
     * 
     * Example calculation:
     * - Customer spends 300 wei
     * - Unit value is 3 wei
     * - Emission rate is 1 token per unit
     * - Result: (300 / 3) * 1 = 100 tokens minted
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - customer address must not be zero address
     * - amountSpent should be greater than 0
     * 
     * Emits: Transfer event (from ERC20._mint)
     * 
     * @custom:security Consider adding checks for:
     * - Zero address validation
     * - Minimum spending amount
     * - Maximum tokens per transaction
     */
    function earnTokens(address customer, uint256 amountSpent) external onlyOwner {
        // Calculate tokens to mint based on spending, unit value, and emission rate
        uint256 tokensToMint = (amountSpent / unitValue) * emissionRate;
        uint256 tokensWithDecimals = tokensToMint * 10 ** decimals();
        
        // Mint the calculated tokens to the customer (with 18 decimals)
        _mint(customer, tokensWithDecimals);
        
        // Update tracking
        totalMinted += tokensWithDecimals;
    }

    /**
     * @dev Allows users to earn tokens for themselves by simulating a purchase
     * @param amountSpent Amount spent by the user (in wei/units)
     * 
     * @notice Anyone can call this function to earn tokens for themselves
     * @notice This is for demonstration/testing purposes
     * @notice In production, this would be called by a verified payment system
     * 
     * Requirements:
     * - amountSpent should be greater than 0
     * 
     * Emits: Transfer event (from ERC20._mint)
     */
    function earnTokensForSelf(uint256 amountSpent) external {
        require(amountSpent > 0, "Amount spent must be greater than 0");
        
        // Calculate tokens to mint based on spending, unit value, and emission rate
        uint256 tokensToMint = (amountSpent / unitValue) * emissionRate;
        uint256 tokensWithDecimals = tokensToMint * 10 ** decimals();
        
        // Mint the calculated tokens to the caller (with 18 decimals)
        _mint(msg.sender, tokensWithDecimals);
        
        // Update tracking
        totalMinted += tokensWithDecimals;
    }

    /**
     * @dev Burns tokens when user redeems rewards
     * @param amount Amount of tokens to burn for redemption
     * 
     * @notice This function implements the deflationary mechanism
     * @notice Tokens are permanently removed from circulation
     */
    function redeemReward(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        // Burn tokens to reduce total supply (deflationary mechanism)
        _burn(msg.sender, amount);
        
        // Update tracking
        totalBurned += amount;
        
        // Emit event for tracking redemptions
        emit TokensRedeemed(msg.sender, amount);
    }
    
    /**
     * @dev Get metrics for token economics
     * @return totalMintedTokens Total tokens ever minted
     * @return totalBurnedTokens Total tokens burned (supply reduction)
     * @return currentSupply Current circulating supply
     */
    function getTokenMetrics() external view returns (uint256 totalMintedTokens, uint256 totalBurnedTokens, uint256 currentSupply) {
        return (totalMinted, totalBurned, totalSupply());
    }
    
    // Event for tracking redemptions
    event TokensRedeemed(address indexed user, uint256 amount);
}