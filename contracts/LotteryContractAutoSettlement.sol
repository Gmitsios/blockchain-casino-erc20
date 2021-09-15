pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ERC20Mintable.sol";

contract LotteryContractAutoSettlement is VRFConsumerBase {
    using SafeMath for uint256;

    address[] public players;
    uint public stake;
    uint public settleAt;
    address public winner;
    bool canEnter;
    ERC20Mintable public token;

    bytes32 internal keyHash;
    uint256 internal fee;

    constructor(
        ERC20Mintable _token,
        uint _stake,
        uint _settleAt,
        address _vrfCoordinator,
        address _linkAddress,
        bytes32 _keyHash,
        uint256 _fee
        )
        VRFConsumerBase(_vrfCoordinator, _linkAddress)
    {
        require(_stake > 0);
        require(_settleAt > 0);
        // require(address(_token) != address(0));

        // set up vars for randomness
        keyHash = _keyHash;
        fee = _fee;

        stake = _stake;
        settleAt = _settleAt;
        token = _token;
        canEnter = true;
    }

    function enter() payable public {
        require(canEnter, "Lottery is picking a winner, please wait...");
        require(token.transferFrom(msg.sender, address(this), stake));

        players.push(payable(msg.sender));

        if (players.length == settleAt) {
            require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK to fulfill randomness !!");
            canEnter = false;
            requestRandomness(keyHash, fee);
        }
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 randNumber = randomness.mod(players.length);
        pickWinner(randNumber);
    }

    function pickWinner(uint256 winnerIndex) private {
        require(players.length == settleAt);

        token.transfer(players[winnerIndex], token.balanceOf(address(this)));
        winner = players[winnerIndex];
        players = new address payable[](0);
        canEnter = true;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }
}