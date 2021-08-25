var LotteryContractFactory = artifacts.require("LotteryContractFactory.sol");

const MyToken = artifacts.require("ERC20Mintable");
let token = MyToken.address;

module.exports = function(deployer) {
  deployer.deploy(LotteryContractFactory, token);
};
