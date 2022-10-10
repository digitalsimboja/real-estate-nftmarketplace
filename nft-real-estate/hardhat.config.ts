import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-chai-matchers";

dotenv.config();


const config: HardhatUserConfig = {
  solidity:  "0.8.4",
  networks: {
    goerli: {
      url: process.env.QUICKNODE_HTTP_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY]: [],
    },
  },

}

export default config;