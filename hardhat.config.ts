require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
   solidity: "0.8.11",
   defaultNetwork: "ganache",
   networks: {
      hardhat: {}, // локальная сеть Hardhat
      ganache: {
         url: "http://127.0.0.1:7545", // RPC URL Ganache
         accounts: ["0x13341ca892d349c2b401479f842aadff7e92fd376c3b316ef063445fc46181ae"], // Приватный ключ
      }
   },
};
