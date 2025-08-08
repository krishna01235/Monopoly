const { ethers, artifacts } = require("hardhat");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
    // Prefer Hardhat-provided signer (works for localhost and networks with configured accounts)
    let [deployer] = await ethers.getSigners();
    if (!deployer) {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey || privateKey.trim().length === 0) {
            throw new Error(
                "No signer available. Either configure accounts in hardhat.config.js or set PRIVATE_KEY in .env"
            );
        }
        const provider = ethers.provider;
        deployer = new ethers.Wallet(privateKey, provider);
    }

    // Get the contract factory connected with the deployer signer
    const ContractFactory = await ethers.getContractFactory("GetSet", deployer);

    // Deploy the contract
    const contract = await ContractFactory.deploy(/* constructor arguments if any */);

    // Wait for deployment to complete
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);

    // Save contract details for the frontend
    saveFrontendFiles(contract, "GetSet");
}

function saveFrontendFiles(contract, name) {
    const contractsDir = path.join(__dirname, "../src/contract_data/");
    const frontendContractsDir = path.join(
        __dirname,
        "../src/frontend/src/contract_data/"
    );

    // Ensure the directories exist
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }
    if (!fs.existsSync(frontendContractsDir)) {
        fs.mkdirSync(frontendContractsDir, { recursive: true });
    }

    // Save contract address
    const addressJson = JSON.stringify({ address: contract.target }, null, 2);
    fs.writeFileSync(path.join(contractsDir, `${name}-address.json`), addressJson);
    fs.writeFileSync(
        path.join(frontendContractsDir, `${name}-address.json`),
        addressJson
    );

    // Save contract ABI
    const contractArtifact = artifacts.readArtifactSync(name);
    const artifactJson = JSON.stringify(contractArtifact, null, 2);
    fs.writeFileSync(path.join(contractsDir, `${name}.json`), artifactJson);
    fs.writeFileSync(
        path.join(frontendContractsDir, `${name}.json`),
        artifactJson
    );

    // console.log(`Contract artifacts saved to ${contractsDir}`);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
