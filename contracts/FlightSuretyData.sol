pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct Airlines {
        bool isRegistered;
        address accountAddress;
        string airlinesName;
        uint insuranceFund;
    }

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airlines;
        string flightName;
    }

    // struct Passenger {
    //     bool isInsured;
    //     uint8 insuranceStatusCode;
    //     uint256 amount;
    // }
    // uint8 private constant STATUS_CODE_INSURED = 0;
    // uint8 private constant STATUS_CODE_CREDITED = 1;
    // uint8 private constant STATUS_CODE_WITHDRAWN = 2;

    mapping(string => Flight) private flights;

    address[] registeredAirlineList = new address[](0); 
    mapping(address => Airlines) registeredAirlines; 
    mapping(address => Flight) registeredFlights; 

    mapping(address => address[]) registrationAuthorizers; // Airlines that have authorized the registration

    mapping(address => uint256) private authorizedCallers;

    mapping(bytes32 => mapping(address => uint256)) insuredPassengers;
    mapping(bytes32 => address[]) insuredPassengerList;

    mapping(bytes32 => uint256) creditedPassengers;

   // Airlines[] registrationApprovedBy = new Airlines[](0);

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    event RegisteredAirline(string name, address account);
    event RegisteredFlight(string name, address account);


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                ( string memory firstAirlines,
                                    address firstAirlineAddress
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        authorizedCallers[contractOwner] = 1;
        operational = true;
        registeredAirlineList.push(firstAirlineAddress);
        registeredAirlines[firstAirlineAddress]  =  Airlines({
            isRegistered: true,
            accountAddress: firstAirlineAddress,
            airlinesName: firstAirlines,
            insuranceFund: 0
        });
        emit RegisteredAirline( firstAirlines, firstAirlineAddress);   // First airline registered

    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAlreadyNotRegistered(address newAirlines)
    {
        require(!registeredAirlines[newAirlines].isRegistered, "Airlines is already registered"  );
        _;
    }

    modifier requireAuthorizedCaller()
    {
        require(authorizedCallers[msg.sender] == 1, "Authorized caller"  );
        _;
    }

    modifier requireMinimumFund(uint amount)
    {
         require(msg.value >= amount, "Minimum amount is needed");
        _;
    }

    modifier requireRegisteredAirline()
    {
         require(registeredAirlines[msg.sender].isRegistered, "Airlines is not registered"  );
        _;
    }

 
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/


    function authorizeCaller
                            (
                                address callerAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedCallers[callerAddress] = 1;
    }

    function deauthorizeCaller
                            (
                                address callerAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedCallers[callerAddress];
    }


    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            external 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireAuthorizedCaller
    {
        operational = mode;
    }

    function isAirlineRegistered(address airlineAddress) external view returns (bool status){
        status = registeredAirlines[airlineAddress].isRegistered;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function getRegisteredAirlines( ) external view returns (address[] memory _registeredAirlineList){
        return registeredAirlineList;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                string  airlinesName,
                                address newAirlines // airlines that needs to be registered
                            )
                            external
                           requireIsOperational
                           requireAlreadyNotRegistered (newAirlines)  // require airlines is not already registered
                            returns(bool success, uint256 votesNeeded)
    {
        // if the # of registered airlines is less than 5, one of the registered airlines can register another airlines
        bool authorized = false;
        success = false;
        if(registeredAirlineList.length <= 2){
            if(registeredAirlines[msg.sender].isRegistered)
            {
                authorized = true;
            }
        }
        else { // half of the registered airlines should authorize the registration
           address[] memory authorizers =  registrationAuthorizers[newAirlines];
           if(authorizers.length >= registeredAirlineList.length.div(2)){
                authorized = true;               
           }
           else{
               registrationAuthorizers[newAirlines].push(msg.sender);
               votesNeeded  = registeredAirlineList.length.div(2) - (authorizers.length+1);
           }

        } 
        if(authorized){
            registeredAirlineList.push(newAirlines);
            registeredAirlines[newAirlines]  =  Airlines({
                isRegistered: true,
                accountAddress: newAirlines,
                airlinesName: airlinesName, 
                insuranceFund: 0
            });
            success = true;
            votesNeeded = 0;
           registrationAuthorizers[newAirlines] = new address[](0);
           emit RegisteredAirline(airlinesName, newAirlines);
        }
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            ( 
                               address passenger,
                                address airlines,
                                string flight,
                                uint256 timestamp
                            )
                            external
                            payable
                            requireMinimumFund(1)
                            requireRegisteredAirline
                            requireIsOperational
    {
        //maybe add timestamp later
       bytes32 key = keccak256(abi.encodePacked( airlines, flight, timestamp));

        require(insuredPassengers[key][passenger] <= 0, "Passenger already bought insurance for the flight");
        insuredPassengers[key][passenger] = msg.value;
        insuredPassengerList[key].push(passenger);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
//                                address passenger,
                                address airlines,
                                string flight,
                                uint256 timestamp
                                )
                                external
                                requireIsOperational
    {
        
       bytes32 key = keccak256(abi.encodePacked( airlines, flight, timestamp));

        address[] passengers = insuredPassengerList[key];
        for (uint index=0; index < passengers.length; index++) {
            address passenger = passengers[index];
            uint256 insurancePaid = insuredPassengers[key][passenger];
            require(insurancePaid > 0, "There is no insurance bought to refund");
            
            // if the passenger has bought insurance, credit their account 1.5*insurance
            bytes32 passengerKey = keccak256(abi.encodePacked(passenger, airlines, flight, timestamp));

            creditedPassengers[passengerKey] = insurancePaid.mul(15).div(10);
            //emit CreditInsured(passenger, airlines, flight, timestamp, insuredPassengers[key].amount);
        }
    }
    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function withdraw (
//                        address passenger,
                        address airlines,
                        string flight,
                        uint256 timestamp
                    )
                    external
                    requireIsOperational
    {
        address passenger = msg.sender;
        bytes32 passengerKey = keccak256(abi.encodePacked(passenger, airlines, flight, timestamp));
        uint256 amountToBeCredited = creditedPassengers[passengerKey];
        require(amountToBeCredited > 0, "There is no amount to be credited");
        require(amountToBeCredited <= registeredAirlines[airlines].insuranceFund, "Airlines doesn't have fund");
        //make the amount to be credited 0 - to avoid reentrancy
        creditedPassengers[passengerKey] = 0;
        msg.sender.transfer(amountToBeCredited);
        //subtract the amount credited from the airlines fund
        registeredAirlines[airlines].insuranceFund  = registeredAirlines[airlines].insuranceFund.sub(amountToBeCredited);
        //cleanup
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
                            requireMinimumFund(10)
                            requireRegisteredAirline
                            requireIsOperational
    {
        //store the amount that the airlines has paid
        registeredAirlines[msg.sender].insuranceFund.add(msg.value);

    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

