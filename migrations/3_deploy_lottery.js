var LotteryContractAutoSettlement = artifacts.require("LotteryContractAutoSettlement.sol");

const MyToken = artifacts.require("ERC20Mintable");
let token = MyToken.address;

require("dotenv").config({path: "../.env"});

module.exports = function(deployer) {
  deployer.deploy(
    LotteryContractAutoSettlement,
    token,
    process.env.INITIAL_STAKE,
    2,
    process.env.VRF_COORDINATOR,
    process.env.LINK_ADDRESS,
    process.env.KEYHASH,
    web3.utils.toWei(process.env.FEE, "ether")
  );
};
