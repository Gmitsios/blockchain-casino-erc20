var MyERC20MintableToken = artifacts.require("ERC20Mintable.sol");

require("dotenv").config({path: "../.env"});

module.exports = function(deployer) {
  deployer.deploy(MyERC20MintableToken, process.env.INITIAL_SUPPLY);
};
