import { ethers } from 'ethers';

const MONAD_CHAIN_ID_HEX = '0x279f'; // Monad Testnet chain ID in hex (10143)

// Function to ensure no blockchain transactions are triggered during game actions
export function ensureNoBlockchainTransactions(action) {
  console.log(`Game action "${action}" is local-only - no blockchain transactions will be triggered`);
  return true;
}

export async function isMetaMaskAvailable() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function connectWallet() {
  if (!(await isMetaMaskAvailable())) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  await ensureMonadNetwork();
  return accounts?.[0] ?? null;
}

export async function getCurrentAccount() {
  if (!(await isMetaMaskAvailable())) return null;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts?.[0] ?? null;
}

export function onAccountsChanged(callback) {
  if (typeof window === 'undefined' || !window.ethereum) return () => {};
  window.ethereum.on('accountsChanged', callback);
  return () => window.ethereum.removeListener('accountsChanged', callback);
}

export function onChainChanged(callback) {
  if (typeof window === 'undefined' || !window.ethereum) return () => {};
  window.ethereum.on('chainChanged', callback);
  return () => window.ethereum.removeListener('chainChanged', callback);
}

const MONAD_PARAMS = {
  chainId: MONAD_CHAIN_ID_HEX,
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

export async function ensureMonadNetwork() {
  if (!(await isMetaMaskAvailable())) return;
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (currentChainId?.toLowerCase() === MONAD_CHAIN_ID_HEX) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_PARAMS],
      });
    } else {
      throw err;
    }
  }
}

const OPTIMISM_CHAIN_ID_HEX = '0xa'; // Optimism chain ID in hex (10)

const OPTIMISM_PARAMS = {
  chainId: OPTIMISM_CHAIN_ID_HEX,
  chainName: 'Optimism',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.optimism.io'],
  blockExplorerUrls: ['https://optimistic.etherscan.io'],
};

export async function ensureOptimismNetwork() {
  if (!(await isMetaMaskAvailable())) return;
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (currentChainId?.toLowerCase() === OPTIMISM_CHAIN_ID_HEX) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: OPTIMISM_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [OPTIMISM_PARAMS],
      });
    } else {
      throw err;
    }
  }
}

const POLYGON_CHAIN_ID_HEX = '0x89'; // Polygon chain ID in hex (137)

const POLYGON_PARAMS = {
  chainId: POLYGON_CHAIN_ID_HEX,
  chainName: 'Polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com'],
};

export async function ensurePolygonNetwork() {
  if (!(await isMetaMaskAvailable())) return;
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (currentChainId?.toLowerCase() === POLYGON_CHAIN_ID_HEX) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [POLYGON_PARAMS],
      });
    } else {
      throw err;
    }
  }
}
