// scripts/checkWallet.js
const hre = require("hardhat");

async function main() {
  const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
  const wallet = new hre.ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
  console.log("Your wallet address is:", wallet.address);

  const balance = await wallet.getBalance();
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
