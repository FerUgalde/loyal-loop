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
    
    /// @dev Counter for coupon IDs
    uint256 private nextCouponId = 1;
    
    /// @dev Mapping from coupon ID to coupon details
    mapping(uint256 => Coupon) public coupons;
    
    /// @dev Mapping from user address to their active coupons
    mapping(address => uint256[]) public userCoupons;
    
    /// @dev Coupon structure
    struct Coupon {
        uint256 id;
        address owner;
        uint256 discountPercent; // Percentage discount (1-100)
        uint256 tokensBurned;    // Tokens burned to get this coupon
        uint256 expiryTime;      // Unix timestamp
        bool isUsed;             // Whether coupon has been redeemed
        string businessType;     // Type of business (restaurant, retail, etc.)
    }

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
        require(amountSpent >= unitValue, "Amount spent must be at least unitValue to earn tokens");
        
        // Calculate tokens to mint based on spending, unit value, and emission rate
        uint256 tokensToMint = (amountSpent / unitValue) * emissionRate;
        require(tokensToMint > 0, "No tokens to mint");
        
        uint256 tokensWithDecimals = tokensToMint * 10 ** decimals();
        
        // Mint the calculated tokens to the caller (with 18 decimals)
        _mint(msg.sender, tokensWithDecimals);
        
        // Update tracking
        totalMinted += tokensWithDecimals;
    }

    /**
     * @dev Creates a discount coupon by burning tokens
     * @param tokenAmount Amount of tokens to burn for the coupon
     * @param discountPercent Discount percentage (1-100)
     * @param businessType Type of business the coupon is for
     * @param validityDays Number of days the coupon is valid
     * 
     * @notice Burns tokens and creates a discount coupon
     * @notice Implements the deflationary mechanism while providing utility
     */
    function createCoupon(
        uint256 tokenAmount, 
        uint256 discountPercent, 
        string memory businessType, 
        uint256 validityDays
    ) external returns (uint256 couponId) {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(discountPercent > 0 && discountPercent <= 100, "Discount must be between 1-100%");
        require(validityDays > 0 && validityDays <= 365, "Validity must be between 1-365 days");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        // Burn tokens (deflationary mechanism)
        _burn(msg.sender, tokenAmount);
        totalBurned += tokenAmount;
        
        // Create coupon
        couponId = nextCouponId++;
        uint256 expiryTime = block.timestamp + (validityDays * 24 * 60 * 60);
        
        coupons[couponId] = Coupon({
            id: couponId,
            owner: msg.sender,
            discountPercent: discountPercent,
            tokensBurned: tokenAmount,
            expiryTime: expiryTime,
            isUsed: false,
            businessType: businessType
        });
        
        // Add to user's coupons
        userCoupons[msg.sender].push(couponId);
        
        // Emit events
        emit TokensRedeemed(msg.sender, tokenAmount);
        emit CouponCreated(couponId, msg.sender, discountPercent, tokenAmount);
        
        return couponId;
    }
    
    /**
     * @dev Uses a coupon (marks it as used)
     * @param couponId ID of the coupon to use
     * 
     * @notice Only coupon owner can use it
     * @notice Only works if coupon is valid and not expired
     */
    function useCoupon(uint256 couponId) external {
        Coupon storage coupon = coupons[couponId];
        
        require(coupon.owner == msg.sender, "Not coupon owner");
        require(!coupon.isUsed, "Coupon already used");
        require(block.timestamp <= coupon.expiryTime, "Coupon expired");
        
        // Mark as used
        coupon.isUsed = true;
        
        emit CouponUsed(couponId, msg.sender);
    }
    
    /**
     * @dev Get user's active coupons
     * @param user Address of the user
     * @return Array of coupon IDs
     */
    function getUserCoupons(address user) external view returns (uint256[] memory) {
        return userCoupons[user];
    }
    
    /**
     * @dev Get coupon details
     * @param couponId ID of the coupon
     * @return Coupon struct with all details
     */
    function getCouponDetails(uint256 couponId) external view returns (Coupon memory) {
        return coupons[couponId];
    }
    
    /**
     * @dev Check if coupon is valid and usable
     * @param couponId ID of the coupon
     * @return bool indicating if coupon is valid
     */
    function isCouponValid(uint256 couponId) external view returns (bool) {
        Coupon memory coupon = coupons[couponId];
        return !coupon.isUsed && block.timestamp <= coupon.expiryTime && coupon.owner != address(0);
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
    
    // Events for coupon system
    event CouponCreated(uint256 indexed couponId, address indexed user, uint256 discountPercent, uint256 tokensBurned);
    event CouponUsed(uint256 indexed couponId, address indexed user);
}