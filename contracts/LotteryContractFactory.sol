pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "./LotteryContractAutoSettlement.sol";

contract LotteryContractFactory is Ownable {
  address[] public lottery_contracts;
  address public manager;
  ERC20Mintable public token;

  LinkTokenInterface immutable internal LINK;
  address vrfCoordinator;
  address linkAddress;
  bytes32 keyHash;
  uint256 fee;
  uint256 contractLinkFunding = 0.3 * 10 ** 18;

  constructor(
    ERC20Mintable _token,
    address _vrfCoordinator,
    address _linkAddress,
    bytes32 _keyHash,
    uint256 _fee
    )
  {
    manager = msg.sender;
    token = _token;

    vrfCoordinator = _vrfCoordinator;
    linkAddress = _linkAddress;
    keyHash = _keyHash;
    fee = _fee;
    LINK = LinkTokenInterface(_linkAddress);
  }

  function create_lottery(uint _stake, uint _settle_at) public onlyOwner {
    require(LINK.balanceOf(address(this)) >= contractLinkFunding, "Not enough LINK to fund the lottery !!");
    
    address newLottery = address(new LotteryContractAutoSettlement(token, _stake, _settle_at, vrfCoordinator, linkAddress, keyHash, fee));
    LINK.transfer(newLottery, contractLinkFunding);
    lottery_contracts.push(newLottery);
  }

  function get_lotteries() public view returns (address[] memory) {
    return lottery_contracts;
  }
}