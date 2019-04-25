
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    

        // Register airline
        DOM.elid('registerAirline').addEventListener('click', () => {
            let airlineName = DOM.elid('airlineName').value;
            let airlineAddress = DOM.elid('airlineAddress').value;
            let approverAddress = DOM.elid('approverAddress').value;
            let displayDiv = DOM.elid("display-votes");
             // Write transaction
            contract.registerAirline(airlineName, airlineAddress, {
                "from": approverAddress,
                // "value": fee,
                // "gas": 471230,
                // "gasPrice": 100000
            }, function(error, result) {
                displayDiv.innerHTML = result + " votes needed";            
                display('Register', 'Register Airlines', [ { label: 'Register Airline Status', error: error, value: result} ]);
            });
        })

        // Fund airline
        DOM.elid('fundAirlines').addEventListener('click', () => {
            let airlineFundAmount = DOM.elid('airlineFundAmount').value;
            let fundedAirlineAddress = DOM.elid('fundedAirlineAddress').value;
             // Write transaction
            contract.fund( {
                "from": fundedAirlineAddress,
                "value": airlineFundAmount,
                // "gas": 471230,
                // "gasPrice": 100000
            }, function(error, result) {
                display('Fund', 'Fund Airlines', [ { label: 'Fund Airline Status', error: error, value: result} ]);
            });
        })

        // buy insurance
        DOM.elid('buyInsurance').addEventListener('click', () => {
            let flightInsuranceAmount = DOM.elid('flightInsuranceAmount').value;
            let flightName = DOM.elid('flightName').value;
            let insAirlineAddress = DOM.elid('insAirlineAddress').value;
            let flightTime = DOM.elid('flightTime').value;
            let passengerAddress = DOM.elid('passengerAddress').value;
            
             // Write transaction
            contract.buy( passengerAddress, insAirlineAddress,  flightName, flightTime, {
                "from": passengerAddress,
                "value": flightInsuranceAmount,
                // "gas": 471230,
                // "gasPrice": 100000
            }, function(error, result) {
                display('buyInsurance', 'buyInsurance', [ { label: 'Buy Insurance Status', error: error, value: result} ]);
            });
        })

        // credit Insured passengers
        DOM.elid('creditInsurees').addEventListener('click', () => {
            let creditFlightName = DOM.elid('creditFlightName').value;
            let creditAirlineAddress = DOM.elid('creditAirlineAddress').value;
            let creditFlightTime = DOM.elid('creditFlightTime').value;
            
             // Write transaction
            contract.creditInsurees( creditAirlineAddress,  creditFlightName, creditFlightTime, {
                "from": creditAirlineAddress,
                //"value": flightInsuranceAmount,
                // "gas": 471230,
                // "gasPrice": 100000
            }, function(error, result) {
                display('creditInsurees', 'creditInsurees', [ { label: 'creditInsurees Status', error: error, value: result} ]);
            });
        })

        // Withdraw Flight Surety
        DOM.elid('withdraw').addEventListener('click', () => {
            let wdPassengerAddress = DOM.elid('wdPassengerAddress').value;
            let wdFlightName = DOM.elid('wdFlightName').value;
            let wdAirlineAddress = DOM.elid('wdAirlineAddress').value;
            let wdFlightTime = DOM.elid('wdFlightTime').value;
            
             // Write transaction
            contract.creditInsurees( wdAirlineAddress,  wdFlightName, wdFlightTime, {
                "from": wdPassengerAddress,
                //"value": flightInsuranceAmount,
                // "gas": 471230,
                // "gasPrice": 100000
            }, function(error, result) {
                display('withdraw', 'withdraw', [ { label: 'withdraw Status', error: error, value: result} ]);
            });
        })

    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
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







