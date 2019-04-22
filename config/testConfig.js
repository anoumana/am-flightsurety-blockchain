
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0xd74004be25adae4b36f91599bfc77d1f03663009",
        "0x3d3e12753df66cfebc7b29ecfe24f4a75fe4b756",
        "0xe65e37974dd1306f634f2357359c4f2c9352ebce",
        "0xbcae5e1fd1098989c5d1de554acd50808c32873f",
        "0x8c6e45ad15fdf13abbe25180356bdbe14e3bf74c",
        "0xc24fe1ace1146d89b1f198a1c5b2fb1ca3d9ad0a",
        "0xf64f3628effd3f44aca7accfede1e2e1ee2b9349",
        "0xd81fefa6addf81d7c2710a140f5af67aed9386e3",
        "0x1c89705b5a57429b4405f6a1c3346bc46e693287"
    ];

    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new("A1 Airlines", firstAirline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};