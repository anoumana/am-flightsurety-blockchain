
import 'babel-polyfill';
//import './app';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json'; 

import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const TEST_ORACLES_COUNT = 10;


let config = Config['localhost'];
console.log(config.url);
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];

let accounts =  web3.eth.getAccounts(); 
var registeredOracles = new Map();
let registrationFee = 0;

let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

//setupAppContractForData();
// registerAirlines();
// registerOracles();

// async function setupAppContractForData() {
//   await flightSuretyData.methods.authorizeCaller(config.appAddress).send({from:accounts[0],"gas": 471230, "gasPrice": 100000 }).then(`Done Authorizing Caller ${config.appAddress}`).catch(`ERROR Authorizing Caller ${config.appAddress}`);

// }

async function registerAirlines() {
  try{
    accounts = await web3.eth.getAccounts();
    console.log("Accounts :" + accounts);
  }
  catch(error){console.log("account error :" + error)}

  console.log("data: " + flightSuretyData.address);
  console.log("acct 0: " + accounts[0]);
  
try{
    let result = await flightSuretyData.methods.isOperational().call({from:accounts[0],"gas": 4712300, "gasPrice": 100000 });
    console.log("xycvdsd : " + result);
}catch(error ){console.log("Err" + error);}

    try{
      await flightSuretyData.methods.authorizeCaller(config.appAddress,{from:accounts[0],"gas": 4712300, "gasPrice": 100000 })
      console.log("Auth" );
  }
  catch(error){console.log("auth caller error :" + error)}


  //console.log("%%%%%%%%%%%%%")

  try {
  let val =  web3.utils.toWei("10",'ether');
  await flightSuretyApp.methods.fund({from:accounts[1],value:val,"gas": 4712300, "gasPrice": 100000  })
    console.log("funded A1 airlines");
  }
  catch(error){console.log("fund call error :" + error)}

  try {
    await flightSuretyApp.methods.registerAirline(accounts[2], "A2 airlines",{from:accounts[1],"gas": 4712300, "gasPrice": 100000 })
    console.log("registered A2 airlines");
  }
  catch(error){console.log("register A2 call error :" + error)}

  try {
    let val =  web3.utils.toWei("10",'ether');
    await flightSuretyApp.methods.fund({from:accounts[2],value:val,"gas": 4712300, "gasPrice": 100000  })
    console.log("funded A2 airlines");
  }
  catch(error){console.log("fund A2 call error :" + error)}

} 

async function registerOracles() {
      
      try {
        registrationFee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
      } catch (e) {
        console.log(e);
      }

      accounts = await web3.eth.getAccounts();
      console.log(accounts);

      accounts.forEach(async acct => {
        //for each account register an oracle
        try { 
        let r = await flightSuretyApp.methods.registerOracle({
            "from": acct,
            "value": registrationFee,
            "gas": 4712300,  // make sure enough gas is put in, otherwise it fails
            "gasPrice": 100000
        }); 
        //get indexes for the oracle account
        let result = await flightSuretyApp.methods.getMyIndexes().call({from: acct});
        console.log(result);
        //set them in the map to be used for the event listener
        registeredOracles.set(acct,result);
        console.log(`Oracle ${acct} registered: ${registeredOracles.get(acct)[0]}, 
          ${registeredOracles.get(acct)[1]}, ${registeredOracles.get(acct)[2]}, 
          ${registeredOracles.get(acct)[3]}, ${registeredOracles.get(acct)[4]}`);
      } catch (error) 
      {
        console.log("oracle registration : " + error); 
      }
    });
} 

registerAirlines();
registerOracles();


flightSuretyApp.events.FlightStatusInfo({
  fromBlock: "latest"
  }, function (error, event) {
    console.log("eventlistener :" + event);
    if (error) {
      console.log("eventlistener error:" +error.message);
    }
    else {
      let airline = event.returnValues.airline; 
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let flightStatus = event.returnValues.status;
      console.log(` Flight Status Info: ${airline}, ${flight}, ${timestamp}, ${flightStatus}`);
    }
  }
)

flightSuretyApp.events.OracleReport({
  fromBlock: "latest"
  }, function (error, event) {
    console.log("oracleReport eventlistener :" + event);
    if (error) {
      console.log(error.message);
    }
    else {
      let airline = event.returnValues.airline; 
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let flightStatus = event.returnValues.status;
      
      console.log(` OracleReport: ${airline}, ${flight}, ${timestamp}, ${flightStatus}`);
    }
  }
)




flightSuretyApp.events.OracleRequest({
    fromBlock: "latest"
    }, function (error, event) {
      console.log("OracleRequest eventlistener :" + event);
      if (error) {
        console.log(error);
      }
      else {
        let airline = event.returnValues.airline; 
        let flight = event.returnValues.flight;
        let timestamp = event.returnValues.timestamp; 
        let found = false;
        console.log(`oracle Req: ${airline} - ${flight} - ${timestamp}`)

        for (var [acct, value] of registeredOracles) {
          console.log(acct + ' = ' + value);
          for (var i = 0; i < value.length; i++) {
            console.log(`Oracle Req before submit:${value[i]}, "${airline}", ${flight}, ${timestamp}, ${STATUS_CODE_LATE_AIRLINE}`);
            flightSuretyApp.methods.submitOracleResponse(value[i], airline, flight, timestamp, STATUS_CODE_LATE_AIRLINE).call({ from: acct })
              .then(console.log(`Oracle response submited: ${acct} ${value[i]}`))
              .catch(function(error) {
              console.log(`${error} Oracle response Error for: ${acct} ${i}`);
              });
          }
        }
      }

    //console.log(event)
});


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;
