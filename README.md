# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`


To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server
### Server initializes the first two flights and funds the first flight, also registers the oracles

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder

## Dapp - usage 
Put a passenger wallet address, choose a flight and buy insurance by pressing the "Buy Insurance" button
Check the insurance amount of that same passenger by clicking the "Check Insurance" button

Click the "Check Flight Status " Button to check the flight status - this triggers the oracles to submit their responses to the contract. And if there are at least 3 oracles submitting the late airlines, it will automatically trigger the creditInsurees method to credit all the passengers who have bought insurance for that flight

Now click the "Check Surety" Button to see that it has the surety credited for that passenger
Click on "Withdraw" button to get that credit transfered to the passenger's wallet

You can check to see if the insurance and surety have been put back to 0 by clicking those buttons.

## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)