var LotteryContractAutoSettlement = artifacts.require("LotteryContractAutoSettlement.sol");

const MyToken = artifacts.require("ERC20Mintable");
let token = MyToken.address;

require("dotenv").config({path: "../.env"});

module.exports = function(deployer) {
  deployer.deploy(LotteryContractAutoSettlement, token, process.env.INITIAL_STAKE, 2);
};
