// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleDEX
 * @dev A simple DEX contract for swapping between LOYAL tokens and ETH
 * @notice This contract allows users to trade LOYAL tokens for ETH and vice versa
 */
contract SimpleDEX is Ownable, ReentrancyGuard {
    IERC20 public loyalToken;
    
    // Exchange rate: 1 ETH = exchangeRate LOYAL tokens
    uint256 public exchangeRate;
    
    // Fee percentage (in basis points, e.g., 100 = 1%)
    uint256 public feePercentage;
    
    // Liquidity tracking
    uint256 public ethLiquidity;
    uint256 public tokenLiquidity;
    
    // Events
    event TokenSwap(
        address indexed user,
        uint256 ethAmount,
        uint256 tokenAmount,
        bool ethToToken
    );
    
    event LiquidityAdded(
        address indexed provider,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    
    event ExchangeRateUpdated(uint256 newRate);
    event FeeUpdated(uint256 newFee);
    
    /**
     * @dev Constructor to initialize the DEX
     * @param _loyalToken Address of the LOYAL token contract
     * @param _exchangeRate Initial exchange rate (tokens per ETH)
     * @param _feePercentage Fee percentage in basis points
     */
    constructor(
        address _loyalToken,
        uint256 _exchangeRate,
        uint256 _feePercentage
    ) Ownable(msg.sender) {
        require(_loyalToken != address(0), "Invalid token address");
        require(_exchangeRate > 0, "Exchange rate must be positive");
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        
        loyalToken = IERC20(_loyalToken);
        exchangeRate = _exchangeRate;
        feePercentage = _feePercentage;
    }
    
    /**
     * @dev Swap ETH for LOYAL tokens
     * @notice Users can send ETH to receive LOYAL tokens
     */
    function swapEthForTokens() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        
        uint256 tokenAmount = (msg.value * exchangeRate) / 1e18;
        uint256 fee = (tokenAmount * feePercentage) / 10000;
        uint256 tokensToSend = tokenAmount - fee;
        
        require(tokenLiquidity >= tokensToSend, "Insufficient token liquidity");
        
        // Update liquidity
        ethLiquidity += msg.value;
        tokenLiquidity -= tokensToSend;
        
        // Transfer tokens to user
        require(loyalToken.transfer(msg.sender, tokensToSend), "Token transfer failed");
        
        emit TokenSwap(msg.sender, msg.value, tokensToSend, true);
    }
    
    /**
     * @dev Swap LOYAL tokens for ETH
     * @param _tokenAmount Amount of tokens to swap
     * @notice Users can swap LOYAL tokens for ETH
     */
    function swapTokensForEth(uint256 _tokenAmount) external nonReentrant {
        require(_tokenAmount > 0, "Must specify token amount");
        
        uint256 ethAmount = (_tokenAmount * 1e18) / exchangeRate;
        uint256 fee = (ethAmount * feePercentage) / 10000;
        uint256 ethToSend = ethAmount - fee;
        
        require(ethLiquidity >= ethToSend, "Insufficient ETH liquidity");
        require(loyalToken.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");
        
        // Update liquidity
        tokenLiquidity += _tokenAmount;
        ethLiquidity -= ethToSend;
        
        // Transfer ETH to user
        payable(msg.sender).transfer(ethToSend);
        
        emit TokenSwap(msg.sender, ethToSend, _tokenAmount, false);
    }
    
    /**
     * @dev Add liquidity to the DEX
     * @param _tokenAmount Amount of tokens to add as liquidity
     * @notice Users can add liquidity by sending tokens and ETH
     */
    function addLiquidity(uint256 _tokenAmount) external payable {
        require(msg.value > 0, "Must send ETH");
        require(_tokenAmount > 0, "Must send tokens");
        
        require(loyalToken.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");
        
        ethLiquidity += msg.value;
        tokenLiquidity += _tokenAmount;
        
        emit LiquidityAdded(msg.sender, msg.value, _tokenAmount);
    }
    
    /**
     * @dev Remove liquidity from the DEX (owner only)
     * @param _ethAmount Amount of ETH to remove
     * @param _tokenAmount Amount of tokens to remove
     */
    function removeLiquidity(uint256 _ethAmount, uint256 _tokenAmount) external onlyOwner {
        require(_ethAmount <= ethLiquidity, "Insufficient ETH liquidity");
        require(_tokenAmount <= tokenLiquidity, "Insufficient token liquidity");
        
        ethLiquidity -= _ethAmount;
        tokenLiquidity -= _tokenAmount;
        
        payable(msg.sender).transfer(_ethAmount);
        require(loyalToken.transfer(msg.sender, _tokenAmount), "Token transfer failed");
        
        emit LiquidityRemoved(msg.sender, _ethAmount, _tokenAmount);
    }
    
    /**
     * @dev Update exchange rate (owner only)
     * @param _newRate New exchange rate
     */
    function updateExchangeRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be positive");
        exchangeRate = _newRate;
        emit ExchangeRateUpdated(_newRate);
    }
    
    /**
     * @dev Update fee percentage (owner only)
     * @param _newFee New fee percentage in basis points
     */
    function updateFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        feePercentage = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    /**
     * @dev Get current DEX status
     * @return ethBalance Current ETH liquidity
     * @return tokenBalance Current token liquidity
     * @return currentRate Current exchange rate
     * @return currentFee Current fee percentage
     */
    function getDEXStatus() external view returns (
        uint256 ethBalance,
        uint256 tokenBalance,
        uint256 currentRate,
        uint256 currentFee
    ) {
        return (ethLiquidity, tokenLiquidity, exchangeRate, feePercentage);
    }
    
    /**
     * @dev Calculate swap amounts
     * @param _inputAmount Input amount
     * @param _ethToToken Direction of swap
     * @return outputAmount Amount to receive
     * @return feeAmount Fee to be charged
     */
    function calculateSwap(uint256 _inputAmount, bool _ethToToken) 
        external 
        view 
        returns (uint256 outputAmount, uint256 feeAmount) 
    {
        if (_ethToToken) {
            // ETH to Token
            uint256 tokenAmount = (_inputAmount * exchangeRate) / 1e18;
            feeAmount = (tokenAmount * feePercentage) / 10000;
            outputAmount = tokenAmount - feeAmount;
        } else {
            // Token to ETH
            uint256 ethAmount = (_inputAmount * 1e18) / exchangeRate;
            feeAmount = (ethAmount * feePercentage) / 10000;
            outputAmount = ethAmount - feeAmount;
        }
    }
    
    /**
     * @dev Emergency withdrawal function (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 ethBalance = address(this).balance;
        uint256 tokenBalance = loyalToken.balanceOf(address(this));
        
        if (ethBalance > 0) {
            payable(owner()).transfer(ethBalance);
        }
        
        if (tokenBalance > 0) {
            loyalToken.transfer(owner(), tokenBalance);
        }
        
        ethLiquidity = 0;
        tokenLiquidity = 0;
    }
}
