var LotteryContractFactory = artifacts.require("LotteryContractFactory.sol");

const MyToken = artifacts.require("ERC20Mintable");
let token = MyToken.address;

module.exports = function(deployer) {
  deployer.deploy(
    LotteryContractFactory,
    token,
    process.env.VRF_COORDINATOR,
    process.env.LINK_ADDRESS,
    process.env.KEYHASH,
    web3.utils.toWei(process.env.FEE, "ether")
  );
};
