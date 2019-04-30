
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        contract.initialize((error, result) => {
            console.log(error,result);
            display('Initialize Status', 'Initialize contract', [ { label: 'Initialize Status', error: error, value: result} ]);
        });

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    


        // buy insurance
        DOM.elid('buyInsurance').addEventListener('click', () => {
            let flightName = DOM.elid('buyFlightName').value;
            let passengerAddress = DOM.elid('buyPassengerAddress').value;
            console.log("in buy index: " + passengerAddress);
             // Write transaction
            contract.buy( passengerAddress, flightName, function(error, result) {
                //displayDiv.innerHTML = result + " votes needed";            
                display('buyInsurance', 'buyInsurance', [ { label: 'Buy Insurance Status', error: error, value: result} ]);
                console.log("buy error : " + error);
                console.log("buy result : " + result);
            });
        })

        // Check Flight Insurance
        DOM.elid('chkInsurance').addEventListener('click', () => {
            let flightName = DOM.elid('buyFlightName').value;
            let passengerAddress = DOM.elid('buyPassengerAddress').value;
            console.log("chk ins : " + passengerAddress + ":" +flightName );
                // Write transaction
            contract.checkInsAmount( passengerAddress,  flightName, function(error, result) {
                display('chkInsurance', 'chkInsurance', [ { label: 'chkInsurance Status', error: error, value: result} ]);
                console.log("chkInsurance error : " + error);
                console.log("chkInsurance result : " + result);
            });
        })
        // Check chkSurety Amount
        DOM.elid('chkSurety').addEventListener('click', () => {
            let flightName = DOM.elid('buyFlightName').value;
            let passengerAddress = DOM.elid('buyPassengerAddress').value;
            console.log("checkSuretyAmount : " + passengerAddress + ":" +flightName );
                // Write transaction
            contract.checkSuretyAmount( passengerAddress,  flightName, function(error, result) {
                display('checkSuretyAmount', 'checkSuretyAmount', [ { label: 'checkSuretyAmount Status', error: error, value: result} ]);
                console.log("checkSuretyAmount error : " + error);
                console.log("checkSuretyAmount result : " + result);
            });
        })
        
        // Withdraw Flight Surety
        DOM.elid('withdraw').addEventListener('click', () => {
            let flightName = DOM.elid('buyFlightName').value;
            let passengerAddress = DOM.elid('buyPassengerAddress').value;
           console.log("wd : " + passengerAddress + ":" +flightName );
             // Write transaction
            contract.withdraw( passengerAddress,  flightName, function(error, result) {
                display('withdraw', 'withdraw', [ { label: 'withdraw Status', error: error, value: result} ]);
                console.log("wd error : " + error);
                console.log("wd result : " + result);
            });
        })

    });
    

        // trigger flight status
        DOM.elid('checkFlightStatus').addEventListener('click', () => {
            let flightName = DOM.elid('checkFlightName').value;
            console.log("in checkFlight index");
             // Write transaction
            contract.checkFlightStatus( flightName, function(error, result) {
                //displayDiv.innerHTML = result + " votes needed";            
                display('checkFlightStatus', 'checkFlightStatus', [ { label: 'checkFlightStatus :', error: error, value: result} ]);
                console.log("checkFlightStatus error : " + error);
                console.log("checkFlightStatus result : " + result);
            });
        })


})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    displayDiv.innerHTML = "";

    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







