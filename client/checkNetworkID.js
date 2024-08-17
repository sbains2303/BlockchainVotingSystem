let { Web3 } = require("web3");

let provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

let web3 = new Web3(provider);

// Get the network ID
web3.eth.net.getId()
  .then(networkId => {
    console.log('Network ID:', networkId);
  })
  .catch(error => {
    console.error('Error getting network ID:', error);
  });
