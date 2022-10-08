// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");


async function main() {
  const REGULATOR_ACCOUNT_ADDRESS = "0x19e8037e5E8390128DC3da1b2AF4F3fD6a7962Ba";

  // Get the contract factory to deply
  const EstateMarketplace = await ethers.getContractFactory("NFTRealEstateMarketplace");
  const estateMarketplace = await EstateMarketplace.deploy(REGULATOR_ACCOUNT_ADDRESS);

  await estateMarketplace.deployed();

  console.log("Estate Martkeplace Deployed Address:", estateMarketplace.address);

  const EstateNFT = await ethers.getContractFactory("EstateNFT");
  const estateNFT =  await EstateNFT.deploy(estateMarketplace.address);

  await estateNFT.deployed();

  console.log("EstateNFT Deployed Address: ", estateNFT.address);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
