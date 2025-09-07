import { ethers } from 'ethers';
import monopolyAddress from '../contract_data/Monopoly-address.json';
import monopolyArtifact from '../contract_data/Monopoly.json';

// Load contract artifacts (bundled by Vite)
let MONOPOLY_ABI = monopolyArtifact?.abi || null;
let MONOPOLY_CONTRACT_ADDRESS = monopolyAddress?.address || null;

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
  
  // Ensure artifacts are present
  if (!MONOPOLY_CONTRACT_ADDRESS || !MONOPOLY_ABI) {
    throw new Error('Contract artifacts not available');
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
    
    // Detect contract API by attempting view calls
    let isNewApi = false;
    let totalFee;
    let feePerPlayer;

    try {
      const computedFee = await contract.getGameFee(playerCount);
      totalFee = computedFee;
      isNewApi = true;
      console.log(`Detected new API. Total fee for ${playerCount} players: ${ethers.formatEther(totalFee)} MONAD`);
    } catch (_) {
      // Fallback: old contract path using ENTRY_FEE
      try {
        feePerPlayer = await contract.ENTRY_FEE();
        console.log(`Detected old API. ENTRY_FEE: ${ethers.formatEther(feePerPlayer)} MONAD`);
      } catch (_) {
        feePerPlayer = ethers.parseEther("0.05");
        console.log(`Using fallback entry fee: ${ethers.formatEther(feePerPlayer)} MONAD`);
      }
    }

    if (isNewApi) {
      const tx = await contract.startNewGame(playerCount, { value: totalFee });
      const receipt = await tx.wait();
      return { success: true, transactionHash: receipt.hash, fee: ethers.formatEther(totalFee) };
    }

    // Old API flow: createGame expects a single entry fee value
    const maxPlayers = playerCount;
    const tx = await contract.createGame(maxPlayers, { value: feePerPlayer });
    const receipt = await tx.wait();
    return { success: true, transactionHash: receipt.hash, fee: ethers.formatEther(feePerPlayer) };
  } catch (error) {
    console.error('Error starting new game:', error);
    throw error;
  }
}

export async function getGameFee(playerCount) {
  try {
    const contract = await getMonopolyContract();
    try {
      const fee = await contract.getGameFee(playerCount);
      return ethers.formatEther(fee);
    } catch (_) {
      try {
        const entryFee = await contract.ENTRY_FEE();
        const totalFee = entryFee * BigInt(playerCount);
        return ethers.formatEther(totalFee);
      } catch (_) {
        const feePerPlayer = ethers.parseEther("0.05");
        const totalFee = feePerPlayer * BigInt(playerCount);
        return ethers.formatEther(totalFee);
      }
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
    try {
      const isCorrect = await contract.isCorrectFee(playerCount, sentAmount);
      return isCorrect;
    } catch (_) {
      // Old API: compute locally using ENTRY_FEE
      let entryFee;
      try {
        entryFee = await contract.ENTRY_FEE();
      } catch (_) {
        entryFee = ethers.parseEther("0.05");
      }
      const expected = entryFee * BigInt(playerCount);
      return expected === sentAmount;
    }
  } catch (error) {
    console.error('Error checking fee:', error);
    throw error;
  }
}

export async function getUserGameFees(userAddress) {
  try {
    const contract = await getMonopolyContract();
    try {
      const fees = await contract.gameFees(userAddress);
      return ethers.formatEther(fees);
    } catch (_) {
      // Old API likely does not track this mapping
      return '0.0';
    }
  } catch (error) {
    console.error('Error getting user game fees:', error);
    throw error;
  }
} 