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
        this.passengers = [];
    }

    initialize(callback) {
        // this.flightSuretyData.methods.authorizeCaller(this.flightSuretyApp.address)        
        // .call({from: self.airlines[0], gas:471230, gasprice: 100000 }, 
        // (error,result) => {
        //     callback(error, result);
        // });

        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            let counter = 1;
            
            while(this.airlines.length < 7) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 7) {
                this.passengers.push(accts[counter++]);
            }

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
        let weiAmt =  this.web3.utils.toWei(amount,'ether');
        self.flightSuretyApp.methods.fund()
            .send({from: airlineAddress, value: weiAmt, gas:4712300, gasprice: 100000 }, 
            (error,result) => {
                callback(error, result);
            });
        
    }

    buy(passengerAddress, insAirlineAddress,  flightName, flightTime, callback) {
        let self = this;
        let weiAmt =  this.web3.utils.toWei("1",'ether');
        self.flightSuretyApp.methods.buy()
            .send({from: passengerAddress, value: weiAmt, gas:4712300, gasprice: 100000 }, 
            (error,result) => {
                callback(error, result);
            });
        
    }

    creditInsurees(creditAirlineAddress,  creditFlightName, creditFlightTime, callback) {
        let self = this;
        self.flightSuretyApp.methods.creditInsurees(creditAirlineAddress,  creditFlightName, creditFlightTime)
            .send({from: creditAirlineAddress,  gas:4712300, gasprice: 100000 }, 
            (error,result) => {
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