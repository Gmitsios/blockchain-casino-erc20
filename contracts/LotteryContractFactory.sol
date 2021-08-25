pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LotteryContractAutoSettlement.sol";

contract LotteryContractFactory is Ownable {
  address[] public lottery_contracts;
  address public manager;
  ERC20Mintable public token;

  constructor(ERC20Mintable _token) {
    manager = msg.sender;
    token = _token;
  }

  function create_lottery(uint _stake, uint _settle_at) public onlyOwner {
    address new_lottery = address(new LotteryContractAutoSettlement(token, _stake, _settle_at));
    lottery_contracts.push(new_lottery);
  }

  function get_lotteries() public view returns (address[] memory) {
    return lottery_contracts;
  }
}