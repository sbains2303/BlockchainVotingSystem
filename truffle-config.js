module.exports = {
  contracts_build_directory: './client/src/contracts',
  networks: {
    development: {
      host: "127.0.0.1",  // Localhost
      port: 7545,         // Ganache default port
      network_id: "*" // Your Ganache network ID
    },
    // other networks can be configured here
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19", // Specify the Solidity version
      // other compiler options can be set here
    }
  },

  // Truffle DB settings can be configured here if needed
  db: {
    enabled: false,
  }
};
