require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "ganache",
  networks: {
    hardhat: {},
    ganache: {
      url: "http://127.0.0.1:7545", // RPC-сервер Ganache
      accounts: [`${PRIVATE_KEY}`],
      chainId: 1337, // Стандартный chainId для Ganache
    }
  },
};
