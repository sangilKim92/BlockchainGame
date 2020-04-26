const path = require("path");
var HDWalletProvider= require("truffle-hdwallet-provider");
const memonic="gun diet horn drip champion invest honey envelope park clock arch dust";
const infura_api_key="77d967562c074b70b4033af48cc27e5f";


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host:"127.0.0.1",port: 8545, network_id:"5777"
    },
    ropsten : {
      provider:()=>new HDWalletProvider(memonic,"https://ropsten.infura.io/v3/77d967562c074b70b4033af48cc27e5f" ),
      gas:6000000,
      gasPrice:20000000000,
      network_id:'3'
    }
  }
};
