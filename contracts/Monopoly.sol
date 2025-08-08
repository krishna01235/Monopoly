// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Monopoly {
    // Event for logging game creation
    event GameCreated(address indexed player, uint256 playerCount, uint256 totalFee);
    
    // Fee per player in wei (0.05 MONAD = 0.05 * 10^18 wei)
    uint256 public constant FEE_PER_PLAYER = 0.05 ether;
    
    // Owner of the contract
    address public owner;
    
    // Mapping to track game fees collected
    mapping(address => uint256) public gameFees;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Function to start a new game with specified number of players
    function startNewGame(uint256 playerCount) public payable {
        require(playerCount >= 2 && playerCount <= 8, "Player count must be between 2 and 8");
        require(msg.value == FEE_PER_PLAYER * playerCount, "Incorrect fee amount");
        
        // Calculate total fee
        uint256 totalFee = FEE_PER_PLAYER * playerCount;
        
        // Record the fee
        gameFees[msg.sender] += totalFee;
        
        // Emit event
        emit GameCreated(msg.sender, playerCount, totalFee);
    }
    
    // Function to withdraw collected fees (owner only)
    function withdrawFees() public {
        require(msg.sender == owner, "Only owner can withdraw fees");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Function to get the fee for a specific number of players
    function getGameFee(uint256 playerCount) public pure returns (uint256) {
        return FEE_PER_PLAYER * playerCount;
    }
    
    // Function to check if the sent amount is correct for the player count
    function isCorrectFee(uint256 playerCount, uint256 sentAmount) public pure returns (bool) {
        return sentAmount == FEE_PER_PLAYER * playerCount;
    }
    
    // Allow receiving plain Ether transfers
    receive() external payable {
        // This function allows the contract to receive ETH
    }
    
    // Optional fallback to handle unexpected function calls
    fallback() external payable {
        // This function handles unexpected calls
    }
}