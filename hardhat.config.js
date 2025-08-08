// filepath: c:\Users\vedan\OneDrive\Desktop\hardhat starter\hardhat.config.js
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths:{
    sources:"./contracts",
    tests:"./test",
    cache:"./cache",
    artifacts:"./artifacts"
  },
  networks:{
    hardhat:{
      chainId:1337
    },
    sepolia:{
      url:"https://eth-sepolia.g.alchemy.com/v2/8M-A8S59VNodqtUAIom94hhtunRlqYHF",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    monad:{
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    "monad-testnet":{
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    polygon:{
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    optimism:{
      url: "https://mainnet.optimism.io",
      chainId: 10,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    arbitrum:{
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
};