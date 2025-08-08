import { ethers } from 'ethers';

// Load contract artifacts
let MONOPOLY_ABI = null;
let MONOPOLY_CONTRACT_ADDRESS = null;

// Function to load contract artifacts
async function loadContractArtifacts() {
  try {
    // Load contract address
    const addressResponse = await fetch('/src/contract_data/Monopoly-address.json');
    const addressData = await addressResponse.json();
    MONOPOLY_CONTRACT_ADDRESS = addressData.address;
    
    // Load contract ABI
    const abiResponse = await fetch('/src/contract_data/Monopoly.json');
    const abiData = await abiResponse.json();
    MONOPOLY_ABI = abiData.abi;
    
    console.log('Monopoly contract artifacts loaded successfully');
  } catch (error) {
    console.error('Error loading contract artifacts:', error);
    throw new Error('Failed to load contract artifacts. Please ensure the contract is deployed.');
  }
}

export async function setContractAddress(address) {
  MONOPOLY_CONTRACT_ADDRESS = address;
}

export async function getContractAddress() {
  return MONOPOLY_CONTRACT_ADDRESS;
}

export async function getMonopolyContract() {
  if (!window.ethereum) {
    throw new Error('MetaMask not available');
  }
  
  // Load contract artifacts if not already loaded
  if (!MONOPOLY_CONTRACT_ADDRESS || !MONOPOLY_ABI) {
    await loadContractArtifacts();
  }
  
  if (!MONOPOLY_CONTRACT_ADDRESS) {
    throw new Error('Contract address not set');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(MONOPOLY_CONTRACT_ADDRESS, MONOPOLY_ABI, signer);
}

export async function startNewGame(playerCount) {
  try {
    const contract = await getMonopolyContract();
    
    // Get the actual entry fee from the contract
    let feePerPlayer;
    if (contract.ENTRY_FEE) {
      feePerPlayer = await contract.ENTRY_FEE();
      console.log(`Contract entry fee: ${ethers.formatEther(feePerPlayer)} MONAD`);
    } else {
      // Fallback to 0.05 MONAD if ENTRY_FEE not available
      feePerPlayer = ethers.parseEther("0.05");
      console.log(`Using fallback entry fee: ${ethers.formatEther(feePerPlayer)} MONAD`);
    }
    
    const totalFee = feePerPlayer * BigInt(playerCount);
    
    console.log(`Starting new game with ${playerCount} players. Fee: ${ethers.formatEther(totalFee)} MONAD`);
    
    // Check if the contract has the startNewGame function
    if (contract.startNewGame) {
      // Call the startNewGame function (our new contract)
      const tx = await contract.startNewGame(playerCount, { value: totalFee });
      const receipt = await tx.wait();
      
      console.log('Game started successfully! Transaction hash:', receipt.hash);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        fee: ethers.formatEther(totalFee)
      };
    } else if (contract.createGame) {
      // Use the existing createGame function (current contract)
      // The createGame function expects maxPlayers, not current player count
      const maxPlayers = playerCount; // Use current player count as max players
      
      // Try sending just the single entry fee (0.05 MONAD)
      console.log(`Sending single entry fee: ${ethers.formatEther(feePerPlayer)} MONAD`);
      
      const tx = await contract.createGame(maxPlayers, { value: feePerPlayer });
      const receipt = await tx.wait();
      
      console.log('Game created successfully! Transaction hash:', receipt.hash);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        fee: ethers.formatEther(feePerPlayer)
      };
    } else {
      throw new Error('Contract does not have startNewGame or createGame function. Please deploy the correct contract.');
    }
  } catch (error) {
    console.error('Error starting new game:', error);
    throw error;
  }
}

export async function getGameFee(playerCount) {
  try {
    const contract = await getMonopolyContract();
    
    // Check if the contract has the getGameFee function
    if (contract.getGameFee) {
      const fee = await contract.getGameFee(playerCount);
      return ethers.formatEther(fee);
    } else if (contract.ENTRY_FEE) {
      // Use the ENTRY_FEE constant from the existing contract
      const entryFee = await contract.ENTRY_FEE();
      const totalFee = entryFee * BigInt(playerCount);
      return ethers.formatEther(totalFee);
    } else {
      // Fallback to hardcoded calculation
      const feePerPlayer = ethers.parseEther("0.05");
      const totalFee = feePerPlayer * BigInt(playerCount);
      return ethers.formatEther(totalFee);
    }
  } catch (error) {
    console.error('Error getting game fee:', error);
    // Fallback to hardcoded calculation
    const feePerPlayer = ethers.parseEther("0.05");
    const totalFee = feePerPlayer * BigInt(playerCount);
    return ethers.formatEther(totalFee);
  }
}

export async function checkCorrectFee(playerCount, sentAmount) {
  try {
    const contract = await getMonopolyContract();
    const isCorrect = await contract.isCorrectFee(playerCount, sentAmount);
    return isCorrect;
  } catch (error) {
    console.error('Error checking fee:', error);
    throw error;
  }
}

export async function getUserGameFees(userAddress) {
  try {
    const contract = await getMonopolyContract();
    const fees = await contract.gameFees(userAddress);
    return ethers.formatEther(fees);
  } catch (error) {
    console.error('Error getting user game fees:', error);
    throw error;
  }
} 