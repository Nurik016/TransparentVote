require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337, // Hardhat Network
    },
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat Node
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
      chainId: 31337,
    },
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
      chainId: 1337,
    }
  },
};
