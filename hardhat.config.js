import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.24",
  networks: {
    xlayerTestnet: {
      url: process.env.RPC_URL || "https://xlayertestrpc.okx.com",
      chainId: 1952,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
