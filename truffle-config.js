const HDWalletProvider = require("@truffle/hdwallet-provider");

const infura_api_key = process.env.INFURA_API_KEY;
const fs = require("fs");
const secret = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    mainnet: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: secret
        },
        providerOrUrl: `https://mainnet.infura.io/v3/${infura_api_key}`
      }),
      network_id: 1,
      confirmations: 0,
      gas: 700000,
      gasPrice: 100000000000,
      timeoutBlocks: 200,
      skipDryRun: false
    },
    rinkeby: {
      provider: () => new HDWalletProvider({
        privateKeys: [secret],
        providerOrUrl: `https://rinkeby.infura.io/v3/${infura_api_key}`
      }),
      network_id: 4,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "0.8.7",
      // docker: true,
      settings: {
       optimizer: {
         enabled: true,
         runs: 1000
        },
      //  evmVersion: "byzantium"
      }
    }
  }
};
