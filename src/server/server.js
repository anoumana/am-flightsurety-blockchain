import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
//let accts = '';
var registeredOracles = new Map(); // store address and registered oracle
//let fee = 0;
async function registerOracles() {
  
  try {
    let registrationFee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
    console.log("reg fee: " + registrationFee);
  } catch (e) {
    console.log("reg fee error :" + e);
  }
  try {
    let oracleAccounts = await web3.eth.getAccounts();
    console.log(oracleAccounts);
  } catch (err) {
    console.log("accounts error :" + err);
  }

  oracleAccounts.forEach(async account => {
    try { 
    let r = await flightSuretyApp.methods.registerOracle().send({
        "from": account,
        "value": fee,
        "gas": 471230,
        "gasPrice": 100000
    }); 
    let result = await flightSuretyApp.methods.getMyIndexes().call({from: account});
    console.log(result);
    oracles.set(account,result);
    console.log(`Oracle ${account} registered: ${oracles.get(account)[0]}, ${oracles.get(account)[1]}, ${oracles.get(account)[2]}`);
  } catch (err) 
  {
    console.log(err); 
  }
});
} 

registerOracles();

flightSuretyApp.events.OracleRequest({
    fromBlock: "latest"
  }, function (error, event) {
    if (error) console.log(error)
    let airline = event.returnValues.airline; 
    let flight = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp; 

    for (var [account, flightStatus] of oracles) {
      console.log(account + ' = ' + flightStatus);
      for(let index=0;index<3;index++) {
        try {
          // Submit a response...it will only be accepted if there is an Index match
          SubmitOracleResponse(flightStatus[index], airline, flight, timestamp, STATUS_CODE_ON_TIME,account);
          console.log('\nError', index, flightStatus[index].toNumber(), flight, timestamp);
        }
        catch(e) {
          console.log('\nError', index, flightStatus[index].toNumber(), flight, timestamp);
          console.log(e);
        }
      }
    }
  console.log(event)
});
const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


