const { ethers } = require('ethers');

// Contract address from the deployed contract
const CONTRACT_ADDRESS = '0xddfc46bB56eF5335c7f3d640CECc2A48a0cA7E94';

// Minimal ABI
const ABI = [
  "function ENTRY_FEE() public view returns (uint256)",
  "function createGame(uint256 maxPlayers) public payable returns (uint256)"
];

async function testFeeValidation() {
  try {
    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Create contract instance (read-only)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    // Get the entry fee
    const entryFee = await contract.ENTRY_FEE();
    console.log('Contract ENTRY_FEE:', ethers.formatEther(entryFee), 'MONAD');
    
    // Test different scenarios
    const maxPlayers = 4;
    
    // Scenario 1: Fee for maxPlayers slots
    const feeForMaxPlayers = entryFee * BigInt(maxPlayers);
    console.log(`Fee for ${maxPlayers} max players:`, ethers.formatEther(feeForMaxPlayers), 'MONAD');
    
    // Scenario 2: Fee for current players only
    const currentPlayers = 2;
    const feeForCurrentPlayers = entryFee * BigInt(currentPlayers);
    console.log(`Fee for ${currentPlayers} current players:`, ethers.formatEther(feeForCurrentPlayers), 'MONAD');
    
    // Scenario 3: Single entry fee
    console.log(`Single entry fee:`, ethers.formatEther(entryFee), 'MONAD');
    
    return {
      entryFee: ethers.formatEther(entryFee),
      feeForMaxPlayers: ethers.formatEther(feeForMaxPlayers),
      feeForCurrentPlayers: ethers.formatEther(feeForCurrentPlayers)
    };
  } catch (error) {
    console.error('Error testing fee validation:', error);
    throw error;
  }
}

// Run the test
testFeeValidation()
  .then(result => {
    console.log('Fee validation test completed:', result);
  })
  .catch(error => {
    console.error('Failed to test fee validation:', error);
  }); 