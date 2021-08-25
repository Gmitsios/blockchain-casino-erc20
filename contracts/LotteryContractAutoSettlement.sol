pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";

// https://github.com/StephenGrider/EthereumCasts/blob/master/lottery/contracts/Lottery.sol
contract LotteryContractAutoSettlement {
    address[] public players;
    uint public stake;
    uint public settle_at;
    address public winner;
    ERC20Mintable public token;

    constructor(ERC20Mintable _token, uint _stake, uint _settle_at) {
        require(_stake > 0);
        require(_settle_at > 0);
        // require(address(_token) != address(0));
        stake = _stake;
        settle_at = _settle_at;
        token = _token;
    }

    function enter() payable public {
        require(token.transferFrom(msg.sender, address(this), stake));

        players.push(payable(msg.sender));

        if (players.length == settle_at) {
            pickWinner();
        }
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() private {
        require(players.length == settle_at);

        uint index = random() % players.length;
        token.transfer(players[index], token.balanceOf(address(this)));
        winner = players[index];
        players = new address payable[](0);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }
}