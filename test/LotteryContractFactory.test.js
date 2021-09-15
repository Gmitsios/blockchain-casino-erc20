const Lottery = artifacts.require("LotteryContractAutoSettlement");
const LotteryFactory = artifacts.require("LotteryContractFactory");
const Token = artifacts.require("ERC20Mintable");
const Ierc20 = artifacts.require("IERC20");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Lottery Factory Test", async (accounts) => {

  const [deployerAccount, someAccount, anotherAccount] = accounts;

  beforeEach(async () => {
    this.token = await Token.new(process.env.INITIAL_SUPPLY);
    this.myLotteryFactory = await LotteryFactory.new(
      this.token.address,
      process.env.VRF_COORDINATOR,
      process.env.LINK_ADDRESS,
      process.env.KEYHASH,
      web3.utils.toWei(process.env.FEE, "ether")
    );
  });

  it('has a token', async () => {
    let token = this.token;
    let instance = this.myLotteryFactory;
    
    expect(token.totalSupply()).to.eventually.be.a.bignumber.equal(new BN(process.env.INITIAL_SUPPLY));
    return expect(instance.token()).to.eventually.be.equal(token.address);
  });

  it('only owner is allowed to create lotteries', async () => {
    let instance = this.myLotteryFactory;
    let link = await Ierc20.at(process.env.LINK_ADDRESS);
    await link.transfer(instance.address, web3.utils.toWei("1", "ether"), { from: deployerAccount });

    return expect(instance.create_lottery(10000, 5, { from: someAccount })).to.be.rejected;
  });

  it('creates a lottery', async () => {
    let instance = this.myLotteryFactory;
    let link = await Ierc20.at(process.env.LINK_ADDRESS);
    await link.transfer(instance.address, web3.utils.toWei("1", "ether"), { from: deployerAccount });

    await instance.create_lottery(10000, 5);
    return expect(instance.get_lotteries()).to.eventually.have.lengthOf(1);
  });

  it('creates multiple lotteries', async () => {
    let instance = this.myLotteryFactory;
    let link = await Ierc20.at(process.env.LINK_ADDRESS);
    await link.transfer(instance.address, web3.utils.toWei("1", "ether"), { from: deployerAccount });

    await instance.create_lottery(10000, 5);
    await instance.create_lottery(100000, 5);

    return expect(instance.get_lotteries()).to.eventually.have.lengthOf(2);
  });

  it('lotteries work fine', async () => {
    let instance = this.myLotteryFactory;
    let link = await Ierc20.at(process.env.LINK_ADDRESS);
    await link.transfer(instance.address, web3.utils.toWei("1", "ether"), { from: deployerAccount });

    await instance.create_lottery(10000, 5);
    const LotteryAddresses = await instance.get_lotteries();
    const lottery = await Lottery.at(LotteryAddresses[0]);

    return expect(lottery.stake()).to.eventually.be.a.bignumber.equal('10000');
  });

});