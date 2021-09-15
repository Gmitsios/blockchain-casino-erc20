import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import TokenContract from "./contracts/ERC20Mintable.json";
import LotteryContract from "./contracts/LotteryContractAutoSettlement.json";
import LotteryFactory from "./contracts/LotteryContractFactory.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, sumInPlay: [], lastWinner: [], players: [], stake: [], num_players: [] };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      console.log(LotteryFactory.networks[this.networkId].address);
      this.instance = new this.web3.eth.Contract(
        LotteryFactory.abi,
        LotteryFactory.networks[this.networkId] && LotteryFactory.networks[this.networkId].address,
      );

      this.getLotteries();
      this.getTokenInfo();
      this.getTokenBalance();
      this.instanceManager = await this.instance.methods.manager().call();

      this.uuid = require("uuid");

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true, newLotteryStake: '', newLotteryMembers: '' });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  concatArr = (arr, input_hash) => {
    // input_hash should have key 'address' like: {address: *, *: *}
    // array should be in the form: [ {address: *, *: *}, {address: *, *: *}, ... ]

    let new_arr = []
    let found = false;
    arr.forEach(function (item) {
      if(item["address"] === input_hash["address"]) {
        new_arr.push(input_hash);
        found = true;
      } else {
        new_arr.push(item);
      }
    });

    if(found) {
      return new_arr;
    }

    return [...new_arr, input_hash];
  };

  getToken = async () => {
    return new this.web3.eth.Contract(
      TokenContract.abi,
      TokenContract.networks[this.networkId] && TokenContract.networks[this.networkId].address,
    );
  };

  getTokenInfo =  async () => {
    let token = await this.getToken();
    let name = await token.methods.name().call();
    let symbol = await token.methods.symbol().call();
    
    this.setState({ token_name: name, token_symbol: symbol });
  };

  getTokenBalance = async () => {
    let token = await this.getToken();
    let my_balance = await token.methods.balanceOf(this.accounts[0]).call();

    this.setState({ balance: my_balance })
  };

  getLotteries = async () => {
    let lotteries = await this.instance.methods.get_lotteries().call();
    this.setState({ lotteries: lotteries });

    lotteries.forEach((lottery) => {
      this.getPlayers(lottery);
      this.getSumInPLay(lottery);
      this.getLastWinner(lottery);
      this.getLotteryInfo(lottery);
    })
  };

  createNewLottery = async (e) => {
    e.preventDefault();

    let stake = this.web3.utils.toWei(this.state.newLotteryStake, "wei");
    let members = parseInt(this.state.newLotteryMembers);
    await this.instance.methods.create_lottery(stake, members).send({from: this.web3.currentProvider.selectedAddress});
    this.getLotteries();
  };

  getLottery = async (lottery_address) => {
    return new this.web3.eth.Contract(LotteryContract.abi, lottery_address);
  };

  enterLottery = async (lottery_address) => {
    let lottery = await this.getLottery(lottery_address);
    let token = await this.getToken();
    let value = await lottery.methods.stake().call();
    await token.methods.approve(lottery_address, value).send({ from: this.accounts[0] });
    await lottery.methods.enter().send({ from: this.accounts[0] });
    this.getPlayers(lottery_address);
    this.getSumInPLay(lottery_address);
    this.getLastWinner(lottery_address);
    this.getTokenBalance();
  };

  getPlayers = async (lottery_address) => {
    let lottery = await this.getLottery(lottery_address);
    let players = await lottery.methods.getPlayers().call();
    this.setState({ players: this.concatArr(this.state.players, {
      address: lottery_address,
      players: players
      })
    });
  };

  getSumInPLay = async (lottery_address) => {
    let token = await this.getToken();
    let sum_in_play = await token.methods.balanceOf(lottery_address).call();
    this.setState({ sumInPlay: this.concatArr(this.state.sumInPlay, {
      address: lottery_address,
      sumInPlay: sum_in_play
      })
    });
  };

  getLastWinner = async (lottery_address) => {
    let lottery = await this.getLottery(lottery_address);
    let last_winner = await lottery.methods.winner().call();

    this.setState({ lastWinner: this.concatArr(this.state.lastWinner, {
      address: lottery_address,
      lastWinner: last_winner
    })});
  };

  getLotteryInfo = async (lottery_address) => {
    let lottery = await this.getLottery(lottery_address);
    let stake = await lottery.methods.stake().call();    
    let num_players = await lottery.methods.settleAt().call();

    this.setState({
      stake: this.concatArr(this.state.stake, {
        address: lottery_address,
        stake: stake
      }),
      num_players: this.concatArr(this.state.num_players, {
        address: lottery_address,
        num_players: num_players
      })
    });
  };

  handleNewLotteryStake = (e) => {
    this.setState({newLotteryStake: e.target.value});
  };

  handleNewLotteryMembers = (e) => {
    this.setState({newLotteryMembers: e.target.value});
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Container className="App">

        {this.accounts[0] === this.instanceManager &&
          <Form>
          <Row>
            <Col>
              <Form.Control placeholder="Stake in Wei" value={this.state.newLotteryStake} onChange={this.handleNewLotteryStake} />
            </Col>
            <Col>
              <Form.Control placeholder="Number of seats" value={this.state.newLotteryMembers} onChange={this.handleNewLotteryMembers} />
            </Col>
            <Col>
              <Button variant="primary" type="submit" onClick={this.createNewLottery}>Create Lottery</Button>
            </Col>
          </Row>
        </Form>
        }

        <h1>Welcome to the Blockchain Casino v0.2!</h1>
        <p>Where decentralized dreams come true.</p>
        <h2>Lottery Smart Contract Casino with ERC20 Token</h2>
        <h3>Balance: {this.state.balance} {this.state.token_name}s ({this.state.token_symbol})</h3>
        <h3>There are {this.state.lotteries.length} Lotteries to choose from!</h3>

        <Jumbotron>

        {
          this.state.lotteries.map((lottery) => (
            <Row key={lottery} className="border mb-5">
              <p>Lottery Address - {lottery}</p>

              <Row>
                <Col>
                  <p>Stake - {
                    this.state.stake.map((item) => {
                      if(item["address"] === lottery) {
                        return (item["stake"]);
                      } else {return ''};
                    })
                    }</p>
                </Col>
                <Col>
                  <p>Number of seats - {
                    this.state.num_players.map((item) => {
                      if(item["address"] === lottery) {
                        return (item["num_players"]);
                      } else {return ''};
                    })
                    }</p>
                </Col>
              </Row>

              <Button variant="secondary" onClick={() => this.enterLottery(lottery)}>Enter Lottery</Button>
              <p>Number of Entries: {
                this.state.players.map((item) => {
                  if(item["address"] === lottery) {
                    return (item["players"].length);
                  } else {return ''};
                  })
                  }</p>

              <Table striped bordered responsive align="center">
                <thead>
                  <tr>
                    <th>Addresses in Play</th>
                  </tr>
                </thead>
                <tbody>
                {
                this.state.players.map((item) => {
                  if(item["address"] === lottery) {
                    return (
                      item["players"].map((player) => (
                        <tr key={this.uuid.v4()}>
                          <td>{player}</td>
                          <td />
                        </tr>
                      ))
                    );
                  } else return <tr key={this.uuid.v4()}></tr>
                })
              }
                </tbody>
              </Table>

              <p>Sum Wei in play: {
                this.state.sumInPlay.map((item) => {
                  if(item["address"] === lottery) {
                    return (item["sumInPlay"]);
                  } else {return ''};
                })
                }</p>
              <p>Last Winner: {
                this.state.lastWinner.map((item) => {
                  if(item["address"] === lottery) {
                    return (item["lastWinner"]);
                  } else {return ''};
                })
                }</p>
            
            </Row>

          ))
        }

        </Jumbotron>

      </Container>

    );
  }
}

export default App;
