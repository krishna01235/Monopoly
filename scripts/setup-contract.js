const fs = require("fs");
const path = require("path");

// Function to read contract address from deployment
function getContractAddress() {
  try {
    const addressPath = path.join(__dirname, "../src/contract_data/Monopoly-address.json");
    if (fs.existsSync(addressPath)) {
      const addressData = JSON.parse(fs.readFileSync(addressPath, "utf8"));
      return addressData.address;
    }
  } catch (error) {
    console.error("Error reading contract address:", error);
  }
  return null;
}

// Function to update frontend contract address
function updateFrontendContractAddress(address) {
  try {
    const frontendAddressPath = path.join(__dirname, "../src/frontend/src/contract_data/Monopoly-address.json");
    const addressData = { address: address };
    
    // Ensure directory exists
    const dir = path.dirname(frontendAddressPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(frontendAddressPath, JSON.stringify(addressData, null, 2));
    console.log(`✅ Contract address updated in frontend: ${address}`);
  } catch (error) {
    console.error("Error updating frontend contract address:", error);
  }
}

// Function to copy contract ABI to frontend
function copyContractABI() {
  try {
    const sourceABIPath = path.join(__dirname, "../src/contract_data/Monopoly.json");
    const targetABIPath = path.join(__dirname, "../src/frontend/src/contract_data/Monopoly.json");
    
    if (fs.existsSync(sourceABIPath)) {
      // Ensure directory exists
      const dir = path.dirname(targetABIPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.copyFileSync(sourceABIPath, targetABIPath);
      console.log("✅ Contract ABI copied to frontend");
    } else {
      console.log("⚠️  Contract ABI not found. Please compile the contract first.");
    }
  } catch (error) {
    console.error("Error copying contract ABI:", error);
  }
}

// Main function
function main() {
  console.log("🔧 Setting up Monopoly contract for frontend...");
  
  const contractAddress = getContractAddress();
  
  if (contractAddress) {
    console.log(`📋 Contract address: ${contractAddress}`);
    updateFrontendContractAddress(contractAddress);
    copyContractABI();
    console.log("✅ Setup complete! The frontend is now configured to use the deployed contract.");
  } else {
    console.log("❌ Contract address not found. Please deploy the contract first:");
    console.log("   npm run deploy:monopoly");
  }
}

// Run the setup
main(); 