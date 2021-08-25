const Lottery = artifacts.require("LotteryContractAutoSettlement");
const Token = artifacts.require("ERC20Mintable");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: ".env"});

contract("Lottery Test", async (accounts) => {

  const [deployerAccount, someAccount, anotherAccount] = accounts;

  beforeEach(async () => {
    this.token = await Token.new(process.env.INITIAL_SUPPLY);
    this.myLottery = await Lottery.new(this.token.address, process.env.INITIAL_STAKE, 3);
  });

  it('has a token', async () => {
    let instance = this.myLottery;
    let token = this.token;

    expect(token.totalSupply()).to.eventually.be.a.bignumber.equal(new BN(process.env.INITIAL_SUPPLY));
    return expect(instance.token()).to.eventually.be.equal(token.address);
  });

  it('stake should be set', async () => {
    let instance = this.myLottery;
    return expect(instance.stake()).to.eventually.be.a.bignumber.equal(process.env.INITIAL_STAKE);
  });

  it('one can enter the lottery', async () => {
    let instance = this.myLottery;
    let token = this.token;

    await token.mint(someAccount, new BN(process.env.INITIAL_STAKE));    
    await token.approve(instance.address, new BN(process.env.INITIAL_STAKE), { from: someAccount });

    await instance.enter({ from: someAccount });
    expect(instance.getPlayers()).to.eventually.have.lengthOf(1);
    return expect(token.balanceOf(instance.address)).to.eventually.be.a.bignumber.equal(new BN(process.env.INITIAL_STAKE));
  });

  it('many ones can enter the lottery', async () => {
    let instance = this.myLottery;
    let token = this.token;

    await token.mint(someAccount, new BN(process.env.INITIAL_STAKE));    
    await token.approve(instance.address, new BN(process.env.INITIAL_STAKE), { from: someAccount });
    await token.mint(anotherAccount, new BN(process.env.INITIAL_STAKE));    
    await token.approve(instance.address, new BN(process.env.INITIAL_STAKE), { from: anotherAccount });

    await instance.enter({ from: someAccount });
    await instance.enter({ from: anotherAccount });

    var players = await instance.getPlayers();
    expect(players.length).to.be.equal(2);
    expect(players[0]).to.be.equal(someAccount);
    return expect(players[1]).to.be.equal(anotherAccount);
  });

  it('winner gets it all', async () => {
    let instance = this.myLottery;
    let token = this.token;

    await token.mint(someAccount, (new BN(process.env.INITIAL_STAKE)).mul(new BN(3)));    
    await token.approve(instance.address, (new BN(process.env.INITIAL_STAKE)).mul(new BN(3)), { from: someAccount });

    let balance0 = await token.balanceOf(someAccount);
    await instance.enter({ from: someAccount });    
    let balance1 = await token.balanceOf(someAccount);
    await instance.enter({ from: someAccount });
    await instance.enter({ from: someAccount });
    let balance2 = await token.balanceOf(someAccount);

    expect(balance0 == balance2);
    expect(balance1 > balance0);
    return expect(instance.getPlayers()).to.eventually.be.empty;
  });

});