var HDWalletProvider = require("truffle-hdwallet-provider");
//var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const infuraKey = "9a0a8568265140179c7aa9d49458592b";
const mnemonic = "income just length prefer leisure fly speed obtain sting shift paper panic";

module.exports = {
  networks: {
    develop: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:9545/", 0, 50);
      },
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
      gas: 47000000,
      accounts: 20,
      gasLimit: 21000000,
      defaultEtherBalance: 500
    },
  rinkeby: {
    provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
    network_id: 4, // rinkeby's id
    gas: 4500000, // rinkeby has a lower block limit than mainnet
    gasPrice: 10000000000
    },
   },
    
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};