# blockchain-casino-erc20
The **Blockchain Casino ERC-20 Edition** is a smart contract developed in Solidity with truffle and React.
It's an extension of the [Blockchain Casino](https://github.com/Gmitsios/blockchain-casino) that accepts entries in native currency of [ERC-20 LOTTO Token](https://github.com/Gmitsios/mintable_token).

##### Rules:
  - Currency is LOTTO Token
  - Owner can create any number of [Blockchain Lotteries](https://github.com/Gmitsios/blockchain-lottery)
  - Any account can enter any Lottery
  - The winner is picked randomly after all seats are taken and the Lottery resets
  - Enjoy Responsibly!

**Randomness is provided by [ChainLink VRF](https://docs.chain.link/docs/chainlink-vrf/)**

![](https://github.com/Gmitsios/blockchain-casino-erc20/blob/main/screenshot.png)

### Dependencies:

- install [nodejs](https://nodejs.org/en/) with/and npm
-  `npm i -g truffle`
- install [ganache](https://www.trufflesuite.com/ganache)

Replace the '**MNEMONIC**' in `env.example` and rename it to `.env`

For **Metamask**:
- Add the [extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)
- Generate accounts with the same '**MNEMONIC**'
- Add a new network and connect it to Ganache (port: 7545)

## Migrate on Blockchain:
    
    npm install
    truffle migrate --network ganache_local

### To Test the Migration

    truffle test --network ganache_local

## Run the Front-End React App:

    cd client
    npm install
    npm run start