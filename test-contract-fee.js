const { ethers } = require('ethers');

// Contract address from the deployed contract
const CONTRACT_ADDRESS = '0xddfc46bB56eF5335c7f3d640CECc2A48a0cA7E94';

// Minimal ABI to get the entry fee
const ABI = [
  "function ENTRY_FEE() public view returns (uint256)",
  "function createGame(uint256 maxPlayers) public payable returns (uint256)"
];

async function checkContractFee() {
  try {
    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Create contract instance (read-only)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    // Get the entry fee
    const entryFee = await contract.ENTRY_FEE();
    console.log('Contract ENTRY_FEE:', ethers.formatEther(entryFee), 'MONAD');
    
    // Test different fee calculations
    const playerCount = 4;
    const calculatedFee = entryFee * BigInt(playerCount);
    console.log(`For ${playerCount} players, total fee should be:`, ethers.formatEther(calculatedFee), 'MONAD');
    
    return {
      entryFee: ethers.formatEther(entryFee),
      totalFee: ethers.formatEther(calculatedFee)
    };
  } catch (error) {
    console.error('Error checking contract fee:', error);
    throw error;
  }
}

// Run the check
checkContractFee()
  .then(result => {
    console.log('Contract fee check completed:', result);
  })
  .catch(error => {
    console.error('Failed to check contract fee:', error);
  }); 