
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    try {
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
        console.log("Auth")
    }
    catch(error) { console.log ("auth err :" +error);}
    });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();
    console.log("operational status :" + status);
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyApp.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
        console.log("not owner error : " + e);
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access  restricted to non Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      console.log("account address : " + config.testAddresses[0] );
      try {
        let owner = await config.flightSuretyApp.getContractOwner.call();
        console.log("contract account address : " + owner );
          
      } catch (error) {
        console.log("contract account error : " + error );

      }
      
      try 
      {
          await config.flightSuretyApp.setOperatingStatus(false, { from: config.testAddresses[0] });
          
      }
      catch(e) {
          console.log("owner error : " + e);
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyApp.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSuretyApp.setTestingMode(true);
      }
      catch(e) {
          console.log("multiparty - " + e);
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyApp.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not authorized', async () => {
    
    // ARRANGE
    let airline2 = accounts[2];

     try {
        let address = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("contract account address : " + address[0]  + ": " + address[1]);
            
    } catch (error) {
        console.log("contract account error : " + error );

    }
    // ACT
    try {
        
    //    bool  success;
    //   int votes;
       let result = await config.flightSuretyApp.registerAirline("Second Airlines", airline2, {from:config.testAddresses[2]});
        //console.log(success + " votes :" + votes);
        console.log("result : " + result[0] + ": " + result[1]);
    }
    catch(e) {
        console.log("error : " + e);
    }
   let result1 = await config.flightSuretyApp.isAirlineRegistered.call(airline2); 
   console.log("is reg :" + result1);

   try {
        let address1 = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("contract account address : " + address1[0]  + ": " + address1[1]);
            
    } catch (error) {
        console.log("contract account error : " + error );

    }
    // ASSERT
    assert.equal(result1, false, "Airline should not be able to register another airline if it hasn't been authorized");

  });
 
  it('Need at least one registered airlines to approve to register a new airline', async () => {
    
    // ARRANGE
    let airline2 = accounts[2];

     try {
        let address = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("contract account 1address : " + address[0]  + ": " + address[1]);
            
    } catch (error) {
        console.log("contract account error : " + error );

    }
    // ACT
    console.log("acct 1 addr :" + accounts[1]);
    try {
       let result = await config.flightSuretyApp.registerAirline("Second Airlines", accounts[2], {from:accounts[1]});
         console.log("result : " + result);
    }
    catch(e) {
        console.log("error : " + e);
    }
   let result1 = await config.flightSuretyApp.isAirlineRegistered.call(accounts[2]); 
   console.log("is reg :" + result1);

   try {
        let address1 = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("contract account2 address : " + address1[0]  + ": " + address1[1] + ": " + address1[2]  );
    } catch (error) { console.log("contract account2 error : " + error );}


   //3rd airlines
   try {
        let result = await config.flightSuretyApp.registerAirline("Third Airlines", accounts[3], {from:accounts[1]});
        //result = await config.flightSuretyData.registerAirline("Third Airlines", accounts[3], {from:accounts[2]});

        console.log("result : " + result[0] + ": " + result[1]);
    }
    catch(e) {
        console.log("error : " + e);
    }
    result1 = await config.flightSuretyApp.isAirlineRegistered.call(accounts[3]); 
    console.log("is reg :" + result1);

    try {
        let address1 = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("contract account 3 address : " + address1[0]  + ": " + address1[1] + ": " + address1[2] 
                                                   + " : "  + address1[3] + " : "  + address1[4] + " : "  + address1[5] );
    } catch (error) { console.log("contract account 3error : " + error );}

});
 
it('(airline) needs 50% of registered airlines to register ', async () => {
  

    //4th
    try {
        let result = await config.flightSuretyApp.registerAirline("Fourth Airlines", accounts[4], {from:accounts[1]});
        result = await config.flightSuretyApp.registerAirline("Fourth Airlines", accounts[4], {from:accounts[2]});
        console.log("result : " + result[0] + ": " + result[1]);
    }
    catch(e) {
        console.log("error : " + e);
    }
    result1 = await config.flightSuretyApp.isAirlineRegistered.call(accounts[4]); 
    console.log("is reg :" + result1);
    try {
        let address1 = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("contract account 4address : " + address1[0]  + ": " + address1[1] + ": " + address1[2] 
                                                   + " : "  + address1[3] + " : "  + address1[4] + " : "  + address1[5] );
    } catch (error) { console.log("contract account 4error : " + error );}


    // //5th
    // try {
    //     result = await config.flightSuretyData.registerAirline("Fifth Airlines", accounts[5], {from:config.testAddresses[1]});
    //     console.log("result : " + result[0] + ": " + result[1]);
    // }
    // catch(e) {
    //     console.log("error : " + e);
    // }
    // result1 = await config.flightSuretyData.isAirlineRegistered.call(accounts[5]); 
    // console.log("is reg :" + result1);

    // try {
    //     let address1 = await config.flightSuretyData.getRegisteredAirlines.call();
    //     console.log("contract account address : " + address1[0]  + ": " + address1[1] + ": " + address1[2] 
    //                                                + " : "  + address1[3] + " : "  + address1[4] + " : "  + address1[5] );
    // } catch (error) { console.log("contract account5 error : " + error );}


    // //6th
    // try {
    //     let result = await config.flightSuretyData.registerAirline("Fifth Airlines", accounts[6], {from:config.testAddresses[1]});
    //     console.log("result : " + result[0] + ": " + result[1]);
    // }
    // catch(e) {
    //     console.log("error : " + e);
    // }
    // result1 = await config.flightSuretyData.isAirlineRegistered.call(accounts[6]); 
    // console.log("is reg :" + result1);

    // try {
    //     let address1 = await config.flightSuretyData.getRegisteredAirlines.call();
    //     console.log("contract account address : " + address1[0]  + ": " + address1[1] + ": " + address1[2] 
    //                                                + " : "  + address1[3] + " : "  + address1[4] + " : "  + address1[5] );
    // } catch (error) { console.log("contract account 6 error : " + error );}

});
 
it('test fund ', async () => {
  
    try {
        let address1 = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("fund contract account 4address : " + address1[0]  + ": " + address1[1] + ": " + address1[2] 
                                                   + " : "  + address1[3] + " : "  + address1[4] + " : "  + address1[5] );
    } catch (error) { console.log("fund contract account 4error : " + error );}

    let val =  web3.utils.toWei("11",'ether');
    let  amount = 0;
    try{
        await config.flightSuretyApp.fund({from: accounts[2], "value": val});   
        amount = await config.flightSuretyApp.getRegisteredAirlineFund.call(accounts[2]);
        console.log("fund address :" + accounts[2]);
        console.log("fund :" + amount);

    } catch (error) { console.log("contract fund error : " + error );}

    console.log("fund amount :" +amount);
    // ASSERT
    assert.equal(amount, val, "Airlines is not funded");

});

 
it('test buy works', async () => {

    try {
        let address1 = await config.flightSuretyApp.getRegisteredAirlines.call();
        console.log("buy contract account 4address : " + address1[0]  + ": " + address1[1] + ": " + address1[2] 
                                                   + " : "  + address1[3] + " : "  + address1[4] + " : "  + address1[5] );
    } catch (error) { console.log("buy contract account 4error : " + error );}
    // buy 
    console.log("passenger :" + accounts[2]);

    let val =  web3.utils.toWei("2",'ether');
    let amount = 0;
    try{    
       await config.flightSuretyApp.buy(accounts[6],accounts[2], "A2flight", "12345", {from: accounts[6], "value": val});
       //await config.flightSuretyApp.buy(accounts[6],accounts[2], "A2flight", "12345", {from: accounts[6], "value": val});

       amount = await config.flightSuretyApp.getInsuranceAmount.call(accounts[6],accounts[2], "A2flight", "12345");
       console.log("buy :" + amount);
    }
    catch(err){ console.log(" buy error: " + err);}
    // ASSERT
    assert.equal(amount, val, "Insurance is not bought");

});
 
it('test creditInsurees works', async () => {
    let val =  web3.utils.toWei("3",'ether');
    let amount = 0;

    try{
        await config.flightSuretyApp.creditInsurees(accounts[2], "A2flight", "12345",15,10, {from: accounts[2]});
        //console.log("credit inuserees :" + numOfPassengers);

        amount = await config.flightSuretyApp.getInsuranceAmount.call(accounts[6],accounts[2], "A2flight", "12345");
        console.log("buy cr :" + amount);
 
        amount = await config.flightSuretyApp.getCreditedInsuranceAmount.call(accounts[6],accounts[2], "A2flight", "12345");
        console.log("credit :" + amount);
 
    }
    catch(err){ console.log("cr error: " + err);}

    // ASSERT
    assert.equal(amount, val, "Insurance not credited");

});
 
it('test withdraw works', async () => {

    let val =  web3.utils.toWei("3",'ether');
    let amount = 10;

    try{
        await config.flightSuretyApp.withdraw(accounts[6], accounts[2], "A2flight", "12345", {from: accounts[6]});

        amount = await config.flightSuretyApp.getCreditedInsuranceAmount.call(accounts[6],accounts[2], "A2flight", "12345");
        console.log("withdraw :" + amount);

    }
    catch(err){ console.log("wd error: " + err);}
    // await config.flightSuretyApp.fund.sendTransaction(airline2, {from: config.firstAirline, "value": 10});
    // await config.flightSuretyApp.fund.sendTransaction(airline3, {from: config.firstAirline, "value": 10});
    // await config.flightSuretyApp.fund.sendTransaction(airline4, {from: config.firstAirline, "value": 10});
    // ASSERT
    assert.equal(amount, 0, "Insurance is not withdrawn");

   });
 


});
