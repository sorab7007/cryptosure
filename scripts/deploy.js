const hre = require("hardhat");

async function main() {
  console.log("📦 Starting deployment...");

  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");

  // Estimate gas
  const estimatedGas = await hre.ethers.provider.estimateGas(
    CampaignFactory.getDeployTransaction()
  );
  console.log("⛽ Estimated gas:", estimatedGas.toString());

  // Deploy the contract
  const campaignFactory = await CampaignFactory.deploy();
  console.log("🚀 Deploying... Waiting for confirmations...");

  await campaignFactory.deployed();

  console.log("✅ Deployed! Contract address:", campaignFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
