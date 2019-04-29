import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.flightAirlineMap = null;
        this.flightTimestampMap = null;
    }

    initialize(callback) {

        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            let counter = 1;
            
            while(this.airlines.length < 7) {
                this.airlines.push(accts[counter++]);
            }

            this.flightAirlineMap = new Map([
                ["AM123",accts[1]],
                ["AM234",accts[1]],
                ["AM345",accts[1]],
                ["AM456",accts[1]],
                ["AM567",accts[1]]
            ]);
            this.flightTimestampMap = new Map([
                ["AM123",123456],
                ["AM234",234567],
                ["AM345",45678],
                ["AM456",56789],
                ["AM567",67891]
            ]);

            callback();
        });
    }

    registerAirline(airlineName, airlineAddress, approverAddress, callback) {
        let self = this;
        self.flightSuretyApp.methods.registerAirline(airlineName, airlineAddress)
            .send({from: approverAddress, gas:4712300, gasprice: 100000 }, 
            (error,result) => {
                callback(error, result);
            });
        
    }

    isAirlineRegistered( airlineAddress, callback) {
        let self = this;
        self.flightSuretyApp.methods.isAirlineRegistered(airlineAddress)
            .call({from: self.airlines[0], gas:4712300, gasprice: 100000 }, 
            (error,result) => {
                callback(error, result);
            });
        
    }

    fund(airlineAddress, amount, callback) {
        let self = this;
        let weiAmt =  self.web3.utils.toWei(amount,'ether');
        self.flightSuretyApp.methods.fund()
            .send({from: airlineAddress, value: weiAmt, gas:4712300, gasprice: 100000 }, 
            (error,result) => {
                callback(error, result);
            });
        
    }

    buy(passengerAddress, flightName, callback) {
        let self = this;
        console.log("in buy contract");
        let weiAmt =  self.web3.utils.toWei("1",'ether');
        let airlines = self.flightAirlineMap.get(flightName);
        let timestamp = self.flightTimestampMap.get(flightName);
        console.log("in buy contract : " + airlines +" : " + timestamp + " : " + weiAmt);
        self.flightSuretyApp.methods.buy(passengerAddress, airlines, flightName, timestamp)
            .send({from: passengerAddress, value: weiAmt, gas:4712300, gasprice: 100000 }, 
            (error,result) => { console.log("after send :" + result);
                callback(error, result);
            });
    }

    checkFlightStatus(flightName, callback) {
        let self = this;
        let airlines = self.flightAirlineMap.get(flightName);
        let timestamp = self.flightTimestampMap.get(flightName);
        console.log("in checkFlightStatus contract : " + airlines +" : " + timestamp + " : " + flightName);

        self.flightSuretyApp.methods
            .fetchFlightStatus( airlines, flightName, timestamp)
            .send({ from: self.airlines[1], gas: 471230, gasPrice: 100000 }, (error, result) => {
                callback(error, result);
            });
        
    }

    withdraw( wdPassengerAddress, wdAirlineAddress,  wdFlightName, wdFlightTime, callback) {
        let self = this;
        self.flightSuretyApp.methods.withdraw( wdAirlineAddress,  wdFlightName, wdFlightTime)
            .send({from: wdPassengerAddress,  gas:4712300, gasprice: 100000 }, 
            (error,result) => {
                callback(error, result);
            });
        
    }

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
             .isOperational()
             .call({ from: self.owner}, callback);
     }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}