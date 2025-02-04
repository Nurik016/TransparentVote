require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "hardhat", // Используем Hardhat Network
  networks: {
    hardhat: {
      chainId: 31337, // chainId для Hardhat Network
    },
    ganache: {
      url: "http://127.0.0.1:7545", // RPC-сервер Ganache
      accounts: [`${PRIVATE_KEY}`],
      chainId: 1337,
    }
  },
};
